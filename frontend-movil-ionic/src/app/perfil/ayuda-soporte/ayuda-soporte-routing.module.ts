import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AyudaSoportePage } from './ayuda-soporte.page';

const routes: Routes = [
  {
    path: '',
    component: AyudaSoportePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AyudaSoportePageRoutingModule {}
