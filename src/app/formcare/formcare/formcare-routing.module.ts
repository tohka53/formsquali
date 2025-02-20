import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormcareComponent } from './formcare.component';

const routes: Routes = [

  {
    path: '',
    component: FormcareComponent  
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormcareRoutingModule { }
