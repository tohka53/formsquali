import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormcpayComponent } from './formcpay.component';

const routes: Routes = [

  {
    path: '',
    component: FormcpayComponent  
    }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormcpayRoutingModule { }
