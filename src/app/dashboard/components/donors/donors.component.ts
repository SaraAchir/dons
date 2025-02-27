import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Donor } from '../../interfaces/donor.interface';

@Component({
  selector: 'app-donors',
  templateUrl: './donors.component.html',
  styleUrls: ['./donors.component.scss'],
  standalone: false
})
export class DonorsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'email', 'totalDonated', 'lastDonationDate', 'donationType'];
  dataSource!: MatTableDataSource<Donor>;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
donors: any;

  ngOnInit() {
    const donors: Donor[] = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        totalDonated: 1500,
        lastDonationDate: new Date('2024-01-15'),
        donationType: 'regular'
      }
    ];
    
    this.dataSource = new MatTableDataSource(donors);
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return data.firstName.toLowerCase().includes(filter.toLowerCase()) ||
             data.lastName.toLowerCase().includes(filter.toLowerCase()) ||
             data.email.toLowerCase().includes(filter.toLowerCase()) ||
             data.donationType.toLowerCase().includes(filter.toLowerCase());
    };
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
}