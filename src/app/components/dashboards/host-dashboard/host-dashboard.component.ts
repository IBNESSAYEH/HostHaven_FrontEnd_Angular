import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Annonce } from '../../../models/annonce';
import { AnnonceService } from '../../../services/annonce.service';
import { AuthService } from '../../../services/auth.service';

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
      this.error = 'User not found';
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
        this.error = 'Failed to load properties';
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
    if (confirm('Are you sure you want to delete this property?')) {
      this.annonceService.delete(id).subscribe({
        next: () => {
          this.properties = this.properties.filter(p => p.id !== id);
          this.calculateStats();
        },
        error: (error) => {
          console.error('Error deleting property:', error);
        }
      });
    }
  }

  togglePropertyStatus(property: Annonce) {
    const updatedProperty = {
      ...property,
      status: !property.status
    };

    this.annonceService.update(property.id, updatedProperty).subscribe({
      next: (response) => {
        const index = this.properties.findIndex(p => p.id === property.id);
        if (index !== -1) {
          this.properties[index] = response;
          this.calculateStats();
        }
      },
      error: (error) => {
        console.error('Error updating property status:', error);
      }
    });
  }
}
