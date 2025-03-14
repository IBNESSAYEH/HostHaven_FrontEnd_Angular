import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { Booking } from '../../../models/booking';
import { Annonce } from '../../../models/annonce';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-host-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './host-bookings.component.html',
  styleUrls: ['./host-bookings.component.scss']
})
export class HostBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  properties: Annonce[] = [];
  filteredBookings: Booking[] = [];
  isLoading = true;
  error: string | null = null;
  statusFilter: string = 'all';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadHostProperties();
  }

  loadHostProperties() {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.error = 'User not found';
      this.isLoading = false;
      return;
    }

    this.http.get<Annonce[]>(`http://localhost:8080/api/annonces/user/${userId}`).subscribe({
      next: (properties) => {
        this.properties = properties;
        if (properties.length > 0) {
          this.loadBookingsForProperties(properties);
        } else {
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading host properties:', error);
        this.error = 'Failed to load your properties';
        this.isLoading = false;
      }
    });
  }

  private loadBookingsForProperties(properties: Annonce[]) {
    const bookingRequests = properties.map(property =>
      this.http.get<Booking[]>(`http://localhost:8080/api/bookings/annonce/${property.id}`)
    );

    let completedRequests = 0;
    const allBookings: Booking[] = [];

    // If no properties, don't try to load bookings
    if (bookingRequests.length === 0) {
      this.isLoading = false;
      return;
    }

    bookingRequests.forEach(request => {
      request.subscribe({
        next: (bookings) => {
          allBookings.push(...bookings);
          completedRequests++;

          if (completedRequests === properties.length) {
            this.bookings = allBookings;
            this.applyFilters();
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error loading bookings:', error);
          completedRequests++;

          if (completedRequests === properties.length) {
            if (allBookings.length === 0) {
              this.error = 'Failed to load bookings';
            }
            this.bookings = allBookings;
            this.applyFilters();
            this.isLoading = false;
          }
        }
      });
    });
  }

  applyFilters() {
    if (this.statusFilter === 'all') {
      this.filteredBookings = [...this.bookings];
    } else {
      this.filteredBookings = this.bookings.filter(booking => booking.status === this.statusFilter);
    }

    // Sort by date (most recent first)
    this.filteredBookings.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateB - dateA;
    });
  }

  changeStatus(booking: Booking, newStatus: string) {
    if (newStatus === booking.status) return;

    const actionName = newStatus === 'confirmed' ? 'confirm' : newStatus === 'cancelled' ? 'cancel' : 'update';

    Swal.fire({
      title: `${actionName.charAt(0).toUpperCase() + actionName.slice(1)} Booking?`,
      text: `Are you sure you want to ${actionName} this booking?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Yes, ${actionName} it!`,
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.updateBookingStatus(booking.id, newStatus);
      }
    });
  }

  private updateBookingStatus(bookingId: string, newStatus: string) {
    // Map the status to the correct endpoint
    let endpoint: string;
    if (newStatus === 'cancelled') {
      endpoint = 'cancel';
    } else if (newStatus === 'confirmed') {
      endpoint = 'confirm';
    } else {
      endpoint = newStatus;
    }

    this.http.post(`http://localhost:8080/api/bookings/${bookingId}/${endpoint}`, {}).subscribe({
      next: (response: any) => {
        const index = this.bookings.findIndex(b => b.id === bookingId);
        if (index !== -1) {
          this.bookings[index].status = newStatus;
          this.applyFilters();
        }

        Swal.fire({
          title: 'Success!',
          text: `Booking has been ${newStatus}`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        console.error(`Error ${newStatus} booking:`, error);
        Swal.fire('Error', `Failed to ${newStatus} booking`, 'error');
      }
    });
  }

  getPropertyTitle(annonceId: string): string {
    const property = this.properties.find(p => p.id === annonceId);
    return property ? property.title : 'Unknown Property';
  }

  setStatusFilter(status: string) {
    this.statusFilter = status;
    this.applyFilters();
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  calculateDuration(startDate: Date | string, endDate: Date | string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
}
