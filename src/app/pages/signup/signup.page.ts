import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@services/core/auth.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { getAuth, signOut } from 'firebase/auth';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: false
})
export class SignupPage implements OnInit {
  signupForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  async onSignup() {
    if (this.signupForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Creating account...'
      });
      await loading.present();

      const { email, password } = this.signupForm.value;
      const result = await this.authService.signup(email, password);

      await loading.dismiss();

      if (result.success) {

        const auth = getAuth();
        await signOut(auth);
        
        const alert = await this.alertController.create({
          header: 'Success',
          message: 'Account created successfully! Please login.',
          buttons: [{
            text: 'OK',
            handler: () => {
              this.router.navigate(['/login']);
            }
          }]
        });
        await alert.present();
      } else {
        const alert = await this.alertController.create({
          header: 'Signup Failed',
          message: result.error || 'Unable to create account. Please try again.',
          buttons: ['OK']
        });
        await alert.present();
      }
    } else {
      let message = 'Please fill in all fields correctly.';
      
      if (this.signupForm.hasError('passwordMismatch')) {
        message = 'Passwords do not match.';
      }

      const alert = await this.alertController.create({
        header: 'Invalid Form',
        message,
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}