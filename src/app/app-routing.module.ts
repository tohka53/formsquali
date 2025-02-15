import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [


  {
    path: 'home',
    loadChildren: () => import('./home/home/home.module').then(m => m.HomeModule)
  },  
  {
    path: 'formbink',
    loadChildren: () => import('./formbink/formbink/formbink.module').then(m => m.FormbinkModule)
  },  

  {
    
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
