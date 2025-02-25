import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../services/users.service';
import { AdminUser } from '../../../models/user';

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
      }
    });
  }

  applyFilters(): void {
    let filtered = this.users;

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(u =>
        u.firstName.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.phone && u.phone.includes(term))
      );
    }

    if (this.filterRole && this.filterRole !== '') {
      filtered = filtered.filter(u => u.role === this.filterRole);
    }

    this.filteredUsers = filtered;
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    this.currentPage = 1;
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
      phone: user.phone,
      role: user.role,
      emailVerificationStatus: user.emailVerificationStatus
    });
  }

  cancelEdit(): void {
    this.editingUser = null;
    this.userForm.reset();
  }
  // saveUser(): void {
  //   if (this.userForm.invalid || !this.editingUser) return;

  //   const updatedUser = {
  //     ...this.editingUser,
  //     ...this.userForm.value
  //   };

  //   this.userService.updateUser(updatedUser.id, updatedUser).subscribe({
  //     next: (response) => {
  //       const index = this.users.findIndex(u => u.id === updatedUser.id);
  //       if (index !== -1) {
  //         this.users[index] = response;
  //         this.applyFilters();
  //       }
  //       this.editingUser = null;
  //     },
  //     error: (err) => {
  //       console.error('Error updating user:', err);
  //     }
  //   });
  // }


  toggleUserStatus(user: AdminUser): void {
    if (user.emailVerificationStatus) {
      this.userService.unverifyUserEmail(user.id).subscribe({
        next: (response) => {
          const index = this.users.findIndex(u => u.id === user.id);
          if (index !== -1) {
            this.users[index].emailVerificationStatus = response.emailVerificationStatus;
          }
        },
        error: (err) => {
          console.error('Error unverifying user email:', err);
        }
      });
    } else {
      this.userService.verifyUserEmail(user.id).subscribe({
        next: (response) => {
          const index = this.users.findIndex(u => u.id === user.id);
          if (index !== -1) {
            this.users[index].emailVerificationStatus = response.emailVerificationStatus;
          }
        },
        error: (err) => {
          console.error('Error verifying user email:', err);
        }
      });
    }
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== id);
          this.applyFilters();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
        }
      });
    }
  }

  updateUserRole(user: AdminUser): void {
    if (!user) return;

    console.log('Updating role to:', user.role);

    this.userService.updateUserRole(user.id, user.role).subscribe({
      next: (response) => {
        console.log('Role updated successfully:', response);
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.users[index].role = response.role;
        }
      },
      error: (err) => {
        console.error('Error updating role:', err);
        const originalUser = this.users.find(u => u.id === user.id);
        if (originalUser) {
          user.role = originalUser.role;
        }
      }
    });
  }

  saveUser(): void {
    if (this.userForm.invalid || !this.editingUser) return;

    const updatedUser = {
      ...this.editingUser,
      ...this.userForm.value
    };

    this.userService.updateUser(updatedUser.id, updatedUser).subscribe({
      next: (response) => {
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = response;
          this.applyFilters();
        }
        this.editingUser = null;
      },
      error: (err) => {
        console.error('Error updating user:', err);
      }
    });
  }
}
