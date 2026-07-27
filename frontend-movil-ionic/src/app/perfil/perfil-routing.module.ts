import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PerfilPage } from './perfil.page';

const routes: Routes = [
  {
    path: '',
    component: PerfilPage
  },
  {
    path: 'info-personal',
    loadChildren: () => import('./info-personal/info-personal.module').then(m => m.InfoPersonalPageModule)
  },
  {
    path: 'historial-medico',
    loadChildren: () => import('./historial-medico/historial-medico.module').then(m => m.HistorialMedicoPageModule)
  },
  {
    path: 'notificaciones',
    loadChildren: () => import('./notificaciones/notificaciones.module').then(m => m.NotificacionesPageModule)
  },
  {
    path: 'privacidad-seguridad',
    loadChildren: () => import('./privacidad-seguridad/privacidad-seguridad.module').then(m => m.PrivacidadSeguridadPageModule)
  },
  {
    path: 'ayuda-soporte',
    loadChildren: () => import('./ayuda-soporte/ayuda-soporte.module').then(m => m.AyudaSoportePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerfilPageRoutingModule {}
