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
    let filtered = this.properties;

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
        p.user.email.toLowerCase().includes(term)
      );
    }

    if (this.filterCity && this.filterCity !== '') {
      filtered = filtered.filter(p => p.city.id === this.filterCity);
    }

    this.filteredProperties = filtered;
    this.totalPages = Math.ceil(this.filteredProperties.length / this.itemsPerPage);
    this.currentPage = 1;
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
      let startPage = Math.max(1, this.currentPage - 2);
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
    const updatedProperty = {
      ...property,
      status: !property.status
    };

    this.annonceService.update(property.id, updatedProperty).subscribe({
      next: (response) => {
        const index = this.properties.findIndex(p => p.id === property.id);
        if (index !== -1) {
          this.properties[index] = response;
          this.calculateStatistics();
          this.applyFilters();
        }
      },
      error: (err) => {
        console.error('Error toggling property status:', err);
      }
    });
  }

  deleteProperty(id: string): void {
    if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      this.annonceService.delete(id).subscribe({
        next: () => {
          this.properties = this.properties.filter(p => p.id !== id);
          this.calculateStatistics();
          this.applyFilters();
        },
        error: (err) => {
          console.error('Error deleting property:', err);
        }
      });
    }
  }

  truncateId(id: string): string {
    return id.substring(0, 8) + '...';
  }



}
