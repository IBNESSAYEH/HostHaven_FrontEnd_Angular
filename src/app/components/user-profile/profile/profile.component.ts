import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;
  userInfo: any = null;

  constructor(
    private fb: FormBuilder,
      private authService: AuthService,
    private userService: UsersService,
     private router: Router
  ) {
    this.profileForm = this.initializeProfileForm();
     this.passwordForm = this.initializePasswordForm();
  }

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadUserProfile();
  }

  private initializeProfileForm(): FormGroup {
    return this.fb.group({
       firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
       phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });
  }

  private initializePasswordForm(): FormGroup {
    return this.fb.group({
      currentPassword: ['', [Validators.required]],
       newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { passwordMismatch: true };
  }

  private loadUserProfile() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userInfo = user;
      this.profileForm.patchValue({
        firstName: user.firstName,
         lastName: user.lastName,
        phone: user.phone
      });
    }
  }

  getUserInitials(): string {
    if (!this.userInfo) return '';
    return `${this.userInfo.firstName[0]}${this.userInfo.lastName[0]}`.toUpperCase();
  }

  getCurrentUserName(): string {
    if (!this.userInfo) return '';
    return `${this.userInfo.firstName} ${this.userInfo.lastName}`;
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  isFieldInvalid(fieldName: string, form: FormGroup = this.profileForm): boolean {
    const field = form.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    if (control && control.errors) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['minlength'])
        return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
      if (control.errors['maxlength'])
        return `Maximum length is ${control.errors['maxlength'].requiredLength} characters`;
      if (control.errors['pattern']) return 'Invalid format';
    }
    return '';
  }

  onSubmit() {
    if (this.profileForm.valid && this.userInfo?.userId) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;

      this.userService.updateProfile(
        this.userInfo.userId,
        this.profileForm.value
      ).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: (response) => {
          this.successMessage = 'Profile updated successfully';
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              ...this.profileForm.value
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            this.userInfo = updatedUser;
          }
        },
        error: (error) => {
          console.error('Profile update error:', error);
          this.error = error.error?.message || 'Failed to update profile';
        }
      });
    }
  }

  onPasswordChange() {
    if (this.passwordForm.valid && this.userInfo?.userId) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;

      const passwordData = {
        currentPassword: this.passwordForm.get('currentPassword')?.value,
        newPassword: this.passwordForm.get('newPassword')?.value
      };

      this.userService.changePassword(
        this.userInfo.userId,
        passwordData
      ).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: () => {
          this.successMessage = 'Password changed successfully';
          this.passwordForm.reset();
        },
        error: (error) => {
          console.error('Password change error:', error);
          this.error = error.error?.message || 'Failed to change password';
        }
      });
    }
  }
}
