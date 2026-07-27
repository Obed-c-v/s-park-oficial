import { Component, OnInit } from '@angular/core';
import { ToastController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-ayuda-soporte',
  templateUrl: './ayuda-soporte.page.html',
  styleUrls: ['./ayuda-soporte.page.scss'],
  standalone: false,
})
export class AyudaSoportePage implements OnInit {
  soporteAsunto = '';
  soporteMensaje = '';
  enviando = false;

  constructor(
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) {}

  ngOnInit() {}

  enviarSoporte() {
    if (!this.soporteAsunto.trim() || !this.soporteMensaje.trim()) {
      this.mostrarToast('Por favor, complete todos los campos.', 'warning');
      return;
    }

    this.enviando = true;
    setTimeout(() => {
      this.mostrarToast('Mensaje enviado. El soporte técnico responderá a tu correo a la brevedad.', 'success');
      this.soporteAsunto = '';
      this.soporteMensaje = '';
      this.enviando = false;
      this.navCtrl.back();
    }, 1000);
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
