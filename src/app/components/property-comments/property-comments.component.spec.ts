import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyCommentsComponent } from './property-comments.component';

describe('PropertyCommentsComponent', () => {
  let component: PropertyCommentsComponent;
  let fixture: ComponentFixture<PropertyCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyCommentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PropertyCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
