import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    this.http.post('http://localhost:8080/api/auth/signup', this.signupData)
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
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    console.log('Google signup initiated');
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('isDarkMode', this.isDarkMode.toString());
  }
}