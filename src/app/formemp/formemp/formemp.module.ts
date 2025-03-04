import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormempRoutingModule } from './formemp-routing.module';
import { FormempComponent } from './formemp.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    FormempComponent,

  ],
  imports: [
    CommonModule,
    FormempRoutingModule,
    FormsModule
  ]
})
export class FormempModule { }
