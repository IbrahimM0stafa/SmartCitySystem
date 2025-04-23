import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-oauth2-redirect',
  standalone: true,
  template: `<p>Redirecting, please wait...</p>`,
  styleUrls: ['./oauth2-redirect.component.css']
})
export class Oauth2RedirectComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      localStorage.setItem('token', token);

      // Optionally fetch user info or just redirect
      this.router.navigate(['/home']);
    } else {
      alert('Login failed: No token found');
      this.router.navigate(['/login']);
    }
  }
}
