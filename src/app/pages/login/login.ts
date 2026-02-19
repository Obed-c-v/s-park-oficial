import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { fadeInSlide } from '../../shared/animations';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../shared/services/settings.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  animations: [fadeInSlide],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private router = inject(Router);
  settingsService = inject(SettingsService);

  email = '';
  password = '';
  errorMessage = '';
  touched = { email: false, password: false };

  onLogin() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = this.settingsService.translate('required_fields_msg');
      return;
    }

    // Simulando una validación 
    if (this.email === 'obed@gmail.com' && this.password === '123456') {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = this.settingsService.translate('invalid_login');
    }
  }
}
