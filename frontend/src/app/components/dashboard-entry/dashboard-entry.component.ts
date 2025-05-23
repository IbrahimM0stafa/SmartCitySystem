// dashboard-entry.component.ts

import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-dashboard-entry',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './dashboard-entry.component.html',
  styleUrls: ['./dashboard-entry.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardEntryComponent implements OnInit {
  cardData = [
    {
      id: 'traffic',
      title: 'Traffic Monitoring',
      description: 'Monitor and analyze traffic conditions in real-time across the city. View congestion levels, traffic flows, and incident reports.',
      icon: 'traffic-light',
      lastUpdate: '2 minutes ago',
      metrics: [
        { value: '--', label: 'Accuracy', class: 'traffic-value' },
        { value: '--', label: 'Active sensors', class: 'traffic-value' }
      ],
      iconClass: 'traffic-icon'
    },
    {
      id: 'lighting',
      title: 'Street Light Management',
      description: 'Control and manage street lights across the city. Monitor energy usage, schedule lighting cycles, and detect faulty units.',
      icon: 'lightbulb',
      lastUpdate: '5 minutes ago',
      metrics: [
        { value: '--', label: 'Energy saving', class: 'light-value' },
        { value: '--', label: 'Active lights', class: 'light-value' }
      ],
      iconClass: 'light-icon'
    },
    {
      id: 'pollution',
      title: 'Air Pollution Monitoring',
      description: 'Track air quality and pollution levels in real-time. Monitor particulate matter, harmful gases, and environmental conditions across urban areas.',
      icon: 'wind',
      lastUpdate: '1 minute ago',
      metrics: [
        { value: '--', label: 'Data uptime', class: 'pollution-value' },
        { value: '--', label: 'Active sensors', class: 'pollution-value' }
      ],
      iconClass: 'pollution-icon'
    }
  ];

  constructor(
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Apply the current theme to the body
    this.applyThemeToBody();
  }

  applyThemeToBody(): void {
    // Remove any existing theme classes
    document.body.classList.remove('light-mode', 'dark-mode');
    // Add the current theme class
    document.body.classList.add(this.themeService.currentTheme === 'dark' ? 'dark-mode' : 'light-mode');
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.applyThemeToBody();
  }

  navigateToDashboard(dashboardId: string): void {
    this.router.navigate([`/${dashboardId}-dashboard`]);
  }
}