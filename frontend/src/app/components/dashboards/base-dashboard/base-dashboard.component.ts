// base-dashboard.component.ts
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';
import { environment } from '../../../../environments/environment';
import * as Highcharts from 'highcharts';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface BaseData {
  id: string;
  location: string;
  timestamp: string;
  [key: string]: any;
}

export interface ChartConfig {
  title: string;
  xAxisTitle?: string;
  yAxisTitle?: string;
  seriesName: string;
  color: string;
  chartType?: 'line' | 'column';
}

@Component({
  template: ''
})
export abstract class BaseDashboardComponent<T extends BaseData> implements OnInit, OnDestroy {
  
  // Common data properties
  data: T[] = [];
  
  // Common filters and sorting
  locationFilter: string = '';
  startDate: string = '';
  endDate: string = '';
  private _statusFilter: string = '';
  public get statusFilter(): string {
    return this._statusFilter;
  }
  public set statusFilter(value: string) {
    this._statusFilter = value;
  }
  sortField: string = 'timestamp';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalElements: number = 0;

  // Auto refresh
  private autoRefreshSubscription: Subscription | undefined;
  @Input() refreshInterval: number = 60000; // Default 20 seconds
  
  // Chart visibility controls
  showAllCharts = true;
  selectedChart: string | null = null;
  
  // Highcharts
  Highcharts: typeof Highcharts = Highcharts;

  // Expose commonly used classes for child components
  protected HttpParams = HttpParams;
  protected HttpHeaders = HttpHeaders;
  protected environment = environment;

  // Abstract properties that child components must define
  abstract apiEndpoint: string;

  constructor(
    protected http: HttpClient
  ) {}

  ngOnInit() {
    this.loadData();
    
    // Set up auto refresh
    this.autoRefreshSubscription = interval(this.refreshInterval).subscribe(() => {
      this.loadData();
    });
  }
  
