
import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  constructor(private snackBar: MatSnackBar) {
    emailjs.init("xzjomzS189-3OqN2t");
  }

  async sendConfirmationEmail(email: string, donationDetails: any): Promise<boolean> {
    try {
      console.log('Starting email send process...');
      const response = await emailjs.send(
      "service_r75x6sc",
        "template_vxc8zad",
        {
          to_email: email,
          firstName: donationDetails.firstName,
          amount: donationDetails.amount,
          orderId: donationDetails.orderId,
          date: new Date().toLocaleDateString(),
          selectedCauses: donationDetails.causes
        }
      );

      console.log('EmailJS Response:', response);
      this.snackBar.open('Confirmation email sent!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      
      return true;

    } catch (error) {
      console.error('EmailJS Error:', error);
      this.snackBar.open('Could not send confirmation email', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return false;
    }
  }
}