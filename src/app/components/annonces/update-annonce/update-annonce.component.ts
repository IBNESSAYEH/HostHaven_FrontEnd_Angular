import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Category, City, Type } from '../../../models/annonce';
import { AnnonceService } from '../../../services/annonce.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-update-annonce',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './update-annonce.component.html'
})
export class UpdateAnnonceComponent implements OnInit {
  annonceForm: FormGroup = this.initializeForm();
  cities: City[] = [];
  types: Type[] = [];
  categories: Category[] = [];
  isLoading = false;
  error: string | null = null;
  annonceId: string;

  constructor(
    private fb: FormBuilder,
    private annonceService: AnnonceService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.annonceId = this.route.snapshot.params['id'];
  }

  private initializeForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      monthPrice: [null, [Validators.required, Validators.min(0)]],
      weekPrice: [null, [Validators.min(0)]],
      dayPrice: [null, [Validators.min(0)]],
      adress: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      cityId: ['', Validators.required],
      categoryId: ['', Validators.required],
      typeId: ['', Validators.required],
      caracteristiques: this.fb.group({
        etage: [0],
        surface: [null, Validators.required],
        assenceur: [false],
        balcon: [false],
        terrasse: [false],
        piscine: [false],
        jardin: [false],
        parking: [false],
        numberRooms: [null, Validators.required],
        numberSale: [1, Validators.required],
        numberSalleBain: [1, Validators.required]
      })
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    this.error = null;

    forkJoin({
      annonce: this.annonceService.getById(this.annonceId),
      cities: this.annonceService.getCities(),
      types: this.annonceService.getTypes(),
      categories: this.annonceService.getCategories()
    }).subscribe({
      next: (data) => {
        this.cities = data.cities;
        this.types = data.types;
        this.categories = data.categories;
        this.populateForm(data.annonce);
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.error = 'Failed to load data. Please try again.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private populateForm(annonce: any): void {
    this.annonceForm.patchValue({
      title: annonce.title,
      description: annonce.description,
      monthPrice: annonce.monthPrice,
      weekPrice: annonce.weekPrice,
      dayPrice: annonce.dayPrice,
      adress: annonce.adress,
      phone: annonce.phone,
      email: annonce.email,
      cityId: annonce.city.id,
      categoryId: annonce.category.id,
      typeId: annonce.type.id,
      caracteristiques: {
        etage: annonce.caracteristiques.etage,
        surface: annonce.caracteristiques.surface,
        assenceur: annonce.caracteristiques.assenceur,
        balcon: annonce.caracteristiques.balcon,
        terrasse: annonce.caracteristiques.terrasse,
        piscine: annonce.caracteristiques.piscine,
        jardin: annonce.caracteristiques.jardin,
        parking: annonce.caracteristiques.parking,
        numberRooms: annonce.caracteristiques.numberRooms,
        numberSale: annonce.caracteristiques.numberSale,
        numberSalleBain: annonce.caracteristiques.numberSalleBain
      }
    });
  }

  onSubmit(): void {
    if (this.annonceForm.valid) {
      this.isLoading = true;
      this.error = null;

      this.annonceService.update(this.annonceId, this.annonceForm.value).subscribe({
        next: (response) => {
          this.router.navigate(['/annonces', this.annonceId]);
        },
        error: (error) => {
          console.error('Error updating annonce:', error);
          this.error = error.error?.message || 'Failed to update listing';
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.annonceForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.annonceForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.annonceForm.get(fieldName);
    if (control && control.errors) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['minlength']) return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
      if (control.errors['min']) return `Minimum value is ${control.errors['min'].min}`;
      if (control.errors['email']) return 'Invalid email format';
      if (control.errors['pattern']) return 'Invalid format';
    }
    return '';
  }
}
