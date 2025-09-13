import { Alert } from 'react-native';
import { apiService } from './apiService';

// Payment method types for Ghana
export type PaymentMethodType = 'mobile_money' | 'credit_card' | 'debit_card' | 'paystack' | 'palm_pay' | 'mtn_momo' | 'vodafone_cash' | 'airtel_money';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  lastFour: string;
  provider: string; // MTN, Vodafone, AirtelTigo, etc.
  isDefault: boolean;
  nickname?: string;
  expirationDate?: string;
  brand?: string;
}

export interface PaymentData {
  amount: number;
  currency: string; // GHS (Ghana Cedis)
  paymentFor: 'booking' | 'order';
  referenceId: string;
  paymentMethodId?: string;
  mobileMoneyData?: {
    phoneNumber: string;
    network: 'MTN' | 'Vodafone' | 'AirtelTigo';
  };
  cardData?: {
    number: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    holderName: string;
  };
  // Ghana-specific fields
  promoCode?: string;
  originalAmount?: number;
  discountAmount?: number;
  city?: string;
  region?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  message?: string;
  reference?: string;
  error?: string;
}

class PaymentService {
  private paystackPublicKey: string;
  private palmPayApiKey: string;

  constructor() {
    // These should be loaded from environment variables or secure config
    this.paystackPublicKey = __DEV__ ? 'pk_test_your_paystack_key' : 'pk_live_your_paystack_key';
    this.palmPayApiKey = __DEV__ ? 'test_palm_pay_key' : 'live_palm_pay_key';
  }

  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // Validate payment data
      const validation = this.validatePaymentData(paymentData);
      if (!validation.isValid) {
        return {
          success: false,
          status: 'failed',
          message: validation.error
        };
      }

