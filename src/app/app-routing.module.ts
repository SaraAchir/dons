import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DonationFormComponent } from './components/donation-form/donation-form.component';
import { DonationListComponent } from './components/donation-list/donation-list.component';
import { DonorListComponent } from './components/donor-list/donor-list.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'donations', component: DonationListComponent },
  { path: 'donations/new', component: DonationFormComponent },
  { path: 'donors', component: DonorListComponent },
  {path: 'dashboard',
  loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
