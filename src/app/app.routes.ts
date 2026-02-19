import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Patients } from './pages/patients/patients';
import { PatientDetail } from './pages/patient-detail/patient-detail';
import { Alerts } from './pages/alerts/alerts';
import { Settings } from './pages/settings/settings';
import { TestDetail } from './pages/test-detail/test-detail';
import { Login } from './pages/login/login';
import { Profile } from './pages/profile/profile';

import { LayoutComponent } from './components/layout/layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: Dashboard, data: { breadcrumb: 'Dashboard' } },
      {
        path: 'patients',
        data: { breadcrumb: 'Pacientes' },
        children: [
          { path: '', component: Patients },
          { path: 'detail/:id', component: PatientDetail, data: { breadcrumb: 'Detalle de Paciente' } }
        ]
      },
      { path: 'alerts', component: Alerts, data: { breadcrumb: 'Alertas' } },
      { path: 'profile', component: Profile, data: { breadcrumb: 'Perfil' } },
      { path: 'test-detail', component: TestDetail, data: { breadcrumb: 'Detalle de Prueba' } },
    ]
  },
];
