import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  imports: [CommonModule, FormsModule]
})
export class SettingsComponent {
  selectedSensor: string = 'traffic';
  @ViewChild('wrapperRef') wrapperRef!: ElementRef<HTMLElement>; // ✅ Reference to wrapper
  formData: any = {
    // Existing form fields
    trafficDensity: null,
    avgSpeed: null,
    co: null,
    ozone: null,
    brightnessLevel: null,
    powerConsumption: null,
    
    // New checkbox fields for notifications
    notifyAboveTraffic: false,
    notifyBelowTraffic: false,
    notifyAboveAir: false,
    notifyBelowAir: false,
    notifyAboveLight: false,
    notifyBelowLight: false
  };
  
  onSensorChange() {
    console.log('Sensor switched to:', this.selectedSensor);
  }
  
  submitForm() {
    console.log('Submitted data for', this.selectedSensor, this.formData);
    alert('Thresholds saved successfully!');
  }
  
  toggleTheme() {
    const wrapper = this.wrapperRef?.nativeElement;
    wrapper.classList.toggle('dark-theme');
    wrapper.classList.toggle('light-theme');
  }
  
  resetForm() {
    this.formData = {
      // Reset existing form fields
      trafficDensity: null,
      avgSpeed: null,
      co: null,
      ozone: null,
      brightnessLevel: null,
      powerConsumption: null,
      
      // Reset checkboxes
      notifyAboveTraffic: false,
      notifyBelowTraffic: false,
      notifyAboveAir: false,
      notifyBelowAir: false,
      notifyAboveLight: false,
      notifyBelowLight: false
    };
  }
}