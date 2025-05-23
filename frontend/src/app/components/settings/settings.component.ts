import { Component, ElementRef, ViewChild, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, SettingsRequest } from '../../services/settings.service';
import { ThemeService } from '../../services/theme.service';

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
    private settingsService: SettingsService,
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
    
    // Create an array of settings requests based on form data
    const requests: SettingsRequest[] = this.createSettingsRequests();
    
    // Submit each setting individually
    const observables = requests.map(request => 
      this.settingsService.saveSettings(request)
    );
    
    // Create a counter for successful saves
    let successCount = 0;
    let hasError = false;
    
    // Process each request individually
    requests.forEach((request, index) => {
      this.settingsService.saveSettings(request).subscribe({
        next: (response) => {
          console.log(`Setting saved: ${request.metric}`, response);
          successCount++;
          
          // If all settings saved successfully
          if (successCount === requests.length && !hasError) {
            console.log('All settings saved successfully!');
            alert('Thresholds saved successfully!');
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error saving setting:', error);
          this.errorMessage = error.message || `Failed to save ${request.metric} settings. Please try again.`;
          hasError = true;
          this.isLoading = false;
        }
      });
    });
    
    // If no requests to process, we're done
    if (requests.length === 0) {
      alert('No settings to save!');
      this.isLoading = false;
    }
  }
  
  private createSettingsRequests(): SettingsRequest[] {
    const requests: SettingsRequest[] = [];
    
    switch (this.selectedSensor) {
      case 'traffic':
        if (this.formData.trafficDensity !== null) {
          if (this.formData.notifyAboveTraffic) {
            requests.push({
              type: 'Traffic',
              metric: 'trafficDensity',
              thresholdValue: this.formData.trafficDensity,
              alertType: 'Above'
            });
          }
          
          if (this.formData.notifyBelowTraffic) {
            requests.push({
              type: 'Traffic',
              metric: 'trafficDensity',
              thresholdValue: this.formData.trafficDensity,
              alertType: 'Below'
            });
          }
        }
        
        if (this.formData.avgSpeed !== null) {
          if (this.formData.notifyAboveTraffic) {
            requests.push({
              type: 'Traffic',
              metric: 'avgSpeed',
              thresholdValue: this.formData.avgSpeed,
              alertType: 'Above'
            });
          }
          
          if (this.formData.notifyBelowTraffic) {
            requests.push({
              type: 'Traffic',
              metric: 'avgSpeed',
              thresholdValue: this.formData.avgSpeed,
              alertType: 'Below'
            });
          }
        }
        break;
        
      case 'air':
        if (this.formData.co !== null) {
          if (this.formData.notifyAboveAir) {
            requests.push({
              type: 'Air_Pollution',
              metric: 'co',
              thresholdValue: this.formData.co,
              alertType: 'Above'
            });
          }
          
          if (this.formData.notifyBelowAir) {
            requests.push({
              type: 'Air_Pollution',
              metric: 'co',
              thresholdValue: this.formData.co,
              alertType: 'Below'
            });
          }
        }
        
        if (this.formData.ozone !== null) {
          if (this.formData.notifyAboveAir) {
            requests.push({
              type: 'Air_Pollution',
              metric: 'ozone',
              thresholdValue: this.formData.ozone,
              alertType: 'Above'
            });
          }
          
          if (this.formData.notifyBelowAir) {
            requests.push({
              type: 'Air_Pollution',
              metric: 'ozone',
              thresholdValue: this.formData.ozone,
              alertType: 'Below'
            });
          }
        }
        break;
        
      case 'light':
        if (this.formData.brightnessLevel !== null) {
          if (this.formData.notifyAboveLight) {
            requests.push({
              type: 'Street_Light',
              metric: 'brightnessLevel',
              thresholdValue: this.formData.brightnessLevel,
              alertType: 'Above'
            });
          }
          
          if (this.formData.notifyBelowLight) {
            requests.push({
              type: 'Street_Light',
              metric: 'brightnessLevel',
              thresholdValue: this.formData.brightnessLevel,
              alertType: 'Below'
            });
          }
        }
        
        if (this.formData.powerConsumption !== null) {
          if (this.formData.notifyAboveLight) {
            requests.push({
              type: 'Street_Light',
              metric: 'powerConsumption',
              thresholdValue: this.formData.powerConsumption,
              alertType: 'Above'
            });
          }
          
          if (this.formData.notifyBelowLight) {
            requests.push({
              type: 'Street_Light',
              metric: 'powerConsumption',
              thresholdValue: this.formData.powerConsumption,
              alertType: 'Below'
            });
          }
        }
        break;
    }
    
    return requests;
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