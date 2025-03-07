
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-booking-success',
  standalone: true,
  imports: [],
  templateUrl: './booking-success.component.html',
  styleUrl: './booking-success.component.css'
})



export class BookingSuccessComponent implements OnInit {
  bookingId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.bookingId = params['booking_id'] || null;
    });
  }
}
