import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirPollutionDashboardComponent } from './air-pollution-dashboard.component';

describe('AirPollutionDashboardComponent', () => {
  let component: AirPollutionDashboardComponent;
  let fixture: ComponentFixture<AirPollutionDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirPollutionDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirPollutionDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
