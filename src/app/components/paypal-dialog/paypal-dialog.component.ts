import { Component, Inject, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PaypalService } from '../../services/paypal.service';

@Component({
  selector: 'app-paypal-dialog',
  templateUrl: './paypal-dialog.component.html',
  styleUrls: ['./paypal-dialog.component.scss'],
  standalone:false
})
export class PaypalDialogComponent implements AfterViewInit {
  constructor(
    public dialogRef: MatDialogRef<PaypalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private paypalService: PaypalService
  ) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.initializePayPal();
    }, 0);
  }

  async initializePayPal() {
    try {
      const subscription = this.paypalService.paymentStatus.subscribe(status => {
        if (status.success) {
          this.dialogRef.close({ success: true });
          subscription.unsubscribe();
        }
      });
  
      await this.paypalService.iniiitPayPalButton(
        this.data.amount,
        '#paypal-button-container',
        this.data.userEmail,
        this.data.donationDetails
      );
    } catch (error) {
      console.error('PayPal initialization error:', error);
      this.dialogRef.close({ success: false, error });
    }
  }
}