  ngOnDestroy() {
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
    }
  }

  // Null-safe utility methods
  protected safeGet<K extends keyof T>(item: T | null | undefined, key: K, defaultValue: any = null): any {
    return item?.[key] ?? defaultValue;
  }

  protected safeNumber(value: any, defaultValue: number = 0): number {
    if (value === null || value === undefined || value === '') return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }

  protected safeString(value: any, defaultValue: string = ''): string {
    return value?.toString() ?? defaultValue;
  }

  protected safeDate(value: any, defaultValue: Date = new Date()): Date {
    if (!value) return defaultValue;
    const date = new Date(value);
    return isNaN(date.getTime()) ? defaultValue : date;
  }

  protected isValidValue(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  protected filterValidData(data: T[], field: string): T[] {
    return data.filter(item => this.isValidValue(item[field]));
  }

  loadData() {
    console.log(`Loading ${this.getDataType()} data`);
    const endpoint = `${environment.apiUrl}/api/sensors/${this.apiEndpoint}`;
    
    // Configure request parameters
    let params = new HttpParams()
      .set('page', String(this.currentPage - 1))
      .set('size', String(this.itemsPerPage))
      .set('sortBy', this.sortField)
      .set('order', this.sortDirection);
    
    // Add filters if they exist - using null-safe checks
    if (this.locationFilter?.trim()) {
      params = params.set('location', this.locationFilter);
    }
    
    if (this.startDate) {
      const formattedStartDate = this.safeDate(this.startDate).toISOString();
      params = params.set('start', formattedStartDate);
    }
    
    if (this.endDate) {
      const formattedEndDate = this.safeDate(this.endDate).toISOString();
      params = params.set('end', formattedEndDate);
    }
    
    if (this.statusFilter?.trim()) {
      params = params.set(this.getStatusFilterKey(), this.statusFilter);
    }

    // Set HTTP options with authentication
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    const options = headers ? { params, headers } : { params };
    
    console.log('Making request to:', endpoint);
    console.log('With parameters:', params.toString());

    this.http.get<PageResponse<T>>(endpoint, options)
      .subscribe({
        next: response => {
          console.log(`${this.getDataType()} data received:`, response);
          // Null-safe data assignment
          this.data = response?.content ?? [];
          this.totalElements = this.safeNumber(response?.totalElements, 0);
          
          console.log(`Loaded ${this.data.length} ${this.getDataType()} records`);
          console.log('Total records available:', this.totalElements);
          
          // Update charts with the real data
          this.updateCharts();
        },
        error: error => {
          console.error(`Error loading ${this.getDataType()} data:`, error);
          
          if (error.status === 401) {
            console.error('Authentication failed. Redirecting to login...');
          } else if (error.status === 403) {
            console.error('Permission denied for this resource');
          } else if (error.status === 0) {
            console.error('Connection error. Backend might be down or CORS issue');
          }
          
          this.data = [];
        }
      });
  }

  // Common sorting functionality
  sort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    this.currentPage = 1;
    this.loadData();
  }
  
  // Common filter functionality
  onFilterChange() {
    this.currentPage = 1;
    this.loadData();
  }
  
  // Common pagination functionality
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadData();
    }
  }

  // Common chart visibility controls
  toggleAllCharts(): void {
    this.showAllCharts = !this.showAllCharts;
    if (this.showAllCharts) {
      this.selectedChart = null;
    }
  }

  toggleChart(chartType: string): void {
    if (this.selectedChart === chartType) {
      this.showAllCharts = true;
      this.selectedChart = null;
    } else {
      this.showAllCharts = false;
      this.selectedChart = chartType;
    }
  }

  // Common getters
  get totalPages(): number {
    return Math.ceil(this.totalElements / this.itemsPerPage);
  }

  get paginatedData(): T[] {
    return this.data ?? [];
  }

  // Utility method to create time series data - null-safe version
  protected createTimeSeriesData(data: T[], valueField: string): [number, number][] {
    if (!data || data.length === 0) return [];
    
    // Filter out records with null/invalid timestamps or values
    const validData = data.filter(item => 
      this.isValidValue(item.timestamp) && 
      this.isValidValue(item[valueField])
    );
    
    const sortedData = [...validData].sort((a, b) => {
      return this.safeDate(a.timestamp).getTime() - this.safeDate(b.timestamp).getTime();
    });
    
    return sortedData.map(item => [
      this.safeDate(item.timestamp).getTime(),
      this.safeNumber(item[valueField])
    ]);
  }

  // Utility method to create chart options
  protected createChartOptions(config: ChartConfig, data: [number, number][]): Highcharts.Options {
    return {
      title: { text: this.safeString(config.title, 'Chart') },
      xAxis: { 
        type: 'datetime', 
        title: { text: this.safeString(config.xAxisTitle, 'Time') }
      },
      yAxis: { 
        title: { text: this.safeString(config.yAxisTitle, 'Value') }
      },
      series: [{
        type: config.chartType ?? 'line',
        name: this.safeString(config.seriesName, 'Data'),
        data: data ?? [],
        color: this.safeString(config.color, '#000000')
      }],
      credits: { enabled: false },
      responsive: {
        rules: [{
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            legend: {
              enabled: false
            }
          }
        }]
      }
    };
  }

  // Utility method to create distribution/status charts - null-safe version
  protected createDistributionChart(
    data: T[], 
    statusField: string, 
    categories: string[], 
    title: string, 
    color: string
  ): Highcharts.Options {
    if (!data || data.length === 0) {
      return this.createEmptyChart(title, color);
    }

    // Count occurrences of each status/category
    const statusCounts = new Map<string, number>();
    
    // Initialize all categories with 0
    categories.forEach(category => {
      statusCounts.set(category, 0);
    });
    
    // Count actual occurrences - filter out null/undefined values
    data.forEach(item => {
      const status = this.safeString(item[statusField]);
      if (status && statusCounts.has(status)) {
        statusCounts.set(status, statusCounts.get(status)! + 1);
      }
    });
    
    // Convert to array for Highcharts
    const chartData = categories.map(category => statusCounts.get(category) ?? 0);
    
    return {
      chart: { type: 'column' },
      title: { text: this.safeString(title, 'Distribution') },
      xAxis: { 
        categories: categories,
        title: { text: 'Status' }
      },
      yAxis: { 
        title: { text: 'Frequency' },
        min: 0
      },
      series: [{
        type: 'column',
        name: 'Occurrences',
        data: chartData,
        color: this.safeString(color, '#000000')
      }],
      credits: { enabled: false },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0
        }
      },
      responsive: {
        rules: [{
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            legend: {
              enabled: false
            }
          }
        }]
      }
    };
  }

  // Helper method to create empty chart for null data scenarios
  private createEmptyChart(title: string, color: string): Highcharts.Options {
    return {
      chart: { type: 'column' },
      title: { text: this.safeString(title, 'No Data Available') },
      xAxis: { 
        categories: [],
        title: { text: 'Status' }
      },
      yAxis: { 
        title: { text: 'Frequency' },
        min: 0
      },
      series: [{
        type: 'column',
        name: 'Occurrences',
        data: [],
        color: this.safeString(color, '#000000')
      }],
      credits: { enabled: false }
    };
  }

  // Utility method to create location-based aggregated data - null-safe version
  protected createLocationAggregatedData(data: T[], valueField: string): { categories: string[], values: number[] } {
    if (!data || data.length === 0) {
      return { categories: [], values: [] };
    }

    const locationMap = new Map<string, { sum: number, count: number }>();
    
    // Filter out records with null/invalid location or value
    const validData = data.filter(item => 
      this.isValidValue(item.location) && 
      this.isValidValue(item[valueField])
    );
    
    validData.forEach(item => {
      const location = this.safeString(item.location);
      const value = this.safeNumber(item[valueField]);
      
      if (!locationMap.has(location)) {
        locationMap.set(location, { sum: 0, count: 0 });
      }
      
      const entry = locationMap.get(location)!;
      entry.sum += value;
      entry.count++;
    });
    
    const categories: string[] = [];
    const values: number[] = [];
    
    locationMap.forEach((value, key) => {
      categories.push(key);
      values.push(value.count > 0 ? value.sum / value.count : 0); // Average with null protection
    });
    
    return { categories, values };
  }

  // Utility method to format timestamp for display - null-safe version
  protected formatTimestamp(timestamp: string | null | undefined): string {
    if (!this.isValidValue(timestamp)) {
      return 'Invalid Date';
    }

    try {
      return this.safeDate(timestamp).toLocaleString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid Date';
    }
  }

  // Utility method to get the latest data point - null-safe version
  protected getLatestDataPoint(): T | null {
    if (!this.data || this.data.length === 0) return null;

    // Filter out records with invalid timestamps
    const validData = this.data.filter(item => this.isValidValue(item.timestamp));
    
    if (validData.length === 0) return null;

    return validData.reduce((latest, current) => {
      const latestTime = this.safeDate(latest.timestamp).getTime();
      const currentTime = this.safeDate(current.timestamp).getTime();
      return currentTime > latestTime ? current : latest;
    }, validData[0]);
  }

  // Utility method to calculate average of a numeric field - null-safe version
  protected calculateAverage(data: T[], field: string): number {
    if (!data || data.length === 0) return 0;
    
    // Filter out records with null/invalid values for the field
    const validData = data.filter(item => this.isValidValue(item[field]));
    
    if (validData.length === 0) return 0;
    
    const sum = validData.reduce((acc, item) => acc + this.safeNumber(item[field]), 0);
    return sum / validData.length;
  }

  // Additional utility methods for common null-safe operations
  protected safeArrayLength(array: any[]): number {
    return array?.length ?? 0;
  }

  protected safeArrayAccess<T>(array: T[], index: number): T | null {
    return array?.[index] ?? null;
  }

  protected safePropertyAccess(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  // Abstract methods that child components must implement
  abstract getDataType(): string;
  abstract getStatusFilterKey(): string;
  abstract updateCharts(): void;
}