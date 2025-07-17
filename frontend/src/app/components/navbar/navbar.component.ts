import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ClickOutsideDirective],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  userName: string = '';
  dropdownOpen = false;

  constructor(
    public themeService: ThemeService,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  private loadUserProfile() {
    this.authService.getUserProfile().subscribe({
      next: (response: any) => {
        this.userName = response.firstname ?? 'User';
      },
      error: () => {
        this.userName = 'User';
      }
    });
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  onKeyDown(event: KeyboardEvent) {
    // Handle Enter and Space keys for dropdown toggle
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleDropdown();
    }
    // Handle Escape key to close dropdown
    else if (event.key === 'Escape' && this.dropdownOpen) {
      this.closeDropdown();
    }
  }

  onMenuItemKeyDown(event: KeyboardEvent, action: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (action === 'changePassword') {
        this.onChangePassword();
      } else if (action === 'logout') {
        this.onLogout();
      }
    }
  }

  onChangePassword() {
    this.closeDropdown();
    this.router.navigate(['/change-password']);
  }

  onLogout() {
    this.closeDropdown();
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout failed:', error);
        this.router.navigate(['/login']);
      }
    });
  }
}