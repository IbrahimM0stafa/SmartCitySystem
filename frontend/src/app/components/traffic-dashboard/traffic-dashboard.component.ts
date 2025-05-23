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
type PollutionLevel = 'Good' | 'Moderate' | 'Unhealthy' | 'Very_Unhealthy' | 'Hazardous';
type LightStatus = 'ON' | 'OFF' | 'MAINTENANCE';

interface TrafficData {
  id: string;
  location: string;
  timestamp: string;
  trafficDensity: number;
  avgSpeed: number;
  congestionLevel: CongestionLevel;
}

interface StreetLightData {
  id: string;
  location: string;
  timestamp: string;
  brightnessLevel: number;
  powerConsumption: number;
  status: LightStatus;
}

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
  lightingData: StreetLightData[] = [];
  pollutionData: AirPollutionData[] = [];
  
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
    title: { text: 'Metrics by Location' },
    xAxis: { categories: [] },
    yAxis: [
      { title: { text: 'Primary Metric' } },
      { title: { text: 'Secondary Metric' }, opposite: true }
    ],
    series: [
      { type: 'column', name: 'Primary Metric', data: [] },
      { type: 'line', name: 'Secondary Metric', data: [], yAxis: 1 }
    ]
  };
  updateFlag = false;

  showAllCharts = true;
  selectedChart: 'primaryMetric' | 'secondaryMetric' | 'statusDistribution' | null = null;

  primaryMetricChartOptions: Highcharts.Options = {
    title: { text: 'Primary Metric Over Time' },
    xAxis: { type: 'datetime', title: { text: 'Time' } },
    yAxis: { title: { text: 'Value' } },
    series: [{
      type: 'line',
      name: 'Primary Metric',
      data: [],
      color: '#7b1fa2'
    }],
    credits: { enabled: false }
  };

  secondaryMetricChartOptions: Highcharts.Options = {
    title: { text: 'Secondary Metric Over Time' },
    xAxis: { type: 'datetime', title: { text: 'Time' } },
    yAxis: { title: { text: 'Value' } },
    series: [{
      type: 'line',
      name: 'Secondary Metric',
      data: [],
      color: '#6a1b9a'
    }],
    credits: { enabled: false }
  };

  statusDistributionChartOptions: Highcharts.Options = {
    chart: { type: 'column' },
    title: { text: 'Status Distribution' },
    xAxis: { 
      categories: [],
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
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Determine dashboard type from route
    this.dashboardType = this.route.snapshot.url[0]?.path?.split('-')[0] as 'traffic' | 'lighting' | 'pollution' || 'traffic';
    this.loadData();
    this.updateChartConfiguration();
    
    // Set up auto refresh every 60 seconds
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
    console.log('Loading data for dashboard type:', this.dashboardType);
    const baseUrl = `${environment.apiUrl}/api/sensors`;
    
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
      // Ensure ISO format for dates
      const formattedStartDate = new Date(this.startDate).toISOString();
      params = params.set('start', formattedStartDate);
      console.log('Using start date filter:', formattedStartDate);
    }
    
    if (this.endDate) {
      // Ensure ISO format for dates
      const formattedEndDate = new Date(this.endDate).toISOString();
      params = params.set('end', formattedEndDate);
      console.log('Using end date filter:', formattedEndDate);
    }
    
    // Add status filter based on dashboard type
    if (this.statusFilter?.trim()) {
      switch (this.dashboardType) {
        case 'traffic':
          params = params.set('congestionLevel', this.statusFilter);
          break;
        case 'lighting':
          params = params.set('status', this.statusFilter);
          break;
        case 'pollution':
          params = params.set('pollutionLevel', this.statusFilter);
          break;
      }
      console.log(`Applied ${this.dashboardType} status filter:`, this.statusFilter);
    }

    // Set HTTP options with parameters and manual Authorization header
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    const options = headers ? { params, headers } : { params };
    
    // Determine endpoint based on dashboard type
    let endpoint = '';
    switch (this.dashboardType) {
      case 'traffic':
        endpoint = `${baseUrl}/traffic`;
        break;
      case 'lighting':
        endpoint = `${baseUrl}/street-light`;
        break;
      case 'pollution':
        endpoint = `${baseUrl}/air-pollution`;
        break;
    }
    
    console.log('Making request to:', endpoint);
    console.log('With parameters:', params.toString());
    
    // Check if we have authentication token
    const hasToken = !!localStorage.getItem('token');
    console.log('Authentication token present:', hasToken);

    // Make the HTTP request
    this.http.get<PageResponse<any>>(endpoint, options)
      .subscribe({
        next: response => {
          console.log('Response received:', response);
          // Store the data based on dashboard type
          switch (this.dashboardType) {
            case 'traffic':
              this.trafficData = response.content;
              console.log(`Loaded ${this.trafficData.length} traffic records`);
              break;
            case 'lighting':
              this.lightingData = response.content;
              console.log(`Loaded ${this.lightingData.length} lighting records`);
              break;
            case 'pollution':
              this.pollutionData = response.content;
              console.log(`Loaded ${this.pollutionData.length} pollution records`);
              break;
          }
          
          this.totalElements = response.totalElements;
          console.log('Total records available:', this.totalElements);
          console.log('Current page:', response.number + 1);
          console.log('Total pages:', response.totalPages);
          
          // Update charts with the real data
          this.updateChartData();
          this.updateTimeSeriesCharts();
          this.updateStatusDistributionChart();
        },
        error: error => {
          console.error('Error loading data:', error);
          
          // Handle specific error cases
          if (error.status === 401) {
            console.error('Authentication failed. Redirecting to login...');
            // You might want to redirect to login page here
            // this.router.navigate(['/login']);
          } else if (error.status === 403) {
            console.error('Permission denied for this resource');
          } else if (error.status === 0) {
            console.error('Connection error. Backend might be down or CORS issue');
          }
          
          // Reset data to empty to avoid displaying stale data
          switch (this.dashboardType) {
            case 'traffic':
              this.trafficData = [];
              break;
            case 'lighting':
              this.lightingData = [];
              break;
            case 'pollution':
              this.pollutionData = [];
              break;
          }
        }
      });
  }

  updateChartConfiguration() {
    switch (this.dashboardType) {
      case 'traffic':
        this.chartOptions.title = { text: 'Traffic Metrics by Location' };
        this.chartOptions.yAxis = [
          { title: { text: 'Traffic Density' } },
          { title: { text: 'Average Speed (km/h)' }, opposite: true }
        ];
        this.chartOptions.series = [
          { type: 'column', name: 'Traffic Density', data: [] },
          { type: 'line', name: 'Average Speed', data: [], yAxis: 1 }
        ];

        this.primaryMetricChartOptions.title = { text: 'Traffic Density Over Time' };
        this.primaryMetricChartOptions.yAxis = { title: { text: 'Vehicles per Hour' } };
        this.primaryMetricChartOptions.series = [{
          type: 'line',
          name: 'Traffic Density',
          data: [],
          color: '#7b1fa2'
        }];

        this.secondaryMetricChartOptions.title = { text: 'Average Speed Over Time' };
        this.secondaryMetricChartOptions.yAxis = { title: { text: 'Speed (km/h)' } };
        this.secondaryMetricChartOptions.series = [{
          type: 'line',
          name: 'Average Speed',
          data: [],
          color: '#6a1b9a'
        }];

        this.statusDistributionChartOptions.title = { text: 'Congestion Level Distribution' };
        this.statusDistributionChartOptions.xAxis = { 
          categories: ['Low', 'Moderate', 'High', 'Severe'],
          title: { text: 'Congestion Level' }
        };
        break;

      case 'lighting':
        this.chartOptions.title = { text: 'Street Light Metrics by Location' };
        this.chartOptions.yAxis = [
          { title: { text: 'Brightness Level' } },
          { title: { text: 'Power Consumption (W)' }, opposite: true }
        ];
        this.chartOptions.series = [
          { type: 'column', name: 'Brightness Level', data: [] },
          { type: 'line', name: 'Power Consumption', data: [], yAxis: 1 }
        ];

        this.primaryMetricChartOptions.title = { text: 'Brightness Level Over Time' };
        this.primaryMetricChartOptions.yAxis = { title: { text: 'Brightness (%)' } };
        this.primaryMetricChartOptions.series = [{
          type: 'line',
          name: 'Brightness Level',
          data: [],
          color: '#7b1fa2'
        }];

        this.secondaryMetricChartOptions.title = { text: 'Power Consumption Over Time' };
        this.secondaryMetricChartOptions.yAxis = { title: { text: 'Power (W)' } };
        this.secondaryMetricChartOptions.series = [{
          type: 'line',
          name: 'Power Consumption',
          data: [],
          color: '#6a1b9a'
        }];

        this.statusDistributionChartOptions.title = { text: 'Light Status Distribution' };
        this.statusDistributionChartOptions.xAxis = { 
          categories: ['ON', 'OFF', 'MAINTENANCE'],
          title: { text: 'Status' }
        };
        break;

      case 'pollution':
        this.chartOptions.title = { text: 'Air Quality Metrics by Location' };
        this.chartOptions.yAxis = [
          { title: { text: 'PM2.5' } },
          { title: { text: 'Ozone (ppb)' }, opposite: true }
        ];
        this.chartOptions.series = [
          { type: 'column', name: 'PM2.5', data: [] },
          { type: 'line', name: 'Ozone', data: [], yAxis: 1 }
        ];

        this.primaryMetricChartOptions.title = { text: 'PM2.5 Levels Over Time' };
        this.primaryMetricChartOptions.yAxis = { title: { text: 'PM2.5 (μg/m³)' } };
        this.primaryMetricChartOptions.series = [{
          type: 'line',
          name: 'PM2.5',
          data: [],
          color: '#7b1fa2'
        }];

        this.secondaryMetricChartOptions.title = { text: 'Ozone Levels Over Time' };
        this.secondaryMetricChartOptions.yAxis = { title: { text: 'Ozone (ppb)' } };
        this.secondaryMetricChartOptions.series = [{
          type: 'line',
          name: 'Ozone',
          data: [],
          color: '#6a1b9a'
        }];

        this.statusDistributionChartOptions.title = { text: 'Air Quality Status Distribution' };
        this.statusDistributionChartOptions.xAxis = { 
          categories: ['Good', 'Moderate', 'Unhealthy', 'Very_Unhealthy', 'Hazardous'],
          title: { text: 'Pollution Level' }
        };
        break;
    }
    
    this.updateFlag = true;
  }

  updateChartData() {
  let currentData = this.getCurrentData();
  
  // Process data for chart - use original data order (no sorting needed here)
  const locationMap = new Map<string, { primary: number; secondary: number; count: number }>();
  
  // Aggregate data by location
  currentData.forEach(data => {
    const location = data.location;
    if (!locationMap.has(location)) {
      locationMap.set(location, { primary: 0, secondary: 0, count: 0 });
    }
    
    const entry = locationMap.get(location)!;
    
    switch (this.dashboardType) {
      case 'traffic':
        entry.primary += data.trafficDensity;
        entry.secondary += data.avgSpeed;
        break;
      case 'lighting':
        entry.primary += data.brightnessLevel;
        entry.secondary += data.powerConsumption;
        break;
      case 'pollution':
        entry.primary += data.pm2_5;
        entry.secondary += data.ozone;
        break;
    }
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
        name: this.getPrimaryMetricName(),
        data: primaryData
      },
      {
        type: 'line',
        name: this.getSecondaryMetricName(),
        data: secondaryData,
        yAxis: 1
      }
    ]
  };

  // Force chart update
  this.updateFlag = true;
  setTimeout(() => {
    this.updateFlag = false;
  });
}


 updateTimeSeriesCharts() {
  let currentData = this.getCurrentData();
  
  // CREATE A COPY before sorting - this is the key fix!
  const sortedData = [...currentData].sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });
  
  // Prepare time series data arrays
  const primaryTimeSeriesData: [number, number][] = [];
  const secondaryTimeSeriesData: [number, number][] = [];
  
  // Use the sorted copy, not the original data
  sortedData.forEach(data => {
    const timestamp = new Date(data.timestamp).getTime();
    
    switch (this.dashboardType) {
      case 'traffic':
        primaryTimeSeriesData.push([timestamp, data.trafficDensity]);
        secondaryTimeSeriesData.push([timestamp, data.avgSpeed]);
        break;
      case 'lighting':
        primaryTimeSeriesData.push([timestamp, data.brightnessLevel]);
        secondaryTimeSeriesData.push([timestamp, data.powerConsumption]);
        break;
      case 'pollution':
        primaryTimeSeriesData.push([timestamp, data.pm2_5]);
        secondaryTimeSeriesData.push([timestamp, data.ozone]);
        break;
    }
  });
  
  // Update primary metric chart
  this.primaryMetricChartOptions = {
    ...this.primaryMetricChartOptions,
    series: [{
      type: 'line',
      name: this.getPrimaryMetricName(),
      data: primaryTimeSeriesData,
      color: '#7b1fa2'
    }]
  };
  
  // Update secondary metric chart
  this.secondaryMetricChartOptions = {
    ...this.secondaryMetricChartOptions,
    series: [{
      type: 'line',
      name: this.getSecondaryMetricName(),
      data: secondaryTimeSeriesData,
      color: '#6a1b9a'
    }]
  };
}

  updateStatusDistributionChart() {
    let currentData = this.getCurrentData();
    const statusCounts = new Map<string, number>();
    let statusField: string;
    let statusCategories: string[] = [];
    
    // Determine the status field based on dashboard type
    switch (this.dashboardType) {
      case 'traffic':
        statusField = 'congestionLevel';
        statusCategories = ['Low', 'Moderate', 'High', 'Severe'];
        break;
      case 'lighting':
        statusField = 'status';
        statusCategories = ['ON', 'OFF', 'MAINTENANCE'];
        break;
      case 'pollution':
        statusField = 'pollutionLevel';
        statusCategories = ['Good', 'Moderate', 'Unhealthy', 'Very_Unhealthy', 'Hazardous'];
        break;
      default:
        statusField = '';
        break;
    }
    
    // Initialize counts
    statusCategories.forEach(category => {
      statusCounts.set(category, 0);
    });
    
    // Count occurrences
    currentData.forEach(data => {
      const status = data[statusField];
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    });
    
    // Prepare chart data
    const statusData = statusCategories.map(category => statusCounts.get(category) || 0);
    
    // Update status distribution chart
    this.statusDistributionChartOptions = {
      ...this.statusDistributionChartOptions,
      xAxis: {
        categories: statusCategories,
        title: { text: this.getStatusFieldName() }
      },
      series: [{
        type: 'column',
        name: 'Occurrences',
        data: statusData,
        color: '#8e24aa'
      }]
    };
  }

  // Make these public so they can be used in the template
  getCurrentData(): any[] {
    switch (this.dashboardType) {
      case 'traffic':
        return this.trafficData;
      case 'lighting':
        return this.lightingData;
      case 'pollution':
        return this.pollutionData;
      default:
        return [];
    }
  }

  getPrimaryMetricName(): string {
    switch (this.dashboardType) {
      case 'traffic':
        return 'Traffic Density';
      case 'lighting':
        return 'Brightness Level';
      case 'pollution':
        return 'PM2.5';
      default:
        return 'Primary Metric';
    }
  }

  getSecondaryMetricName(): string {
    switch (this.dashboardType) {
      case 'traffic':
        return 'Average Speed';
      case 'lighting':
        return 'Power Consumption';
      case 'pollution':
        return 'Ozone Level';
      default:
        return 'Secondary Metric';
    }
  }

  getStatusFieldName(): string {
    switch (this.dashboardType) {
      case 'traffic':
        return 'Congestion Level';
      case 'lighting':
        return 'Light Status';
      case 'pollution':
        return 'Pollution Level';
      default:
        return 'Status';
    }
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