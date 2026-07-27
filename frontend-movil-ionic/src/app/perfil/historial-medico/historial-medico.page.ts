import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController, NavController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-historial-medico',
  templateUrl: './historial-medico.page.html',
  styleUrls: ['./historial-medico.page.scss'],
  standalone: false,
})
export class HistorialMedicoPage implements OnInit {
  usuario: any = null;
  cargando = true;

  editAlergias = '';
  editRecetas = '';
  notasClinicas: any[] = [];
  cargandoNotas = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
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
          this.editAlergias = this.usuario.alergias || '';
          this.editRecetas = this.usuario.recetas || '';
          this.cargarNotasClinicas();
        } else {
          this.cargando = false;
        }
      },
      error: () => {
        this.mostrarToast('Error al cargar perfil.', 'danger');
        this.cargando = false;
      }
    });
  }

  cargarNotasClinicas() {
    if (!this.usuario?.expediente_id) {
      this.cargando = false;
      return;
    }
    this.cargandoNotas = true;
    this.http.get<any[]>(`${environment.apiUrl}/notas/${this.usuario.expediente_id}`).subscribe({
      next: (res) => {
        this.notasClinicas = res || [];
        this.cargandoNotas = false;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar notas clínicas:', err);
        this.cargandoNotas = false;
        this.cargando = false;
      }
    });
  }

  guardar() {
    this.authService.updateProfile(this.usuario.usuario_id, 'PACIENTE', null, {
      alergias: this.editAlergias,
      recetas: this.editRecetas
    }).subscribe({
      next: () => {
        this.mostrarToast('Historial médico guardado con éxito.', 'success');
        this.navCtrl.back();
      },
      error: () => {
        this.mostrarToast('Error al guardar el historial médico.', 'danger');
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
