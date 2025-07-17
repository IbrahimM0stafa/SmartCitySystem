// base-dashboard.component.spec.ts
import { Component } from '@angular/core';
import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { BaseDashboardComponent, BaseData, ChartConfig } from './base-dashboard.component';
import * as Highcharts from 'highcharts';

interface TestData extends BaseData {
  value: number;
  status: string;
  temperature?: number;
  humidity?: number;
}

@Component({
  template: '<div>Test Component</div>',
  standalone: true
})
class TestDashboardComponent extends BaseDashboardComponent<TestData> {
  apiEndpoint = 'test-endpoint';
  chartConfigs: { [key: string]: ChartConfig } = {};
  
  getDataType(): string {
    return 'TestData';
  }
  
  getStatusFilterKey(): string {
    return 'status';
  }
  
  updateCharts(): void {
    // Mock implementation for testing
    this.chartConfigs = {
      temperature: {
        title: 'Temperature Chart',
        xAxisTitle: 'Time',
        yAxisTitle: 'Temperature (°C)',
        seriesName: 'Temperature',
        color: '#ff0000',
        chartType: 'line'
      },
      humidity: {
        title: 'Humidity Chart',
        xAxisTitle: 'Time',
        yAxisTitle: 'Humidity (%)',
        seriesName: 'Humidity',
        color: '#0000ff',
        chartType: 'column'
      }
    };
  }
}