      // Route to appropriate payment processor
      switch (paymentData.paymentMethodId?.split('_')[0]) {
        case 'paystack':
          return await this.processPaystackPayment(paymentData);
        case 'palmpay':
          return await this.processPalmPayPayment(paymentData);
        case 'momo':
          return await this.processMobileMoneyPayment(paymentData);
        default:
          return await this.processPaystackPayment(paymentData); // Default to Paystack
      }
    } catch (error: any) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        status: 'failed',
        message: error.message || 'Payment processing failed'
      };
    }
  }

  private async processPaystackPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // Initialize Paystack transaction
      const initResponse = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.paystackPublicKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'user@example.com', // Should come from user context
          amount: Math.round(paymentData.amount * 100), // Convert to pesewas
          currency: paymentData.currency,
          reference: `${paymentData.referenceId}_${Date.now()}`,
          callback_url: 'https://your-app.com/payment/callback',
          metadata: {
            paymentFor: paymentData.paymentFor,
            referenceId: paymentData.referenceId,
          },
          channels: ['card', 'mobile_money', 'bank_transfer'],
        }),
      });

      const initResult = await initResponse.json();
      
      if (initResult.status) {
        // For mobile money
        if (paymentData.mobileMoneyData) {
          return await this.processPaystackMobileMoney(initResult.data, paymentData.mobileMoneyData);
        }
        
        // For card payments - this would typically redirect to Paystack checkout
        return {
          success: true,
          transactionId: initResult.data.reference,
          status: 'pending',
          message: 'Payment initialized successfully',
          reference: initResult.data.access_code
        };
      } else {
        return {
          success: false,
          status: 'failed',
          message: initResult.message || 'Failed to initialize payment'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        status: 'failed',
        message: error.message || 'Paystack payment failed'
      };
    }
  }

  private async processPaystackMobileMoney(
    transactionData: any, 
    mobileMoneyData: { phoneNumber: string; network: string }
  ): Promise<PaymentResult> {
    try {
      const chargeResponse = await fetch('https://api.paystack.co/charge', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.paystackPublicKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: transactionData.email,
          amount: transactionData.amount,
          mobile_money: {
            phone: mobileMoneyData.phoneNumber,
            provider: mobileMoneyData.network.toLowerCase()
          },
          reference: transactionData.reference,
        }),
      });

      const chargeResult = await chargeResponse.json();
      
      if (chargeResult.status) {
        return {
          success: true,
          transactionId: chargeResult.data.reference,
          status: 'pending',
          message: 'Mobile money payment initiated. Please check your phone for prompt.'
        };
      } else {
        return {
          success: false,
          status: 'failed',
          message: chargeResult.message || 'Mobile money payment failed'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        status: 'failed',
        message: error.message || 'Mobile money payment failed'
      };
    }
  }

  private async processPalmPayPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // PalmPay integration would go here
      // This is a placeholder implementation
      const response = await fetch('https://api.palmpay.com/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.palmPayApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: paymentData.amount,
          currency: paymentData.currency,
          reference: paymentData.referenceId,
          description: `Payment for ${paymentData.paymentFor}`,
          // Add other PalmPay specific fields
        }),
      });

      const result = await response.json();
      
      return {
        success: result.status === 'success',
        transactionId: result.transaction_id,
        status: result.status === 'success' ? 'completed' : 'failed',
        message: result.message
      };
    } catch (error: any) {
      return {
        success: false,
        status: 'failed',
        message: error.message || 'PalmPay payment failed'
      };
    }
  }

  private async processMobileMoneyPayment(paymentData: PaymentData): Promise<PaymentResult> {
    // For direct mobile money integration (if available)
    // This would integrate with MTN MoMo API, Vodafone Cash API, etc.
    return await this.processPaystackMobileMoney(
      { 
        email: 'user@example.com', 
        amount: paymentData.amount * 100, 
        reference: paymentData.referenceId 
      },
      paymentData.mobileMoneyData!
    );
  }

  async verifyPayment(transactionReference: string): Promise<PaymentResult> {
    try {
      // Verify with Paystack
      const response = await fetch(`https://api.paystack.co/transaction/verify/${transactionReference}`, {
        headers: {
          'Authorization': `Bearer ${this.paystackPublicKey}`,
        },
      });

      const result = await response.json();
      
      if (result.status && result.data.status === 'success') {
        return {
          success: true,
          transactionId: result.data.reference,
          status: 'completed',
          message: 'Payment verified successfully'
        };
      } else {
        return {
          success: false,
          status: 'failed',
          message: result.message || 'Payment verification failed'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        status: 'failed',
        message: error.message || 'Payment verification failed'
      };
    }
  }

  async getSavedPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await apiService.getPaymentMethods();
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  async savePaymentMethod(method: Omit<PaymentMethod, 'id'>): Promise<boolean> {
    try {
      const response = await apiService.savePaymentMethod(method);
      return response.success;
    } catch (error) {
      console.error('Error saving payment method:', error);
      return false;
    }
  }

  private validatePaymentData(paymentData: PaymentData): { isValid: boolean; error?: string } {
    if (!paymentData.amount || paymentData.amount <= 0) {
      return { isValid: false, error: 'Invalid payment amount' };
    }

    if (!paymentData.currency) {
      return { isValid: false, error: 'Currency is required' };
    }

    if (!paymentData.referenceId) {
      return { isValid: false, error: 'Reference ID is required' };
    }

    // Validate mobile money data if provided
    if (paymentData.mobileMoneyData) {
      const { phoneNumber, network } = paymentData.mobileMoneyData;
      
      if (!phoneNumber || !this.isValidGhanaianPhoneNumber(phoneNumber)) {
        return { isValid: false, error: 'Invalid phone number' };
      }

      if (!['MTN', 'Vodafone', 'AirtelTigo'].includes(network)) {
        return { isValid: false, error: 'Invalid mobile network' };
      }
    }

    // Validate card data if provided
    if (paymentData.cardData) {
      const { number, expiryMonth, expiryYear, cvv, holderName } = paymentData.cardData;
      
      if (!number || number.length < 13 || number.length > 19) {
        return { isValid: false, error: 'Invalid card number' };
      }

      if (!expiryMonth || !expiryYear) {
        return { isValid: false, error: 'Invalid expiry date' };
      }

      if (!cvv || cvv.length < 3 || cvv.length > 4) {
        return { isValid: false, error: 'Invalid CVV' };
      }

      if (!holderName || holderName.trim().length < 2) {
        return { isValid: false, error: 'Invalid cardholder name' };
      }
    }

    return { isValid: true };
  }

  private isValidGhanaianPhoneNumber(phoneNumber: string): boolean {
    // Ghana phone number validation
    const ghanaPhoneRegex = /^(\+233|0)(20|21|23|24|25|26|27|28|29|50|53|54|55|56|57|59)\d{7}$/;
    return ghanaPhoneRegex.test(phoneNumber.replace(/\s/g, ''));
  }

  // Helper method to format Ghana Cedis
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount);
  }

  // Helper method to get available payment networks
  static getAvailableNetworks(): Array<{ id: string; name: string; logo?: string }> {
    return [
      { id: 'MTN', name: 'MTN Mobile Money' },
      { id: 'Vodafone', name: 'Vodafone Cash' },
      { id: 'AirtelTigo', name: 'AirtelTigo Money' },
      { id: 'paystack_card', name: 'Credit/Debit Card' },
      { id: 'palmpay', name: 'PalmPay' },
    ];
  }
}

// Export singleton instance and types
export const paymentService = new PaymentService();