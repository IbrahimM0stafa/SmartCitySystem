import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AlertService, Alert } from '../../services/alert.service';
import { ThemeService } from '../../services/theme.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-alert',  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit, OnDestroy {
  alerts: Alert[] = [];
  isDarkMode = false;
  private alertSubscription: Subscription;
  private themeSubscription: Subscription;

  constructor(
    private alertService: AlertService,
    private themeService: ThemeService
  ) {
    console.log('AlertComponent constructed');
    this.alertSubscription = this.alertService.getAlerts().subscribe({
      next: (alerts: Alert[]) => {
        console.log('Received alerts in component:', alerts);
        this.alerts = alerts;
      },
      error: (error) => console.error('Error in alert subscription:', error)
    });

    this.themeSubscription = this.themeService.themeChanges$.subscribe({
      next: (theme) => {
        console.log('Theme changed:', theme);
        this.isDarkMode = theme === 'dark';
      },
      error: (error) => console.error('Error in theme subscription:', error)
    });
  }

  ngOnInit() {
    console.log('AlertComponent initialized');
    this.isDarkMode = this.themeService.currentTheme === 'dark';
    this.alertService.startPolling();
  }

  ngOnDestroy() {
    console.log('AlertComponent being destroyed');
    if (this.alertSubscription) {
      this.alertSubscription.unsubscribe();
    }
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    this.alertService.stopPolling();
  }

  removeAlert(id: string) {
    console.log('Removing alert in component:', id);
    this.alertService.removeAlert(id);
  }
}