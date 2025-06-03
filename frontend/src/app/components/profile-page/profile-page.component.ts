import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { environment } from '../../../environments/environment';

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  age: number;
  gender: string;
  password: string;
}

interface UserProfileResponse {
  id?: number;
  email: string;
  firstname: string;  // Note: lowercase 'f' as per your backend response
  lastname: string;   // Note: lowercase 'l' as per your backend response
  phoneNumber: string;
  age: number;
  gender: string;
}

interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  age: number;
  gender: string;
}

interface InfoField {
  label: string;
  value: string;
  key: string;
}

interface EditableData {
  firstName: string;
  lastName: string;
  phone: string;
  age: number;
  gender: string;
  [key: string]: any;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FormsModule],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ProfilePageComponent implements OnInit {
  userData: UserData | null = null;
  loading = true;
  error: string | null = null;
  isEditMode = false;
  successMessage: string | null = null;
  
  // Editable data copy
  editableData: EditableData = {
    firstName: '',
    lastName: '',
    phone: '',
    age: 0,
    gender: ''
  };
  
  // Original data backup for cancel functionality
  originalData: EditableData = {
    firstName: '',
    lastName: '',
    phone: '',
    age: 0,
    gender: ''
  };

  // Structured data for profile fields
  profileFields: InfoField[] = [];

  constructor(
    private http: HttpClient,
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.applyThemeToBody();
    this.fetchUserProfile();
  }

  applyThemeToBody(): void {
    // Remove any existing theme classes
    document.body.classList.remove('light-mode', 'dark-mode');
    // Add the current theme class
    document.body.classList.add(this.themeService.currentTheme === 'dark' ? 'dark-mode' : 'light-mode');
  }

  fetchUserProfile(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.error = 'Authentication token not found. Please log in again.';
      this.loading = false;
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<UserProfileResponse>(`${environment.apiUrl}/api/profile`, { headers }).subscribe({
      next: (response: UserProfileResponse) => {
        console.log('API Response:', response); // Debug log
        
        this.userData = {
          id: response.id || 0,
          email: response.email || '',
          // Fix: Map the correct field names from backend response
          firstName: response.firstname || '', // Note: backend uses 'firstname' (lowercase)
          lastName: response.lastname || '',   // Note: backend uses 'lastname' (lowercase)
          phone: response.phoneNumber || '',
          age: response.age || 0,
          gender: response.gender || '',
          password: '••••••••' // Masked password
        };
        
        // Initialize editable data
        this.initializeEditableData();
        this.setupProfileFields();
        this.loading = false;
        this.error = null;
        this.successMessage = null;
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.loading = false;
        
        if (err.status === 401) {
          this.error = 'Authentication failed. Please log in again.';
          this.router.navigate(['/login']);
        } else if (err.status === 404) {
          this.error = 'Profile not found.';
        } else if (err.status === 500) {
          this.error = 'Server error. Please try again later.';
        } else {
          this.error = 'Failed to load profile data. Please try again.';
        }
      }
    });
  }

  initializeEditableData(): void {
    if (!this.userData) return;
    
    this.editableData = {
      firstName: this.userData.firstName || '',
      lastName: this.userData.lastName || '',
      phone: this.userData.phone || '',
      age: this.userData.age || 0,
      gender: this.userData.gender || ''
    };
    
    // Create backup
    this.originalData = { ...this.editableData };
  }

  setupProfileFields(): void {
    if (!this.userData) return;

    this.profileFields = [
      { label: 'Email', value: this.userData.email, key: 'email' },
      { label: 'First Name', value: this.userData.firstName, key: 'firstName' },
      { label: 'Last Name', value: this.userData.lastName, key: 'lastName' },
      { label: 'Phone Number', value: this.userData.phone, key: 'phone' },
      { label: 'Age', value: this.userData.age.toString(), key: 'age' },
      { label: 'Gender', value: this.userData.gender, key: 'gender' }
    ];
  }

  getInputType(fieldKey: string): string {
    switch (fieldKey) {
      case 'email':
        return 'email';
      case 'phone':
        return 'tel';
      case 'age':
        return 'number';
      default:
        return 'text';
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.applyThemeToBody();
  }

  onEditProfile(): void {
    this.isEditMode = true;
    this.error = null;
    this.successMessage = null;
    // Refresh editable data
    this.initializeEditableData();
  }

  onSaveProfile(): void {
    if (!this.validateProfileData()) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    const token = localStorage.getItem('token');
    
    if (!token) {
      this.error = 'Authentication token not found. Please log in again.';
      this.loading = false;
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // Prepare data for API (matching backend UpdateProfileRequest)
    const updateRequest: UpdateProfileRequest = {
      firstName: this.editableData.firstName.trim(),
      lastName: this.editableData.lastName.trim(),
      phoneNumber: this.editableData.phone.trim(),
      age: Number(this.editableData.age),
      gender: this.editableData.gender.trim()
    };

    this.http.put<UserProfileResponse>(`${environment.apiUrl}/api/profile`, updateRequest, { headers }).subscribe({
      next: (response: UserProfileResponse) => {
        console.log('Update Response:', response); // Debug log
        
        // Update userData with new values from response
        if (this.userData) {
          // Fix: Map the correct field names from backend response
          this.userData.firstName = response.firstname || this.userData.firstName;
          this.userData.lastName = response.lastname || this.userData.lastName;
          this.userData.phone = response.phoneNumber || this.userData.phone;
          this.userData.age = response.age || this.userData.age;
          this.userData.gender = response.gender || this.userData.gender;
        }
        
        // Update profile fields display
        this.setupProfileFields();
        
        // Update original data for future edits
        this.originalData = { ...this.editableData };
        
        // Exit edit mode
        this.isEditMode = false;
        this.loading = false;
        this.error = null;
        this.successMessage = 'Profile updated successfully!';
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          this.successMessage = null;
        }, 5000);
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.loading = false;
        
        if (err.status === 400) {
          this.error = 'Invalid data provided. Please check your inputs and try again.';
        } else if (err.status === 401) {
          this.error = 'Authentication failed. Please log in again.';
          this.router.navigate(['/login']);
        } else if (err.status === 404) {
          this.error = 'Profile not found.';
        } else if (err.status === 500) {
          this.error = 'Server error occurred. Please try again later.';
        } else {
          this.error = 'Failed to update profile. Please try again.';
        }
      }
    });
  }

  onCancelEdit(): void {
    // Restore original data
    this.editableData = { ...this.originalData };
    this.isEditMode = false;
    this.error = null;
    this.successMessage = null;
  }

  validateProfileData(): boolean {
    // Clear previous errors
    this.error = null;

    // Trim whitespace for validation
    const firstName = this.editableData.firstName?.trim();
    const lastName = this.editableData.lastName?.trim();
    const phone = this.editableData.phone?.trim();
    const gender = this.editableData.gender?.trim();
    const age = Number(this.editableData.age);

    // Basic validation
    if (!firstName) {
      this.error = 'First name is required';
      return false;
    }
    
    if (firstName.length < 2) {
      this.error = 'First name must be at least 2 characters long';
      return false;
    }
    
    if (!lastName) {
      this.error = 'Last name is required';
      return false;
    }
    
    if (lastName.length < 2) {
      this.error = 'Last name must be at least 2 characters long';
      return false;
    }
    
    if (!phone) {
      this.error = 'Phone number is required';
      return false;
    }
    
    // Basic phone validation (you can make this more sophisticated)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
      this.error = 'Please enter a valid phone number';
      return false;
    }
    
    if (!age || age < 1 || age > 150) {
      this.error = 'Please enter a valid age (1-150)';
      return false;
    }
    
    if (!gender) {
      this.error = 'Gender is required';
      return false;
    }
    
    return true;
  }

  onChangePassword(): void {
    this.router.navigate(['/change-password']);
  }

  navigateToSection(section: string): void {
    // Navigate to different sections
    switch(section) {
      case 'home':
        this.router.navigate(['/dashboard']);
        break;
      case 'devices':
        this.router.navigate(['/devices']);
        break;
      case 'sensors':
        this.router.navigate(['/sensors']);
        break;
      case 'notifications':
        this.router.navigate(['/notifications']);
        break;
    }
  }

  // Utility method to clear messages
  clearMessages(): void {
    this.error = null;
    this.successMessage = null;
  }
}