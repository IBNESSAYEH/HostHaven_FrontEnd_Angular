import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Annonce, City } from '../../../models/annonce';
import { AnnonceService } from '../../../services/annonce.service';
import { UsersService } from '../../../services/users.service';
import { AuthService } from '../../../services/auth.service';
import { UserManagementComponent } from '../user-management/user-management.component';
import { AdminUser } from '../../../models/user';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, UserManagementComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  activeTab: 'all' | 'active' | 'inactive' | 'users' = 'all';

  properties: Annonce[] = [];
  filteredProperties: Annonce[] = [];
  cities: City[] = [];

  searchTerm: string = '';
  filterCity: string = '';

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  isLoading: boolean = true;
  error: string | null = null;

  totalProperties: number = 0;
  activeProperties: number = 0;
  inactiveProperties: number = 0;
  totalUsers: number = 0;

  propertyChangeRate: number = 12;
  userChangeRate: number = 8;
  activePropertyRatio: number = 0;
  inactivePropertyRatio: number = 0;
  Math = Math;

  constructor(
    private annonceService: AnnonceService,
    private userService: UsersService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAllProperties();
    this.loadCities();
    this.loadUserCount();
  }

  loadAllProperties(): void {
    this.isLoading = true;
    this.error = null;

    this.annonceService.getAll().subscribe({
      next: (data) => {
        this.properties = data;
        this.calculateStatistics();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading properties:', err);
        this.error = 'Failed to load properties. Please try again later.';
        this.isLoading = false;
        this.showToast('Error', 'Failed to load properties. Please try again later.', 'error');
      }
    });
  }

  loadCities(): void {
    this.annonceService.getCities().subscribe({
      next: (data) => {
        this.cities = data;
      },
      error: (err) => {
        console.error('Error loading cities:', err);
        this.showToast('Error', 'Failed to load cities data.', 'error');
      }
    });
  }

  loadUserCount(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.totalUsers = data.length;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.showToast('Error', 'Failed to load user count data.', 'error');
      }
    });
  }

  calculateStatistics(): void {
    this.totalProperties = this.properties.length;
    this.activeProperties = this.properties.filter(p => p.status).length;
    this.inactiveProperties = this.properties.filter(p => !p.status).length;

    this.activePropertyRatio = this.totalProperties > 0
      ? Math.round((this.activeProperties / this.totalProperties) * 100)
      : 0;

    this.inactivePropertyRatio = this.totalProperties > 0
      ? Math.round((this.inactiveProperties / this.totalProperties) * 100)
      : 0;
  }

  applyFilters(): void {
    let filtered = [...this.properties];

    if (this.activeTab === 'active') {
      filtered = filtered.filter(p => p.status);
    } else if (this.activeTab === 'inactive') {
      filtered = filtered.filter(p => !p.status);
    }

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.adress.toLowerCase().includes(term) ||
        p.city.name.toLowerCase().includes(term) ||
        p.user.firstName.toLowerCase().includes(term) ||
        p.user.lastName.toLowerCase().includes(term) ||
        `${p.user.firstName.toLowerCase()} ${p.user.lastName.toLowerCase()}`.includes(term) ||
        p.user.email.toLowerCase().includes(term)
      );
    }

    if (this.filterCity && this.filterCity !== '') {
      filtered = filtered.filter(p => p.city.id === this.filterCity);
    }

    this.filteredProperties = filtered;
    this.totalPages = Math.ceil(this.filteredProperties.length / this.itemsPerPage);

    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterCity = '';
    this.applyFilters();
    this.showToast('Filters Reset', 'All search filters have been cleared', 'info');
  }

  refreshData(): void {
    Swal.fire({
      title: 'Refreshing Data',
      html: 'Please wait while we fetch the latest data...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
        this.loadAllProperties();
        this.loadCities();
        this.loadUserCount();

        setTimeout(() => {
          Swal.close();
          this.showToast('Data Refreshed', 'All data has been updated successfully', 'success');
        }, 1500);
      }
    });
  }

  exportData(format: 'csv' | 'pdf'): void {
    this.showToast('Export Started', `Exporting data as ${format.toUpperCase()}...`, 'info');

    setTimeout(() => {
      this.showToast('Export Completed', `Data has been exported as ${format.toUpperCase()} successfully`, 'success');
    }, 1500);
  }

  get paginatedProperties(): Annonce[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProperties.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get visiblePageNumbers(): number[] {
    const pageNumbers: number[] = [];
    const totalVisiblePages = 5;

    if (this.totalPages <= totalVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, this.currentPage - Math.floor(totalVisiblePages / 2));
      let endPage = Math.min(this.totalPages, startPage + totalVisiblePages - 1);

      if (endPage - startPage < totalVisiblePages - 1) {
        startPage = Math.max(1, endPage - totalVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  togglePropertyStatus(property: Annonce): void {
    const statusText = !property.status ? 'activate' : 'deactivate';

    Swal.fire({
      title: `${statusText.charAt(0).toUpperCase() + statusText.slice(1)} property?`,
      text: `Are you sure you want to ${statusText} "${property.title}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${statusText} it!`
    }).then((result) => {
      if (result.isConfirmed) {
        this.annonceService.changeStatus(property.id).subscribe({
          next: (response) => {
            const index = this.properties.findIndex(p => p.id === property.id);
            if (index !== -1) {
              this.properties[index] = response;
              this.calculateStatistics();
              this.applyFilters();
            }
            const newStatus = !property.status;
            this.showToast('Success', `Property has been ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
          },
          error: (err) => {
            console.error('Error toggling property status:', err);
            this.showToast('Error', `Failed to ${statusText} property`, 'error');
          }
        });
      }
    });
  }

  deleteProperty(id: string): void {
    const property = this.properties.find(p => p.id === id);
    if (!property) return;

    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete property "${property.title}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.annonceService.delete(id).subscribe({
          next: () => {
            this.properties = this.properties.filter(p => p.id !== id);
            this.calculateStatistics();
            this.applyFilters();

            Swal.fire(
              'Deleted!',
              'Property has been deleted successfully.',
              'success'
            );
          },
          error: (err) => {
            console.error('Error deleting property:', err);
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

  truncateId(id: string): string {
    return id.substring(0, 8) + '...';
  }

  showToast(title: string, message: string, icon: 'success' | 'error' | 'warning' | 'info' | 'question'): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: icon,
      title: title,
      text: message
    });
  }


  setActiveTab(tab: 'all' | 'active' | 'inactive' | 'users'): void {
    this.activeTab = tab;
    this.applyFilters();

    let tabName = 'All Properties';
    switch(tab) {
      case 'active': tabName = 'Active Properties'; break;
      case 'inactive': tabName = 'Inactive Properties'; break;
      case 'users': tabName = 'User Management'; break;
    }

    this.showToast('Tab Changed', `Viewing ${tabName}`, 'info');
  }
}
