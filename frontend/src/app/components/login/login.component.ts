import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Added HttpClientModule
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule], // Added HttpClientModule
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
    private router: Router,
    private http: HttpClient,
    public themeService: ThemeService
  ) { }

  ngOnInit(): void {
    // No need for localStorage logic, ThemeService handles it
  }

  handleSubmit(): void {
    this.http.post<any>('http://localhost:8080/api/auth/signin', {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
  
        // Save the JWT token in localStorage
        localStorage.setItem('token', response.token);
  
        // Optionally, save user info
        localStorage.setItem('user', JSON.stringify({
          id: response.id,
          email: response.email
        }));
  
        alert(`Welcome! Your email: ${response.email}`);
  
        // Emit login event
        this.onLogin.emit();
  
        // Navigate to home page or dashboard
        this.router.navigate(['/home']);
      },
      error: (error) => {
        alert(error.error ? `Login failed: ${error.error}` : 'An error occurred while trying to log in.');
      }
    });
  }

  handleGoogleLogin(): void {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
