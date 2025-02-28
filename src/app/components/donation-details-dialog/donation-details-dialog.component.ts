import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-donation-details-dialog',
  templateUrl: './donation-details-dialog.component.html',
  styleUrls: ['./donation-details-dialog.component.scss'],
  standalone: false
})
export class DonationDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DonationDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {console.log("daaaaaaaaaaaaaata", this.data)} 

  onClose(): void {
    this.dialogRef.close();
  }
}