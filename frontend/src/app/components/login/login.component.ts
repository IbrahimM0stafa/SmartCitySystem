import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {
  @Output() onLogin = new EventEmitter<void>();

  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;

  constructor(
    private readonly router: Router,
    private readonly http: HttpClient,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void { /*  No need for localStorage logic, ThemeService handles it */ }

  handleSubmit(): void {
    this.http.post<any>(`${environment.apiUrl}/api/auth/signin`, {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.id,
          email: response.email
        }));
        alert(`Welcome! Your email: ${response.email}`);
        this.onLogin.emit();
        this.router.navigate(['/dashboard-entry']);
      },
      error: (error) => {
        alert(error.error ? `Login failed: ${error.error}` : 'An error occurred while trying to log in.');
      }
    });
  }

  handleGoogleLogin(): void {
    window.location.href = `${environment.apiUrl}/oauth2/authorization/google`;
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
