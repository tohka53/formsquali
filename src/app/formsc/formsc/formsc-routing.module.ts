import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormscComponent } from './formsc.component';

const routes: Routes = [

  {
    path: '',
    component: FormscComponent  
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormscRoutingModule { }
