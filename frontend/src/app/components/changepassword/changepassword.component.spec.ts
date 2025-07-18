import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import { ChangePasswordComponent } from './changepassword.component';
import { ThemeService } from '../../services/theme.service';
import { environment } from '../../../environments/environment';
import { VALIDATION_MESSAGES } from './validation-messages.config';

describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  let themeService: jasmine.SpyObj<ThemeService>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const themeServiceSpy = jasmine.createSpyObj('ThemeService', ['toggleTheme'], {
      currentTheme: 'light'
    });

    await TestBed.configureTestingModule({
      imports: [
        ChangePasswordComponent,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ThemeService, useValue: themeServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    themeService = TestBed.inject(ThemeService) as jasmine.SpyObj<ThemeService>;
    
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize forms correctly', () => {
      expect(component.changePasswordForm).toBeDefined();
      expect(component.otpForm).toBeDefined();
      expect(component.changePasswordForm.get('email')).toBeDefined();
      expect(component.changePasswordForm.get('oldPassword')).toBeDefined();
      expect(component.changePasswordForm.get('newPassword')).toBeDefined();
      expect(component.changePasswordForm.get('confirmPassword')).toBeDefined();
      expect(component.otpDigits.length).toBe(6);
    });

    it('should initialize default values', () => {
      expect(component.isOtpScreen).toBeFalse();
      expect(component.passwordStrength).toBe(0);
      expect(component.passwordError).toBe('');
      expect(component.loading).toBeFalse();
      expect(component.showOldPassword).toBeFalse();
      expect(component.showNewPassword).toBeFalse();
      expect(component.showConfirmPassword).toBeFalse();
      expect(component.canResend).toBeFalse();
      expect(component.cooldown).toBe(0);
    });
  });

  describe('Form Validation', () => {
    it('should validate email field', () => {
      const emailControl = component.changePasswordForm.get('email');
      
      emailControl?.setValue('');
      expect(emailControl?.invalid).toBeTruthy();
      
      emailControl?.setValue('invalid-email');
      expect(emailControl?.invalid).toBeTruthy();
      
      emailControl?.setValue('valid@example.com');
      expect(emailControl?.valid).toBeTruthy();
    });

    it('should validate required fields', () => {
      const form = component.changePasswordForm;
      
      expect(form.get('email')?.invalid).toBeTruthy();
      expect(form.get('oldPassword')?.invalid).toBeTruthy();
      expect(form.get('newPassword')?.invalid).toBeTruthy();
      expect(form.get('confirmPassword')?.invalid).toBeTruthy();
    });

    it('should validate new password minimum length', () => {
      const newPasswordControl = component.changePasswordForm.get('newPassword');
      
      newPasswordControl?.setValue('short');
      expect(newPasswordControl?.invalid).toBeTruthy();
      
      newPasswordControl?.setValue('validpassword123');
      expect(newPasswordControl?.valid).toBeTruthy();
    });

    it('should validate OTP digits', () => {
      component.otpDigits.controls.forEach((control, index) => {
        control.setValue('');
        expect(control.invalid).toBeTruthy();
        
        control.setValue('a');
        expect(control.invalid).toBeTruthy();
        
        control.setValue('5');
        expect(control.valid).toBeTruthy();
      });
    });
  });

  describe('Password Strength Check', () => {
    it('should calculate password strength correctly', () => {
      component.checkPasswordStrength('weak');
      expect(component.passwordStrength).toBe(0);
      
      component.checkPasswordStrength('weakpassword');
      expect(component.passwordStrength).toBe(25);
      
      component.checkPasswordStrength('WeakPassword');
      expect(component.passwordStrength).toBe(50);
      
      component.checkPasswordStrength('WeakPassword123');
      expect(component.passwordStrength).toBe(75);
      
      component.checkPasswordStrength('StrongPassword123!');
      expect(component.passwordStrength).toBe(100);
    });

    it('should return correct strength text', () => {
      component.passwordStrength = 0;
      expect(component.getStrengthText()).toBe('Password strength');
      
      component.passwordStrength = 25;
      expect(component.getStrengthText()).toBe('Weak');
      
      component.passwordStrength = 50;
      expect(component.getStrengthText()).toBe('Fair');
      
      component.passwordStrength = 75;
      expect(component.getStrengthText()).toBe('Good');
      
      component.passwordStrength = 100;
      expect(component.getStrengthText()).toBe('Strong');
    });

    it('should return correct strength bar color', () => {
      component.passwordStrength = 25;
      expect(component.getStrengthBarColor()).toBe('#ff4d4d');
      
      component.passwordStrength = 50;
      expect(component.getStrengthBarColor()).toBe('#ffa64d');
      
      component.passwordStrength = 75;
      expect(component.getStrengthBarColor()).toBe('#ffff4d');
      
      component.passwordStrength = 100;
      expect(component.getStrengthBarColor()).toBe('#4dff4d');
    });
  });

  describe('Password Change Request', () => {
    beforeEach(() => {
      component.changePasswordForm.patchValue({
        email: 'test@example.com',
        oldPassword: 'oldPassword123',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });
    });

    it('should not submit if form is invalid', () => {
      component.changePasswordForm.patchValue({ email: 'invalid-email' });
      component.handlePasswordRequest();
      
      expect(component.loading).toBeFalse();
      httpMock.expectNone(`${environment.apiUrl}/api/auth/change-password-request`);
    });

    it('should validate password requirements', () => {
      component.changePasswordForm.patchValue({ newPassword: 'weak' });
      component.handlePasswordRequest();
      
      expect(component.passwordError).toBe(VALIDATION_MESSAGES.PASSWORD_REQUIREMENTS);
    });

    it('should validate password confirmation', () => {
      component.changePasswordForm.patchValue({ confirmPassword: 'different' });
      component.handlePasswordRequest();
      
      expect(component.passwordError).toBe(VALIDATION_MESSAGES.PASSWORDS_MISMATCH);
    });

    it('should validate password strength', () => {
      component.changePasswordForm.patchValue({ newPassword: 'weakpassword' });
      component.passwordStrength = 25;
      component.handlePasswordRequest();
      
      expect(component.passwordError).toBe(VALIDATION_MESSAGES.WEAK_PASSWORD);
    });

    it('should make API call on successful validation', () => {
      spyOn(window, 'alert');
      component.passwordStrength = 75;
      
      component.handlePasswordRequest();
      
      const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/change-password-request`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'test@example.com',
        oldPassword: 'oldPassword123'
      });
      
      req.flush({ message: 'OTP sent successfully!' });
      
      expect(window.alert).toHaveBeenCalledWith('OTP sent successfully!');
      expect(component.loading).toBeFalse();
    });

    it('should handle API error', () => {
      spyOn(window, 'alert');
      spyOn(console, 'error');
      component.passwordStrength = 75;
      
      component.handlePasswordRequest();
      
      const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/change-password-request`);
      req.flush({ error: 'Invalid credentials' }, { status: 400, statusText: 'Bad Request' });
      
      expect(console.error).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Invalid credentials');
      expect(component.loading).toBeFalse();
    });

    it('should transition to OTP screen on success', fakeAsync(() => {
      spyOn(window, 'alert');
      component.passwordStrength = 75;
      
      component.handlePasswordRequest();
      
      const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/change-password-request`);
      req.flush({ message: 'OTP sent successfully!' });
      
      tick(300);
      
      expect(component.isOtpScreen).toBeTruthy();
      expect(component.pageAnimation).toBe('slide-in');
    }));
  });

  describe('OTP Handling', () => {
    beforeEach(() => {
      component.isOtpScreen = true;
      component.changePasswordForm.patchValue({
        email: 'test@example.com',
        newPassword: 'NewPassword123!'
      });
    });

    it('should get OTP value correctly', () => {
      const digits = ['1', '2', '3', '4', '5', '6'];
      digits.forEach((digit, index) => {
        component.otpDigits.at(index).setValue(digit);
      });
      
      expect(component.otpValue).toBe('123456');
    });

    it('should not submit OTP if not complete', () => {
      spyOn(window, 'alert');
      component.otpDigits.at(0).setValue('1');
      
      component.handleOtpSubmit();
      
      expect(window.alert).toHaveBeenCalledWith('Please enter all 6 OTP digits');
      httpMock.expectNone(`${environment.apiUrl}/api/auth/verify-password-change`);
    });

    it('should submit OTP when complete', () => {
      spyOn(window, 'alert');
      const digits = ['1', '2', '3', '4', '5', '6'];
      digits.forEach((digit, index) => {
        component.otpDigits.at(index).setValue(digit);
      });
      
      component.handleOtpSubmit();
      
      const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/verify-password-change`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'test@example.com',
        otp: '123456',
        newPassword: 'NewPassword123!'
      });
      
      req.flush({ message: 'Password changed successfully!' });
      
      expect(window.alert).toHaveBeenCalledWith('Password changed successfully!');
    });

    it('should handle OTP verification error', () => {
      spyOn(window, 'alert');
      spyOn(console, 'error');
      const digits = ['1', '2', '3', '4', '5', '6'];
      digits.forEach((digit, index) => {
        component.otpDigits.at(index).setValue(digit);
      });
      
      component.handleOtpSubmit();
      
      const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/verify-password-change`);
      req.flush({ error: 'Invalid OTP' }, { status: 400, statusText: 'Bad Request' });
      
      expect(console.error).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Invalid OTP');
      expect(component.loading).toBeFalse();
    });

    it('should handle paste event correctly', () => {
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer()
      });
      pasteEvent.clipboardData?.setData('text', '123456');
      
      component.handlePaste(pasteEvent);
      
      expect(component.otpValue).toBe('123456');
    });

    it('should handle paste with non-numeric characters', () => {
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer()
      });
      pasteEvent.clipboardData?.setData('text', 'a1b2c3d4e5f6');
      
      component.handlePaste(pasteEvent);
      
      expect(component.otpValue).toBe('123456');
    });
  });

  describe('Resend OTP', () => {
    beforeEach(() => {
      component.isOtpScreen = true;
      component.changePasswordForm.patchValue({
        email: 'test@example.com',
        oldPassword: 'oldPassword123'
      });
    });

    it('should start resend cooldown', fakeAsync(() => {
      component.startResendCooldown();
      
      expect(component.canResend).toBeFalse();
      expect(component.cooldown).toBe(60);
      
      tick(1000);
      expect(component.cooldown).toBe(59);
      
      tick(59000);
      expect(component.cooldown).toBe(0);
      expect(component.canResend).toBeTruthy();
    }));

    it('should not resend OTP if cooldown active', () => {
      component.canResend = false;
      component.handleResendOtp();
      
      httpMock.expectNone(`${environment.apiUrl}/api/auth/change-password-request`);
    });

    it('should resend OTP when allowed', () => {
      spyOn(window, 'alert');
      component.canResend = true;
      
      component.handleResendOtp();
      
      const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/change-password-request`);
      expect(req.request.method).toBe('POST');
      
      req.flush({ message: 'New OTP sent successfully!' });
      
      expect(window.alert).toHaveBeenCalledWith('New OTP sent successfully!');
      expect(component.canResend).toBeFalse();
    });

    it('should clear OTP inputs on resend', () => {
      component.canResend = true;
      const digits = ['1', '2', '3', '4', '5', '6'];
      digits.forEach((digit, index) => {
        component.otpDigits.at(index).setValue(digit);
      });
      
      component.handleResendOtp();
      
      const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/change-password-request`);
      req.flush({ message: 'New OTP sent successfully!' });
      
      expect(component.otpValue).toBe('');
    });
  });

  describe('Navigation', () => {
    it('should navigate to login on goToLogin', fakeAsync(() => {
      spyOn(component.logoutEvent, 'emit');
      
      component.goToLogin();
      
      tick(300);
      
      expect(component.logoutEvent.emit).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    }));

    it('should go back from OTP screen', fakeAsync(() => {
      component.isOtpScreen = true;
      
      component.goBack();
      
      tick(300);
      
      expect(component.isOtpScreen).toBeFalse();
      expect(component.pageAnimation).toBe('slide-in');
    }));
  });

  describe('Theme Toggle', () => {
    it('should toggle theme', () => {
      component.toggleTheme();
      
      expect(themeService.toggleTheme).toHaveBeenCalled();
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle old password visibility', () => {
      expect(component.showOldPassword).toBeFalse();
      
      component.toggleShowOldPassword();
      expect(component.showOldPassword).toBeTruthy();
      
      component.toggleShowOldPassword();
      expect(component.showOldPassword).toBeFalse();
    });

    it('should toggle new password visibility', () => {
      expect(component.showNewPassword).toBeFalse();
      
      component.toggleShowNewPassword();
      expect(component.showNewPassword).toBeTruthy();
      
      component.toggleShowNewPassword();
      expect(component.showNewPassword).toBeFalse();
    });

    it('should toggle confirm password visibility', () => {
      expect(component.showConfirmPassword).toBeFalse();
      
      component.toggleShowConfirmPassword();
      expect(component.showConfirmPassword).toBeTruthy();
      
      component.toggleShowConfirmPassword();
      expect(component.showConfirmPassword).toBeFalse();
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize form listeners on ngOnInit', () => {
      spyOn(component, 'initializeFormListeners');
      
      component.ngOnInit();
      
      expect(component.initializeFormListeners).toHaveBeenCalled();
    });

    it('should unsubscribe from cooldown on destroy', () => {
      component.startResendCooldown();
      const subscription = component.cooldownSubscription;
      spyOn(subscription!, 'unsubscribe');
      
      component.ngOnDestroy();
      
      expect(subscription!.unsubscribe).toHaveBeenCalled();
    });

    it('should handle destroyed component without subscription', () => {
      component.cooldownSubscription = undefined;
      
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('Form Listeners', () => {
    it('should update password strength on new password change', () => {
      spyOn(component, 'checkPasswordStrength');
      
      component.changePasswordForm.get('newPassword')?.setValue('TestPassword123!');
      
      expect(component.checkPasswordStrength).toHaveBeenCalledWith('TestPassword123!');
      expect(component.passwordError).toBe('');
    });

    it('should clear password error on confirm password change', () => {
      component.passwordError = 'Some error';
      
      component.changePasswordForm.get('confirmPassword')?.setValue('something');
      
      expect(component.passwordError).toBe('');
    });
  });
});