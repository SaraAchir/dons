













import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { EmailService } from './email.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DonationApiService } from './donation-api.service';
import { Router } from '@angular/router';
interface PayPalButtonConfig {
  style: {
    layout: string;
  };
  onApprove: (data: any, actions: any) => Promise<void>;
  createSubscription?: (data: any, actions: any) => Promise<string>;
  createOrder?: (data: any, actions: any) => Promise<string>;
  onError?: (err: any) => void;
  onCancel?: (err: any) => void;
}
type FrequencyType = 'monthly' | 'journalier';
export interface DonationDetails {
  donationType: 'regular' | 'one-time';
  frequency?: FrequencyType;
  firstName: string;
  email: string;
  causes: Array<{
    name: string;
    amount: number;
  }>;
}

interface SubscriptionPlans {
  [key: string]: string;
  monthly: string;
  annuel: string
 
}

const SUBSCRIPTION_PLANS: SubscriptionPlans = {
  annuel: 'P-0VD902653S6829239M67QVNI',
  monthly: 'P-9H666951GE1171120M67CJ7A',
};

interface PaymentError {
  code: string;
  message: string;
  details?: any;
}



@Injectable({
  providedIn: 'root'
})
export class PaypalService {
  paymentStatus = new Subject<{success: boolean, orderId?: string, error?: any}>();

  constructor(
    private emailService: EmailService,
    private snackBar: MatSnackBar,
    private donationApiService: DonationApiService,
    private router: Router,


  ) {}

  private handleError(error: any): PaymentError {
    console.error('Detailed Payment Error:', error);
    
    let errorDetails: PaymentError = {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred'
    };

    if (error.name === 'INVALID_REQUEST') {
      errorDetails = {
        code: 'INVALID_REQUEST',
        message: 'Invalid payment request. Please check your payment details.',
        details: error
      };
    } else if (error.name === 'INSTRUMENT_DECLINED') {
      errorDetails = {
        code: 'CARD_DECLINED',
        message: 'Your payment method was declined. Please try another payment method.',
        details: error
      };
    } else if (error.name === 'INSUFFICIENT_FUNDS') {
      errorDetails = {
        code: 'INSUFFICIENT_FUNDS',
        message: 'Insufficient funds in your account.',
        details: error
      };
    } else if (error.message) {
      errorDetails = {
        code: error.name || 'PAYMENT_ERROR',
        message: error.message,
        details: error
      };
    }

    this.snackBar.open(`Payment Error: ${errorDetails.message}`, 'Close', {
      duration: 8000,
      panelClass: ['error-snackbar']
    });

    this.paymentStatus.next({
      success: false,
      error: errorDetails
    });

    return errorDetails;
  }
















  
  
 

