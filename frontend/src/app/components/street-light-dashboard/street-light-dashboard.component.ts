// street-light-dashboard.component.ts
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

type LightStatus = 'ON' | 'OFF' | 'MAINTENANCE';

interface StreetLightData {
  id: string;
  location: string;
  timestamp: string;
  brightnessLevel: number;
  powerConsumption: number;
  status: LightStatus;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Component({
  selector: 'app-street-light-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    HighchartsChartModule,
    NavbarComponent
  ],
  templateUrl: './street-light-dashboard.component.html',
  styleUrls: ['./street-light-dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class StreetLightDashboardComponent implements OnInit, OnDestroy {
  
  // Data array for street light data
  lightingData: StreetLightData[] = [];
  
  // Filters and sorting
  locationFilter: string = '';
  startDate: string = '';
  endDate: string = '';
  statusFilter: string = '';
  sortField: string = 'timestamp';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalElements: number = 0;

  // Auto refresh
  private autoRefreshSubscription: Subscription | undefined;
  
  // Highcharts configuration
  Highcharts: typeof Highcharts = Highcharts;
  
  // Chart visibility controls
  showAllCharts = true;
  selectedChart: 'brightnessLevel' | 'powerConsumption' | 'statusDistribution' | null = null;

  // Chart configurations
  brightnessChartOptions: Highcharts.Options = {
    title: { text: 'Brightness Level Over Time' },
    xAxis: { type: 'datetime', title: { text: 'Time' } },
    yAxis: { title: { text: 'Brightness (%)' } },
    series: [{
      type: 'line',
      name: 'Brightness Level',
      data: [],
      color: '#7b1fa2'
    }],
    credits: { enabled: false }
  };

  powerConsumptionChartOptions: Highcharts.Options = {
    title: { text: 'Power Consumption Over Time' },
    xAxis: { type: 'datetime', title: { text: 'Time' } },
    yAxis: { title: { text: 'Power (W)' } },
    series: [{
      type: 'line',
      name: 'Power Consumption',
      data: [],
      color: '#6a1b9a'
    }],
    credits: { enabled: false }
  };

  statusDistributionChartOptions: Highcharts.Options = {
    chart: { type: 'column' },
    title: { text: 'Light Status Distribution' },
    xAxis: { 
      categories: ['ON', 'OFF', 'MAINTENANCE'],
      title: { text: 'Status' }
    },
    yAxis: { title: { text: 'Frequency' } },
    series: [{
      type: 'column',
      name: 'Occurrences',
      data: [],
      color: '#8e24aa'
    }],
    credits: { enabled: false }
  };

  constructor(
    public themeService: ThemeService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadData();
    
    // Set up auto refresh every 20 seconds
    this.autoRefreshSubscription = interval(20000).subscribe(() => {
      this.loadData();
    });
  }
  
  ngOnDestroy() {
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
    }
  }

  loadData() {
    console.log('Loading street light data');
    const endpoint = `${environment.apiUrl}/api/sensors/street-light`;
    
    // Configure request parameters
    let params = new HttpParams()
      .set('page', String(this.currentPage - 1))
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
    }
    
    if (this.endDate) {
      const formattedEndDate = new Date(this.endDate).toISOString();
      params = params.set('end', formattedEndDate);
    }
    
    if (this.statusFilter?.trim()) {
      params = params.set('status', this.statusFilter);
    }

    // Set HTTP options with authentication
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    const options = headers ? { params, headers } : { params };
    
    console.log('Making request to:', endpoint);
    console.log('With parameters:', params.toString());

    this.http.get<PageResponse<StreetLightData>>(endpoint, options)
      .subscribe({
        next: response => {
          console.log('Street light data received:', response);
          this.lightingData = response.content;
          this.totalElements = response.totalElements;
          
          console.log(`Loaded ${this.lightingData.length} street light records`);
          console.log('Total records available:', this.totalElements);
          
          // Update charts with the real data
          this.updateTimeSeriesCharts();
          this.updateStatusDistributionChart();
        },
        error: error => {
          console.error('Error loading street light data:', error);
          
          if (error.status === 401) {
            console.error('Authentication failed. Redirecting to login...');
          } else if (error.status === 403) {
            console.error('Permission denied for this resource');
          } else if (error.status === 0) {
            console.error('Connection error. Backend might be down or CORS issue');
          }
          
          this.lightingData = [];
        }
      });
  }

  updateTimeSeriesCharts() {
    // Create a copy before sorting
    const sortedData = [...this.lightingData].sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    
    // Prepare time series data arrays
    const brightnessTimeSeriesData: [number, number][] = [];
    const powerConsumptionTimeSeriesData: [number, number][] = [];
    
    sortedData.forEach(data => {
      const timestamp = new Date(data.timestamp).getTime();
      brightnessTimeSeriesData.push([timestamp, data.brightnessLevel]);
      powerConsumptionTimeSeriesData.push([timestamp, data.powerConsumption]);
    });
    
    // Update brightness chart
    this.brightnessChartOptions = {
      ...this.brightnessChartOptions,
      series: [{
        type: 'line',
        name: 'Brightness Level',
        data: brightnessTimeSeriesData,
        color: '#7b1fa2'
      }]
    };
    
    // Update power consumption chart
    this.powerConsumptionChartOptions = {
      ...this.powerConsumptionChartOptions,
      series: [{
        type: 'line',
        name: 'Power Consumption',
        data: powerConsumptionTimeSeriesData,
        color: '#6a1b9a'
      }]
    };
  }

  updateStatusDistributionChart() {
    const statusCounts = new Map<string, number>();
    const statusCategories = ['ON', 'OFF', 'MAINTENANCE'];
    
    // Initialize counts
    statusCategories.forEach(category => {
      statusCounts.set(category, 0);
    });
    
    // Count occurrences
    this.lightingData.forEach(data => {
      statusCounts.set(data.status, (statusCounts.get(data.status) || 0) + 1);
    });
    
    // Prepare chart data
    const statusData = statusCategories.map(category => statusCounts.get(category) || 0);
    
    // Update status distribution chart
    this.statusDistributionChartOptions = {
      ...this.statusDistributionChartOptions,
      series: [{
        type: 'column',
        name: 'Occurrences',
        data: statusData,
        color: '#8e24aa'
      }]
    };
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.itemsPerPage);
  }

  get paginatedData(): StreetLightData[] {
    return this.lightingData;
  }
  
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
  
  onFilterChange() {
    this.currentPage = 1;
    this.loadData();
  }
  
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

  toggleChart(chartType: 'brightnessLevel' | 'powerConsumption' | 'statusDistribution'): void {
    if (this.selectedChart === chartType) {
      this.showAllCharts = true;
      this.selectedChart = null;
    } else {
      this.showAllCharts = false;
      this.selectedChart = chartType;
    }
  }
}