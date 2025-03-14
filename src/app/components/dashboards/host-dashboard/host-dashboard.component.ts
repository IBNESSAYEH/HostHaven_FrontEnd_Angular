import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Annonce } from '../../../models/annonce';
import { AnnonceService } from '../../../services/annonce.service';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-host-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './host-dashboard.component.html',
  styleUrls: ['./host-dashboard.component.scss']
})
export class HostDashboardComponent implements OnInit {
  properties: Annonce[] = [];
    isLoading = true;
  error: string | null = null;
  searchTerm = '';
    filterStatus = '';
  defaultImagePath = 'assets/images/pixlr-image-generator-1ebfe583-0068-4415-9b35-5330d6ac9f10.png';

  totalProperties = 0;
   activeProperties = 0;
  pendingProperties = 0;
   inactiveProperties = 0;

  constructor(
     private annonceService: AnnonceService,
    private authService: AuthService
  ) {}

  ngOnInit() {
     this.loadProperties();
  }

  private loadProperties() {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.showErrorAlert('User not found', 'Please log in to view your properties.');
      return;
    }

    this.isLoading = true;
     this.annonceService.getByUserId(userId).subscribe({
      next: (data) => {
        this.properties = data;
         this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading properties:', error);
        this.showErrorAlert('Failed to load properties', 'Please try again later.');
         this.isLoading = false;
      }
    });
  }

  private calculateStats() {
    this.totalProperties = this.properties.length;
     this.activeProperties = this.properties.filter(p => p.status).length;
    this.inactiveProperties = this.properties.filter(p => !p.status).length;
    this.pendingProperties = 0;
  }

  get filteredProperties(): Annonce[] {
    return this.properties.filter(property => {
      const matchesSearch = !this.searchTerm ||
         property.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        property.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          property.city.name.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.filterStatus ||
        (this.filterStatus === 'active' && property.status) ||
        (this.filterStatus === 'inactive' && !property.status);

      return matchesSearch && matchesStatus;
    });
  }

  getStatusBadgeClass(status: boolean): string {
    return status ? 'badge-success' : 'badge-error';
  }

  deleteProperty(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
       icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDelete(id);
      }
    });
  }

  private performDelete(id: string) {
    Swal.fire({
      title: 'Deleting...',
      text: 'Please wait while we delete your property',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
        this.annonceService.delete(id).subscribe({
          next: () => {
            this.properties = this.properties.filter(p => p.id !== id);
            this.calculateStats();
            Swal.fire(
              'Deleted!',
              'Your property has been deleted.',
              'success'
            );
          },
          error: (error) => {
            console.error('Error deleting property:', error);
            Swal.fire(
              'Error!',
              'Failed to delete property. Please try again.',
              'error'
            );
          }
        });
      }
    });
  }

  togglePropertyStatus(property: Annonce) {
    const newStatus = !property.status;
    const statusText = newStatus ? 'activate' : 'deactivate';

    Swal.fire({
      title: `${newStatus ? 'Activate' : 'Deactivate'} Property?`,
      text: `Are you sure you want to ${statusText} "${property.title}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${statusText} it!`
    }).then((result) => {
      if (result.isConfirmed) {
        this.performStatusToggle(property);
      }
    });
  }

  private performStatusToggle(property: Annonce) {
    const updatedProperty = {
      ...property,
      status: !property.status
    };

    Swal.fire({
      title: 'Updating...',
      text: 'Please wait while we update your property',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
        this.annonceService.changeStatus(property.id).subscribe({
          next: (response) => {
            const index = this.properties.findIndex(p => p.id === property.id);
            if (index !== -1) {
              this.properties[index] = response;
              this.calculateStats();
              Swal.fire(
                'Updated!',
                `Property has been ${response.status ? 'activated' : 'deactivated'}.`,
                'success'
              );
            }
          },
          error: (error) => {
            console.error('Error updating property status:', error);
            Swal.fire(
              'Error!',
              'Failed to update property status. Please try again.',
              'error'
            );
          }
        });
      }
    });
  }

  private showErrorAlert(title: string, text: string) {
    Swal.fire({
      icon: 'error',
      title: title,
      text: text
    });
  }

  getPropertyImage(property: Annonce): string {
    if (property && property.images && property.images.length > 0) {
      return property.images[0].imageURL;
    }
    return this.defaultImagePath;
  }
}
