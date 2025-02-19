import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormenComponent } from './formen.component';

const routes: Routes = [

  {
    path: '',
    component: FormenComponent  
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormenRoutingModule { }
