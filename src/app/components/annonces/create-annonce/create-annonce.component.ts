import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AnnonceService } from '../../../services/annonce.service';
import { City, Type, Category } from '../../../models/annonce';
import { AuthService } from '../../../services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-create-annonce',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './create-annonce.component.html',
  styleUrls: ['./create-annonce.component.scss']
})
export class CreateAnnonceComponent implements OnInit {
  annonceForm: FormGroup = this.initializeForm();
  cities: City[] = [];
  types: Type[] = [];
  categories: Category[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private annonceService: AnnonceService,
    private authService: AuthService,
    private router: Router
  ) {}

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

    this.loadFormData();

    const userEmail = this.authService.userSubject?.getValue()?.email;
    if (userEmail) {
      this.annonceForm.patchValue({ email: userEmail });
    }
  }

  private loadFormData(): void {
    this.isLoading = true;
    this.error = null;

    forkJoin({
      cities: this.annonceService.getCities(),
      types: this.annonceService.getTypes(),
      categories: this.annonceService.getCategories()
    }).subscribe({
      next: (data) => {
        this.cities = data.cities;
        this.types = data.types;
        this.categories = data.categories;
        this.error = null;
      },
      error: (error) => {
        console.error('Error loading form data:', error);
        if (error.status === 401) {
          this.error = 'Your session has expired. Please login again.';
          this.router.navigate(['/auth/login']);
        } else {
          this.error = 'Failed to load necessary data. Please try again.';
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.annonceForm.valid) {
      this.isLoading = true;
      this.error = null;

      const token = this.authService.getToken();
      if (!token) {
        this.error = 'You must be authenticated to create a listing';
        this.isLoading = false;
        return;
      }

      const formData = this.annonceForm.value;

      this.annonceService.create(formData).subscribe({
        next: (response) => {
          console.log('Annonce created successfully:', response);
          this.router.navigate(['/annonces', response.id]);
        },
        error: (error) => {
          console.error('Error creating annonce:', error);
          this.error = error.error?.message || 'Failed to create listing';
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
