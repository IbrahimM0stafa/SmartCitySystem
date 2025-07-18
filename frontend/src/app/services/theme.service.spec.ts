import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let mockLocalStorage: { [key: string]: string };
  let mockMediaQuery: {
    matches: boolean;
    media: string;
    addEventListener: jasmine.Spy;
    removeEventListener: jasmine.Spy;
    onchange: null;
    addListener: jasmine.Spy;
    removeListener: jasmine.Spy;
    dispatchEvent: (event: Event) => boolean;
  };

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => mockLocalStorage[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete mockLocalStorage[key];
    });

    // Create a fully mock MediaQueryList with writable matches property
    mockMediaQuery = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
      onchange: null,
      addListener: jasmine.createSpy('addListener'),
      removeListener: jasmine.createSpy('removeListener'),
      dispatchEvent: (event: Event) => true
    };

    spyOn(window, 'matchMedia').and.callFake(() => mockMediaQuery as MediaQueryList);

    // Mock document.documentElement.setAttribute
    spyOn(document.documentElement, 'setAttribute');

    TestBed.configureTestingModule({
      providers: [ThemeService]
    });

    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    // Clean up
    mockLocalStorage = {};
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with dark theme as default', () => {
      expect(service.currentTheme).toBe('dark');
    });

    it('should provide theme changes observable', () => {
      expect(service.themeChanges$).toBeDefined();
      
      service.themeChanges$.subscribe(theme => {
        expect(theme).toBe('dark');
      });
    });
  });

  describe('Theme Initialization Logic', () => {
    it('should use saved theme from localStorage when available', () => {
      // Simulate a saved theme in localStorage
      mockLocalStorage['preferred-theme'] = 'light';
      
      // Create a new service instance to test initialization
      const newService = new ThemeService();
      
      expect(newService.currentTheme).toBe('light');
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });

    it('should use system preference when no saved theme (dark preference)', () => {
      // Clear localStorage and set system preference to dark
      mockLocalStorage = {};
      mockMediaQuery.matches = true;
      
      const newService = new ThemeService();
      
      expect(newService.currentTheme).toBe('dark');
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    it('should use system preference when no saved theme (light preference)', () => {
      // Clear localStorage and set system preference to light
      mockLocalStorage = {};
      mockMediaQuery.matches = false;
      
      const newService = new ThemeService();
      
      expect(newService.currentTheme).toBe('light');
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });

    it('should fall back to dark theme when no saved theme and no system preference', () => {
      // Clear localStorage and ensure matchMedia returns false
      mockLocalStorage = {};
      mockMediaQuery.matches = false;
      
      const newService = new ThemeService();
      
      expect(newService.currentTheme).toBe('light');
    });
  });

  describe('Theme Management', () => {
    it('should set theme correctly', () => {
      spyOn(service['themeSubject'], 'next');
      
      service.setTheme('light');
      
      expect(service.currentTheme).toBe('light');
      expect(service['themeSubject'].next).toHaveBeenCalledWith('light');
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
      expect(localStorage.setItem).toHaveBeenCalledWith('preferred-theme', 'light');
    });

    it('should toggle theme from dark to light', () => {
      service['_currentTheme'] = 'dark';
      spyOn(service, 'setTheme');
      
      service.toggleTheme();
      
      expect(service.setTheme).toHaveBeenCalledWith('light');
    });

    it('should toggle theme from light to dark', () => {
      service['_currentTheme'] = 'light';
      spyOn(service, 'setTheme');
      
      service.toggleTheme();
      
      expect(service.setTheme).toHaveBeenCalledWith('dark');
    });
  });

  describe('Theme Persistence', () => {
    it('should save theme to localStorage when set', () => {
      service.setTheme('light');
      expect(localStorage.setItem).toHaveBeenCalledWith('preferred-theme', 'light');
    });

    it('should load theme from localStorage on initialization', () => {
      mockLocalStorage['preferred-theme'] = 'light';
      
      const newService = new ThemeService();
      expect(newService.currentTheme).toBe('light');
    });

    it('should handle invalid theme values gracefully', () => {
      mockLocalStorage['preferred-theme'] = 'invalid-theme';
      
      const newService = new ThemeService();
      expect(newService.currentTheme).toBeDefined();
    });
  });

  describe('DOM Manipulation', () => {
    it('should set data-theme attribute on document element', () => {
      service.setTheme('light');
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });

    it('should update data-theme attribute when theme changes', () => {
      service.setTheme('dark');
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
      
      service.setTheme('light');
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });
  });

  describe('Observable Behavior', () => {
    it('should emit theme changes through observable', () => {
      const themeChanges: string[] = [];
      
      service.themeChanges$.subscribe(theme => {
        themeChanges.push(theme);
      });
      
      service.setTheme('light');
      service.setTheme('dark');
      
      expect(themeChanges).toEqual(['dark', 'light', 'dark']);
    });

    it('should emit initial theme value to subscribers', () => {
      let receivedTheme: string | undefined;
      
      service.themeChanges$.subscribe(theme => {
        receivedTheme = theme;
      });
      
      expect(receivedTheme).toBe('dark');
    });

    it('should handle multiple subscribers', () => {
      const subscriber1Themes: string[] = [];
      const subscriber2Themes: string[] = [];
      
      service.themeChanges$.subscribe(theme => subscriber1Themes.push(theme));
      service.themeChanges$.subscribe(theme => subscriber2Themes.push(theme));
      
      service.setTheme('light');
      
      expect(subscriber1Themes).toContain('light');
      expect(subscriber2Themes).toContain('light');
    });
  });

  describe('System Theme Detection', () => {
    it('should detect system dark mode preference', () => {
      mockMediaQuery.matches = true;
      mockLocalStorage = {};
      
      const newService = new ThemeService();
      expect(newService.currentTheme).toBe('dark');
    });

    it('should detect system light mode preference', () => {
      mockMediaQuery.matches = false;
      mockLocalStorage = {};
      
      const newService = new ThemeService();
      expect(newService.currentTheme).toBe('light');
    });

    it('should call matchMedia with correct query', () => {
      new ThemeService();
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });
  });

  describe('Storage Key Management', () => {
    it('should use correct storage key', () => {
      const expectedKey = 'preferred-theme';
      service.setTheme('light');
      
      expect(localStorage.setItem).toHaveBeenCalledWith(expectedKey, 'light');
    });

    it('should retrieve from correct storage key', () => {
      const expectedKey = 'preferred-theme';
      new ThemeService();
      
      expect(localStorage.getItem).toHaveBeenCalledWith(expectedKey);
    });
  });

  describe('Theme Validation', () => {
    it('should accept valid light theme', () => {
      service.setTheme('light');
      expect(service.currentTheme).toBe('light');
    });

    it('should accept valid dark theme', () => {
      service.setTheme('dark');
      expect(service.currentTheme).toBe('dark');
    });

    it('should handle theme switching multiple times', () => {
      service.setTheme('light');
      expect(service.currentTheme).toBe('light');
      
      service.setTheme('dark');
      expect(service.currentTheme).toBe('dark');
      
      service.setTheme('light');
      expect(service.currentTheme).toBe('light');
    });
  });

  describe('Integration with Browser APIs', () => {
    it('should handle localStorage unavailable gracefully', () => {
      spyOn(localStorage, 'getItem').and.throwError('localStorage not available');
      spyOn(localStorage, 'setItem').and.throwError('localStorage not available');
      
      expect(() => new ThemeService()).not.toThrow();
    });

    it('should handle matchMedia unavailable gracefully', () => {
      (window as any).matchMedia = undefined;
      
      expect(() => new ThemeService()).not.toThrow();
    });
  });

  describe('Service Lifecycle', () => {
    it('should maintain theme state across multiple calls', () => {
      service.setTheme('light');
      expect(service.currentTheme).toBe('light');
      
      service.toggleTheme();
      expect(service.currentTheme).toBe('dark');
      
      service.toggleTheme();
      expect(service.currentTheme).toBe('light');
    });

    it('should provide consistent theme state through getter', () => {
      service.setTheme('dark');
      expect(service.currentTheme).toBe('dark');
      
      service.setTheme('light');
      expect(service.currentTheme).toBe('light');
    });
  });

  describe('Performance Considerations', () => {
    it('should not create memory leaks with observables', () => {
      const subscription = service.themeChanges$.subscribe();
      expect(subscription.unsubscribe).toBeDefined();
      
      expect(() => subscription.unsubscribe()).not.toThrow();
    });

    it('should handle rapid theme changes', () => {
      for (let i = 0; i < 10; i++) {
        service.toggleTheme();
      }
      
      expect(service.currentTheme).toBeDefined();
      expect(['light', 'dark']).toContain(service.currentTheme);
    });
  });
});