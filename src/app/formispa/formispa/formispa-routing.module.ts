import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormispaComponent } from './formispa.component';

const routes: Routes = [

  {
    path: '',
    component: FormispaComponent  
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormispaRoutingModule { }
