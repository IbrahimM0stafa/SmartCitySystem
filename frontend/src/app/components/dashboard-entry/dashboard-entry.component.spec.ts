import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardEntryComponent } from './dashboard-entry.component';

describe('DashboardEntryComponent', () => {
  let component: DashboardEntryComponent;
  let fixture: ComponentFixture<DashboardEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardEntryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
