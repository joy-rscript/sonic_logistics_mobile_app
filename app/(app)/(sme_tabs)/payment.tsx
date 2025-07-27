import { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, 
  ActivityIndicator, Modal, Alert 
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CreditCard, Smartphone, Building, CheckCircle } from 'lucide-react-native';
import LottieView from 'lottie-react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useDelivery } from '@/contexts/DeliveryContext';
import { computeDeliveryCharges, makePayment, DeliveryCharges } from '@/utils/deliveryApi';

export default function PaymentScreen() {
  const { deliveryId, deliveryData } = useLocalSearchParams();
  const [charges, setCharges] = useState<DeliveryCharges | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_money' | 'bank_transfer'>('mobile_money');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showUSSDModal, setShowUSSDModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'mpesa' | 'airtel' | 'tkash'>('mpesa');

  const parsedDeliveryData = deliveryData ? JSON.parse(deliveryData as string) : null;
  const dropoffLocation = parsedDeliveryData?.dropoffLocation || 'Unknown Location';

  useEffect(() => {
    calculateCharges();
  }, []);

  const calculateCharges = async () => {
    if (!parsedDeliveryData) return;

    setIsLoading(true);
    try {
      const chargesInput = {
        packageWeight: parsedDeliveryData.PackageDetails.packageWeight,
        courierCapacity: parsedDeliveryData.PackageDetails.courierCapacity,
        insurance: parsedDeliveryData.PackageDetails.insurance,
        itemValue: parsedDeliveryData.PackageDetails.itemValue,
        valueRange: parsedDeliveryData.PackageDetails.valueRange,
        vehicleType: parsedDeliveryData.PackageDetails.vehicleType,
        pickupCord: parsedDeliveryData.pickupCord,
        dropoffCord: parsedDeliveryData.dropoffCord,
      };

      const computedCharges = await computeDeliveryCharges(chargesInput);
      setCharges(computedCharges);
    } catch (error) {
      console.error('Error calculating charges:', error);
      Alert.alert('Error', 'Failed to calculate delivery charges. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (payLater = false) => {
    if (!charges || !deliveryId) return;

    setIsProcessingPayment(true);

    try {
      if (!payLater) {
        if (paymentMethod === 'mobile_money') {
          setShowUSSDModal(true);
          setIsProcessingPayment(false);
          return;
        }

        if (paymentMethod === 'card') {
          // Simulate card payment processing
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      const paymentData = {
        deliveryRequestId: deliveryId as string,
        amount: charges.charges,
        method: payLater ? 'pay_later' : paymentMethod,
        smeId: 'sme_003', // This should come from user context
      };

      const paymentResult = await makePayment(paymentData);

      if (paymentResult.success) {
        setShowSuccessModal(true);
      } else {
        Alert.alert('Payment Failed', 'Please try again or contact support.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Payment Error', 'An error occurred while processing your payment.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleUSSDConfirmation = async () => {
    setShowUSSDModal(false);
    setIsProcessingPayment(true);

    // Simulate USSD payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    const paymentData = {
      deliveryRequestId: deliveryId as string,
      amount: charges!.charges,
      method: 'mobile_money',
      smeId: 'sme_003',
      provider: selectedProvider,
    };

    try {
      const paymentResult = await makePayment(paymentData);
      if (paymentResult.success) {
        setShowSuccessModal(true);
      }
    } catch (error) {
      Alert.alert('Payment Failed', 'Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.replace('/(app)/(sme_tabs)/deliveries');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LottieView
            source={{ uri: 'https://lottie.host/66ff6de2-394e-4010-8064-1d884167dbf6/do1Etdp721.json' }}
            autoPlay
            loop
            style={styles.loadingAnimation}
          />
          <Text style={styles.loadingText}>Calculating delivery charges...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Payment</Text>
          <Text style={styles.headerSubtitle}>Delivery to {dropoffLocation}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
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

      {/* Payment Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title={isProcessingPayment ? 'Processing...' : 'Pay Now'}
          onPress={() => handlePayment(false)}
          disabled={isProcessingPayment || !charges}
          loading={isProcessingPayment}
          style={styles.payButton}
        />
        
        {charges?.delayPayment && (
          <Button
            title="Pay Later"
            onPress={() => handlePayment(true)}
            disabled={isProcessingPayment}
            variant="outline"
            style={styles.payLaterButton}
          />
        )}
      </View>

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
                onPress={() => setShowUSSDModal(false)}
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

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <CheckCircle size={64} color={Colors.light.success} />
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successMessage}>
              Your delivery request has been submitted and will be available for couriers to accept.
            </Text>
            <Button
              title="View My Deliveries"
              onPress={handleSuccessClose}
              style={styles.successButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  successModal: {
    backgroundColor: Colors.light.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    margin: SPACING.lg,
    alignItems: 'center',
    maxWidth: '90%',
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
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  successButton: {
    width: '100%',
  },
});