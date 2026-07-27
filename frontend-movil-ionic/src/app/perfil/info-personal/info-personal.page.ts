import { Component, OnInit } from '@angular/core';
import { ToastController, NavController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-info-personal',
  templateUrl: './info-personal.page.html',
  styleUrls: ['./info-personal.page.scss'],
  standalone: false,
})
export class InfoPersonalPage implements OnInit {
  usuario: any = null;
  cargando = true;

  editNombre = '';
  editApellido = '';
  editTelefono = '';

  constructor(
    private authService: AuthService,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.cargando = true;
    this.authService.getMe().subscribe({
      next: (res) => {
        this.usuario = res.details;
        if (this.usuario) {
          this.editNombre = this.usuario.nombre || '';
          this.editApellido = this.usuario.apellido || '';
          this.editTelefono = this.usuario.telefono || '';
        }
        this.cargando = false;
      },
      error: () => {
        this.mostrarToast('Error al cargar la información del perfil.', 'danger');
        this.cargando = false;
      }
    });
  }

  get fechaNacimiento(): string {
    if (!this.usuario?.fecha_nacimiento) return '—';
    return new Date(this.usuario.fecha_nacimiento).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  guardar() {
    if (!this.editNombre.trim() || !this.editApellido.trim()) {
      this.mostrarToast('El nombre y apellido son requeridos.', 'warning');
      return;
    }

    this.authService.updateProfile(this.usuario.usuario_id, 'PACIENTE', null, {
      nombre: this.editNombre,
      apellido: this.editApellido,
      telefono: this.editTelefono
    }).subscribe({
      next: () => {
        this.mostrarToast('Información personal actualizada con éxito.', 'success');
        this.navCtrl.back();
      },
      error: () => {
        this.mostrarToast('Error al actualizar la información.', 'danger');
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
