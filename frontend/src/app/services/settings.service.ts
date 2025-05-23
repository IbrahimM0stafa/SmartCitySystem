import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface SettingsRequest {
  type: 'Traffic' | 'Air_Pollution' | 'Street_Light';
  metric: string;
  thresholdValue: number;
  alertType: 'Above' | 'Below';
}

export interface Settings {
  id: string;
  type: 'Traffic' | 'Air_Pollution' | 'Street_Light';
  metric: string;
  thresholdValue: number;
  alertType: 'Above' | 'Below';
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = 'http://localhost:8080/api/settings';

  constructor(private http: HttpClient) { }

  saveSettings(request: SettingsRequest): Observable<Settings> {
    return this.http.post<Settings>(this.apiUrl, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Optional: Add method to fetch current settings
  getSettings(): Observable<Settings[]> {
    return this.http.get<Settings[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 400) {
        // Handle validation errors
        errorMessage = error.error?.message || 'Invalid input data';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized. Please log in again.';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (error.status === 0) {
        errorMessage = 'Server is unreachable. Please check your connection.';
      } else {
        errorMessage = `Server error: ${error.status}. ${error.error?.message || ''}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}