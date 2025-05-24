import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css'],
  encapsulation: ViewEncapsulation.None

})
export class ProfilePageComponent implements OnInit {
  userData: any = null;
  loading = true;

  constructor(private http: HttpClient, public themeService: ThemeService) {}

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  fetchUserProfile(): void {
    const token = localStorage.getItem('token'); // Assuming JWT token is stored in localStorage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get('http://localhost:8081/api/profile', { headers }).subscribe({
      next: (response: any) => {
        this.userData = {
          email: response.email,
          firstName: response.firstname,
          lastName: response.lastname,
          phone: response.phoneNumber,
          age: response.age,
          gender: response.gender,
          password: '****' // Masked or replaced password
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching profile', err);
        this.loading = false;
      }
    });
  }

  toggleDarkMode(): void {
    this.themeService.toggleTheme();
  }
}
