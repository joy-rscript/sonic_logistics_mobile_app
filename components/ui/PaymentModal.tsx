import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { ArrowLeft, CreditCard, Smartphone, Building, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react-native';
import LottieView from 'lottie-react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import { Card } from './Card';
import { Button } from './Button';
import { computeDeliveryCharges, makePayment, DeliveryCharges } from '@/utils/deliveryApi';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  deliveryData: any;
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentCancel: () => void;
  onPaymentFailure: (error: string) => void;
}

type PaymentMethod = 'card' | 'mobile_money' | 'bank_transfer';
type PaymentState = 'loading' | 'form' | 'processing' | 'success' | 'failed';

export function PaymentModal({
  visible,
  onClose,
  deliveryData,
  onPaymentSuccess,
  onPaymentCancel,
  onPaymentFailure,
}: PaymentModalProps) {
  const [charges, setCharges] = useState<DeliveryCharges | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile_money');
  const [paymentState, setPaymentState] = useState<PaymentState>('loading');
  const [selectedProvider, setSelectedProvider] = useState<'mpesa' | 'airtel' | 'tkash'>('mpesa');
  const [showUSSDModal, setShowUSSDModal] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const dropoffLocation = deliveryData?.dropoffLocation || 'Unknown Location';

  useEffect(() => {
    if (visible && deliveryData) {
      calculateCharges();
    }
  }, [visible, deliveryData]);

  const calculateCharges = async () => {
    setPaymentState('loading');
    try {
      const chargesInput = {
        packageWeight: deliveryData.PackageDetails.packageWeight,
        courierCapacity: deliveryData.PackageDetails.courierCapacity,
        insurance: deliveryData.PackageDetails.insurance,
        itemValue: deliveryData.PackageDetails.itemValue,
        valueRange: deliveryData.PackageDetails.valueRange,
        vehicleType: deliveryData.PackageDetails.vehicleType,
        pickupCord: deliveryData.pickupCord,
        dropoffCord: deliveryData.dropoffCord,
      };

      const computedCharges = await computeDeliveryCharges(chargesInput);
      setCharges(computedCharges);
      setPaymentState('form');
    } catch (error) {
      console.error('Error calculating charges:', error);
      setPaymentState('failed');
    }
  };

  const handleClose = () => {
    if (paymentState === 'processing') {
      Alert.alert(
        'Cancel Payment?',
        'Are you sure you want to cancel this payment? Your delivery request will be saved with pending payment status.',
        [
          { text: 'Continue Payment', style: 'cancel' },
          { 
            text: 'Cancel Payment', 
            style: 'destructive',
            onPress: () => {
              setPaymentState('form');
              onPaymentCancel();
              onClose();
            }
          },
        ]
      );
    } else {
      onClose();
    }
  };

  const handlePayNow = async () => {
    if (!charges || !deliveryData) return;

    setPaymentState('processing');

    try {
      if (paymentMethod === 'mobile_money') {
        setShowUSSDModal(true);
        return;
      }

      if (paymentMethod === 'card') {
        // Integrate Paystack here
        await handlePaystackPayment();
        return;
      }

      // Bank transfer or other methods
      await processPayment();
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentState('failed');
      onPaymentFailure('Payment processing failed. Please try again.');
    }
  };

  const handlePaystackPayment = async () => {
    try {
      // Simulate Paystack integration
      // In real implementation, you would use Paystack SDK here
      const paymentData = {
        deliveryRequestId: deliveryData.id,
        amount: charges!.charges,
        method: 'card' as 'card' | 'mobile_money' | 'bank_transfer',
        smeId: deliveryData.ClientDetails.smeId,
      };

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      const paymentResult = await makePayment(paymentData);
      
      if (paymentResult.success) {
        setTransactionId(paymentResult.transactionId);
        setPaymentState('success');
        setTimeout(() => {
          onPaymentSuccess(paymentResult.transactionId);
          onClose();
        }, 2000);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      setPaymentState('failed');
      onPaymentFailure('Card payment failed. Please try again.');
    }
  };

  const handleUSSDConfirmation = async () => {
    setShowUSSDModal(false);

    try {
      const paymentData = {
        deliveryRequestId: deliveryData.id,
        amount: charges!.charges,
        method: 'mobile_money' as 'card' | 'mobile_money' | 'bank_transfer',
        smeId: deliveryData.ClientDetails.smeId,
        provider: selectedProvider,
      };

      // Simulate USSD payment processing
      await new Promise(resolve => setTimeout(resolve, 4000));

      const paymentResult = await makePayment(paymentData);
      
      if (paymentResult.success) {
        setTransactionId(paymentResult.transactionId);
        setPaymentState('success');
        setTimeout(() => {
          onPaymentSuccess(paymentResult.transactionId);
          onClose();
        }, 2000);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      setPaymentState('failed');
      onPaymentFailure('Mobile money payment failed. Please try again.');
    }
  };

  const processPayment = async () => {
    const paymentData = {
      deliveryRequestId: deliveryData.id,
      amount: charges!.charges,
      method: paymentMethod,
      smeId: deliveryData.ClientDetails.smeId,
    };

    const paymentResult = await makePayment(paymentData);
    
    if (paymentResult.success) {
      setTransactionId(paymentResult.transactionId);
      setPaymentState('success');
      setTimeout(() => {
        onPaymentSuccess(paymentResult.transactionId);
        onClose();
      }, 2000);
    } else {
      throw new Error('Payment failed');
    }
  };

  const handlePayLater = () => {
    onPaymentCancel(); // This will set payment status to pending
    onClose();
  };

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <LottieView
        source={{ uri: 'https://lottie.host/66ff6de2-394e-4010-8064-1d884167dbf6/do1Etdp721.json' }}
        autoPlay
        loop
        style={styles.loadingAnimation}
      />
      <Text style={styles.loadingText}>Calculating the best delivery price for you...</Text>
    </View>
  );

  const renderSuccessState = () => (
    <View style={styles.successContainer}>
      <CheckCircle size={80} color={Colors.light.success} />
      <Text style={styles.successTitle}>Payment Successful!</Text>
      <Text style={styles.successMessage}>
        Your delivery request has been submitted and is now available for couriers.
      </Text>
      {transactionId && (
        <Text style={styles.transactionId}>Transaction ID: {transactionId}</Text>
      )}
    </View>
  );

  const renderFailedState = () => (
    <View style={styles.failedContainer}>
      <XCircle size={80} color={Colors.light.error} />
      <Text style={styles.failedTitle}>Payment Failed</Text>
      <Text style={styles.failedMessage}>
        Something went wrong with your payment. Please try again.
      </Text>
      <Button
        title="Try Again"
        onPress={() => setPaymentState('form')}
        style={styles.retryButton}
      />
    </View>
  );

  const renderPaymentForm = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Charges Breakdown */}
      {charges && (
        <Card style={styles.chargesCard}>
          <Text style={styles.cardTitle}>Delivery Charges</Text>
          
          <View style={styles.chargesBreakdown}>
            <View style={styles.chargeRow}>
              <Text style={styles.chargeLabel}>Base Price</Text>
              <Text style={styles.chargeValue}>KSh {charges.breakdown.basePrice}</Text>
            </View>
            <View style={styles.chargeRow}>
              <Text style={styles.chargeLabel}>Distance Charge</Text>
              <Text style={styles.chargeValue}>KSh {charges.breakdown.distanceCharge}</Text>
            </View>
            <View style={styles.chargeRow}>
              <Text style={styles.chargeLabel}>Weight Charge</Text>
              <Text style={styles.chargeValue}>KSh {charges.breakdown.weightCharge}</Text>
            </View>
            {charges.breakdown.insuranceCharge > 0 && (
              <View style={styles.chargeRow}>
                <Text style={styles.chargeLabel}>Insurance</Text>
                <Text style={styles.chargeValue}>KSh {charges.breakdown.insuranceCharge}</Text>
              </View>
            )}
            <View style={styles.chargeRow}>
              <Text style={styles.chargeLabel}>Vehicle Premium</Text>
              <Text style={styles.chargeValue}>KSh {charges.breakdown.premiumCharge}</Text>
            </View>
            
            <View style={[styles.chargeRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>KSh {charges.charges}</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Payment Methods */}
      <Card style={styles.paymentMethodsCard}>
        <Text style={styles.cardTitle}>Payment Method</Text>
        
        <View style={styles.paymentMethods}>
          <TouchableOpacity
            style={[styles.paymentMethod, paymentMethod === 'mobile_money' && styles.paymentMethodActive]}
            onPress={() => setPaymentMethod('mobile_money')}
          >
            <Smartphone size={24} color={paymentMethod === 'mobile_money' ? Colors.light.primary : Colors.light.placeholder} />
            <Text style={[styles.paymentMethodText, paymentMethod === 'mobile_money' && styles.paymentMethodTextActive]}>
              Mobile Money
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentMethod, paymentMethod === 'card' && styles.paymentMethodActive]}
            onPress={() => setPaymentMethod('card')}
          >
            <CreditCard size={24} color={paymentMethod === 'card' ? Colors.light.primary : Colors.light.placeholder} />
            <Text style={[styles.paymentMethodText, paymentMethod === 'card' && styles.paymentMethodTextActive]}>
              Credit/Debit Card
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentMethod, paymentMethod === 'bank_transfer' && styles.paymentMethodActive]}
            onPress={() => setPaymentMethod('bank_transfer')}
          >
            <Building size={24} color={paymentMethod === 'bank_transfer' ? Colors.light.primary : Colors.light.placeholder} />
            <Text style={[styles.paymentMethodText, paymentMethod === 'bank_transfer' && styles.paymentMethodTextActive]}>
              Bank Transfer
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Payment</Text>
            <Text style={styles.headerSubtitle}>Delivery to {dropoffLocation}</Text>
          </View>
        </View>

        {/* Content based on state */}
        {paymentState === 'loading' && renderLoadingState()}
        {paymentState === 'form' && renderPaymentForm()}
        {paymentState === 'processing' && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.processingText}>Processing your payment...</Text>
          </View>
        )}
        {paymentState === 'success' && renderSuccessState()}
        {paymentState === 'failed' && renderFailedState()}

        {/* Payment Buttons */}
        {paymentState === 'form' && charges && (
          <View style={styles.buttonContainer}>
            <Button
              title="Pay Now"
              onPress={handlePayNow}
              style={styles.payButton}
            />
            
            {charges.delayPayment && (
              <Button
                title="Pay Later"
                onPress={handlePayLater}
                variant="outline"
                style={styles.payLaterButton}
              />
            )}
          </View>
        )}

        {/* USSD Modal */}
        <Modal
          visible={showUSSDModal}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.ussdModal}>
              <Text style={styles.modalTitle}>Select Mobile Money Provider</Text>
              
              <View style={styles.providerOptions}>
                {[
                  { id: 'mpesa', label: 'M-Pesa', color: '#00A651' },
                  { id: 'airtel', label: 'Airtel Money', color: '#FF0000' },
                  { id: 'tkash', label: 'T-Kash', color: '#E4002B' }
                ].map(provider => (
                  <TouchableOpacity
                    key={provider.id}
                    style={[
                      styles.providerOption,
                      selectedProvider === provider.id && styles.providerOptionActive,
                      { borderColor: provider.color }
                    ]}
                    onPress={() => setSelectedProvider(provider.id as any)}
                  >
                    <Text style={[styles.providerText, { color: provider.color }]}>
                      {provider.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.ussdInstructions}>
                You will receive a USSD prompt to complete the payment of KSh {charges?.charges}
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowUSSDModal(false);
                    setPaymentState('form');
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={handleUSSDConfirmation}
                >
                  <Text style={styles.modalConfirmText}>Confirm Payment</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: Colors.light.background,
    ...SHADOWS.light,
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.xl,
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingAnimation: {
    width: 120,
    height: 120,
  },
  loadingText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    marginTop: SPACING.md,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  successTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.xl,
    color: Colors.light.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  successMessage: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: Colors.light.placeholder,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  transactionId: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.primary,
    textAlign: 'center',
  },
  failedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  failedTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.xl,
    color: Colors.light.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  failedMessage: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: Colors.light.placeholder,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  retryButton: {
    width: '100%',
  },
  chargesCard: {
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.lg,
    color: Colors.light.text,
    marginBottom: SPACING.md,
  },
  chargesBreakdown: {
    gap: SPACING.sm,
  },
  chargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  chargeLabel: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
  },
  chargeValue: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  totalLabel: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.lg,
    color: Colors.light.text,
  },
  totalValue: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.lg,
    color: Colors.light.primary,
  },
  paymentMethodsCard: {
    marginBottom: SPACING.lg,
  },
  paymentMethods: {
    gap: SPACING.sm,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  paymentMethodActive: {
    borderColor: Colors.light.primary,
    backgroundColor: `${Colors.light.primary}10`,
  },
  paymentMethodText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
    marginLeft: SPACING.md,
  },
  paymentMethodTextActive: {
    color: Colors.light.primary,
  },
  buttonContainer: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  payButton: {
    marginBottom: 0,
  },
  payLaterButton: {
    marginBottom: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ussdModal: {
    backgroundColor: Colors.light.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    margin: SPACING.lg,
    maxWidth: '90%',
  },
  modalTitle: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.lg,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  providerOptions: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  providerOption: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  providerOptionActive: {
    backgroundColor: `rgba(0, 0, 0, 0.05)`,
  },
  providerText: {
    fontFamily: FONT.poppinsBold,
    fontSize: FONT_SIZE.md,
  },
  ussdInstructions: {
    fontFamily: FONT.regular,
    fontSize: FONT_SIZE.sm,
    color: Colors.light.placeholder,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SPACING.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalCancelButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  modalCancelText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.text,
  },
  modalConfirmButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontFamily: FONT.medium,
    fontSize: FONT_SIZE.md,
    color: Colors.light.background,
  },
});