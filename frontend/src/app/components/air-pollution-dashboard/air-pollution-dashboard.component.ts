import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpParams, HttpHeaders } from '@angular/common/http';
import { HighchartsChartModule } from 'highcharts-angular';
import { NavbarComponent } from '../navbar/navbar.component';
import * as Highcharts from 'highcharts';
import { environment } from '../../../environments/environment';
import { Subscription, interval } from 'rxjs';

type PollutionLevel = 'Good' | 'Moderate' | 'Unhealthy' | 'Very_Unhealthy' | 'Hazardous';

interface AirPollutionData {
  id: string;
  location: string;
  timestamp: string;
  pm2_5: number;
  pm10: number;
  ozone: number;
  pollutionLevel: PollutionLevel;
  co: number;
  no2: number;
  so2: number;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Component({
  selector: 'app-air-pollution-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    HighchartsChartModule,
    NavbarComponent
  ],
  templateUrl: './air-pollution-dashboard.component.html',
  styleUrls: ['./air-pollution-dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AirPollutionDashboardComponent implements OnInit, OnDestroy {
  
  // Data array for air pollution data
  pollutionData: AirPollutionData[] = [];
  
  // Filters and sorting
  locationFilter: string = '';
  startDate: string = '';
  endDate: string = '';
  pollutionLevelFilter: string = '';
  sortField: string = 'timestamp';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalElements: number = 0;

  // Auto refresh
  private autoRefreshSubscription: Subscription | undefined;
  
  // Chart controls
  showAllCharts = true;
  selectedChart: 'pm25' | 'ozone' | 'pollutionDistribution' | null = null;
  
  // Highcharts configuration
  Highcharts: typeof Highcharts = Highcharts;
  
  pm25ChartOptions: Highcharts.Options = {
    title: { text: 'PM2.5 Levels Over Time' },
    xAxis: { type: 'datetime', title: { text: 'Time' } },
    yAxis: { title: { text: 'PM2.5 (μg/m³)' } },
    series: [{
      type: 'line',
      name: 'PM2.5',
      data: [],
      color: '#e91e63'
    }],
    credits: { enabled: false }
  };

  ozoneChartOptions: Highcharts.Options = {
    title: { text: 'Ozone Levels Over Time' },
    xAxis: { type: 'datetime', title: { text: 'Time' } },
    yAxis: { title: { text: 'Ozone (ppb)' } },
    series: [{
      type: 'line',
      name: 'Ozone',
      data: [],
      color: '#00bcd4'
    }],
    credits: { enabled: false }
  };

  pollutionDistributionChartOptions: Highcharts.Options = {
    chart: { type: 'column' },
    title: { text: 'Pollution Level Distribution' },
    xAxis: { 
      categories: ['Good', 'Moderate', 'Unhealthy', 'Very_Unhealthy', 'Hazardous'],
      title: { text: 'Pollution Level' }
    },
    yAxis: { title: { text: 'Frequency' } },
    series: [{
      type: 'column',
      name: 'Occurrences',
      data: [],
      color: '#ff5722'
    }],
    credits: { enabled: false }
  };

  constructor(
    public themeService: ThemeService,
    private readonly http: HttpClient
  ) {}

  ngOnInit() {
    this.loadData();
    
    // Set up auto refresh every 60 seconds
    this.autoRefreshSubscription = interval(60000).subscribe(() => {
      this.loadData();
    });
  }
  
  ngOnDestroy() {
    // Clean up subscription when component is destroyed
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
    }
  }

  loadData() {
    console.log('Loading air pollution data...');
    const baseUrl = `${environment.apiUrl}/api/sensors/air-pollution`;
    
    // Configure request parameters
    let params = new HttpParams()
      .set('page', String(this.currentPage - 1))  // Spring uses 0-based indexing
      .set('size', String(this.itemsPerPage))
      .set('sortBy', this.sortField)
      .set('order', this.sortDirection);
    
    // Add filters if they exist
    if (this.locationFilter?.trim()) {
      params = params.set('location', this.locationFilter);
    }
    
    if (this.startDate) {
      const formattedStartDate = new Date(this.startDate).toISOString();
      params = params.set('start', formattedStartDate);
      console.log('Using start date filter:', formattedStartDate);
    }
    
    if (this.endDate) {
      const formattedEndDate = new Date(this.endDate).toISOString();
      params = params.set('end', formattedEndDate);
      console.log('Using end date filter:', formattedEndDate);
    }
    
    if (this.pollutionLevelFilter?.trim()) {
      params = params.set('pollutionLevel', this.pollutionLevelFilter);
      console.log('Applied pollution level filter:', this.pollutionLevelFilter);
    }

    // Set HTTP options with parameters and manual Authorization header
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    const options = headers ? { params, headers } : { params };
    
    console.log('Making request to:', baseUrl);
    console.log('With parameters:', params.toString());
    
    // Check if we have authentication token
    const hasToken = !!localStorage.getItem('token');
    console.log('Authentication token present:', hasToken);

    // Make the HTTP request
    this.http.get<PageResponse<AirPollutionData>>(baseUrl, options)
      .subscribe({
        next: response => {
          console.log('Response received:', response);
          
          this.pollutionData = response.content;
          this.totalElements = response.totalElements;
          
          console.log(`Loaded ${this.pollutionData.length} pollution records`);
          console.log('Total records available:', this.totalElements);
          console.log('Current page:', response.number + 1);
          console.log('Total pages:', response.totalPages);
          
          // Update charts with the real data
          this.updateCharts();
        },
        error: error => {
          console.error('Error loading air pollution data:', error);
          
          // Handle specific error cases
          if (error.status === 401) {
            console.error('Authentication failed. Redirecting to login...');
          } else if (error.status === 403) {
            console.error('Permission denied for this resource');
          } else if (error.status === 0) {
            console.error('Connection error. Backend might be down or CORS issue');
          }
          
          // Reset data to empty to avoid displaying stale data
          this.pollutionData = [];
        }
      });
  }

  updateCharts() {
    this.updatePM25Chart();
    this.updateOzoneChart();
    this.updatePollutionDistributionChart();
  }

  updatePM25Chart() {
    // Create a copy before sorting
    const sortedData = [...this.pollutionData].sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    
    const pm25Data: [number, number][] = sortedData.map(data => [
      new Date(data.timestamp).getTime(),
      data.pm2_5
    ]);
    
    this.pm25ChartOptions = {
      ...this.pm25ChartOptions,
      series: [{
        type: 'line',
        name: 'PM2.5',
        data: pm25Data,
        color: '#e91e63'
      }]
    };
  }

  updateOzoneChart() {
    // Create a copy before sorting
    const sortedData = [...this.pollutionData].sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    
    const ozoneData: [number, number][] = sortedData.map(data => [
      new Date(data.timestamp).getTime(),
      data.ozone
    ]);
    
    this.ozoneChartOptions = {
      ...this.ozoneChartOptions,
      series: [{
        type: 'line',
        name: 'Ozone',
        data: ozoneData,
        color: '#00bcd4'
      }]
    };
  }

  updatePollutionDistributionChart() {
    const pollutionCounts = new Map<string, number>();
    const pollutionCategories = ['Good', 'Moderate', 'Unhealthy', 'Very_Unhealthy', 'Hazardous'];
    
    // Initialize counts
    pollutionCategories.forEach(category => {
      pollutionCounts.set(category, 0);
    });
    
    // Count occurrences
    this.pollutionData.forEach(data => {
      const level = data.pollutionLevel;
      pollutionCounts.set(level, (pollutionCounts.get(level) ?? 0) + 1);
    });
    
    // Prepare chart data
    const distributionData = pollutionCategories.map(category => pollutionCounts.get(category) ?? 0);
    
    this.pollutionDistributionChartOptions = {
      ...this.pollutionDistributionChartOptions,
      series: [{
        type: 'column',
        name: 'Occurrences',
        data: distributionData,
        color: '#ff5722'
      }]
    };
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.itemsPerPage);
  }

  get paginatedData(): AirPollutionData[] {
    return this.pollutionData;
  }
  
  sort(field: string) {
    if (this.sortField === field) {
      // If clicking the same field, toggle direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // If clicking a new field, set it as the sort field and default to ascending
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    // Reset to page 1 when sorting changes
    this.currentPage = 1;
    
    this.loadData(); // Reload data with new sorting
  }
  
  // Handle filter changes - reset pagination when filters change
  onFilterChange() {
    this.currentPage = 1; // Reset to page 1
    this.loadData();
  }
  
  // Navigation between pages
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadData();
    }
  }

  toggleAllCharts(): void {
    this.showAllCharts = !this.showAllCharts;
    if (this.showAllCharts) {
      this.selectedChart = null;
    }
  }

  toggleChart(chartType: 'pm25' | 'ozone' | 'pollutionDistribution'): void {
    if (this.selectedChart === chartType) {
      this.showAllCharts = true;
      this.selectedChart = null;
    } else {
      this.showAllCharts = false;
      this.selectedChart = chartType;
    }
  }
}