import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeadtComponent } from './headt/headt/headt.component';
import { FootetComponent } from './footet/footet/footet.component';
import { HomeComponent } from './home/home/home.component';
import { FormbinkComponent } from './formbink/formbink/formbink.component';



@NgModule({
  declarations: [
    AppComponent,
    HeadtComponent,
    FootetComponent,
    HomeComponent,
    FormbinkComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
