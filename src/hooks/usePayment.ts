import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { paymentService, PaymentData } from '../services/paymentService';
import ghanaPromotionService, { GhanaPromotion } from '../services/ghanaPromotionService';

interface UsePaymentParams {
  amount: number;
  currency: string;
  paymentFor: 'booking' | 'order';
  referenceId: string;
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: string) => void;
}

export function usePayment({ amount, currency, paymentFor, referenceId, onPaymentSuccess, onPaymentError }: UsePaymentParams) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<GhanaPromotion | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoCode, setPromoCode] = useState('');

  const finalAmount = amount - discountAmount;

  const validatePromoCode = useCallback(async (
    promoCode: string,
    validationData: {
      userId: string;
      orderAmount: number;
      paymentMethod: string;
      city: string;
      region: string;
      userOrderCount: number;
    }
  ) => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return false;
    }

    try {
      const validation = await ghanaPromotionService.validatePromoCode(promoCode, validationData);

      if (validation.valid && validation.promotion) {
        setAppliedPromo(validation.promotion);
        
        // Calculate discount
        let discount = 0;
        if (validation.promotion.type === 'percentage') {
          discount = (validationData.orderAmount * validation.promotion.discountValue) / 100;
          if (validation.promotion.maximumDiscountAmount) {
            discount = Math.min(discount, validation.promotion.maximumDiscountAmount);
          }
        } else if (validation.promotion.type === 'fixed_amount') {
          discount = validation.promotion.discountValue;
        }
        
        setDiscountAmount(discount);
        Alert.alert('Success', `Promo code applied! You save ₵${discount.toFixed(2)}`);
        return true;
      } else {
        Alert.alert('Error', validation.error || 'Invalid promo code');
        return false;
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to apply promo code. Please try again.');
      return false;
    }
  }, []);

  const processPayment = useCallback(async (paymentData: PaymentData, paymentType: 'mobile_money' | 'card') => {
    if (isProcessing) return null;

    setIsProcessing(true);

    try {
      // Both mobile money and card payments go through the same processPayment method
      const result = await paymentService.processPayment({
        ...paymentData,
        amount: paymentData.amount - discountAmount,
      });

      if (result.success) {
        onPaymentSuccess?.(result);
        return result;
      } else {
        const errorMessage = result.error || 'Payment failed. Please try again.';
        Alert.alert('Payment Failed', errorMessage);
        onPaymentError?.(errorMessage);
        return null;
      }
    } catch (error) {
      const errorMessage = 'Payment processing failed. Please check your connection and try again.';
      Alert.alert('Error', errorMessage);
      onPaymentError?.(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, discountAmount, onPaymentSuccess, onPaymentError]);

  const handleApplyPromo = useCallback(async (
    validationData: {
      userId: string;
      paymentMethod: string;
      city: string;
      region: string;
      userOrderCount: number;
    }
  ) => {
    return await validatePromoCode(promoCode, {
      ...validationData,
      orderAmount: amount,
    });
  }, [promoCode, amount, validatePromoCode]);

  const removePromo = useCallback(() => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoCode('');
  }, []);

  const handlePayment = useCallback(async (paymentType: 'mobile_money' | 'card', additionalData?: any) => {
    const paymentData: PaymentData = {
      amount: finalAmount,
      currency,
      paymentFor,
      referenceId,
      promoCode: appliedPromo?.promoCode,
      originalAmount: amount,
      discountAmount,
      ...additionalData,
    };

    return await processPayment(paymentData, paymentType);
  }, [finalAmount, currency, paymentFor, referenceId, appliedPromo, amount, discountAmount, processPayment]);

  const resetPayment = useCallback(() => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setIsProcessing(false);
    setPromoCode('');
  }, []);
  return {
    isProcessing,
    appliedPromo,
    discountAmount,
    promoCode,
    setPromoCode,
    finalAmount,
    validatePromoCode,
    handleApplyPromo,
    removePromo,
    handlePayment,
    processPayment,
    resetPayment,
    setAppliedPromo,
    setDiscountAmount,
  };
}