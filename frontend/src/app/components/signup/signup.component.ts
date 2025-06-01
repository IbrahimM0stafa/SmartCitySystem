import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { environment } from '../../../environments/environment';

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  profilePicture: string;
  gender: string;
  age: number | null;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SignupComponent implements OnInit {
  signupData: SignupData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    profilePicture: '',
    gender: '',
    age: null
  };
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
    // Password regex: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(this.signupData.password)) {
      alert('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
      return;
    }
    this.http.post(`${environment.apiUrl}/api/auth/signup`, this.signupData)
      .subscribe({
        next: (response: any) => {
          console.log('Signup successful:', response);
          alert(`Account created successfully for ${response.firstName} ${response.lastName}!`);
          
          // Navigate to login page after successful signup
          this.router.navigate(['/login']);
        },
        error: (error) => {
          if (error.error && typeof error.error === 'string') {
            alert(`Signup failed: ${error.error}`);
          } else if (error.error?.message) {
            alert(`Signup failed: ${error.error.message}`);
          } else {
            alert('An error occurred during signup. Please try again.');
          }
        }
      });
  }

  handleGoogleSignup(): void {
    window.location.href = `${environment.apiUrl}/oauth2/authorization/google`;
    console.log('Google signup initiated');
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}