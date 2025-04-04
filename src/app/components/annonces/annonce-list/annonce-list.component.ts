import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Annonce, AnnonceFilters, City, Type } from '../../../models/annonce';
import { AnnonceService } from '../../../services/annonce.service';
import { AnnonceCardComponent } from '../annonce-card/annonce-card.component';
import { PaginationComponent } from '../../pagination/pagination/pagination.component';
import { LoadingComponent } from '../../loading/loading/loading.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-annonce-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    AnnonceCardComponent,
    PaginationComponent,
    LoadingComponent
  ],
  templateUrl: './annonce-list.component.html',
  styleUrls: ['./annonce-list.component.scss']
})
export class AnnonceListComponent implements OnInit {
  annonces: Annonce[] = [];
  filteredAnnonces: Annonce[] = [];
  cities: City[] = [];
  types: Type[] = [];
  error: string | null = null;

  filters: AnnonceFilters = {
    searchTerm: '',
    city: '',
    type: '',
    priceRange: ''
  };

  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;
  isLoading = true;

  constructor(
    private annonceService: AnnonceService,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.loadAnnonces();
  }

  loadAnnonces() {
    this.isLoading = true;
    this.error = null;

    this.annonceService.getAll().subscribe({
      next: (data) => {
        if (data) {
          this.annonces = data;
          this.filteredAnnonces = data;
          this.extractFilters();
          console.log(data);
        } else {
          this.annonces = [];
          this.filteredAnnonces = [];
        }
        this.calculatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading annonces:', error);
        this.error = 'Failed to load announcements';
        this.isLoading = false;
      }
    });
  }

  extractFilters() {
    const uniqueCities = new Map<string, City>();
    const uniqueTypes = new Map<string, Type>();

    this.annonces.forEach(annonce => {
      if (annonce.city && annonce.city.id) {
        uniqueCities.set(annonce.city.id, annonce.city);
      }
      if (annonce.type && annonce.type.id) {
        uniqueTypes.set(annonce.type.id, annonce.type);
      }
    });

    this.cities = Array.from(uniqueCities.values());
    this.types = Array.from(uniqueTypes.values());
  }

  filter() {
    this.filteredAnnonces = this.annonces.filter(annonce => {
      const matchesSearch = !this.filters.searchTerm ||
        annonce.title.toLowerCase().includes(this.filters.searchTerm.toLowerCase()) ||
        annonce.description.toLowerCase().includes(this.filters.searchTerm.toLowerCase());

      const matchesCity = !this.filters.city ||
        (annonce.city && annonce.city.id === this.filters.city);

      const matchesType = !this.filters.type ||
        (annonce.type && annonce.type.id === this.filters.type);

      let matchesPrice = true;
      if (this.filters.priceRange) {
        const [min, max] = this.filters.priceRange.split('-').map(Number);
        matchesPrice = max ?
          annonce.monthPrice >= min && annonce.monthPrice <= max :
          annonce.monthPrice >= min;
      }

      return matchesSearch && matchesCity && matchesType && matchesPrice;
    });

    this.currentPage = 1;
    this.calculatePagination();
  }

  resetFilters() {
    this.filters = {
      searchTerm: '',
      city: '',
      type: '',
      priceRange: ''
    };
    this.filteredAnnonces = [...this.annonces];
    this.currentPage = 1;
    this.calculatePagination();
  }

  get paginatedAnnonces(): Annonce[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredAnnonces.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({length: this.totalPages}, (_, i) => i + 1);
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredAnnonces.length / this.itemsPerPage);
  }
}