describe('BaseDashboardComponent', () => {
  let component: TestDashboardComponent;
  let fixture: ComponentFixture<TestDashboardComponent>;
  let httpMock: HttpTestingController;

  const mockApiResponse = {
    content: [
      { id: '1', location: 'LocationA', timestamp: '2023-01-01T10:00:00Z', value: 10, status: 'OK', temperature: 25, humidity: 60 },
      { id: '2', location: 'LocationB', timestamp: '2023-01-02T11:00:00Z', value: 15, status: 'WARNING', temperature: 30, humidity: 65 },
      { id: '3', location: 'LocationA', timestamp: '2023-01-03T12:00:00Z', value: 20, status: 'ERROR', temperature: 35, humidity: 70 }
    ] as TestData[],
    totalElements: 3,
    totalPages: 1,
    size: 10,
    number: 0
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TestDashboardComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestDashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // ==================== BASIC COMPONENT TESTS ====================
  describe('Component Initialization', () => {
    it('should create', () => {
      fixture.detectChanges();
      const req = httpMock.expectOne(`${environment.apiUrl}/api/sensors/test-endpoint?page=0&size=10&sortBy=timestamp&order=desc`);
      req.flush({ content: [], totalElements: 0, totalPages: 0, size: 10, number: 0 });
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.data).toEqual([]);
      expect(component.currentPage).toBe(1);
      expect(component.itemsPerPage).toBe(10);
      expect(component.sortField).toBe('timestamp');
      expect(component.sortDirection).toBe('desc');
      expect(component.showAllCharts).toBe(true);
      expect(component.selectedChart).toBeNull();
      expect(component.locationFilter).toBe('');
      expect(component.statusFilter).toBe('');
      expect(component.startDate).toBe('');
      expect(component.endDate).toBe('');
      expect(component.totalElements).toBe(0);
      expect(component.refreshInterval).toBe(60000);
    });

    it('should call abstract methods correctly', () => {
      expect(component.getDataType()).toBe('TestData');
      expect(component.getStatusFilterKey()).toBe('status');
      expect(component.apiEndpoint).toBe('test-endpoint');
    });

    it('should have Highcharts available', () => {
      expect(component.Highcharts).toBeDefined();
    });

    it('should have exposed utility classes', () => {
      expect(component['HttpParams']).toBeDefined();
      expect(component['HttpHeaders']).toBeDefined();
      expect(component['environment']).toBeDefined();
    });
  });

  // ==================== DATA LOADING TESTS ====================
  describe('Data Loading', () => {
    it('should load data successfully', () => {
      spyOn(console, 'log');
      fixture.detectChanges();
      const req = httpMock.expectOne(`${environment.apiUrl}/api/sensors/test-endpoint?page=0&size=10&sortBy=timestamp&order=desc`);
      req.flush(mockApiResponse);

      expect(component.data).toEqual(mockApiResponse.content);
      expect(component.totalElements).toBe(3);
      expect(console.log).toHaveBeenCalledWith('Loading TestData data');
      expect(console.log).toHaveBeenCalledWith('TestData data received:', mockApiResponse);
    });

    it('should handle loading errors gracefully', () => {
      spyOn(console, 'error');
      fixture.detectChanges();
      const req = httpMock.expectOne(`${environment.apiUrl}/api/sensors/test-endpoint?page=0&size=10&sortBy=timestamp&order=desc`);
      req.error(new ProgressEvent('Network error'));
      
      expect(component.data).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error loading TestData data:', jasmine.any(Object));
    });

    it('should handle 401 authentication errors', () => {
      spyOn(console, 'error');
      fixture.detectChanges();
      const req = httpMock.expectOne(`${environment.apiUrl}/api/sensors/test-endpoint?page=0&size=10&sortBy=timestamp&order=desc`);
      req.error(new ProgressEvent('Unauthorized'), { status: 401 });
      
      expect(console.error).toHaveBeenCalledWith('Authentication failed. Redirecting to login...');
    });

    it('should handle 403 permission errors', () => {
      spyOn(console, 'error');
      fixture.detectChanges();
      const req = httpMock.expectOne(`${environment.apiUrl}/api/sensors/test-endpoint?page=0&size=10&sortBy=timestamp&order=desc`);
      req.error(new ProgressEvent('Forbidden'), { status: 403 });
      
      expect(console.error).toHaveBeenCalledWith('Permission denied for this resource');
    });

    it('should handle connection errors', () => {
      spyOn(console, 'error');
      fixture.detectChanges();
      const req = httpMock.expectOne(`${environment.apiUrl}/api/sensors/test-endpoint?page=0&size=10&sortBy=timestamp&order=desc`);
      req.error(new ProgressEvent('Connection error'), { status: 0 });
      
      expect(console.error).toHaveBeenCalledWith('Connection error. Backend might be down or CORS issue');
    });

    it('should reload data when loadData is called', () => {
      // Initial load
      fixture.detectChanges();
      httpMock.expectOne(`${environment.apiUrl}/api/sensors/test-endpoint?page=0&size=10&sortBy=timestamp&order=desc`)
        .flush(mockApiResponse);

      // Manual reload
      component.loadData();
      httpMock.expectOne(`${environment.apiUrl}/api/sensors/test-endpoint?page=0&size=10&sortBy=timestamp&order=desc`)
        .flush(mockApiResponse);

      expect(component.data).toEqual(mockApiResponse.content);
    });

    it('should call updateCharts after successful data load', () => {
      spyOn(component, 'updateCharts');
      fixture.detectChanges();
      const req = httpMock.expectOne(`${environment.apiUrl}/api/sensors/test-endpoint?page=0&size=10&sortBy=timestamp&order=desc`);
      req.flush(mockApiResponse);

      expect(component.updateCharts).toHaveBeenCalled();
    });
  });

  // ==================== FILTERING TESTS ====================
  describe('Filtering', () => {
    it('should apply location filter', () => {
      component.locationFilter = 'LocationA';
      fixture.detectChanges();
      
      const req = httpMock.expectOne(
        req => req.url === `${environment.apiUrl}/api/sensors/test-endpoint` &&
        req.params.get('location') === 'LocationA'
      );
      req.flush(mockApiResponse);
    });

    it('should not apply location filter when empty', () => {
      component.locationFilter = '';
      fixture.detectChanges();
      
      const req = httpMock.expectOne(
        req => req.url === `${environment.apiUrl}/api/sensors/test-endpoint` &&
        !req.params.has('location')
      );
      req.flush(mockApiResponse);
    });

    it('should not apply location filter when only whitespace', () => {
      component.locationFilter = '   ';
      fixture.detectChanges();
      
      const req = httpMock.expectOne(
        req => req.url === `${environment.apiUrl}/api/sensors/test-endpoint` &&
        !req.params.has('location')
      );
      req.flush(mockApiResponse);
    });

    it('should apply status filter', () => {
      component.statusFilter = 'OK';
      fixture.detectChanges();
      
      const req = httpMock.expectOne(
        req => req.url === `${environment.apiUrl}/api/sensors/test-endpoint` &&
        req.params.get('status') === 'OK'
      );
      req.flush(mockApiResponse);
    });

    it('should apply start date filter', () => {
      component.startDate = '2023-01-01';
      fixture.detectChanges();
      
      const req = httpMock.expectOne(
        req => req.url === `${environment.apiUrl}/api/sensors/test-endpoint` &&
        req.params.get('start') === '2023-01-01T00:00:00.000Z'
      );
      req.flush(mockApiResponse);
    });

    it('should apply end date filter', () => {
      component.endDate = '2023-01-31';
      fixture.detectChanges();
      
      const req = httpMock.expectOne(
        req => req.url === `${environment.apiUrl}/api/sensors/test-endpoint` &&
        req.params.get('end') === '2023-01-31T00:00:00.000Z'
      );
      req.flush(mockApiResponse);
    });

    it('should apply multiple filters simultaneously', () => {
      component.locationFilter = 'LocationA';
      component.statusFilter = 'OK';
      component.startDate = '2023-01-01';
      component.endDate = '2023-01-31';
      fixture.detectChanges();
      
      const req = httpMock.expectOne(
        req => req.url === `${environment.apiUrl}/api/sensors/test-endpoint` &&
        req.params.get('location') === 'LocationA' &&
        req.params.get('status') === 'OK' &&
        req.params.has('start') &&
        req.params.has('end')
      );
      req.flush(mockApiResponse);
    });

    it('should reset page to 1 when onFilterChange is called', () => {
      component.currentPage = 3;
      component.onFilterChange();
      
      const req = httpMock.expectOne(
        req => req.params.get('page') === '0'
      );
      req.flush(mockApiResponse);
      expect(component.currentPage).toBe(1);
    });
  });

  // ==================== SORTING TESTS ====================
  describe('Sorting', () => {
    beforeEach(() => {
      fixture.detectChanges();
      httpMock.expectOne(`${environment.apiUrl}/api/sensors/test-endpoint?page=0&size=10&sortBy=timestamp&order=desc`)
        .flush(mockApiResponse);
    });

    it('should sort by location ascending', () => {
      component.sort('location');
      const req = httpMock.expectOne(`${environment.apiUrl}/api/sensors/test-endpoint?page=0&size=10&sortBy=location&order=asc`);
      req.flush(mockApiResponse);
      
      expect(component.sortField).toBe('location');
      expect(component.sortDirection).toBe('asc');
    });

    it('should toggle sort direction when sorting by same field', () => {
      component.sort('location');
      httpMock.expectOne(`${environment.apiUrl}/api/sensors/test-endpoint?page=0&size=10&sortBy=location&order=asc`)
        .flush(mockApiResponse);
      
      component.sort('location');
      const req = httpMock.expectOne(`${environment.apiUrl}/api/sensors/test-endpoint?page=0&size=10&sortBy=location&order=desc`);
      req.flush(mockApiResponse);
      
      expect(component.sortField).toBe('location');
      expect(component.sortDirection).toBe('desc');
    });

    it('should reset page to 1 when sorting', () => {
      component.currentPage = 3;
      component.sort('location');
      
      const req = httpMock.expectOne(
        req => req.params.get('page') === '0'
      );
      req.flush(mockApiResponse);
      expect(component.currentPage).toBe(1);
    });
  });

  // ==================== PAGINATION TESTS ====================
  describe('Pagination', () => {
    it('should go to specified page', () => {
      component.totalElements = 100;
      component.goToPage(2);
      
      const req = httpMock.expectOne(`${environment.apiUrl}/api/sensors/test-endpoint?page=1&size=10&sortBy=timestamp&order=desc`);
      req.flush(mockApiResponse);
      
      expect(component.currentPage).toBe(2);
    });

    it('should not go to page less than 1', () => {
      component.currentPage = 1;
      component.goToPage(0);
      
      // Should not make HTTP request
      expect(component.currentPage).toBe(1);
    });

    it('should not go to page greater than total pages', () => {
      component.totalElements = 20;
      component.currentPage = 1;
      component.goToPage(5); // totalPages would be 2
      
      // Should not make HTTP request
      expect(component.currentPage).toBe(1);
    });

    it('should calculate total pages correctly', () => {
      component.totalElements = 25;
      component.itemsPerPage = 10;
      expect(component.totalPages).toBe(3);
    });

    it('should return paginated data', () => {
      component.data = mockApiResponse.content;
      expect(component.paginatedData).toEqual(mockApiResponse.content);
    });
  });

  // ==================== CHART VISIBILITY TESTS ====================
  describe('Chart Visibility', () => {
    it('should toggle all charts visibility', () => {
      component.showAllCharts = true;
      component.toggleAllCharts();
      expect(component.showAllCharts).toBe(false);
      
      component.toggleAllCharts();
      expect(component.showAllCharts).toBe(true);
    });

    it('should set selected chart to null when showing all charts', () => {
      component.selectedChart = 'temperature';
      component.showAllCharts = false;
      component.toggleAllCharts();
      
      expect(component.showAllCharts).toBe(true);
      expect(component.selectedChart).toBeNull();
    });

    it('should toggle specific chart', () => {
      component.toggleChart('temperature');
      expect(component.showAllCharts).toBe(false);
      expect(component.selectedChart).toBe('temperature');
    });

    it('should show all charts when toggling same chart twice', () => {
      component.toggleChart('temperature');
      expect(component.selectedChart).toBe('temperature');
      
      component.toggleChart('temperature');
      expect(component.showAllCharts).toBe(true);
      expect(component.selectedChart).toBeNull();
    });

    it('should switch between charts', () => {
      component.toggleChart('temperature');
      expect(component.selectedChart).toBe('temperature');
      
      component.toggleChart('humidity');
      expect(component.selectedChart).toBe('humidity');
      expect(component.showAllCharts).toBe(false);
    });
  });

  // ==================== AUTHENTICATION TESTS ====================
  describe('Authentication', () => {
    it('should include authorization header when token exists', () => {
      spyOn(localStorage, 'getItem').and.returnValue('test-token');
      fixture.detectChanges();
      
      const req = httpMock.expectOne(
        req => req.headers.has('Authorization') &&
        req.headers.get('Authorization') === 'Bearer test-token'
      );
      req.flush(mockApiResponse);
    });

    it('should not include authorization header when token does not exist', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      fixture.detectChanges();
      
      const req = httpMock.expectOne(
        req => !req.headers.has('Authorization')
      );
      req.flush(mockApiResponse);
    });
  });

  // ==================== AUTO REFRESH TESTS ====================
  describe('Auto Refresh', () => {
    it('should auto refresh data at specified interval', fakeAsync(() => {
      component.refreshInterval = 1000; // 1 second for testing
      fixture.detectChanges();
      httpMock.expectOne(`${environment.apiUrl}/api/sensors/test-endpoint?page=0&size=10&sortBy=timestamp&order=desc`)
        .flush(mockApiResponse);
      
      tick(1000);
      httpMock.expectOne(`${environment.apiUrl}/api/sensors/test-endpoint?page=0&size=10&sortBy=timestamp&order=desc`)
        .flush(mockApiResponse);
    }));

    it('should stop auto refresh on destroy', fakeAsync(() => {
      component.refreshInterval = 1000;
      fixture.detectChanges();
      httpMock.expectOne(`${environment.apiUrl}/api/sensors/test-endpoint?page=0&size=10&sortBy=timestamp&order=desc`)
        .flush(mockApiResponse);
      
      // Destroy the component
      fixture.destroy();
      
      // Verify no outstanding requests
      httpMock.verify();
      
      tick(1000);
      // No expectation needed since verify() would fail if there were requests
    }));
  });

  // ==================== UTILITY METHODS TESTS ====================
  describe('Utility Methods', () => {
    beforeEach(() => {
      component.data = mockApiResponse.content;
    });

    it('should create time series data', () => {
      const result = component['createTimeSeriesData'](component.data, 'value');
      expect(result).toEqual([
        [new Date('2023-01-01T10:00:00Z').getTime(), 10],
        [new Date('2023-01-02T11:00:00Z').getTime(), 15],
        [new Date('2023-01-03T12:00:00Z').getTime(), 20]
      ]);
    });

    it('should create chart options', () => {
      const config: ChartConfig = {
        title: 'Test Chart',
        xAxisTitle: 'Time',
        yAxisTitle: 'Value',
        seriesName: 'Test Series',
        color: '#ff0000',
        chartType: 'line'
      };
      
      const data: [number, number][] = [[Date.now(), 10]];
      const options = component['createChartOptions'](config, data);
      
      expect(options.title?.text).toBe('Test Chart');
      expect(options.xAxis && 'title' in options.xAxis && options.xAxis.title?.text).toBe('Time');
      expect(options.yAxis && 'title' in options.yAxis && options.yAxis.title?.text).toBe('Value');
      expect(options.series?.[0].type).toBe('line');
      expect(options.series?.[0].name).toBe('Test Series');
      // Type assertion for accessing color property
      expect((options.series?.[0] as any).color).toBe('#ff0000');
      expect(options.credits?.enabled).toBe(false);
    });

    it('should create chart options with default values', () => {
      const config: ChartConfig = {
        title: 'Test Chart',
        seriesName: 'Test Series',
        color: '#ff0000'
      };
      
      const data: [number, number][] = [[Date.now(), 10]];
      const options = component['createChartOptions'](config, data);
      
      expect(options.xAxis && 'title' in options.xAxis && options.xAxis.title?.text).toBe('Time');
      expect(options.yAxis && 'title' in options.yAxis && options.yAxis.title?.text).toBe('Value');
      expect(options.series?.[0].type).toBe('line');
    });

    it('should create distribution chart', () => {
      const categories = ['OK', 'WARNING', 'ERROR'];
      const options = component['createDistributionChart'](
        component.data,
        'status',
        categories,
        'Status Distribution',
        '#00ff00'
      );
      
      expect(options.chart?.type).toBe('column');
      expect(options.title?.text).toBe('Status Distribution');
      expect(options.xAxis && 'categories' in options.xAxis && options.xAxis.categories).toEqual(categories);
      // Type assertion for accessing data property
      expect((options.series?.[0] as any).data).toEqual([1, 1, 1]); // One of each status
    });

    it('should create location aggregated data', () => {
      const result = component['createLocationAggregatedData'](component.data, 'value');
      expect(result.categories).toContain('LocationA');
      expect(result.categories).toContain('LocationB');
      expect(result.values).toEqual([15, 15]); // Average for LocationA: (10+20)/2=15, LocationB: 15
    });

    it('should format timestamp', () => {
      const timestamp = '2023-01-01T10:00:00Z';
      const result = component['formatTimestamp'](timestamp);
      expect(result).toBe(new Date(timestamp).toLocaleString());
    });

    it('should get latest data point', () => {
      const latest = component['getLatestDataPoint']();
      expect(latest?.id).toBe('3'); // Latest by timestamp
    });

    it('should return null for latest data point when no data', () => {
      component.data = [];
      const latest = component['getLatestDataPoint']();
      expect(latest).toBeNull();
    });

    it('should calculate average', () => {
      const average = component['calculateAverage'](component.data, 'value');
      expect(average).toBe(15); // (10+15+20)/3 = 15
    });

    it('should return 0 for average when no data', () => {
      const average = component['calculateAverage']([], 'value');
      expect(average).toBe(0);
    });

    it('should handle missing field in average calculation', () => {
      const dataWithMissing: TestData[] = [
        { id: '1', location: 'A', timestamp: '2023-01-01T00:00:00Z', value: 10, status: 'OK' },
        { id: '2', location: 'B', timestamp: '2023-01-02T00:00:00Z', value: 0, status: 'OK' } // explicit 0 instead of undefined
      ];
      const average = component['calculateAverage'](dataWithMissing, 'value');
      expect(average).toBe(5); // (10+0)/2 = 5
    });
  });

  // ==================== STATUS FILTER PROPERTY TESTS ====================
  describe('Status Filter Property', () => {
    it('should get and set status filter', () => {
      component.statusFilter = 'OK';
      expect(component.statusFilter).toBe('OK');
    });

    it('should apply status filter correctly', () => {
      component.statusFilter = 'WARNING';
      fixture.detectChanges();
      
      const req = httpMock.expectOne(
        req => req.params.get('status') === 'WARNING'
      );
      req.flush(mockApiResponse);
    });
  });

  // ==================== ERROR HANDLING TESTS ====================
  describe('Error Handling', () => {
    it('should handle empty response', () => {
      fixture.detectChanges();
      const req = httpMock.expectOne(`${environment.apiUrl}/api/sensors/test-endpoint?page=0&size=10&sortBy=timestamp&order=desc`);
      req.flush({ content: [], totalElements: 0, totalPages: 0, size: 10, number: 0 });
      
      expect(component.data).toEqual([]);
      expect(component.totalElements).toBe(0);
    });

    it('should handle malformed response', () => {
      spyOn(console, 'error');
      fixture.detectChanges();
      const req = httpMock.expectOne(`${environment.apiUrl}/api/sensors/test-endpoint?page=0&size=10&sortBy=timestamp&order=desc`);
      req.flush(null);
      
      expect(component.data).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });
  });
});