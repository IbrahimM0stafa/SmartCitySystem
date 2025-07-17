// traffic-dashboard.component.ts
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../services/theme.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HighchartsChartModule } from 'highcharts-angular';
import { NavbarComponent } from '../../navbar/navbar.component';
import * as Highcharts from 'highcharts';
import { BaseDashboardComponent } from '../base-dashboard/base-dashboard.component';

type CongestionLevel = 'Low' | 'Moderate' | 'High' | 'Severe';

interface TrafficData {
  id: string;
  location: string;
  timestamp: string;
  trafficDensity: number;
  avgSpeed: number;
  congestionLevel: CongestionLevel;
}

@Component({
  selector: 'app-traffic-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HighchartsChartModule,
    NavbarComponent
  ],
  templateUrl: './traffic-dashboard.component.html',
  styleUrls: ['./traffic-dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TrafficDashboardComponent extends BaseDashboardComponent<TrafficData> implements OnInit {
  
  // Override base class property
  apiEndpoint = 'traffic';
  
  // Traffic-specific properties
  dashboardType: 'traffic' | 'lighting' | 'pollution' = 'traffic';
  
  // Traffic-specific chart options
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
    http: HttpClient
  ) {
    super(http);
  }

  override ngOnInit() {
    super.ngOnInit();
  }

  // Override chart type mapping for traffic dashboard
  override toggleChart(chartType: 'primaryMetric' | 'secondaryMetric' | 'statusDistribution'): void {
    super.toggleChart(chartType);
  }

  // Implement abstract methods from base class
  getDataType(): string {
    return 'traffic';
  }

  getStatusFilterKey(): string {
    return 'congestionLevel';
  }

  updateCharts(): void {
    this.updateChartData();
    this.updateTimeSeriesCharts();
    this.updateStatusDistributionChart();
  }

  // Traffic-specific chart update methods
  updateChartData() {
    // Process data for chart
    const locationMap = new Map<string, { primary: number; secondary: number; count: number }>();
    
    // Aggregate data by location
    this.data.forEach(data => {
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
    const primaryTimeSeriesData = this.createTimeSeriesData(this.data, 'trafficDensity');
    const secondaryTimeSeriesData = this.createTimeSeriesData(this.data, 'avgSpeed');
    
    // Update primary metric chart
    this.primaryMetricChartOptions = this.createChartOptions(
      {
        title: 'Traffic Density Over Time',
        yAxisTitle: 'Vehicles per Hour',
        seriesName: 'Traffic Density',
        color: '#7b1fa2'
      },
      primaryTimeSeriesData
    );
    
    // Update secondary metric chart
    this.secondaryMetricChartOptions = this.createChartOptions(
      {
        title: 'Average Speed Over Time',
        yAxisTitle: 'Speed (km/h)',
        seriesName: 'Average Speed',
        color: '#6a1b9a'
      },
      secondaryTimeSeriesData
    );
  }

  updateStatusDistributionChart() {
    const statusCategories = ['Low', 'Moderate', 'High', 'Severe'];
    this.statusDistributionChartOptions = this.createDistributionChart(
      this.data,
      'congestionLevel',
      statusCategories,
      'Congestion Level Distribution',
      '#8e24aa'
    );
  }

  // Traffic-specific getter methods (maintaining original behavior)
  getCurrentData(): TrafficData[] {
    return this.data;
  }

  get trafficData(): TrafficData[] {
    return this.data;
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
}