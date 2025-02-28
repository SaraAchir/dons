import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { DonationApiService } from '../../services/donation-api.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { DonationDetailsDialogComponent } from '../donation-details-dialog/donation-details-dialog.component';
interface Donation {
  created_at: string;
  donation_type: string;
  frequency?: string;
  total_amount: number;
  payment_status: boolean;
  details: any[];
}

@Component({
  selector: 'app-donation-list',
  templateUrl: './donation-list.component.html',
  styleUrls: ['./donation-list.component.scss'],
  standalone :false
})
export class DonationListComponent  implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['created_at', 'donation_type', 'frequency', 'total_amount', 'payment_status', 'details'];
  dataSource: MatTableDataSource<Donation>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private donationApiService: DonationApiService, private dialog: MatDialog) {
    this.dataSource = new MatTableDataSource<Donation>([]);
  }

  ngOnInit() {
    this.loadDonations();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadDonations() {
    this.donationApiService.getDonations().subscribe(
      (data) => {
        this.dataSource.data = data;
      },
      (error) => {
        console.error('Error loading donations:', error);
      }
    );
  }
  openDetails(donation: Donation) {
    this.dialog.open(DonationDetailsDialogComponent, {
      width: '500px',
      data: donation
    });
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}