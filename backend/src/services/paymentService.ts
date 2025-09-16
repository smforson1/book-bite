import axios from 'axios';
import { logger } from '@/utils/logger';
import { Payment } from '@/models/Payment';
import { IPayment } from '@/types';

export interface PaymentRequest {
  amount: number;
  currency: string;
  email: string;
  phone?: string;
  reference: string;
  callback_url?: string;
}

export interface PaymentResponse {
  success: boolean;
  data?: any;
  message: string;
  authorization_url?: string;
  access_code?: string;
  reference?: string;
}

export class PaymentService {
  // Paystack integration
  static async initiatePaystackPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: paymentData.email,
          amount: paymentData.amount * 100, // Paystack expects amount in kobo
          currency: paymentData.currency,
          reference: paymentData.reference,
          callback_url: paymentData.callback_url,
          channels: ['card', 'mobile_money', 'ussd', 'bank_transfer']
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: 'Payment initialized successfully',
          authorization_url: response.data.data.authorization_url,
          access_code: response.data.data.access_code,
          reference: response.data.data.reference
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Payment initialization failed'
        };
      }
    } catch (error: any) {
      logger.error('Paystack payment error:', error.response?.data || error.message);
      return {
        success: false,
        message: 'Payment service unavailable'
      };
    }
  }

  // Verify Paystack payment
  static async verifyPaystackPayment(reference: string): Promise<PaymentResponse> {
    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
          }
        }
      );

      if (response.data.status) {
        return {
          success: true,
          data: response.data.data,
          message: 'Payment verified successfully'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Payment verification failed'
        };
      }
    } catch (error: any) {
      logger.error('Paystack verification error:', error.response?.data || error.message);
      return {
        success: false,
        message: 'Payment verification failed'
      };
    }
  }

  // MTN Mobile Money integration (simplified - would need actual MTN MoMo API)
  static async initiateMTNMoMoPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      // This is a simplified implementation
      // In production, you would integrate with MTN MoMo API
      
      const response = await axios.post(
        `${process.env.MTN_MOMO_BASE_URL}/collection/v1_0/requesttopay`,
        {
          amount: paymentData.amount.toString(),
          currency: paymentData.currency,
          externalId: paymentData.reference,
          payer: {
            partyIdType: 'MSISDN',
            partyId: paymentData.phone
          },
          payerMessage: 'Payment for Book Bite order',
          payeeNote: 'Book Bite payment'
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.MTN_MOMO_API_KEY}`,
            'X-Reference-Id': paymentData.reference,
            'X-Target-Environment': process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_SUBSCRIPTION_KEY
          }
        }
      );

      return {
        success: true,
        data: response.data,
        message: 'MTN MoMo payment initiated successfully',
        reference: paymentData.reference
      };
    } catch (error: any) {
      logger.error('MTN MoMo payment error:', error.response?.data || error.message);
      return {
        success: false,
        message: 'MTN MoMo payment failed'
      };
    }
  }

  // PalmPay integration (simplified)
  static async initiatePalmPayPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      // This is a simplified implementation
      // In production, you would integrate with PalmPay API
      
      const response = await axios.post(
        `${process.env.PALMPAY_BASE_URL}/api/v1/payments/initialize`,
        {
          amount: paymentData.amount,
          currency: paymentData.currency,
          reference: paymentData.reference,
          customer_email: paymentData.email,
          customer_phone: paymentData.phone,
          callback_url: paymentData.callback_url
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.PALMPAY_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        message: 'PalmPay payment initiated successfully',
        authorization_url: response.data.payment_url,
        reference: paymentData.reference
      };
    } catch (error: any) {
      logger.error('PalmPay payment error:', error.response?.data || error.message);
      return {
        success: false,
        message: 'PalmPay payment failed'
      };
    }
  }

  // Generic payment processor
  static async processPayment(
    paymentMethod: string,
    paymentData: PaymentRequest
  ): Promise<PaymentResponse> {
    switch (paymentMethod) {
      case 'paystack':
        return this.initiatePaystackPayment(paymentData);
      case 'mtn_momo':
        return this.initiateMTNMoMoPayment(paymentData);
      case 'palmpay':
        return this.initiatePalmPayPayment(paymentData);
      case 'vodafone_cash':
        // Implement Vodafone Cash integration
        return {
          success: false,
          message: 'Vodafone Cash integration coming soon'
        };
      case 'airteltigo_money':
        // Implement AirtelTigo Money integration
        return {
          success: false,
          message: 'AirtelTigo Money integration coming soon'
        };
      default:
        return {
          success: false,
          message: 'Unsupported payment method'
        };
    }
  }

  // Verify payment based on method
  static async verifyPayment(
    paymentMethod: string,
    reference: string
  ): Promise<PaymentResponse> {
    switch (paymentMethod) {
      case 'paystack':
        return this.verifyPaystackPayment(reference);
      case 'mtn_momo':
        // Implement MTN MoMo verification
        return {
          success: true,
          message: 'MTN MoMo payment verified (mock)'
        };
      case 'palmpay':
        // Implement PalmPay verification
        return {
          success: true,
          message: 'PalmPay payment verified (mock)'
        };
      default:
        return {
          success: false,
          message: 'Unsupported payment method for verification'
        };
    }
  }

  // Create payment record
  static async createPaymentRecord(paymentData: Partial<IPayment>): Promise<IPayment> {
    const payment = new Payment(paymentData);
    return await payment.save();
  }

  // Update payment status
  static async updatePaymentStatus(
    transactionId: string,
    status: 'success' | 'failed' | 'cancelled',
    gatewayResponse?: any
  ): Promise<IPayment | null> {
    return await Payment.findOneAndUpdate(
      { transactionId },
      { 
        status,
        gatewayResponse,
        ...(status === 'success' && { paymentDate: new Date() })
      },
      { new: true }
    );
  }

  // Generate unique reference
  static generateReference(prefix: string = 'BB'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
  }
}