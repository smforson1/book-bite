// Ghana-specific SMS service for BookBite
// Supports major Ghana telecom providers: MTN, Vodafone, AirtelTigo
// Integrates with popular SMS gateways like Arkesel and Hubtel

// Interfaces
export interface SMSMessage {
  to: string;
  message: string;
  type: 'order' | 'booking' | 'payment' | 'otp' | 'promo';
  priority: 'low' | 'normal' | 'high';
}

export interface SMSResult {
  success: boolean;
  messageId?: string;
  cost?: number;
  deliveryStatus?: 'sent' | 'delivered' | 'failed';
  error?: string;
}

export interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  type: SMSMessage['type'];
}

export interface GhanaPhoneValidation {
  isValid: boolean;
  network: 'MTN' | 'Vodafone' | 'AirtelTigo' | 'Unknown';
  formattedNumber: string;
  region: string;
}

class GhanaSMSService {
  private apiEndpoints = {
    arkesel: 'https://sms.arkesel.com/api/v2/sms/send',
    hubtel: 'https://smsc.hubtel.com/v1/messages/send'
  };

  private selectedProvider = 'arkesel'; // Default to Arkesel (popular in Ghana)
  private apiKey: string;
  private senderId: string = 'BookBite'; // 8 characters max for Ghana

  // Ghana network prefixes
  private networkPrefixes = {
    MTN: ['024', '025', '053', '054', '055', '059'],
    Vodafone: ['020', '050', '051'],
    AirtelTigo: ['027', '028', '057', '026', '056']
  };

  // SMS templates for different scenarios
  private templates: SMSTemplate[] = [
    {
      id: 'order_confirmation',
      name: 'Order Confirmation',
      content: 'Hello {name}! Your order #{orderId} from {restaurant} has been confirmed. Total: GHS {amount}. Estimated delivery: {time}. Track: {trackingUrl}',
      variables: ['name', 'orderId', 'restaurant', 'amount', 'time', 'trackingUrl'],
      type: 'order'
    },
    {
      id: 'order_status',
      name: 'Order Status Update',
      content: 'Order #{orderId} update: {status}. {message} - BookBite',
      variables: ['orderId', 'status', 'message'],
      type: 'order'
    },
    {
      id: 'booking_confirmation',
      name: 'Hotel Booking Confirmation',
      content: 'Booking confirmed! {hotel}, Room: {room}, Check-in: {checkin}, Total: GHS {amount}. Ref: {bookingId} - BookBite',
      variables: ['hotel', 'room', 'checkin', 'amount', 'bookingId'],
      type: 'booking'
    },
    {
      id: 'payment_success',
      name: 'Payment Confirmation',
      content: 'Payment successful! GHS {amount} paid via {method}. Ref: {reference}. Thank you for using BookBite!',
      variables: ['amount', 'method', 'reference'],
      type: 'payment'
    },
    {
      id: 'otp_verification',
      name: 'OTP Verification',
      content: 'Your BookBite verification code is: {otp}. Valid for 5 minutes. Do not share this code.',
      variables: ['otp'],
      type: 'otp'
    },
    {
      id: 'promo_offer',
      name: 'Promotional Offer',
      content: 'Special offer! {discount}% off your next order. Use code: {promoCode}. Valid until {expiry}. Order now! - BookBite',
      variables: ['discount', 'promoCode', 'expiry'],
      type: 'promo'
    }
  ];

  constructor() {
    // In production, these would be stored securely
    this.apiKey = process.env.GHANA_SMS_API_KEY || 'your-sms-api-key';
  }

  // Validate and format Ghana phone number
  validateGhanaPhone(phoneNumber: string): GhanaPhoneValidation {
    // Remove all non-digits
    let cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Handle different formats
    if (cleanNumber.startsWith('233')) {
      cleanNumber = cleanNumber.substring(3); // Remove country code
    } else if (cleanNumber.startsWith('+233')) {
      cleanNumber = cleanNumber.substring(4);
    } else if (cleanNumber.startsWith('0')) {
      cleanNumber = cleanNumber.substring(1); // Remove leading 0
    }

    // Check if it's a valid Ghana mobile number (9 digits)
    if (cleanNumber.length !== 9) {
      return {
        isValid: false,
        network: 'Unknown',
        formattedNumber: phoneNumber,
        region: 'Ghana'
      };
    }

    // Identify network
    const prefix = cleanNumber.substring(0, 3);
    let network: 'MTN' | 'Vodafone' | 'AirtelTigo' | 'Unknown' = 'Unknown';
    
    for (const [networkName, prefixes] of Object.entries(this.networkPrefixes)) {
      if (prefixes.includes(prefix)) {
        network = networkName as any;
        break;
      }
    }

    return {
      isValid: network !== 'Unknown',
      network,
      formattedNumber: `+233${cleanNumber}`,
      region: 'Ghana'
    };
  }

  // Send SMS using Ghana provider
  async sendSMS(smsData: SMSMessage): Promise<SMSResult> {
    try {
      // Validate phone number
      const phoneValidation = this.validateGhanaPhone(smsData.to);
      if (!phoneValidation.isValid) {
        return {
          success: false,
          error: 'Invalid Ghana phone number format'
        };
      }

      // Check message length (160 chars for single SMS)
      if (smsData.message.length > 160) {
        console.warn('Message exceeds 160 characters, will be sent as multiple SMS');
      }

      // Send via selected provider
      let result: SMSResult;
      
      switch (this.selectedProvider) {
        case 'arkesel':
          result = await this.sendViaArkesel(phoneValidation.formattedNumber, smsData.message);
          break;
        case 'hubtel':
          result = await this.sendViaHubtel(phoneValidation.formattedNumber, smsData.message);
          break;
        default:
          result = await this.sendViaArkesel(phoneValidation.formattedNumber, smsData.message);
      }

      // Log SMS for analytics
      await this.logSMS({
        ...smsData,
        to: phoneValidation.formattedNumber,
        network: phoneValidation.network,
        result
      });

      return result;
    } catch (error) {
      console.error('SMS sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send SMS'
      };
    }
  }

  // Send SMS via Arkesel (popular Ghana SMS provider)
  private async sendViaArkesel(phoneNumber: string, message: string): Promise<SMSResult> {
    try {
      const response = await fetch(this.apiEndpoints.arkesel, {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: this.senderId,
          message: message,
          recipients: [phoneNumber],
        }),
      });

      const data = await response.json();

      if (response.ok && data.code === 'ok') {
        return {
          success: true,
          messageId: data.data?.id || 'unknown',
          cost: this.calculateSMSCost(message),
          deliveryStatus: 'sent'
        };
      } else {
        return {
          success: false,
          error: data.message || 'SMS sending failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error: Could not connect to SMS provider'
      };
    }
  }

  // Send SMS via Hubtel (alternative Ghana provider)
  private async sendViaHubtel(phoneNumber: string, message: string): Promise<SMSResult> {
    try {
      const response = await fetch(this.apiEndpoints.hubtel, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.apiKey).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          From: this.senderId,
          To: phoneNumber,
          Content: message,
        }),
      });

      const data = await response.json();

      if (response.ok && data.Status === 0) {
        return {
          success: true,
          messageId: data.MessageId,
          cost: this.calculateSMSCost(message),
          deliveryStatus: 'sent'
        };
      } else {
        return {
          success: false,
          error: data.Message || 'SMS sending failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error: Could not connect to SMS provider'
      };
    }
  }

  // Send templated SMS
  async sendTemplatedSMS(
    templateId: string, 
    phoneNumber: string, 
    variables: { [key: string]: string },
    priority: SMSMessage['priority'] = 'normal'
  ): Promise<SMSResult> {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      return {
        success: false,
        error: 'Template not found'
      };
    }

    // Replace variables in template
    let message = template.content;
    for (const [key, value] of Object.entries(variables)) {
      message = message.replace(new RegExp(`{${key}}`, 'g'), value);
    }

    // Check for unreplaced variables
    const unreplacedVars = message.match(/{\\w+}/g);
    if (unreplacedVars) {
      console.warn('Unreplaced variables in SMS template:', unreplacedVars);
    }

    return this.sendSMS({
      to: phoneNumber,
      message,
      type: template.type,
      priority
    });
  }

  // Calculate SMS cost based on message length and network
  private calculateSMSCost(message: string): number {
    const messageCount = Math.ceil(message.length / 160);
    const costPerSMS = 0.05; // GHS 0.05 per SMS in Ghana
    return messageCount * costPerSMS;
  }

  // Log SMS for analytics
  private async logSMS(data: any): Promise<void> {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const logs = await AsyncStorage.default.getItem('sms_logs') || '[]';
      const parsedLogs = JSON.parse(logs);
      
      parsedLogs.push({
        ...data,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 100 logs
      if (parsedLogs.length > 100) {
        parsedLogs.splice(0, parsedLogs.length - 100);
      }
      
      await AsyncStorage.default.setItem('sms_logs', JSON.stringify(parsedLogs));
    } catch (error) {
      console.error('SMS logging error:', error);
    }
  }

  // Get SMS analytics
  async getSMSAnalytics(): Promise<{
    totalSent: number;
    successRate: number;
    networkBreakdown: { [network: string]: number };
    costTotal: number;
    recentLogs: any[];
  }> {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const logs = await AsyncStorage.default.getItem('sms_logs') || '[]';
      const parsedLogs = JSON.parse(logs);
      
      const totalSent = parsedLogs.length;
      const successful = parsedLogs.filter((log: any) => log.result?.success).length;
      const successRate = totalSent > 0 ? (successful / totalSent) * 100 : 0;
      
      const networkBreakdown: { [network: string]: number } = {};
      let costTotal = 0;
      
      parsedLogs.forEach((log: any) => {
        if (log.network) {
          networkBreakdown[log.network] = (networkBreakdown[log.network] || 0) + 1;
        }
        if (log.result?.cost) {
          costTotal += log.result.cost;
        }
      });
      
      return {
        totalSent,
        successRate,
        networkBreakdown,
        costTotal,
        recentLogs: parsedLogs.slice(-10) // Last 10 logs
      };
    } catch (error) {
      return {
        totalSent: 0,
        successRate: 0,
        networkBreakdown: {},
        costTotal: 0,
        recentLogs: []
      };
    }
  }

  // Get available templates
  getAvailableTemplates(): SMSTemplate[] {
    return this.templates;
  }

  // Add custom template
  addCustomTemplate(template: Omit<SMSTemplate, 'id'>): string {
    const id = `custom_${Date.now()}`;
    this.templates.push({ ...template, id });
    return id;
  }
}

// Export singleton instance
export const ghanaSMSService = new GhanaSMSService();
export default ghanaSMSService;