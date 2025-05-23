import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      )
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./components/signup/signup.component').then(
        (m) => m.SignupComponent
      )
  },
  {
    path: 'change-password',
    loadComponent: () =>
      import('./components/changepassword/changepassword.component').then(
        (m) => m.ChangePasswordComponent
      )
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home-page/home-page.component').then(
        (m) => m.HomePageComponent
      ),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/profile-page/profile-page.component').then(
        (m) => m.ProfilePageComponent
      ),
    canActivate: [AuthGuard]
  },
  {
    path: 'oauth2/redirect',
    loadComponent: () =>
      import('./components/oauth2-redirect/oauth2-redirect.component').then(
        (m) => m.Oauth2RedirectComponent
      )
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./components/settings/settings.component').then(
        (m) => m.SettingsComponent
      ),
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard-entry',
    loadComponent: () =>
      import('./components/dashboard-entry/dashboard-entry.component').then(
        (m) => m.DashboardEntryComponent
      ),
    canActivate: [AuthGuard]
  },
  {
    path: 'traffic-dashboard',
    loadComponent: () =>
      import('./components/traffic-dashboard/traffic-dashboard.component').then(
        (m) => m.TrafficDashboardComponent
      ),
    canActivate: [AuthGuard]
  },
  {
    path: 'lighting-dashboard',
    loadComponent: () =>
      import('./components/traffic-dashboard/traffic-dashboard.component').then(
        (m) => m.TrafficDashboardComponent
      ),
    canActivate: [AuthGuard]
  },
  {
    path: 'pollution-dashboard',
    loadComponent: () =>
      import('./components/traffic-dashboard/traffic-dashboard.component').then(
        (m) => m.TrafficDashboardComponent
      ),
    canActivate: [AuthGuard]
  }
];
