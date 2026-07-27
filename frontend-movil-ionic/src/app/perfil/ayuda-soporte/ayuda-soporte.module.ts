import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AyudaSoportePageRoutingModule } from './ayuda-soporte-routing.module';
import { AyudaSoportePage } from './ayuda-soporte.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AyudaSoportePageRoutingModule
  ],
  declarations: [AyudaSoportePage]
})
export class AyudaSoportePageModule {}
