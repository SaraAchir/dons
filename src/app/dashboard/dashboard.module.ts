import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../shared/material.module';
import { DashboardComponent } from './dashboard.component';
import { DonorsComponent } from './components/donors/donors.component';

@NgModule({
  declarations: [
    DashboardComponent,
    DonorsComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardComponent,
        children: [
          { path: 'donors', component: DonorsComponent }
        ]
      }
    ])
  ]
})
export class DashboardModule { }