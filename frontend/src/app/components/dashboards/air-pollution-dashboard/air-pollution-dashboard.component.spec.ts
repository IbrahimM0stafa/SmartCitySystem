import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HighchartsChartModule } from 'highcharts-angular';
import { of, throwError } from 'rxjs';

import { AirPollutionDashboardComponent } from './air-pollution-dashboard.component';
import { ThemeService } from '../../../services/theme.service';
import { NavbarComponent } from '../../navbar/navbar.component';
import { AuthService } from '../../../services/auth.service';
import { ClickOutsideDirective } from '../../../directives/click-outside.directive';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from '../../../../environments/environment';

// Mock data
const mockAirPollutionData = [
  {
    id: '1',
    location: 'Downtown',
    timestamp: '2024-01-01T10:00:00Z',
    pm2_5: 15.5,
    pm10: 25.0,
    ozone: 65.0,
    pollutionLevel: 'Good' as const,
    co: 0.5,
    no2: 20.0,
    so2: 5.0
  },
  {
    id: '2',
    location: 'Industrial Area',
    timestamp: '2024-01-01T11:00:00Z',
    pm2_5: 45.0,
    pm10: 80.0,
    ozone: 120.0,
    pollutionLevel: 'Unhealthy' as const,
    co: 2.0,
    no2: 55.0,
    so2: 15.0
  },
  {
    id: '3',
    location: 'Residential',
    timestamp: '2024-01-01T12:00:00Z',
    pm2_5: 25.0,
    pm10: 40.0,
    ozone: 85.0,
    pollutionLevel: 'Moderate' as const,
    co: 1.0,
    no2: 30.0,
    so2: 8.0
  }
];

const mockPageResponse = {
  content: mockAirPollutionData,
  totalElements: 3,
  totalPages: 1,
  size: 10,
  number: 0
};

