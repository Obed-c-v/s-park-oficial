import { Component, OnInit } from '@angular/core';
import { ToastController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
  standalone: false,
})
export class NotificacionesPage implements OnInit {
  notifCitas = true;
  notifEjercicios = true;
  notifMedicamentos = false;

  constructor(
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.cargarPreferencias();
  }

  cargarPreferencias() {
    try {
      this.notifCitas = localStorage.getItem('pref_notif_citas') !== 'false';
      this.notifEjercicios = localStorage.getItem('pref_notif_ejercicios') !== 'false';
      this.notifMedicamentos = localStorage.getItem('pref_notif_medicamentos') === 'true';
    } catch (_) {}
  }

  guardar() {
    try {
      localStorage.setItem('pref_notif_citas', String(this.notifCitas));
      localStorage.setItem('pref_notif_ejercicios', String(this.notifEjercicios));
      localStorage.setItem('pref_notif_medicamentos', String(this.notifMedicamentos));
      
      this.mostrarToast('Preferencias de notificación actualizadas.', 'success');
      this.navCtrl.back();
    } catch (_) {
      this.mostrarToast('Error al guardar las preferencias.', 'danger');
    }
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
