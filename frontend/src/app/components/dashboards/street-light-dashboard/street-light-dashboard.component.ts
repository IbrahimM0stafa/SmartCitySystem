// street-light-dashboard.component.ts
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../services/theme.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HighchartsChartModule } from 'highcharts-angular';
import { NavbarComponent } from '../../navbar/navbar.component';
import * as Highcharts from 'highcharts';
import { BaseDashboardComponent } from '../base-dashboard/base-dashboard.component';

type LightStatus = 'ON' | 'OFF' | 'MAINTENANCE';

interface StreetLightData {
  id: string;
  location: string;
  timestamp: string;
  brightnessLevel: number;
  powerConsumption: number;
  status: LightStatus;
}

@Component({
  selector: 'app-street-light-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HighchartsChartModule,
    NavbarComponent
  ],
  templateUrl: './street-light-dashboard.component.html',
  styleUrls: ['./street-light-dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class StreetLightDashboardComponent extends BaseDashboardComponent<StreetLightData> implements OnInit {
  
  // Override base class property
  apiEndpoint = 'street-light';
  
  // Street light specific chart configurations
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
    http: HttpClient
  ) {
    super(http);
  }

  override ngOnInit() {
    super.ngOnInit();
  }

  // Override chart type mapping for street light dashboard
  override toggleChart(chartType: 'brightnessLevel' | 'powerConsumption' | 'statusDistribution'): void {
    super.toggleChart(chartType);
  }

  // Implement abstract methods from base class
  getDataType(): string {
    return 'street light';
  }

  getStatusFilterKey(): string {
    return 'status';
  }

  updateCharts(): void {
    this.updateTimeSeriesCharts();
    this.updateStatusDistributionChart();
  }

  // Street light specific chart update methods
  updateTimeSeriesCharts() {
    const brightnessTimeSeriesData = this.createTimeSeriesData(this.data, 'brightnessLevel');
    const powerConsumptionTimeSeriesData = this.createTimeSeriesData(this.data, 'powerConsumption');
    
    // Update brightness chart
    this.brightnessChartOptions = this.createChartOptions(
      {
        title: 'Brightness Level Over Time',
        yAxisTitle: 'Brightness (%)',
        seriesName: 'Brightness Level',
        color: '#7b1fa2'
      },
      brightnessTimeSeriesData
    );
    
    // Update power consumption chart
    this.powerConsumptionChartOptions = this.createChartOptions(
      {
        title: 'Power Consumption Over Time',
        yAxisTitle: 'Power (W)',
        seriesName: 'Power Consumption',
        color: '#6a1b9a'
      },
      powerConsumptionTimeSeriesData
    );
  }

  updateStatusDistributionChart() {
    const statusCategories = ['ON', 'OFF', 'MAINTENANCE'];
    this.statusDistributionChartOptions = this.createDistributionChart(
      this.data,
      'status',
      statusCategories,
      'Light Status Distribution',
      '#8e24aa'
    );
  }

  // Street light specific getter methods (maintaining original behavior)
  get lightingData(): StreetLightData[] {
    return this.data;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}