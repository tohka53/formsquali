import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { inject } from '@vercel/analytics';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeadtComponent } from './headt/headt/headt.component';
import { FootetComponent } from './footet/footet/footet.component';
import { HomeComponent } from './home/home/home.component';
import { FormbinkComponent } from './formbink/formbink/formbink.component';
import { FormprodeComponent } from './formprode/formprode/formprode.component';
import { FormscComponent } from './formsc/formsc/formsc.component';
import { FormispaComponent } from './formispa/formispa/formispa.component';
import { HttpClientModule } from '@angular/common/http';


inject();
@NgModule({
  declarations: [
    AppComponent,
    HeadtComponent,
    FootetComponent,
    HomeComponent,
    FormbinkComponent,
    FormprodeComponent,
    FormscComponent,
    FormispaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule  // Añadir esto
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
