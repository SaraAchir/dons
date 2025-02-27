import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaypalService } from '../../services/paypal.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PaypalDialogComponent } from '../paypal-dialog/paypal-dialog.component';
import { MatDialog } from '@angular/material/dialog';

interface CauseState {
  isSelected: boolean;
  amount: number;
  quantity: number;

}
@Component({
  selector: 'app-donation-form',
  standalone: false,
  templateUrl: './donation-form.component.html',
  styleUrl: './donation-form.component.scss'
})
export class DonationFormComponent implements OnInit ,OnDestroy{
  
  private paymentSubscription: Subscription | undefined;
  donationForm !: FormGroup;
  donationTypes = [
    { value: 'one-time', label: 'One-time Donation' },
    { value: 'regular', label: 'Regular Donation' }
  ];
  frequencies = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'annuel', label: 'Annuel' }
  
  ];

  categories = [
    {
      category: 'Association Support',
      options: [
        { id: 'annual-membership', name: 'Annual membership (starting from 15€)', amount: 15 },
        { id: 'support-association', name: 'Support the association', amount: 0 }
      ]
    },
    {
      category: 'Ramadan',
      options: [
        { id: 'food-basket', name: 'Offer a special Ramadan food basket to Moroccan families (30€)', amount: 30 },
        { id: 'ramadan-pack', name: 'Ramadan pack (250€ per pack for Nepal + 5 fruit trees + 3 food baskets)', amount: 250 },
        { id: 'iftar-morocco', name: 'Iftar Morocco (any amount)', amount: 0 }
      ]
    },
    {
      category: 'Help Orphans',
      options: [
        { id: 'sponsor-orphan', name: 'Sponsor a Moroccan orphan (20€ monthly)', amount: 20 },
        { id: 'widows-orphans', name: 'Fund for Moroccan widows and orphans', amount: 0 },
        { id: 'orphanage-construction', name: 'Participate in orphanage construction in Morocco', amount: 0 }
      ]
    },
    {
      category: 'Well Construction for a Family',
      options: [
        { id: 'well-nepal', name: 'In Nepal (160€)', amount: 160 },
        { id: 'well-bangladesh', name: 'In Bangladesh (165€)', amount: 165 },
        { id: 'well-srilanka', name: 'In Sri Lanka (185€)', amount: 185 },
        { id: 'well-burma', name: 'In Burma (215€)', amount: 215 }
      ]
    },
    {
      category: 'Well Construction for a Village',
      options: [
        { id: 'village-well-niger', name: 'In Niger (750€ + 16€ transaction fee)', amount: 766 },
        { id: 'village-well-bangladesh', name: 'In Bangladesh (771€ + 11€ transaction fee)', amount: 782 },
        { id: 'village-well-cameroon', name: 'In Cameroon (1520€ + 20€ transaction fee)', amount: 1540 }
      ]
    },
    {
      category: 'Other Causes',
      options: [
        { id: 'medical-emergencies', name: 'Support medical emergencies in Morocco', amount: 0 },
        { id: 'social-hospitals', name: 'Support for patients in social hospitals', amount: 0 }
      ]
    }
  ];
 
  selectedCauses: { [key: string]: CauseState } = {};




  constructor(private fb: FormBuilder,private paypalService: PaypalService, private snackBar: MatSnackBar,private dialog: MatDialog) {
    this.initForm();
    this.initSelectedCauses();
    
  }
  async onProceedToPayment() {
        console.log(this.donationForm.value);
        const totalAmount = this.getTotalAmount();
        const selectedCausesList = Object.entries(this.selectedCauses || {})
        .filter(([_, cause]) => cause?.isSelected)
        .map(([id, cause]) => ({
          name: this.getCauseName(id),
          amount: cause?.amount
        }));
        if (this.donationForm.valid && totalAmount > 0) {
      const dialogRef = this.dialog.open(PaypalDialogComponent, {
        width: '500px',
        disableClose: true,
        data: {
          amount: this.getTotalAmount(),
          userEmail: this.donationForm.get('email')?.value,
          donationDetails: {
            firstName: this.donationForm.get('firstName')?.value,
            email: this.donationForm.get('email')?.value,
            donationType: this.donationForm.get('donationType')?.value,
            frequency: this.donationForm.get('frequency')?.value,
            causes: selectedCausesList
          }
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result?.success) {
          // Handle successful payment
          this.resetForm();
        }
      });
    }
  }
  private resetForm(): void {
    this.donationForm.reset();
    this.selectedCauses = {};
    this.donationForm.patchValue({
      donationType: 'one-time',
      causes: []
    });
    this.initSelectedCauses()
  }


  private initForm() {
    this.donationForm = this.fb.group({
      donationType: ['one-time', Validators.required],
      frequency: [''],
      
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['France', Validators.required],
      // taxReceipt: [true],
      // acceptTerms: [false, Validators.requiredTrue]
    });
  }

 
  
  
 



  getCauseAmount(causeId: string): number {
    return this.selectedCauses[causeId]?.amount || 0;
  }

  isCauseSelected(causeId: string): boolean {
    return this.selectedCauses[causeId]?.isSelected || false;
  }
  toggleCause(causeId: string, defaultAmount?: number) {
    const option = this.categories
      .flatMap(category => category.options)
      .find(opt => opt.id === causeId);

    if (option) {
      const isFixedAmount = option.amount > 0;
      this.selectedCauses[causeId] = {
        isSelected: !this.selectedCauses[causeId]?.isSelected,
        amount: isFixedAmount ? option.amount : (defaultAmount || 0),
        quantity: 1
      };
    }
  }
 

  
  updateCauseAmount(causeId: string, newAmount: number) {
    if (!isNaN(newAmount)) {
      const option = this.categories
        .flatMap(category => category.options)
        .find(opt => opt.id === causeId);
  
      if (option) {
        this.selectedCauses[causeId] = {
          ...this.selectedCauses[causeId],
          amount: newAmount,
          quantity: this.selectedCauses[causeId].quantity || 1
        };
      }
    }
  }
  ngOnInit() {
    this.categories.forEach(category => {
      category.options.forEach(option => {
        this.selectedCauses[option.id] = {
          isSelected: false,
          amount: option.amount || 0,
          quantity: 1
        };
      });
    });
    this.paymentSubscription = this.paypalService.paymentStatus.subscribe(
      status => {
        if (status.success) {
          this.snackBar.open('Payment successful! Order ID: ' + status.orderId, 'Close', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          // Handle successful payment (e.g., clear form, show confirmation page)
        } else {
          this.snackBar.open('Payment failed. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      }
    );
  }
  ngOnDestroy() {
    if (this.paymentSubscription) {
      this.paymentSubscription.unsubscribe();
    }
  }

  
// Add this method to your component
validateAmount(causeId: string, amount: number): boolean {
  const option = this.categories
    .flatMap(category => category.options)
    .find(opt => opt.id === causeId);
    
  if (!option || !option.amount) {
    console.log("rrrrrr"+option?.amount)
    return false;
  }
  console.log(amount < option.amount)
  return amount < option.amount;
}
 
updateQuantity(causeId: string, quantity: number) {
  if (this.selectedCauses[causeId]) {
    const baseAmount = this.categories
      .flatMap(category => category.options)
      .find(opt => opt.id === causeId)?.amount || 0;
    
    this.selectedCauses[causeId] = {
      ...this.selectedCauses[causeId],
      quantity: quantity,
      amount: baseAmount * quantity
    };
  }
}


getTotalAmount(): number {
  let total = 0;
  Object.entries(this.selectedCauses).forEach(([causeId, state]) => {
    if (state?.isSelected) {
      const option = this.categories
        .flatMap(category => category.options)
        .find(opt => opt.id === causeId);
      
      if (option) {
        const isFixedAmount = option.amount > 0;
        const amount = isFixedAmount ? option.amount : state.amount;
        total += amount * (state.quantity || 1);
      }
    }
  });
  return total;
}
// When initializing causes
private initSelectedCauses() {
  this.categories.forEach(category => {
    category.options.forEach(option => {
      this.selectedCauses[option.id] = {
        isSelected: false,
        amount: option.amount || 0,
        quantity: 1
      };
    });
  });
}
private getCauseName(causeId: string): string {
  return this.categories
    .flatMap(category => category.options)
    .find(option => option.id === causeId)?.name || '';
}
async initializePayPal() {
  const totalAmount = this.getTotalAmount();
  const userEmail = this.donationForm.get('email')?.value;
  const donationType = this.donationForm.get('donationType')?.value;

  const donationDetails = {
    firstName: this.donationForm.get('firstName')?.value,
    email: userEmail,
    frequency: this.donationForm.get('frequency')?.value,
    donationType: this.donationForm.get('donationType')?.value,
    causes: Object.entries(this.selectedCauses)
      .filter(([_, cause]) => cause?.isSelected)
      .map(([id, cause]) => ({
        name: this.getCauseName(id),
        amount: cause.amount
      }))
  };
  if (donationDetails.donationType === 'regular') {
    donationDetails.frequency = this.donationForm.get('frequency')?.value;
  }
  try {
    await this.paypalService.iniiitPayPalButton(
      totalAmount, 
      '#paypal-button',
      userEmail,
      donationDetails
    );
  } catch (error) {
    console.error('Failed to initialize PayPal:', error);
  }
}

 
 
 
}