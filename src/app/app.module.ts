import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ethers } from 'ethers';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    {
      provide: ethers.providers.Web3Provider,
      useFactory: () => {
        return (window as any).ethereum
          ? new ethers.providers.Web3Provider((window as any).ethereum)
          : undefined
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
