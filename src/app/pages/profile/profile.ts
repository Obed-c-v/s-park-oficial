import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../shared/services/settings.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './profile.html',
    styleUrl: './profile.css',
})
export class Profile {
    userProfile = {
        fullName: 'Dr. Roberto García',
        email: 'roberto.garcia@neuroweb.com',
        licenseNumber: 'ML-77281-SP',
        hospital: 'Sanatorio Central Neurología',
        specialty: 'Neurología Clínica',
        phoneNumber: '+34 612 345 678',
        avatar: 'RG'
    };

    settingsService = inject(SettingsService);

    // Security
    security = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    };

    saveProfile() {
        console.log('Guardando cambios de perfil:', this.userProfile);
        alert(this.settingsService.language() === 'es' ? 'Información de perfil actualizada correctamente.' : 'Profile information updated successfully.');
    }

    changePassword() {
        if (this.security.newPassword !== this.security.confirmPassword) {
            alert(this.settingsService.language() === 'es' ? 'Las contraseñas nuevas no coinciden.' : 'New passwords do not match.');
            return;
        }
        console.log('Changing password...');
        alert(this.settingsService.language() === 'es' ? 'Contraseña actualizada con éxito.' : 'Password updated successfully.');
        this.security = { currentPassword: '', newPassword: '', confirmPassword: '' };
    }
}
