import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  async onLogin() {
    if (this.loginForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Logging in...',
        duration: 3000
      });
      await loading.present();

      const { username, password } = this.loginForm.value;
      const success = await this.authService.login(username, password);

      await loading.dismiss();

      if (success) {
        this.router.navigate(['/app/monthly-budget']);
      } else {
        const alert = await this.alertController.create({
          header: 'Login Failed',
          message: 'Invalid username or password. Use "admin" / "adminadmin"',
          buttons: ['OK']
        });
        await alert.present();
      }
    }
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }
}
