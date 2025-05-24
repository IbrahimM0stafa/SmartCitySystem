import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule, HttpParams, HttpHeaders } from '@angular/common/http';
import { HighchartsChartModule } from 'highcharts-angular';
import { NavbarComponent } from '../navbar/navbar.component';
import * as Highcharts from 'highcharts';
import { environment } from '../../../environments/environment';
import { Subscription, interval } from 'rxjs';

type CongestionLevel = 'Low' | 'Moderate' | 'High' | 'Severe';

interface TrafficData {
  id: string;
  location: string;
  timestamp: string;
  trafficDensity: number;
  avgSpeed: number;
  congestionLevel: CongestionLevel;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Component({
  selector: 'app-traffic-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    HighchartsChartModule,
    NavbarComponent
  ],
  templateUrl: './traffic-dashboard.component.html',
  styleUrls: ['./traffic-dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TrafficDashboardComponent implements OnInit, OnDestroy {
  dashboardType: 'traffic' | 'lighting' | 'pollution' = 'traffic';
  
  // Data arrays for current data
  trafficData: TrafficData[] = [];
  
  // Common filters and sorting
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
  chartOptions: Highcharts.Options = {
    title: { text: 'Traffic Metrics by Location' },
    xAxis: { categories: [] },
    yAxis: [
      { title: { text: 'Traffic Density' } },
      { title: { text: 'Average Speed (km/h)' }, opposite: true }
    ],
    series: [
      { type: 'column', name: 'Traffic Density', data: [] },
      { type: 'line', name: 'Average Speed', data: [], yAxis: 1 }
    ]
  };
  updateFlag = false;

  showAllCharts = true;
  selectedChart: 'primaryMetric' | 'secondaryMetric' | 'statusDistribution' | null = null;

  primaryMetricChartOptions: Highcharts.Options = {
    title: { text: 'Traffic Density Over Time' },
    xAxis: { type: 'datetime', title: { text: 'Time' } },
    yAxis: { title: { text: 'Vehicles per Hour' } },
    series: [{
      type: 'line',
      name: 'Traffic Density',
      data: [],
      color: '#7b1fa2'
    }],
    credits: { enabled: false }
  };

  secondaryMetricChartOptions: Highcharts.Options = {
    title: { text: 'Average Speed Over Time' },
    xAxis: { type: 'datetime', title: { text: 'Time' } },
    yAxis: { title: { text: 'Speed (km/h)' } },
    series: [{
      type: 'line',
      name: 'Average Speed',
      data: [],
      color: '#6a1b9a'
    }],
    credits: { enabled: false }
  };

  statusDistributionChartOptions: Highcharts.Options = {
    chart: { type: 'column' },
    title: { text: 'Congestion Level Distribution' },
    xAxis: { 
      categories: ['Low', 'Moderate', 'High', 'Severe'],
      title: { text: 'Congestion Level' }
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
    private route: ActivatedRoute,
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
    // Clean up subscription when component is destroyed
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
    }
  }

  loadData() {
    console.log('Loading traffic data');
    const baseUrl = `${environment.apiUrl}/api/sensors`;
    
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
      params = params.set('congestionLevel', this.statusFilter);
    }

    // Set HTTP options with parameters and manual Authorization header
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    const options = headers ? { params, headers } : { params };
    
    const endpoint = `${baseUrl}/traffic`;
    
    // Make the HTTP request
    this.http.get<PageResponse<TrafficData>>(endpoint, options)
      .subscribe({
        next: response => {
          this.trafficData = response.content;
          this.totalElements = response.totalElements;
          
          // Update charts with the real data
          this.updateChartData();
          this.updateTimeSeriesCharts();
          this.updateStatusDistributionChart();
        },
        error: error => {
          console.error('Error loading data:', error);
          this.trafficData = [];
        }
      });
  }

  updateChartData() {
    // Process data for chart
    const locationMap = new Map<string, { primary: number; secondary: number; count: number }>();
    
    // Aggregate data by location
    this.trafficData.forEach(data => {
      const location = data.location;
      if (!locationMap.has(location)) {
        locationMap.set(location, { primary: 0, secondary: 0, count: 0 });
      }
      
      const entry = locationMap.get(location)!;
      entry.primary += data.trafficDensity;
      entry.secondary += data.avgSpeed;
      entry.count++;
    });
    
    // Calculate averages
    const categories: string[] = [];
    const primaryData: number[] = [];
    const secondaryData: number[] = [];
    
    locationMap.forEach((value, key) => {
      categories.push(key);
      primaryData.push(value.primary / value.count);
      secondaryData.push(value.secondary / value.count);
    });

    // Update chart configuration
    this.chartOptions = {
      ...this.chartOptions,
      xAxis: { categories },
      series: [
        { 
          type: 'column',
          name: 'Traffic Density',
          data: primaryData
        },
        {
          type: 'line',
          name: 'Average Speed',
          data: secondaryData,
          yAxis: 1
        }
      ]
    };

    this.updateFlag = true;
    setTimeout(() => {
      this.updateFlag = false;
    });
  }

  updateTimeSeriesCharts() {
    const sortedData = [...this.trafficData].sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    
    const primaryTimeSeriesData: [number, number][] = [];
    const secondaryTimeSeriesData: [number, number][] = [];
    
    sortedData.forEach(data => {
      const timestamp = new Date(data.timestamp).getTime();
      primaryTimeSeriesData.push([timestamp, data.trafficDensity]);
      secondaryTimeSeriesData.push([timestamp, data.avgSpeed]);
    });
    
    // Update primary metric chart
    this.primaryMetricChartOptions = {
      ...this.primaryMetricChartOptions,
      series: [{
        type: 'line',
        name: 'Traffic Density',
        data: primaryTimeSeriesData,
        color: '#7b1fa2'
      }]
    };
    
    // Update secondary metric chart
    this.secondaryMetricChartOptions = {
      ...this.secondaryMetricChartOptions,
      series: [{
        type: 'line',
        name: 'Average Speed',
        data: secondaryTimeSeriesData,
        color: '#6a1b9a'
      }]
    };
  }

  updateStatusDistributionChart() {
    const statusCounts = new Map<string, number>();
    const statusCategories = ['Low', 'Moderate', 'High', 'Severe'];
    
    // Initialize counts
    statusCategories.forEach(category => {
      statusCounts.set(category, 0);
    });
    
    // Count occurrences
    this.trafficData.forEach(data => {
      const status = data.congestionLevel;
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    });
    
    // Prepare chart data
    const statusData = statusCategories.map(category => statusCounts.get(category) || 0);
    
    // Update status distribution chart
    this.statusDistributionChartOptions = {
      ...this.statusDistributionChartOptions,
      xAxis: {
        categories: statusCategories,
        title: { text: 'Congestion Level' }
      },
      series: [{
        type: 'column',
        name: 'Occurrences',
        data: statusData,
        color: '#8e24aa'
      }]
    };
  }

  getCurrentData(): TrafficData[] {
    return this.trafficData;
  }

  getPrimaryMetricName(): string {
    return 'Traffic Density';
  }

  getSecondaryMetricName(): string {
    return 'Average Speed';
  }

  getStatusFieldName(): string {
    return 'Congestion Level';
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.itemsPerPage);
  }

  get paginatedData(): any[] {
    return this.getCurrentData();
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
  
  // RESET TO PAGE 1 when sorting changes - this is important!
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

  toggleChart(chartType: 'primaryMetric' | 'secondaryMetric' | 'statusDistribution'): void {
    if (this.selectedChart === chartType) {
      this.showAllCharts = true;
      this.selectedChart = null;
    } else {
      this.showAllCharts = false;
      this.selectedChart = chartType;
    }
  }
}