// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AlertComponent } from './components/alert/alert.component';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AlertComponent, CommonModule],
  template: `
    <app-alert *ngIf="showAlert"></app-alert>
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'iot-monitoring-system';
  showAlert = true;

  constructor(private readonly router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Hide alerts on login, signup, and change password pages
      const hideAlertsOn = ['/login', '/signup', '/change-password'];
      this.showAlert = !hideAlertsOn.some(path => event.url.includes(path));
    });
  }

  ngOnInit() {
    // Initial check for current route
    const currentUrl = this.router.url;
    const hideAlertsOn = ['/login', '/signup', '/change-password'];
    this.showAlert = !hideAlertsOn.some(path => currentUrl.includes(path));
  }
}