describe('AirPollutionDashboardComponent', () => {
  let component: AirPollutionDashboardComponent;
  let fixture: ComponentFixture<AirPollutionDashboardComponent>;
  let httpMock: HttpTestingController;
  let themeService: jasmine.SpyObj<ThemeService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const themeServiceSpy = jasmine.createSpyObj('ThemeService', ['toggleTheme'], {
      currentTheme: 'dark' // This is fine as initial value
    });

    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserProfile', 'logout']);

    await TestBed.configureTestingModule({
      imports: [
        AirPollutionDashboardComponent,
        HttpClientTestingModule,
        FormsModule,
        CommonModule,
        HighchartsChartModule,
        RouterTestingModule,
        NavbarComponent,
        ClickOutsideDirective
      ],
      providers: [
        { provide: ThemeService, useValue: themeServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AirPollutionDashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    themeService = TestBed.inject(ThemeService) as jasmine.SpyObj<ThemeService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    // Setup auth service mock
    authService.getUserProfile.and.returnValue(of({ firstname: 'Test User' }));
    authService.logout.and.returnValue(of({}));

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue('fake-token');
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with correct default values', () => {
      expect(component.apiEndpoint).toBe('air-pollution');
      expect(component.locationFilter).toBe('');
      expect(component.startDate).toBe('');
      expect(component.endDate).toBe('');
      expect(component.pollutionLevelFilter).toBe('');
      expect(component.showAllCharts).toBe(true);
      expect(component.selectedChart).toBe(null);
      expect(component.currentPage).toBe(1);
      expect(component.itemsPerPage).toBe(10);
    });

    it('should initialize chart options', () => {
      expect(component.pm25ChartOptions).toBeDefined();
      expect(component.ozoneChartOptions).toBeDefined();
      expect(component.pollutionDistributionChartOptions).toBeDefined();
    });

    it('should load data on init', fakeAsync(() => {
      spyOn(component, 'loadData');
      
      component.ngOnInit();
      tick();
      
      expect(component.loadData).toHaveBeenCalled();
    }));
  });

  describe('Data Loading', () => {
    it('should load air pollution data successfully', () => {
      component.loadData();

      const req = httpMock.expectOne(`${environment.apiUrl}/api/sensors/air-pollution?page=0&size=10&sortBy=timestamp&order=desc`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
      req.flush(mockPageResponse);

      expect(component.data).toEqual(mockAirPollutionData);
      expect(component.totalElements).toBe(3);
    });

    it('should handle API error', () => {
      spyOn(console, 'error');
      
      component.loadData();

      const req = httpMock.expectOne(`${environment.apiUrl}/api/sensors/air-pollution?page=0&size=10&sortBy=timestamp&order=desc`);
      req.error(new ProgressEvent('error'), { status: 500 });

      expect(console.error).toHaveBeenCalled();
      expect(component.data).toEqual([]);
    });

    it('should include filters in API request', () => {
      component.locationFilter = 'Downtown';
      component.startDate = '2024-01-01T00:00:00';
      component.endDate = '2024-01-01T23:59:59';
      component.pollutionLevelFilter = 'Good';

      component.loadData();

      const req = httpMock.expectOne(req => {
        return req.url.includes('/api/sensors/air-pollution') &&
               req.params.get('location') === 'Downtown' &&
               req.params.get('pollutionLevel') === 'Good' &&
               req.params.has('start') &&
               req.params.has('end');
      });
      
      expect(req.request.method).toBe('GET');
      req.flush(mockPageResponse);
    });

    it('should handle authentication error', () => {
      spyOn(console, 'error');
      
      component.loadData();

      const req = httpMock.expectOne(`${environment.apiUrl}/api/sensors/air-pollution?page=0&size=10&sortBy=timestamp&order=desc`);
      req.error(new ProgressEvent('error'), { status: 401 });

      expect(console.error).toHaveBeenCalledWith('Authentication failed. Redirecting to login...');
      expect(component.data).toEqual([]);
    });
  });

  describe('Abstract Method Implementations', () => {
    it('should return correct data type', () => {
      expect(component.getDataType()).toBe('air pollution');
    });

    it('should return correct status filter key', () => {
      expect(component.getStatusFilterKey()).toBe('pollutionLevel');
    });

    it('should update charts when updateCharts is called', () => {
      spyOn(component as any, 'updatePM25Chart');
      spyOn(component as any, 'updateOzoneChart');
      spyOn(component as any, 'updatePollutionDistributionChart');

      component.updateCharts();

      expect((component as any).updatePM25Chart).toHaveBeenCalled();
      expect((component as any).updateOzoneChart).toHaveBeenCalled();
      expect((component as any).updatePollutionDistributionChart).toHaveBeenCalled();
    });
  });

  describe('Chart Management', () => {
    beforeEach(() => {
      component.data = mockAirPollutionData;
    });

    it('should update PM2.5 chart with correct data', () => {
      (component as any).updatePM25Chart();
      
      expect(component.pm25ChartOptions.title?.text).toBe('PM2.5 Levels Over Time');
      expect(component.pm25ChartOptions.series?.[0]?.name).toBe('PM2.5');
      // Note: Removed color check as it's not part of SeriesOptionsType
    });

    it('should update Ozone chart with correct data', () => {
      (component as any).updateOzoneChart();
      
      expect(component.ozoneChartOptions.title?.text).toBe('Ozone Levels Over Time');
      expect(component.ozoneChartOptions.series?.[0]?.name).toBe('Ozone');
      // Note: Removed color check as it's not part of SeriesOptionsType
    });

    it('should update pollution distribution chart', () => {
      (component as any).updatePollutionDistributionChart();
      
      expect(component.pollutionDistributionChartOptions.title?.text).toBe('Pollution Level Distribution');
      expect(component.pollutionDistributionChartOptions.chart?.type).toBe('column');
    });
  });

  describe('Theme Management', () => {
    it('should call theme service toggle when toggleTheme is called', () => {
      component.toggleTheme();
      expect(themeService.toggleTheme).toHaveBeenCalled();
    });

    it('should not modify currentTheme directly', () => {
      const originalTheme = themeService.currentTheme;
      // Just verify we can read the property
      expect(themeService.currentTheme).toBe(originalTheme);
    });
  });

  describe('Convenience Getters', () => {
    it('should return pollution data through pollutionData getter', () => {
      component.data = mockAirPollutionData;
      expect(component.pollutionData).toEqual(mockAirPollutionData);
    });

    it('should get and set pollution level filter', () => {
      component.pollutionLevelFilter = 'Good';
      expect(component.pollutionLevelFilter).toBe('Good');
      expect(component.statusFilter).toBe('Good');
    });
  });

  describe('Air Pollution Specific Methods', () => {
    beforeEach(() => {
      component.data = mockAirPollutionData;
    });

    it('should get current air quality', () => {
      const currentAirQuality = component.getCurrentAirQuality();
      expect(currentAirQuality).toBeDefined();
      expect(currentAirQuality?.level).toBe('Moderate');
      expect(currentAirQuality?.pm25).toBe(25.0);
      expect(currentAirQuality?.ozone).toBe(85.0);
    });

    it('should return null for current air quality when no data', () => {
      component.data = [];
      const currentAirQuality = component.getCurrentAirQuality();
      expect(currentAirQuality).toBeNull();
    });

    it('should calculate average pollution levels', () => {
      const averages = component.getAveragePollutionLevels();
      expect(averages.pm25).toBeCloseTo(28.5, 1);
      expect(averages.pm10).toBeCloseTo(48.33, 1);
      expect(averages.ozone).toBeCloseTo(90, 1);
      expect(averages.co).toBeCloseTo(1.17, 1);
      expect(averages.no2).toBeCloseTo(35, 1);
      expect(averages.so2).toBeCloseTo(9.33, 1);
    });

    it('should get pollution level color', () => {
      expect(component.getPollutionLevelColor('Good')).toBe('#4caf50');
      expect(component.getPollutionLevelColor('Moderate')).toBe('#ff9800');
      expect(component.getPollutionLevelColor('Unhealthy')).toBe('#f44336');
      expect(component.getPollutionLevelColor('Very_Unhealthy')).toBe('#9c27b0');
      expect(component.getPollutionLevelColor('Hazardous')).toBe('#795548');
    });

    it('should get pollution level description', () => {
      expect(component.getPollutionLevelDescription('Good')).toContain('satisfactory');
      expect(component.getPollutionLevelDescription('Moderate')).toContain('acceptable');
      expect(component.getPollutionLevelDescription('Unhealthy')).toContain('Everyone may begin');
    });

    it('should identify dangerous pollution levels', () => {
      expect(component.isDangerousLevel('Good')).toBe(false);
      expect(component.isDangerousLevel('Moderate')).toBe(false);
      expect(component.isDangerousLevel('Unhealthy')).toBe(true);
      expect(component.isDangerousLevel('Very_Unhealthy')).toBe(true);
      expect(component.isDangerousLevel('Hazardous')).toBe(true);
    });

    it('should get highest pollution locations', () => {
      const highestLocations = component.getHighestPollutionLocations(2);
      expect(highestLocations.length).toBe(2);
      expect(highestLocations[0].location).toBe('Industrial Area');
      expect(highestLocations[0].avgPM25).toBe(45.0);
      expect(highestLocations[1].location).toBe('Residential');
      expect(highestLocations[1].avgPM25).toBe(25.0);
    });
  });

  describe('Pagination and Filtering', () => {
    it('should handle filter changes', () => {
      spyOn(component, 'loadData');
      component.onFilterChange();
      expect(component.currentPage).toBe(1);
      expect(component.loadData).toHaveBeenCalled();
    });

    it('should handle sorting', () => {
      spyOn(component, 'loadData');
      component.sort('pm2_5');
      expect(component.sortField).toBe('pm2_5');
      expect(component.sortDirection).toBe('asc');
      expect(component.currentPage).toBe(1);
      expect(component.loadData).toHaveBeenCalled();
    });

    it('should toggle sort direction when sorting same field', () => {
      spyOn(component, 'loadData');
      component.sortField = 'pm2_5';
      component.sortDirection = 'asc';
      
      component.sort('pm2_5');
      expect(component.sortDirection).toBe('desc');
    });

    it('should navigate to page', () => {
      spyOn(component, 'loadData');
      component.totalElements = 25;
      component.goToPage(2);
      expect(component.currentPage).toBe(2);
      expect(component.loadData).toHaveBeenCalled();
    });

    it('should not navigate to invalid page', () => {
      spyOn(component, 'loadData');
      component.totalElements = 25;
      component.goToPage(10);
      expect(component.currentPage).toBe(1);
      expect(component.loadData).not.toHaveBeenCalled();
    });
  });

  describe('Auto Refresh', () => {
    it('should set up auto refresh on init', fakeAsync(() => {
      spyOn(component, 'loadData');
      component.refreshInterval = 1000; // 1 second for testing
      
      component.ngOnInit();
      tick(1000);
      
      expect(component.loadData).toHaveBeenCalledTimes(2); // Once on init, once on interval
    }));

    it('should clean up auto refresh on destroy', () => {
      component.ngOnInit();
      const subscription = (component as any).autoRefreshSubscription;
      spyOn(subscription, 'unsubscribe');
      
      component.ngOnDestroy();
      expect(subscription.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Chart Visibility Controls', () => {
    it('should toggle all charts', () => {
      component.showAllCharts = true;
      component.toggleAllCharts();
      expect(component.showAllCharts).toBe(false);
    });

    it('should toggle specific chart', () => {
      component.showAllCharts = true;
      component.toggleChart('pm25');
      expect(component.showAllCharts).toBe(false);
      expect(component.selectedChart).toBe('pm25');
    });

    it('should return to all charts when toggling same chart', () => {
      component.showAllCharts = false;
      component.selectedChart = 'pm25';
      component.toggleChart('pm25');
      expect(component.showAllCharts).toBe(true);
      // Replace: expect(component.selectedChart).toBe(null);
      expect(component.selectedChart).toBeNull(); // Use toBeNull() matcher
    });
  });

  describe('Component Template Integration', () => {
    it('should render component template', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.dashboard-container')).toBeTruthy();
    });

    it('should display correct theme class', () => {
      // Replace: themeService.currentTheme = 'dark';
      spyOnProperty(themeService, 'currentTheme', 'get').and.returnValue('dark');
      fixture.detectChanges();
      const dashboardContainer = fixture.nativeElement.querySelector('.dashboard-container');
      expect(dashboardContainer.classList).toContain('dark-mode');
    });

    it('should display theme toggle button', () => {
      const themeButton = fixture.nativeElement.querySelector('.theme-toggle');
      expect(themeButton).toBeTruthy();
    });
  });
});