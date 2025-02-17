import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormprodeComponent } from './formprode.component';

const routes: Routes = [

  {
    path: '',
    component: FormprodeComponent  
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormprodeRoutingModule { }
