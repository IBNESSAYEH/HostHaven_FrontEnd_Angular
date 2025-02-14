import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankNewsComponent } from './bank-news.component';

xdescribe('BankNewsComponent', () => {
  let component: BankNewsComponent;
  let fixture: ComponentFixture<BankNewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankNewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
