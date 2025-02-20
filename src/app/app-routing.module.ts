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
    path: 'formprode',
    loadChildren: () => import('./formprode/formprode/formprode.module').then(m => m.FormprodeModule)
  },  
  {
    path: 'formsc',
    loadChildren: () => import('./formsc/formsc/formsc.module').then(m => m.FormscModule)
  },  
  {
    path: 'formispa',
    loadChildren: () => import('./formispa/formispa/formispa.module').then(m => m.FormispaModule)
  },  
  {
    path: 'formen',
    loadChildren: () => import('./formen/formen/formen.module').then(m => m.FormenModule)
  },  
  {
    path: 'formcare',
    loadChildren: () => import('./formcare/formcare/formcare.module').then(m => m.FormcareModule)
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
