// src/app/services/theme.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private storageKey = 'preferred-theme';
  private _currentTheme: 'light' | 'dark' = 'dark';
  private themeSubject = new BehaviorSubject<'light' | 'dark'>('dark');

  
  themeChanges$: Observable<'light' | 'dark'> = this.themeSubject.asObservable();

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    
    const savedTheme = localStorage.getItem(this.storageKey) as 'light' | 'dark';
    
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  get currentTheme(): 'light' | 'dark' {
    return this._currentTheme;
  }

  setTheme(theme: 'light' | 'dark'): void {
    this._currentTheme = theme;
    this.themeSubject.next(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.storageKey, theme);
  }

  toggleTheme(): void {
    const newTheme = this._currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
}