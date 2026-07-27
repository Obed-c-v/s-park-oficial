import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController, NavController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-privacidad-seguridad',
  templateUrl: './privacidad-seguridad.page.html',
  styleUrls: ['./privacidad-seguridad.page.scss'],
  standalone: false,
})
export class PrivacidadSeguridadPage implements OnInit {
  activaPin = false;
  pinSeguridad = '';

  passwordActual = '';
  passwordNueva = '';
  passwordConfirm = '';

  cargando = false;

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.cargarSeguridad();
  }

  cargarSeguridad() {
    try {
      this.activaPin = localStorage.getItem('pref_activa_pin') === 'true';
      this.pinSeguridad = localStorage.getItem('pref_pin_seguridad') || '';
    } catch (_) {}
  }

  guardarSeguridad() {
    try {
      localStorage.setItem('pref_activa_pin', String(this.activaPin));
      if (this.activaPin) {
        if (!this.pinSeguridad || this.pinSeguridad.length !== 4) {
          this.mostrarToast('El PIN debe ser de 4 dígitos.', 'warning');
          return;
        }
        localStorage.setItem('pref_pin_seguridad', this.pinSeguridad);
      } else {
        localStorage.removeItem('pref_pin_seguridad');
        this.pinSeguridad = '';
      }
      this.mostrarToast('Configuración de PIN de seguridad actualizada.', 'success');
    } catch (_) {
      this.mostrarToast('Error al guardar la configuración.', 'danger');
    }
  }

  cambiarPassword() {
    if (!this.passwordActual || !this.passwordNueva) {
      this.mostrarToast('Complete los campos de contraseña.', 'warning');
      return;
    }
    if (this.passwordNueva !== this.passwordConfirm) {
      this.mostrarToast('La nueva contraseña y su confirmación no coinciden.', 'warning');
      return;
    }
    if (this.passwordNueva.length < 6) {
      this.mostrarToast('La contraseña debe tener al menos 6 caracteres.', 'warning');
      return;
    }

    this.cargando = true;
    this.http.patch(`${environment.apiUrl}/auth/me/password`, {
      currentPassword: this.passwordActual,
      newPassword: this.passwordNueva
    }).subscribe({
      next: () => {
        this.mostrarToast('Contraseña actualizada con éxito.', 'success');
        this.passwordActual = '';
        this.passwordNueva = '';
        this.passwordConfirm = '';
        this.cargando = false;
      },
      error: (err) => {
        const msg = err.error?.message || 'Error al cambiar la contraseña.';
        this.mostrarToast(msg, 'danger');
        this.cargando = false;
      }
    });
  }

  async mostrarToast(mensaje: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }
}
