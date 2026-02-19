import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsService, Language } from '../../shared/services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  settingsService = inject(SettingsService);

  // Security
  security = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  changePassword() {
    if (this.security.newPassword !== this.security.confirmPassword) {
      alert(this.settingsService.language() === 'es' ? 'Las contraseñas nuevas no coinciden.' : 'New passwords do not match.');
      return;
    }
    console.log('Changing password...');
    alert(this.settingsService.language() === 'es' ? 'Contraseña actualizada con éxito.' : 'Password updated successfully.');
    this.security = { currentPassword: '', newPassword: '', confirmPassword: '' };
  }

  onLanguageChange(event: any) {
    this.settingsService.setLanguage(event.target.value as Language);
  }
}
