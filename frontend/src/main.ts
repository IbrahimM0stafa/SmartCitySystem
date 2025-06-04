import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { ThemeService } from './app/services/theme.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/services/auth.interceptor';
import { environment } from './environments/environment';

fetch('/assets/config/app.config.json')
  .then(response => response.json())
  .then(config => {
    let backendUrl = config.apiUrl.replace('${BACKEND_URL}', window.location.origin.replace(':30080', ':31881'));
    // If backendUrl is empty or still contains the placeholder, use default
    if (!backendUrl || backendUrl.includes('${BACKEND_URL}')) {
      backendUrl = 'http://localhost:8081';
    }
    environment.apiUrl = backendUrl;

    bootstrapApplication(AppComponent, {
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideRouter(routes),
        ThemeService,
        provideZoneChangeDetection({ eventCoalescing: true })
      ]
    }).catch(err => console.error(err));
  })
  .catch(err => console.error('Failed to load app config', err));