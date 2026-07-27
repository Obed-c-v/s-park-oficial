import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InfoPersonalPage } from './info-personal.page';

const routes: Routes = [
  {
    path: '',
    component: InfoPersonalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InfoPersonalPageRoutingModule {}
