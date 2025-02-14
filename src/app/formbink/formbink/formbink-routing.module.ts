import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormbinkComponent } from './formbink.component';

const routes: Routes = [

  {
    path: '',
    component: FormbinkComponent  
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormbinkRoutingModule { }
