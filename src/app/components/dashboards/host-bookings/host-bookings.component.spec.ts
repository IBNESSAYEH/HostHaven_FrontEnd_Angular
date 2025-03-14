import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostBookingsComponent } from './host-bookings.component';

describe('HostBookingsComponent', () => {
  let component: HostBookingsComponent;
  let fixture: ComponentFixture<HostBookingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostBookingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HostBookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
