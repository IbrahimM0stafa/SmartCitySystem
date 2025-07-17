import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../services/theme.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HighchartsChartModule } from 'highcharts-angular';
import { NavbarComponent } from '../../navbar/navbar.component';
import * as Highcharts from 'highcharts';
import { BaseDashboardComponent, BaseData } from '../base-dashboard/base-dashboard.component';

type PollutionLevel = 'Good' | 'Moderate' | 'Unhealthy' | 'Very_Unhealthy' | 'Hazardous';

interface AirPollutionData extends BaseData {
  pm2_5: number;
  pm10: number;
  ozone: number;
  pollutionLevel: PollutionLevel;
  co: number;
  no2: number;
  so2: number;
}

@Component({
  selector: 'app-air-pollution-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HighchartsChartModule,
    NavbarComponent
  ],
  templateUrl: './air-pollution-dashboard.component.html',
  styleUrls: ['./air-pollution-dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AirPollutionDashboardComponent extends BaseDashboardComponent<AirPollutionData> {
  
  // API endpoint for air pollution data
  apiEndpoint = 'air-pollution';
  
  // Chart options - initialized in constructor
  pm25ChartOptions: Highcharts.Options = {};
  ozoneChartOptions: Highcharts.Options = {};
  pollutionDistributionChartOptions: Highcharts.Options = {};

  // Available pollution levels for filtering
  readonly pollutionLevels: PollutionLevel[] = ['Good', 'Moderate', 'Unhealthy', 'Very_Unhealthy', 'Hazardous'];

  constructor(
    public themeService: ThemeService,
    http: HttpClient
  ) {
    super(http);
    this.initializeCharts();
  }

  // Initialize empty chart configurations
  private initializeCharts() {
    this.pm25ChartOptions = this.createChartOptions({
      title: 'PM2.5 Levels Over Time',
      yAxisTitle: 'PM2.5 (μg/m³)',
      seriesName: 'PM2.5',
      color: '#e91e63'
    }, []);

    this.ozoneChartOptions = this.createChartOptions({
      title: 'Ozone Levels Over Time',
      yAxisTitle: 'Ozone (ppb)',
      seriesName: 'Ozone',
      color: '#00bcd4'
    }, []);

    this.pollutionDistributionChartOptions = this.createDistributionChart(
      [],
      'pollutionLevel',
      this.pollutionLevels,
      'Pollution Level Distribution',
      '#ff5722'
    );
  }

  // Implementation of abstract methods from base class
  getDataType(): string {
    return 'air pollution';
  }

  getStatusFilterKey(): string {
    return 'pollutionLevel';
  }

  updateCharts(): void {
    this.updatePM25Chart();
    this.updateOzoneChart();
    this.updatePollutionDistributionChart();
  }

  // Chart update methods
  private updatePM25Chart() {
    const pm25Data = this.createTimeSeriesData(this.data, 'pm2_5');
    this.pm25ChartOptions = this.createChartOptions({
      title: 'PM2.5 Levels Over Time',
      yAxisTitle: 'PM2.5 (μg/m³)',
      seriesName: 'PM2.5',
      color: '#e91e63'
    }, pm25Data);
  }

  private updateOzoneChart() {
    const ozoneData = this.createTimeSeriesData(this.data, 'ozone');
    this.ozoneChartOptions = this.createChartOptions({
      title: 'Ozone Levels Over Time',
      yAxisTitle: 'Ozone (ppb)',
      seriesName: 'Ozone',
      color: '#00bcd4'
    }, ozoneData);
  }

  private updatePollutionDistributionChart() {
    this.pollutionDistributionChartOptions = this.createDistributionChart(
      this.data,
      'pollutionLevel',
      this.pollutionLevels,
      'Pollution Level Distribution',
      '#ff5722'
    );
  }

  // Convenience getter for typed data
  get pollutionData(): AirPollutionData[] {
    return this.data;
  }

  // Convenience getter for pollution level filter (matches original component interface)
  get pollutionLevelFilter(): string {
    return this.statusFilter;
  }

  set pollutionLevelFilter(value: string) {
    this.statusFilter = value;
  }

  // Theme toggle method
  toggleTheme() {
    this.themeService.toggleTheme();
  }

  // Additional utility methods for air pollution specific functionality
  
  /**
   * Get the current air quality status based on the latest data
   */
  getCurrentAirQuality(): { level: PollutionLevel; pm25: number; ozone: number } | null {
    const latest = this.getLatestDataPoint();
    if (!latest) return null;
    
    return {
      level: latest.pollutionLevel,
      pm25: latest.pm2_5,
      ozone: latest.ozone
    };
  }

  /**
   * Calculate average pollution levels
   */
  getAveragePollutionLevels(): { pm25: number; pm10: number; ozone: number; co: number; no2: number; so2: number } {
    return {
      pm25: this.calculateAverage(this.data, 'pm2_5'),
      pm10: this.calculateAverage(this.data, 'pm10'),
      ozone: this.calculateAverage(this.data, 'ozone'),
      co: this.calculateAverage(this.data, 'co'),
      no2: this.calculateAverage(this.data, 'no2'),
      so2: this.calculateAverage(this.data, 'so2')
    };
  }

  /**
   * Get pollution level color for UI display
   */
  getPollutionLevelColor(level: PollutionLevel): string {
    const colors = {
      'Good': '#4caf50',
      'Moderate': '#ff9800',
      'Unhealthy': '#f44336',
      'Very_Unhealthy': '#9c27b0',
      'Hazardous': '#795548'
    };
    return colors[level] || '#757575';
  }

  /**
   * Get pollution level description
   */
  getPollutionLevelDescription(level: PollutionLevel): string {
    const descriptions = {
      'Good': 'Air quality is satisfactory and poses little or no risk.',
      'Moderate': 'Air quality is acceptable; however, there may be a risk for some people.',
      'Unhealthy': 'Everyone may begin to experience health effects.',
      'Very_Unhealthy': 'Health alert: everyone may experience more serious health effects.',
      'Hazardous': 'Emergency conditions: the entire population is more likely to be affected.'
    };
    return descriptions[level] || 'Unknown air quality level';
  }

  /**
   * Check if a pollution level is considered dangerous
   */
  isDangerousLevel(level: PollutionLevel): boolean {
    return level === 'Unhealthy' || level === 'Very_Unhealthy' || level === 'Hazardous';
  }

  /**
   * Get locations with highest pollution levels
   */
  getHighestPollutionLocations(limit: number = 5): Array<{ location: string; avgPM25: number; avgOzone: number }> {
    const locationData = new Map<string, { pm25Sum: number; ozoneSum: number; count: number }>();
    
    this.data.forEach(item => {
      if (!locationData.has(item.location)) {
        locationData.set(item.location, { pm25Sum: 0, ozoneSum: 0, count: 0 });
      }
      
      const entry = locationData.get(item.location)!;
      entry.pm25Sum += item.pm2_5;
      entry.ozoneSum += item.ozone;
      entry.count++;
    });
    
    const results = Array.from(locationData.entries())
      .map(([location, data]) => ({
        location,
        avgPM25: data.pm25Sum / data.count,
        avgOzone: data.ozoneSum / data.count
      }))
      .sort((a, b) => b.avgPM25 - a.avgPM25)
      .slice(0, limit);
    
    return results;
  }
}