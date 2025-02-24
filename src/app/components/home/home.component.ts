import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnnonceListComponent } from '../annonces/annonce-list/annonce-list.component';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AnnonceService } from '../../services/annonce.service';
import { City, Type } from '../../models/annonce';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ FormsModule, AnnonceListComponent, CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  cities: City[] = [];
  types: Type[] = [];
  selectedLocation: string = '';
  selectedType: string = '';
  selectedPriceRange: string = '';

  constructor(
    private router: Router,
    private annonceService: AnnonceService
  ) {}

  ngOnInit() {
    this.loadFilters();
  }

  private loadFilters() {
    this.annonceService.getCities().subscribe({
      next: (cities) => this.cities = cities,
      error: (error) => console.error('Error loading cities:', error)
    });

    this.annonceService.getTypes().subscribe({
      next: (types) => this.types = types,
      error: (error) => console.error('Error loading types:', error)
    });
  }

  onSearch() {
    let queryParams: any = {};

    if (this.selectedLocation) {
      queryParams.city = this.selectedLocation;
    }

    if (this.selectedType) {
      queryParams.type = this.selectedType;
    }

    if (this.selectedPriceRange) {
      queryParams.priceRange = this.selectedPriceRange;
    }

    this.router.navigate(['/annonce-list'], {
      queryParams: queryParams
    });
  }
}
