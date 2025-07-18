import { Component, ElementRef, ViewChild, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, SettingsRequest } from '../../services/settings.service';
import { ThemeService } from '../../services/theme.service';

// Add this type if not already in your settings.service.ts
type SensorType = "Traffic" | "Air_Pollution" | "Street_Light";

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None
})
export class SettingsComponent implements OnInit {
  selectedSensor: string = 'traffic';
  @ViewChild('wrapperRef') wrapperRef!: ElementRef<HTMLElement>;
  formData: any = {
    trafficDensity: null,
    avgSpeed: null,
    co: null,
    ozone: null,
    brightnessLevel: null,
    powerConsumption: null,
    
    notifyAboveTraffic: false,
    notifyBelowTraffic: false,
    notifyAboveAir: false,
    notifyBelowAir: false,
    notifyAboveLight: false,
    notifyBelowLight: false
  };

  isLoading: boolean = false;
  errorMessage: string | null = null;
  
  constructor(
    private readonly settingsService: SettingsService,
    public themeService: ThemeService
  ) {}
  
  ngOnInit() {
    // Initialize component
  }
  
  onSensorChange() {
    console.log('Sensor switched to:', this.selectedSensor);
  }
  
  submitForm() {
    this.isLoading = true;
    this.errorMessage = null;
    
    const requests: SettingsRequest[] = this.createSettingsRequests();
    
    let successCount = 0;
    let hasError = false;
    
    requests.forEach((request, index) => {
      this.settingsService.saveSettings(request).subscribe({
        next: (response) => {
          console.log(`Setting saved: ${request.metric}`, response);
          successCount++;
          
          if (successCount === requests.length && !hasError) {
            console.log('All settings saved successfully!');
            alert('Thresholds saved successfully!');
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error saving setting:', error);
          this.errorMessage = error.message ?? `Failed to save ${request.metric} settings. Please try again.`;
          hasError = true;
          this.isLoading = false;
        }
      });
    });
    
    if (requests.length === 0) {
      alert('No settings to save!');
      this.isLoading = false;
    }
  }
  
  private createSettingsRequests(): SettingsRequest[] {
    const requests: SettingsRequest[] = [];
    
    switch (this.selectedSensor) {
      case 'traffic':
        this.handleTrafficRequests(requests);
        break;
        
      case 'air':
        this.handleAirRequests(requests);
        break;
        
      case 'light':
        this.handleLightRequests(requests);
        break;
    }
    
    return requests;
  }

  private handleTrafficRequests(requests: SettingsRequest[]) {
    this.addMetricRequests(requests, 'Traffic', 'trafficDensity', 
      this.formData.trafficDensity, 
      this.formData.notifyAboveTraffic, 
      this.formData.notifyBelowTraffic);
      
    this.addMetricRequests(requests, 'Traffic', 'avgSpeed',
      this.formData.avgSpeed,
      this.formData.notifyAboveTraffic,
      this.formData.notifyBelowTraffic);
  }

  private handleAirRequests(requests: SettingsRequest[]) {
    this.addMetricRequests(requests, 'Air_Pollution', 'co',
      this.formData.co,
      this.formData.notifyAboveAir,
      this.formData.notifyBelowAir);
      
    this.addMetricRequests(requests, 'Air_Pollution', 'ozone',
      this.formData.ozone,
      this.formData.notifyAboveAir,
      this.formData.notifyBelowAir);
  }

  private handleLightRequests(requests: SettingsRequest[]) {
    this.addMetricRequests(requests, 'Street_Light', 'brightnessLevel',
      this.formData.brightnessLevel,
      this.formData.notifyAboveLight,
      this.formData.notifyBelowLight);
      
    this.addMetricRequests(requests, 'Street_Light', 'powerConsumption',
      this.formData.powerConsumption,
      this.formData.notifyAboveLight,
      this.formData.notifyBelowLight);
  }

  private addMetricRequests(
    requests: SettingsRequest[],
    type: SensorType,  // Changed to use the specific type
    metric: string,
    value: number | null,
    notifyAbove: boolean,
    notifyBelow: boolean
  ) {
    if (value === null) return;
    
    if (notifyAbove) {
      requests.push({
        type,
        metric,
        thresholdValue: value,
        alertType: 'Above'
      });
    }
    
    if (notifyBelow) {
      requests.push({
        type,
        metric,
        thresholdValue: value,
        alertType: 'Below'
      });
    }
  }

  resetForm() {
    this.formData = {
      trafficDensity: null,
      avgSpeed: null,
      co: null,
      ozone: null,
      brightnessLevel: null,
      powerConsumption: null,
      
      notifyAboveTraffic: false,
      notifyBelowTraffic: false,
      notifyAboveAir: false,
      notifyBelowAir: false,
      notifyAboveLight: false,
      notifyBelowLight: false
    };
    this.errorMessage = null;
  }
}