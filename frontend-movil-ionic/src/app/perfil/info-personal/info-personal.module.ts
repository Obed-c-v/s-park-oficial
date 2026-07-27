import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { InfoPersonalPageRoutingModule } from './info-personal-routing.module';
import { InfoPersonalPage } from './info-personal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InfoPersonalPageRoutingModule
  ],
  declarations: [InfoPersonalPage]
})
export class InfoPersonalPageModule {}
