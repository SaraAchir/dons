













import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { EmailService } from './email.service';
import { MatSnackBar } from '@angular/material/snack-bar';
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
    private snackBar: MatSnackBar
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

  initPayPalButton(amount: number, containerId: string, userEmail: string, donationDetails: { frequency: FrequencyType; [key: string]: any }): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // @ts-ignore
        paypal.Buttons({
          style: {
            layout: 'vertical'
          },
          createOrder: (data: any, actions: any) => {
            if (donationDetails['donationType'] === 'regular') {
              try {
                return actions?.subscription?.create({
                  plan_id: SUBSCRIPTION_PLANS[donationDetails?.frequency],
                  application_context: {
                    shipping_preference: 'NO_SHIPPING'
                  }
                }).catch((error: any) => {
                  this.handleError('Failed to create subscription: ' + error.message);
                  reject(error);
                });
              } catch (error) {
                this.handleError('Subscription creation error');
                reject(error);
              }
            } else {
              try {
                return actions.order.create({
                  intent: 'CAPTURE',
                  purchase_units: [{
                    amount: {
                      value: amount.toString(),
                      currency_code: 'EUR'
                    },
                    description: 'One-time donation'
                  }]
                }).catch((error: any) => {
                  this.handleError('Failed to create order: ' + error.message);
                  reject(error);
                });
              } catch (error) {
                this.handleError('Order creation error');
                reject(error);
              }
            }
          },

          onApprove: async (data: any, actions: any) => {
            try {
              if (donationDetails['donationType'] === 'regular')  {
                
                const subscription = await actions.subscription.get();
                console.log('Subscription Success:', subscription);
                
                this.paymentStatus.next({
                  success: true,
                  orderId: subscription.id
                });

                await this.emailService.sendConfirmationEmail(userEmail, {
                  ...donationDetails,
                  subscriptionId: subscription.id,
                  isRecurring: true,
                  frequency: donationDetails.frequency
                }).catch(error => {
                  console.error('Email sending failed:', error);
                  this.snackBar.open('Payment successful but email confirmation failed', 'Close', {
                    duration: 5000
                  });
                });

                resolve();
              } else {
                const order = await actions.order.capture();
                console.log('One-time Payment Success:', order);
                
                this.paymentStatus.next({
                  success: true,
                  orderId: order.id
                });

                await this.emailService.sendConfirmationEmail(userEmail, {
                  ...donationDetails,
                  orderId: order.id,
                  isRecurring: false
                }).catch(error => {
                  console.error('Email sending failed:', error);
                  this.snackBar.open('Payment successful but email confirmation failed', 'Close', {
                    duration: 5000
                  });
                });

                resolve();
              }
            } catch (error) {
              this.handleError(error);
              reject(error);
            }
          },

          onError: (err: any) => {
            const errorDetails = this.handleError(err);
            console.error('PayPal Error Details:', {
              code: errorDetails.code,
              message: errorDetails.message,
              raw: err
            });
            reject(errorDetails);
          },

          onCancel: (data: any) => {
            const cancelError = {
              code: 'PAYMENT_CANCELLED',
              message: 'Payment was cancelled by the user',
              details: data
            };
            this.handleError(cancelError);
            reject(cancelError);
          }
        }).render(containerId)
        .catch((renderError: any) => {
          const error = {
            code: 'RENDER_FAILED',
            message: 'Failed to load PayPal button',
            details: renderError
          };
          this.handleError(error);
          reject(error);
        });
      } catch (error) {
        const initError = {
          code: 'INITIALIZATION_FAILED',
          message: 'Failed to initialize PayPal',
          details: error
        };
        this.handleError(initError);
        reject(initError);
      }
    });
  }















  
  
  iniitPayPalButton(amount: number, containerId: string, userEmail: string, donationDetails: any): Promise<void> {
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
                  this.paymentStatus.next({
                    success: true,
                    orderId: data.subscriptionID
                  });
                } else {
                  const order = await actions.order.capture();
                  console.log('Payment Success:', order);
                  this.paymentStatus.next({
                    success: true,
                    orderId: order.id
                  });
                }
                resolve();
              } catch (error) {
                console.error('Payment Error:', error);
                reject(error);
              }
            }
          };
  
          if (donationDetails.donationType === 'regular') {
            buttonConfig.createSubscription = (data: any, actions: any) => {
              return actions.subscription.create({
                'plan_id': SUBSCRIPTION_PLANS[donationDetails.frequency],
                'application_context': {
                  'shipping_preference': 'NO_SHIPPING',
                  'user_action': 'SUBSCRIBE_NOW'
                }
              });
            };
          } else {
            buttonConfig.createOrder = (data: any, actions: any) => {
              return actions.order.create({
                purchase_units: [{
                  amount: {
                    value: amount.toString(),
                    currency_code: 'EUR'
                  }
                }]
              });
            };
          }
  
          // @ts-ignore
          paypal.Buttons(buttonConfig).render(containerId);
        } catch (error) {
          console.error('Render Error:', error);
          reject(error);
        }
      });
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

























