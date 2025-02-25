import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})
export class DashboardComponent {
  menuItems = [
    { icon: 'dashboard', label: 'Overview', route: '/dashboard' },
    { icon: 'volunteer_activism', label: 'Donations', route: '/dashboard/donations' },
    { icon: 'people', label: 'Users', route: '/dashboard/users' },
    { icon: 'analytics', label: 'Analytics', route: '/dashboard/analytics' },
    { icon: 'settings', label: 'Settings', route: '/dashboard/settings' }
  ];
}