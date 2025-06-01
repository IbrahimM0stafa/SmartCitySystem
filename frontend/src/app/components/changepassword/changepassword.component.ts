import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef, Output, EventEmitter, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule, FormsModule],
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ChangePasswordComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('otpDigitInput') otpDigitInputs!: QueryList<ElementRef>;
  @Output() logoutEvent = new EventEmitter<void>();

  changePasswordForm: FormGroup;
  otpForm: FormGroup;
  isOtpScreen = false;
  passwordStrength = 0;
  passwordError = '';
  loading = false;
  pageAnimation = '';

  showOldPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  canResend = false;
  cooldown = 0;
  cooldownSubscription?: Subscription;

  private apiUrl = environment.apiUrl;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    public themeService: ThemeService
  ) {
    // Initialize password change form
    this.changePasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });

    // Initialize OTP form with 6 digit FormControls
    this.otpForm = this.fb.group({
      digits: this.fb.array(
        Array(6).fill('').map(() => new FormControl('', [
          Validators.required,
          Validators.pattern('^[0-9]$')
        ]))
      )
    });
  }

  ngOnInit(): void {
    this.initializeFormListeners();
  }

  ngAfterViewInit(): void {
    // Set up digit input focus handling after view initialization
    this.otpDigitInputs.changes.subscribe(() => {
      if (this.otpDigitInputs.length) {
        this.setupDigitInputListeners();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.cooldownSubscription) {
      this.cooldownSubscription.unsubscribe();
    }
  }

  get otpDigits(): FormArray {
    return this.otpForm.get('digits') as FormArray;
  }

  get otpValue(): string {
    return this.otpDigits.controls.map(control => control.value).join('');
  }

  initializeFormListeners(): void {
    this.changePasswordForm.get('newPassword')?.valueChanges.subscribe(
      (value: string) => {
        this.checkPasswordStrength(value);
        this.passwordError = '';
      }
    );

    this.changePasswordForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.passwordError = '';
    });
  }

  setupDigitInputListeners(): void {
    this.otpDigitInputs.forEach((inputRef, index) => {
      const input = inputRef.nativeElement;
      
      // Handle input changes
      input.addEventListener('input', (e: Event) => {
        const target = e.target as HTMLInputElement;
        const value = target.value;
        
        // Only allow single digit numbers
        const digit = value.replace(/[^0-9]/g, '').slice(-1);
        target.value = digit;
        
        // Update form control value
        this.otpDigits.at(index).setValue(digit);
        
        // Move to next input if a digit was entered
        if (digit && index < 5) {
          this.otpDigitInputs.get(index + 1)?.nativeElement.focus();
        }
      });
      
      // Handle keyboard navigation
      input.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Backspace' || e.key === 'Delete') {
          if (input.value === '') {
            // Move to previous input if current is empty
            if (index > 0) {
              e.preventDefault();
              this.otpDigitInputs.get(index - 1)?.nativeElement.focus();
            }
          } else {
            // Clear current input first
            this.otpDigits.at(index).setValue('');
            input.value = '';
          }
        } else if (e.key === 'ArrowLeft' && index > 0) {
          e.preventDefault();
          this.otpDigitInputs.get(index - 1)?.nativeElement.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
          e.preventDefault();
          this.otpDigitInputs.get(index + 1)?.nativeElement.focus();
        }
      });
    });
  }

  checkPasswordStrength(password: string): void {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^A-Za-z0-9]/)) strength += 25;
    this.passwordStrength = strength;
  }

  handlePasswordRequest(): void {
    if (!this.changePasswordForm.valid) return;

    const formData = this.changePasswordForm.value;

    // Password regex: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      this.passwordError = 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.';
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      this.passwordError = 'Passwords do not match';
      return;
    }

    if (this.passwordStrength < 50) {
      this.passwordError = 'Please use a stronger password';
      return;
    }

    this.loading = true;

    this.http.post(`${this.apiUrl}/api/auth/change-password-request`, {
      email: formData.email,
      oldPassword: formData.oldPassword,
    }).subscribe({
      next: (res: any) => {
        console.log('Response:', res);
        alert(res.message || 'OTP sent successfully!');
        this.pageAnimation = 'slide-out';
        setTimeout(() => {
          this.isOtpScreen = true;
          this.pageAnimation = 'slide-in';
          this.startResendCooldown();
          // Reset OTP form
          this.otpDigits.controls.forEach(control => control.setValue(''));
          // Focus first input when OTP screen appears
          setTimeout(() => {
            if (this.otpDigitInputs?.first) {
              this.otpDigitInputs.first.nativeElement.focus();
            }
          }, 300);
        }, 300);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        const errorMessage = err.error?.error || err.error || 'An error occurred.';
        alert(errorMessage);
        this.loading = false;
      }
    });
  }

  handleOtpSubmit(): void {
    const otpString = this.otpValue;
    if (otpString.length !== 6) {
      alert('Please enter all 6 OTP digits');
      return;
    }

    this.loading = true;

    this.http.post(`${this.apiUrl}/api/auth/verify-password-change`, {
      email: this.changePasswordForm.value.email,
      otp: otpString,
      newPassword: this.changePasswordForm.value.newPassword,
    }).subscribe({
      next: (res: any) => {
        console.log('Verification Response:', res);
        alert(res.message || 'Password changed successfully!');
        this.pageAnimation = 'success-animation';
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      },
      error: (err) => {
        console.error('OTP Error:', err);
        const errorMessage = err.error?.error || err.error || 'OTP verification failed.';
        alert(errorMessage);
        this.loading = false;
      }
    });
  }

  handlePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').substring(0, 6);
    
    if (digits) {
      // Fill in the OTP array
      for (let i = 0; i < 6; i++) {
        const value = i < digits.length ? digits[i] : '';
        this.otpDigits.at(i).setValue(value);
        
        if (this.otpDigitInputs.get(i)) {
          this.otpDigitInputs.first!.nativeElement.focus();
        }
      }
      
      // Focus on appropriate input
      const focusIndex = Math.min(digits.length, 5);
      setTimeout(() => {
        if (this.otpDigitInputs.get(focusIndex)) {
          this.otpDigitInputs.first!.nativeElement.focus();
        }
      }, 0);
    }
  }

  startResendCooldown(): void {
    this.canResend = false;
    this.cooldown = 60;

    this.cooldownSubscription = interval(1000).pipe(take(61)).subscribe(() => {
      this.cooldown--;
      if (this.cooldown <= 0) {
        this.canResend = true;
        this.cooldownSubscription?.unsubscribe();
      }
    });
  }

  handleResendOtp(): void {
    if (!this.canResend || this.loading) return;

    this.loading = true;
    
    // Reset OTP form
    this.otpDigits.controls.forEach(control => control.setValue(''));
    this.otpDigitInputs.forEach(input => input.nativeElement.value = '');

    this.http.post(`${this.apiUrl}/api/auth/change-password-request`, {
      email: this.changePasswordForm.value.email,
      oldPassword: this.changePasswordForm.value.oldPassword,
    }).subscribe({
      next: (res: any) => {
        console.log('Resend OTP Response:', res);
        alert(res.message || 'New OTP sent successfully!');
        this.startResendCooldown();
        this.loading = false;
        // Focus first input
        setTimeout(() => {
          if (this.otpDigitInputs?.first) {
            this.otpDigitInputs.first.nativeElement.focus();
          }
        }, 0);
      },
      error: (err) => {
        console.error('Resend OTP Error:', err);
        const errorMessage = err.error?.error || err.error || 'Could not resend OTP.';
        alert(errorMessage);
        this.loading = false;
      }
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  goToLogin(): void {
    this.pageAnimation = 'slide-out';
    setTimeout(() => {
      this.logoutEvent.emit();
      this.router.navigate(['/login']);
    }, 300);
  }

  goBack(): void {
    this.pageAnimation = 'slide-out';
    setTimeout(() => {
      this.isOtpScreen = false;
      this.pageAnimation = 'slide-in';
    }, 300);
  }

  getStrengthBarColor(): string {
    if (this.passwordStrength <= 25) return '#ff4d4d';
    if (this.passwordStrength <= 50) return '#ffa64d';
    if (this.passwordStrength <= 75) return '#ffff4d';
    return '#4dff4d';
  }

  getStrengthText(): string {
    if (this.passwordStrength === 0) return 'Password strength';
    if (this.passwordStrength <= 25) return 'Weak';
    if (this.passwordStrength <= 50) return 'Fair';
    if (this.passwordStrength <= 75) return 'Good';
    return 'Strong';
  }

  toggleShowOldPassword(): void {
    this.showOldPassword = !this.showOldPassword;
  }
  toggleShowNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }
  toggleShowConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}