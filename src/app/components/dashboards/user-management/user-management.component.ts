import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../services/users.service';
import { AdminUser } from '../../../models/user';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: AdminUser[] = [];
  filteredUsers: AdminUser[] = [];
    selectedUser: AdminUser | null = null;
  editingUser: AdminUser | null = null;
   userForm: FormGroup;
  user: AdminUser | null = null;
  Math = Math;

  searchTerm: string = '';
   filterRole: string = '';

  currentPage: number = 1;
   itemsPerPage: number = 10;
  totalPages: number = 1;

  isLoading: boolean = true;
   error: string | null = null;

  constructor(
    private userService: UsersService,
     private fb: FormBuilder
  ) {
    this.userForm = this.createUserForm();
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  private createUserForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
       lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern('^[0-9]{10}$')]],
       role: ['', Validators.required],
      emailVerificationStatus: [false]
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = null;

    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
         this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
         this.error = 'Failed to load users. Please try again later.';
        this.isLoading = false;

        this.showToast('Error', 'Failed to load users. Please try again later.', 'error');
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.users];

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(u =>
         u.firstName.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        `${u.firstName.toLowerCase()} ${u.lastName.toLowerCase()}`.includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.phone && u.phone.includes(term))
      );
    }

    if (this.filterRole && this.filterRole !== '') {
      filtered = filtered.filter(u => u.role === this.filterRole);
    }

    this.filteredUsers = filtered;
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);

    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterRole = '';
    this.applyFilters();
    this.showToast('Filters Reset', 'All search filters have been cleared', 'info');
  }

  get paginatedUsers(): AdminUser[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
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

  getEmailVerificationClass(user: AdminUser): string {
    return user.emailVerificationStatus ? 'badge-success' : 'badge-warning';
  }

  truncateId(id: string): string {
    return id.substring(0, 8) + '...';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  showUserDetails(user: AdminUser): void {
    this.selectedUser = {...user};
  }

  editUser(user: AdminUser): void {
    this.editingUser = {...user};
    this.selectedUser = null;

    this.userForm.patchValue({
      firstName: user.firstName,
        lastName: user.lastName,
      email: user.email,
        phone: user.phone || '',
      role: user.role,
      emailVerificationStatus: user.emailVerificationStatus
    });
  }

  cancelEdit(): void {
    this.editingUser = null;
    this.userForm.reset();
  }

  toggleUserStatus(user: AdminUser): void {
    const action = user.emailVerificationStatus ? 'unverify' : 'verify';

    Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} user email?`,
      text: `Are you sure you want to ${action} email for ${user.firstName} ${user.lastName}?`,
      icon: 'question',
       showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${action} it!`
    }).then((result) => {
      if (result.isConfirmed) {
        if (user.emailVerificationStatus) {
          this.userService.unverifyUserEmail(user.id).subscribe({
            next: (response) => {
              const index = this.users.findIndex(u => u.id === user.id);
              if (index !== -1) {
                this.users[index].emailVerificationStatus = response.emailVerificationStatus;
              }
              this.showToast('Success', 'Email verification status updated successfully', 'success');
            },
            error: (err) => {
              console.error('Error unverifying user email:', err);
              this.showToast('Error', 'Failed to update email verification status', 'error');
            }
          });
        } else {
          this.userService.verifyUserEmail(user.id).subscribe({
            next: (response) => {
              const index = this.users.findIndex(u => u.id === user.id);
              if (index !== -1) {
                this.users[index].emailVerificationStatus = response.emailVerificationStatus;
              }
              this.showToast('Success', 'Email verification status updated successfully', 'success');
            },
            error: (err) => {
              console.error('Error verifying user email:', err);
              this.showToast('Error', 'Failed to update email verification status', 'error');
            }
          });
        }
      }
    });
  }

  deleteUser(id: string): void {
    const user = this.users.find(u => u.id === id);
    if (!user) return;

    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete user ${user.firstName} ${user.lastName}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(id).subscribe({
          next: () => {
            this.users = this.users.filter(u => u.id !== id);
            this.applyFilters();

            Swal.fire(
              'Deleted!',
              'User has been deleted successfully.',
              'success'
            );
          },
          error: (err) => {
            console.error('Error deleting user:', err);
            Swal.fire(
              'Error!',
              'Failed to delete user. Please try again.',
              'error'
            );
          }
        });
      }
    });
  }

  updateUserRole(user: AdminUser): void {
    if (!user) return;

    this.userService.updateUserRole(user.id, user.role).subscribe({
      next: (response) => {
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.users[index].role = response.role;
        }
        this.showToast('Role Updated', `User role updated to ${response.role} successfully`, 'success');
      },
      error: (err) => {
        console.error('Error updating role:', err);
        const originalUser = this.users.find(u => u.id === user.id);
        if (originalUser) {
          user.role = originalUser.role;
        }
        this.showToast('Error', 'Failed to update user role', 'error');
      }
    });
  }

  saveUser(): void {
    if (this.userForm.invalid || !this.editingUser) return;

    const updatedUser = {
      ...this.editingUser,
      ...this.userForm.value
    };

    Swal.fire({
      title: 'Saving changes',
      html: 'Please wait...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
        this.userService.updateUser(updatedUser.id, updatedUser).subscribe({
          next: (response) => {
            const index = this.users.findIndex(u => u.id === updatedUser.id);
            if (index !== -1) {
              this.users[index] = response;
              this.applyFilters();
            }
            this.editingUser = null;

            Swal.fire({
              title: 'Success!',
              text: 'User information updated successfully',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Error updating user:', err);
            Swal.fire({
              title: 'Error!',
              text: 'Failed to update user information',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        });
      }
    });
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
}