    iniiitPayPalButton(amount: number, containerId: string, userEmail: string, donationDetails: any): Promise<void> {
      return new Promise((resolve, reject) => {
        try {
          const buttonConfig: PayPalButtonConfig = {
            style: {
              layout: 'vertical'
            },
            onApprove: async (data: any, actions: any) => {
              try {
                if (donationDetails.donationType === 'regular') {
                  console.log('Subscription Success:', data);
                    // Ensure causes exist and create donation data
      const donationData = {
        first_name: donationDetails.firstName || '',
        email: donationDetails.email || '',
        donation_type: donationDetails.donationType || 'regular',
        frequency: donationDetails.frequency,
        total_amount: amount.toString(),
        payment_id: data.subscriptionID,
        payment_status: true,
        details: donationDetails.details ? donationDetails.details.map((cause: { id: any; name: any; amount: any; quantity: any;cause:any }) => ({
          cause:  parseInt(cause.cause),
          amount: cause.amount.toString(),
          quantity: cause.quantity || 1,
        })) : []
      };

      console.log('Saving donation:', donationData);
      
      await this.donationApiService.createDonation(donationData).toPromise();
                
                  this.paymentStatus.next({
                    success: true,
                    orderId: data.subscriptionID
                  });
                
                  // Send confirmation email for subscription
                  await this.emailService.sendConfirmationEmail(userEmail, {
                    ...donationDetails,
                    subscriptionId: data.subscriptionID,
                    isRecurring: true,
                    frequency: donationDetails.frequency
                  }).catch(emailError => {
                    console.error('Email sending failed:', emailError);
                    this.snackBar.open('Subscription successful but email confirmation failed', 'Close', {
                      duration: 5000
                    });
                  });
    
                  this.snackBar.open('Subscription successful!', 'Close', {
                    duration: 5000,
                    panelClass: ['success-snackbar']
                  });
                } else {
                  const order = await actions.order.capture();
                  console.log('Payment Success:', order);
                  
      const donationData = {
        first_name: donationDetails.firstName || '',
        email: donationDetails.email || '',
        donation_type: donationDetails.donationType || 'one-time',
        total_amount: amount.toString(),
        payment_id: order.id,
        payment_status: true,
        details: donationDetails.details ? donationDetails.details.map((cause: { id: any; name: any; amount: any; quantity: any;description : any;cause :any }) => ({
          cause:  parseInt(cause.cause),
          amount: cause.amount.toString(),
          quantity: cause.quantity || 1,
          
        })) : []
      };

      console.log('Saving donation:', donationData);
      
      await this.donationApiService.createDonation(donationData).toPromise();

                
                  this.paymentStatus.next({
                    success: true,
                    orderId: order.id
                  });
    
                  // Send confirmation email for one-time payment
                  await this.emailService.sendConfirmationEmail(userEmail, {
                    ...donationDetails,
                    orderId: order.id,
                    isRecurring: false
                  }).catch(emailError => {
                    console.error('Email sending failed:', emailError);
                    this.snackBar.open('Payment successful but email confirmation failed', 'Close', {
                      duration: 5000
                    });
                  });
    
                  this.snackBar.open('Payment successful!', 'Close', {
                    duration: 5000,
                    panelClass: ['success-snackbar']
                  });
                }
                this.router.navigate(['/donations']);
                resolve();
              } catch (error) {
                console.error('Payment Error:', error);
                this.handleError(error);
                reject(error);
              }
            },
            onError: (err: any) => {
              console.error('PayPal Error:', err);
              this.handleError(err);
              this.snackBar.open('Payment failed', 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
              reject(err);
            },
            onCancel: () => {
              console.log('Payment cancelled by user');
              this.snackBar.open('Payment cancelled', 'Close', {
                duration: 3000
              });
              reject('Payment cancelled by user');
            }
          };
    
          if (donationDetails.donationType === 'regular') {
            buttonConfig.createSubscription = (data: any, actions: any) => {
              try {
                return actions.subscription.create({
                  'plan_id': SUBSCRIPTION_PLANS[donationDetails.frequency],
                  'application_context': {
                    'shipping_preference': 'NO_SHIPPING',
                    'user_action': 'SUBSCRIBE_NOW',
                    'payment_method': {
            'payer_selected': 'PAYPAL',
            'payee_preferred': 'IMMEDIATE_PAYMENT_REQUIRED'
          }
                  }
                  
                });
              } catch (error) {
                console.error('Subscription creation error:', error);
                this.handleError(error);
                throw error;
              }
            };
          } else {
            buttonConfig.createOrder = (data: any, actions: any) => {
              try {
                return actions.order.create({
                    application_context: {
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          brand_name: 'TRAE',
          landing_page: 'BILLING',
          user_experience: 'MINIMAL'
          
        },
        purchase_units: [{
          amount: {
            value: amount.toString(),
            currency_code: 'EUR'
          }
        }]
                });
              } catch (error) {
                console.error('Order creation error:', error);
                this.handleError(error);
                throw error;
              }
            };
          }
    
          // @ts-ignore
          paypal.Buttons(buttonConfig).render(containerId);
        } catch (error) {
          console.error('Render Error:', error);
          this.handleError(error);
          reject(error);
        }
      });
    }


}

























