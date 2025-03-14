import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { Booking } from '../../../models/booking';
import Swal from 'sweetalert2';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-bookings.component.html',
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
   isLoading = true;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.error = 'User not found';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.http.get<Booking[]>(`http://localhost:8080/api/bookings/user/${userId}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 200 && error.error instanceof SyntaxError) {
            console.warn('Received malformed JSON with status 200, showing empty bookings');
            return of([]);
          }
          throw error;
        })
      )
      .subscribe({
        next: (data) => {
          this.bookings = data;
            this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading bookings:', error);
            this.error = 'Failed to load bookings. Please try again later.';
          this.isLoading = false;
        }
      });
  }

  cancelBooking(bookingId: string) {
    Swal.fire({
      title: 'Cancel Booking?',
      text: 'Are you sure you want to cancel this booking?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.post(`http://localhost:8080/api/bookings/${bookingId}/cancel`, {})
          .pipe(
            catchError((error) => {
              console.error('Error cancelling booking:', error);
              Swal.fire('Error', 'Failed to cancel booking', 'error');
              throw error;
            })
          )
          .subscribe({
            next: () => {
              this.bookings = this.bookings.map(booking =>
                booking.id === bookingId
                  ? { ...booking, status: 'cancelled' }
                  : booking
              );
              Swal.fire('Cancelled!', 'Your booking has been cancelled.', 'success');
            }
          });
      }
    });
  }
}
