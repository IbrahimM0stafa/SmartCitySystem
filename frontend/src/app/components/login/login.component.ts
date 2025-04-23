import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Added HttpClientModule
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  isDarkMode: boolean = true;

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('isDarkMode');
    if (savedTheme !== null) {
      this.isDarkMode = savedTheme === 'true';
    }
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

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('isDarkMode', this.isDarkMode.toString());
  }
}
