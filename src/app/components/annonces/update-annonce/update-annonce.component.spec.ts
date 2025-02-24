import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateAnnonceComponent } from './update-annonce.component';

describe('UpdateAnnonceComponent', () => {
  let component: UpdateAnnonceComponent;
  let fixture: ComponentFixture<UpdateAnnonceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateAnnonceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateAnnonceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
