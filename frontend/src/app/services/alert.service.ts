import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Alert {
  id: string;
  metric: string;
  value: number;
  thresholdValue: number;
  alertType: string;
  type: string;
  triggeredAt: string;
}

export interface AlertResponse {
  message: string;
  count: number;
  data: Alert[];
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private readonly baseUrl = `${environment.apiUrl}/api/alerts`;
  private alerts = new BehaviorSubject<Alert[]>([]);
  private alertQueue: Alert[] = [];
  private pollingSubscription: Subscription | null = null;
  private displayTimeout: any;
  private readonly POLLING_INTERVAL = 60000; // 1 minute
  private readonly DISPLAY_DURATION = 5000; // 5 seconds
  private isProcessingQueue = false;

  constructor(private http: HttpClient) {}

  getAlerts(): Observable<Alert[]> {
    return this.alerts.asObservable();
  }

  startPolling() {
    console.log('Starting alert polling...');
    if (!this.pollingSubscription) {
      // Initial fetch
      this.fetchAlerts().subscribe({
        next: () => console.log('Initial fetch completed'),
        error: (error) => console.error('Error in initial fetch:', error)
      });
      
      // Setup polling every minute
      this.pollingSubscription = interval(this.POLLING_INTERVAL).pipe(
        switchMap(() => this.fetchAlerts())
      ).subscribe({
        error: (error) => console.error('Error in polling subscription:', error)
      });
    }
  }

  stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
    if (this.displayTimeout) {
      clearTimeout(this.displayTimeout);
    }
    this.alertQueue = [];
    this.alerts.next([]);
    console.log('Alert polling stopped');
  }

  private processNextAlert() {
    if (this.alertQueue.length > 0 && !this.isProcessingQueue) {
      this.isProcessingQueue = true;
      const nextAlert = this.alertQueue[0];
      this.alerts.next([nextAlert]);

      this.displayTimeout = setTimeout(() => {
        this.alertQueue.shift(); // Remove the displayed alert
        this.alerts.next([]); // Clear the display
        this.isProcessingQueue = false;
        
        // Process next alert if available
        if (this.alertQueue.length > 0) {
          setTimeout(() => this.processNextAlert(), 100); // Small delay before next alert
        }
      }, this.DISPLAY_DURATION);
    }
  }

  private fetchAlerts(): Observable<Alert[]> {
    console.log('Fetching alerts...');
    return this.http.get<AlertResponse>(`${this.baseUrl}/recent`).pipe(
      tap({
        next: (response) => {
          console.log('Received response:', response);
          if (response.data?.length) {
            const newAlerts = response.data.filter(newAlert => 
              !this.alertQueue.some(existing => existing.id === newAlert.id)
            );
            
            if (newAlerts.length > 0) {
              console.log('New alerts to display:', newAlerts);
              this.alertQueue.push(...newAlerts);
              
              // Start processing queue if not already processing
              if (!this.isProcessingQueue) {
                this.processNextAlert();
              }
            }
          }
        },
        error: (error) => {
          console.error('Error fetching alerts:', error);
        }
      }),
      catchError(error => {
        console.error('Error in fetchAlerts:', error);
        return this.alerts;
      }),
      switchMap(() => this.alerts)
    );
  }

  removeAlert(id: string) {
    // Remove from queue if present
    this.alertQueue = this.alertQueue.filter(alert => alert.id !== id);
    
    // Remove from current display if it's the current alert
    const currentAlerts = this.alerts.value;
    if (currentAlerts.some(alert => alert.id === id)) {
      this.alerts.next([]);
      this.isProcessingQueue = false;
      // Process next alert immediately
      this.processNextAlert();
    }
  }
}