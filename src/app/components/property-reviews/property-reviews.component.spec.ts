import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyReviewsComponent } from './property-reviews.component';

describe('PropertyReviewsComponent', () => {
  let component: PropertyReviewsComponent;
  let fixture: ComponentFixture<PropertyReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyReviewsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PropertyReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
