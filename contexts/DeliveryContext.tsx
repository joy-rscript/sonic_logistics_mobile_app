import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  fetchAvailableDeliveries,
  fetchCourierDeliveries,
  fetchSMEDeliveries,
  acceptDeliveryRequest,
  updateDeliveryStatus,
  uploadDeliveryImage,
  verifyDeliveryCode,
  createDeliveryRequest,
  computeDeliveryCharges,
  makePayment,
  deleteDeliveryRequest,
  DeliveryRequest,
  DeliveryCharges,
  PaymentRequest
} from '@/utils/deliveryApi';

export interface DeliveryTracker {
  pickup: 'pending' | 'in_progress' | 'completed';
  pickupCode: string | null;
  pickupImage: string | null;
  dropoff: 'pending' | 'in_progress' | 'completed';
  dropoffCode: string | null;
  dropoffImage: string | null;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface DeliveryContextType {
  allDeliveries: DeliveryRequest[];
  pendingOngoingDeliveries: DeliveryRequest[];
  currentDelivery: DeliveryRequest | null;
  smeDeliveries: DeliveryRequest[];
  loading: boolean;
  error: string | null;
  acceptDelivery: (deliveryId: string) => void;
  setCurrentDelivery: (delivery: DeliveryRequest | null) => void;
  updateDeliveryTracker: (deliveryId: string, tracker: Partial<DeliveryTracker>) => void;
  completeDelivery: (deliveryId: string) => void;
  createNewDelivery: (deliveryData: any) => Promise<DeliveryRequest>;
  computeCharges: (input: any) => Promise<DeliveryCharges>;
  processPayment: (paymentData: PaymentRequest) => Promise<{ success: boolean; transactionId: string }>;
  deleteDelivery: (smeId: string, deliveryId: string) => Promise<{ success: boolean }>;
  updateDriverLocation: (deliveryId: string, location: Coordinates) => void;
  getDeliveryById: (id: string) => DeliveryRequest | null;
  refreshDeliveries: () => Promise<void>;
  uploadImage: (deliveryId: string, imageUri: string, type: 'pickup' | 'dropoff') => Promise<void>;
  verifyCode: (deliveryId: string, code: string, type: 'pickup' | 'dropoff') => Promise<boolean>;
  updatePaymentStatus: (deliveryId: string, status: 'pending' | 'completed' | 'failed') => void;
  sendSMSCode: (deliveryId: string, type: 'pickup' | 'dropoff') => Promise<void>;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

// Mock driver data
const mockDrivers = [
  { id: 'driver1', name: 'Martin Lawrence', rating: 4.8 },
  { id: 'driver2', name: 'John Kamau', rating: 4.6 },
  { id: 'driver3', name: 'Sarah Wanjiku', rating: 4.9 },
];

// All available delivery requests (open requests from SMEs)
const allAvailableDeliveries: DeliveryRequest[] = [
  {
    id: 'd1',
    ClientDetails: {
      smeName: 'Ben Njoki',
      businessIndustry: 'Cement Manufacturing',
      smeId: 'sme_001',
    },
    PackageDetails: {
      price: 50,
      insurance: true,
      packageDescription: 'Cement bags',
      selectedQualities: ['Heavy', 'Industrial'],
      packageWeight: '50',
      courierCapacity: 'truck',
      itemValue: '5000',
      valueRange: 2,
      vehicleType: 'truck',
      qualities: ['Heavy', 'Industrial'],
      weightType: 'weight',
    },
    pickupLocation: 'No 2, Balonny Close, Allen Avenue',
    dropoffLocation: '87, South Lester Street, London Close Belgium',
    estimate: '5km | ESTIMATE TIME 4hrs',
    pickupCord: {
      latitude: -1.2647,
      longitude: 36.8106,
      latitudeDelta: 0.0422,
      longitudeDelta: 0.0421,
    },
    dropoffCord: {
      latitude: -1.2921,
      longitude: 36.8219,
      latitudeDelta: 0.0440,
      longitudeDelta: 0.0421,
    },
    status: 'pending',
    payment: 'completed',
  },
  {
    id: 'd2',
    ClientDetails: {
      smeName: 'Alice Mumo',
      businessIndustry: 'Agriculture',
      smeId: 'sme_002',
    },
    PackageDetails: {
      price: 40,
      insurance: false,
      packageDescription: 'Fresh produce',
      selectedQualities: ['Perishable', 'Fragile'],
      packageWeight: '20',
      courierCapacity: 'medium_car',
      itemValue: '2000',
      valueRange: 1,
      vehicleType: 'medium_car',
      qualities: ['Perishable', 'Fragile'],
      weightType: 'weight',
    },
    pickupLocation: 'Plot 6, Otieno Lane',
    dropoffLocation: 'Main Market Rd, Kisumu',
    estimate: '3km | 2hrs',
    pickupCord: {
      latitude: -0.0857,
      longitude: 34.7732,
      latitudeDelta: 0.0422,
      longitudeDelta: 0.0421,
    },
    dropoffCord: {
      latitude: -0.0917,
      longitude: 34.7680,
      latitudeDelta: 0.0440,
      longitudeDelta: 0.0421,
    },
    status: 'pending',
    payment: 'completed',
  },
];

// Mock data for deliveries already accepted by the courier
const mockAcceptedDeliveries: DeliveryRequest[] = [
  {
    id: 'ongoing1',
    ClientDetails: {
      smeName: 'TechCorp Solutions',
      businessIndustry: 'Technology',
      smeId: 'sme_003',
    },
    PackageDetails: {
      price: 60,
      insurance: true,
      packageDescription: 'Electronics',
      selectedQualities: ['Fragile', 'Urgent'],
      packageWeight: '5',
      courierCapacity: 'bike',
      itemValue: '10000',
      valueRange: 3,
      vehicleType: 'bike',
      qualities: ['Fragile', 'Urgent'],
      weightType: 'weight',
    },
    pickupLocation: 'Westlands Square, Nairobi',
    dropoffLocation: 'KICC, Nairobi CBD',
    estimate: '7km | 1hr',
    pickupCord: {
      latitude: -1.2630,
      longitude: 36.8063,
      latitudeDelta: 0.0422,
      longitudeDelta: 0.0421,
    },
    dropoffCord: {
      latitude: -1.2921,
      longitude: 36.8219,
      latitudeDelta: 0.0440,
      longitudeDelta: 0.0421,
    },
    status: 'accepted',
    payment: 'completed',
    acceptedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    CourierDetails: {
      CourierId: 'driver1',
      CourierName: 'Martin Lawrence',
      CourierLocation: 'En route to pickup',
      CourierCoordinates: {
        latitude: -1.2650,
        longitude: 36.8080,
        latitudeDelta: 0.0422,
        longitudeDelta: 0.0421,
      },
    },
    tracker: {
      pickup: 'completed',
      pickupCode: '12345',
      pickupImage: 'https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
      dropoff: 'pending',
      dropoffCode: null,
      dropoffImage: null,
    }
  },
];

// Mock SME deliveries (deliveries created by SMEs)
const mockSMEDeliveries: DeliveryRequest[] = [
  {
    id: 'sme1',
    ClientDetails: {
      smeName: 'TechCorp Solutions',
      businessIndustry: 'Technology',
      smeId: 'sme_003',
    },
    PackageDetails: {
      price: 45,
      insurance: true,
      packageDescription: 'Laptop Computer',
      selectedQualities: ['Fragile', 'Urgent'],
      packageWeight: '3',
      courierCapacity: 'bike',
      itemValue: '50000',
      valueRange: 3,
      vehicleType: 'bike',
      qualities: ['Fragile', 'Urgent'],
      weightType: 'weight',
    },
    pickupLocation: 'TechCorp Building, Nairobi CBD',
    dropoffLocation: 'Karen Shopping Centre',
    estimate: '12km | 45min',
    pickupCord: {
      latitude: -1.2921,
      longitude: 36.8219,
      latitudeDelta: 0.0422,
      longitudeDelta: 0.0421,
    },
    dropoffCord: {
      latitude: -1.3197,
      longitude: 36.7025,
      latitudeDelta: 0.0440,
      longitudeDelta: 0.0421,
    },
    status: 'accepted',
    payment: 'completed',
    acceptedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    CourierDetails: {
      CourierId: 'driver2',
      CourierName: 'John Kamau',
      CourierLocation: 'At pickup location',
      CourierCoordinates: {
        latitude: -1.2950,
        longitude: 36.8100,
        latitudeDelta: 0.0422,
        longitudeDelta: 0.0421,
      },
    },
  },
  {
    id: 'sme2',
    ClientDetails: {
      smeName: 'TechCorp Solutions',
      businessIndustry: 'Technology',
      smeId: 'sme_003',
    },
    PackageDetails: {
      price: 35,
      insurance: false,
      packageDescription: 'Office Supplies',
      selectedQualities: ['Standard'],
      packageWeight: '10',
      courierCapacity: 'small_car',
      itemValue: '1000',
      valueRange: 1,
      vehicleType: 'small_car',
      qualities: ['Standard'],
      weightType: 'weight',
    },
    pickupLocation: 'TechCorp Building, Nairobi CBD',
    dropoffLocation: 'Westlands Mall',
    estimate: '8km | 30min',
    pickupCord: {
      latitude: -1.2921,
      longitude: 36.8219,
      latitudeDelta: 0.0422,
      longitudeDelta: 0.0421,
    },
    dropoffCord: {
      latitude: -1.2630,
      longitude: 36.8063,
      latitudeDelta: 0.0440,
      longitudeDelta: 0.0421,
    },
    status: 'pending',
    payment: 'pending',
  },
];

export function DeliveryProvider({ children }: { children: ReactNode }) {
  const [allDeliveries, setAllDeliveries] = useState<DeliveryRequest[]>(allAvailableDeliveries);
  const [pendingOngoingDeliveries, setPendingOngoingDeliveries] = useState<DeliveryRequest[]>(mockAcceptedDeliveries);
  const [smeDeliveries, setSmeDeliveries] = useState<DeliveryRequest[]>(mockSMEDeliveries);
  const [currentDelivery, setCurrentDeliveryState] = useState<DeliveryRequest | null>(
    mockAcceptedDeliveries.find(d => d.tracker?.pickup === 'completed') || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refresh deliveries from API
  const refreshDeliveries = async () => {
    setLoading(true);
    setError(null);
    try {
      const [available, courier, sme] = await Promise.all([
        fetchAvailableDeliveries(),
        fetchCourierDeliveries('courier1'), // Replace with actual courier ID
        fetchSMEDeliveries('sme1'), // Replace with actual SME ID
      ]);
      
      setAllDeliveries(available);
      setPendingOngoingDeliveries(courier);
      setSmeDeliveries(sme);
    } catch (err) {
      setError('Failed to refresh deliveries');
      console.error('Error refreshing deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  const acceptDelivery = async (deliveryId: string) => {
    setLoading(true);
    setError(null);
    try {
      const acceptedDelivery = await acceptDeliveryRequest(deliveryId, 'courier1'); // Replace with actual courier ID
      
      // Remove from all deliveries and add to pending ongoing
      setAllDeliveries(prev => prev.filter(d => d.id !== deliveryId));
      setPendingOngoingDeliveries(prev => [...prev, acceptedDelivery]);
      
      // Update SME deliveries if this delivery belongs to an SME
      setSmeDeliveries(prev => 
        prev.map(d => 
          d.id === deliveryId 
            ? { ...d, status: 'accepted', CourierDetails: acceptedDelivery.CourierDetails, acceptedAt: new Date() }
            : d
        )
      );

      // Set as current delivery if none exists
      if (!currentDelivery) {
        setCurrentDeliveryState(acceptedDelivery);
      }
    } catch (err) {
      setError('Failed to accept delivery');
      console.error('Error accepting delivery:', err);
      
      // Fallback to original logic if API fails
      const delivery = allDeliveries.find(d => d.id === deliveryId);
      if (!delivery) return;

      // Assign random driver
      const randomDriver = mockDrivers[Math.floor(Math.random() * mockDrivers.length)];

      // Create ongoing delivery with tracker
      const ongoingDelivery: DeliveryRequest = {
        ...delivery,
        status: 'accepted',
        acceptedAt: new Date(),
        driverId: randomDriver.id,
        driverName: randomDriver.name,
        driverLocation: {
          latitude: delivery.pickupCord.latitude + (Math.random() - 0.5) * 0.01,
          longitude: delivery.pickupCord.longitude + (Math.random() - 0.5) * 0.01,
          latitudeDelta: 0.0422,
          longitudeDelta: 0.0421,
        },
        tracker: {
          pickup: 'pending',
          pickupCode: null,
          pickupImage: null,
          dropoff: 'pending',
          dropoffCode: null,
          dropoffImage: null,
        }
      };

      // Remove from all deliveries and add to pending ongoing
      setAllDeliveries(prev => prev.filter(d => d.id !== deliveryId));
      setPendingOngoingDeliveries(prev => [...prev, ongoingDelivery]);
      
      // Update SME deliveries if this delivery belongs to an SME
      setSmeDeliveries(prev => 
        prev.map(d => 
          d.id === deliveryId 
            ? { ...d, status: 'accepted', CourierDetails: { CourierId: randomDriver.id, CourierName: randomDriver.name }, acceptedAt: new Date() }
            : d
        )
      );

      // Set as current delivery if none exists
      if (!currentDelivery) {
        setCurrentDeliveryState(ongoingDelivery);
      }
    } finally {
      setLoading(false);
    }
  };

  // Original acceptDelivery logic moved to fallback above
  const acceptDeliveryFallback = (deliveryId: string) => {
    const delivery = allDeliveries.find(d => d.id === deliveryId);
    if (!delivery) return;

    // Assign random driver
    const randomDriver = mockDrivers[Math.floor(Math.random() * mockDrivers.length)];

    // Create ongoing delivery with tracker
    const ongoingDelivery: DeliveryRequest = {
      ...delivery,
      status: 'accepted',
      acceptedAt: new Date(),
      driverId: randomDriver.id,
      driverName: randomDriver.name,
      driverLocation: {
        latitude: delivery.pickupCord.latitude + (Math.random() - 0.5) * 0.01,
        longitude: delivery.pickupCord.longitude + (Math.random() - 0.5) * 0.01,
        latitudeDelta: 0.0422,
        longitudeDelta: 0.0421,
      },
      tracker: {
        pickup: 'pending',
        pickupCode: null,
        pickupImage: null,
        dropoff: 'pending',
        dropoffCode: null,
        dropoffImage: null,
      }
    };

    // Remove from all deliveries and add to pending ongoing
    setAllDeliveries(prev => prev.filter(d => d.id !== deliveryId));
    setPendingOngoingDeliveries(prev => [...prev, ongoingDelivery]);
    
    // Update SME deliveries if this delivery belongs to an SME
    setSmeDeliveries(prev => 
      prev.map(d => 
        d.id === deliveryId 
          ? { ...d, status: 'accepted', driverId: randomDriver.id, driverName: randomDriver.name, acceptedAt: new Date() }
          : d
      )
    );

    // Set as current delivery if none exists
    if (!currentDelivery) {
      setCurrentDeliveryState(ongoingDelivery);
    }
  };

  const setCurrentDelivery = (delivery: DeliveryRequest | null) => {
    setCurrentDeliveryState(delivery);
  };

  const updateDeliveryTracker = async (deliveryId: string, trackerUpdate: Partial<DeliveryTracker>) => {
    setLoading(true);
    setError(null);
    try {
      await updateDeliveryStatus(deliveryId, { tracker: trackerUpdate });
    } catch (err) {
      setError('Failed to update delivery tracker');
      console.error('Error updating delivery tracker:', err);
    } finally {
      setLoading(false);
    }

    // Update pending ongoing deliveries
    setPendingOngoingDeliveries(prev => 
      prev.map(delivery => 
        delivery.id === deliveryId 
          ? { ...delivery, tracker: { ...delivery.tracker!, ...trackerUpdate } }
          : delivery
      )
    );

    // Update SME deliveries
    setSmeDeliveries(prev => 
      prev.map(delivery => 
        delivery.id === deliveryId 
          ? { ...delivery, tracker: { ...delivery.tracker!, ...trackerUpdate } }
          : delivery
      )
    );

    // Update current delivery if it's the same delivery
    if (currentDelivery?.id === deliveryId) {
      setCurrentDeliveryState(prev => 
        prev ? { ...prev, tracker: { ...prev.tracker!, ...trackerUpdate } } : null
      );
    }
  };

  const completeDelivery = (deliveryId: string) => {
    // Update status to completed
    const updateToCompleted = (delivery: DeliveryRequest) => 
      delivery.id === deliveryId ? { ...delivery, status: 'completed' as const } : delivery;

    setPendingOngoingDeliveries(prev => prev.filter(d => d.id !== deliveryId));
    setSmeDeliveries(prev => prev.map(updateToCompleted));
    
    // Clear current delivery if it's the completed delivery
    if (currentDelivery?.id === deliveryId) {
      const nextOngoing = pendingOngoingDeliveries.find(d => d.id !== deliveryId);
      setCurrentDeliveryState(nextOngoing || null);
    }
  };

  const createNewDelivery = async (deliveryData: any): Promise<DeliveryRequest> => {
    setLoading(true);
    setError(null);
    try {
      const newDelivery = await createDeliveryRequest(deliveryData);
      
      // Add to both SME deliveries and available deliveries
      setSmeDeliveries(prev => [...prev, newDelivery]);
      setAllDeliveries(prev => [...prev, newDelivery]);
      
      return newDelivery;
    } catch (err) {
      setError('Failed to create delivery');
      console.error('Error creating delivery:', err);
      
      // Fallback to original logic
      return createNewDeliveryFallback(deliveryData);
    } finally {
      setLoading(false);
    }
  };

  // Original createNewDelivery logic moved to fallback
  const createNewDeliveryFallback = (deliveryData: any): DeliveryRequest => {
    const newDelivery: DeliveryRequest = {
      id: `sme-${Date.now()}`,
      ...deliveryData,
    };

    // Add to both SME deliveries and available deliveries
    setSmeDeliveries(prev => [...prev, newDelivery]);
    setAllDeliveries(prev => [...prev, newDelivery]);
    
    return newDelivery;
  };

  const computeCharges = async (input: any): Promise<DeliveryCharges> => {
    setLoading(true);
    setError(null);
    try {
      const charges = await computeDeliveryCharges(input);
      return charges;
    } catch (err) {
      setError('Failed to compute charges');
      console.error('Error computing charges:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (paymentData: PaymentRequest): Promise<{ success: boolean; transactionId: string }> => {
    setLoading(true);
    setError(null);
    try {
      const result = await makePayment(paymentData);
      return result;
    } catch (err) {
      setError('Failed to process payment');
      console.error('Error processing payment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDelivery = async (smeId: string, deliveryId: string): Promise<{ success: boolean }> => {
    setLoading(true);
    setError(null);
    try {
      const result = await deleteDeliveryRequest(smeId, deliveryId);
      
      if (result.success) {
        // Remove from local state
        setSmeDeliveries(prev => prev.filter(d => d.id !== deliveryId));
        setAllDeliveries(prev => prev.filter(d => d.id !== deliveryId));
      }
      
      return result;
    } catch (err) {
      setError('Failed to delete delivery');
      console.error('Error deleting delivery:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDriverLocation = async (deliveryId: string, location: Coordinates) => {
    try {
      await updateDeliveryStatus(deliveryId, { driverLocation: location });
    } catch (err) {
      console.warn('Failed to update driver location via API, updating locally:', err);
    }

    const updateLocation = (delivery: DeliveryRequest) => 
      delivery.id === deliveryId ? { ...delivery, CourierDetails: { ...delivery.CourierDetails, CourierCoordinates: location } } : delivery;

    setPendingOngoingDeliveries(prev => prev.map(updateLocation));
    setSmeDeliveries(prev => prev.map(updateLocation));
    
    if (currentDelivery?.id === deliveryId) {
      setCurrentDeliveryState(prev => prev ? { ...prev, CourierDetails: { ...prev.CourierDetails, CourierCoordinates: location } } : null);
    }
  };

  const uploadImage = async (deliveryId: string, imageUri: string, type: 'pickup' | 'dropoff') => {
    setLoading(true);
    setError(null);
    try {
      const imageUrl = await uploadDeliveryImage(deliveryId, imageUri, type);
      
      // Update the delivery tracker with the image URL
      const trackerUpdate = type === 'pickup' 
        ? { pickupImage: imageUrl }
        : { dropoffImage: imageUrl };
      
      await updateDeliveryTracker(deliveryId, trackerUpdate);
    } catch (err) {
      setError('Failed to upload image');
      console.error('Error uploading image:', err);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (deliveryId: string, code: string, type: 'pickup' | 'dropoff'): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const isValid = await verifyDeliveryCode(deliveryId, code, type);
      
      if (isValid) {
        // Update the delivery tracker with the code
        const trackerUpdate = type === 'pickup' 
          ? { pickupCode: code }
          : { dropoffCode: code };
        
        await updateDeliveryTracker(deliveryId, trackerUpdate);
      }
      
      return isValid;
    } catch (err) {
      setError('Failed to verify code');
      console.error('Error verifying code:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = (deliveryId: string, status: 'pending' | 'completed' | 'failed') => {
    const updateStatus = (delivery: DeliveryRequest) => 
      delivery.id === deliveryId ? { ...delivery, payment: status } : delivery;

    setAllDeliveries(prev => prev.map(updateStatus));
    setPendingOngoingDeliveries(prev => prev.map(updateStatus));
    setSmeDeliveries(prev => prev.map(updateStatus));
    
    if (currentDelivery?.id === deliveryId) {
      setCurrentDeliveryState(prev => prev ? { ...prev, payment: status } : null);
    }
  };

  const sendSMSCode = async (deliveryId: string, type: 'pickup' | 'dropoff'): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Get delivery details for phone numbers
      const delivery = getDeliveryById(deliveryId);
      if (!delivery) throw new Error('Delivery not found');
      
      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const phoneNumber = type === 'pickup' 
        ? '+254712345678' // Courier's phone (should come from user context)
        : '+254712345679'; // Recipient's phone (should come from delivery data)
      
      // In a real implementation, you would call your SMS API here
      // await apiClient.post(`/deliveries/${deliveryId}/send-sms`, { type, phoneNumber, code: verificationCode });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock SMS sending - log the code for development
      console.log(`🚚 SMS sent to ${phoneNumber} for ${type} verification: ${verificationCode}`);
      console.log(`📱 Message: "Sonic Logistics: Your ${type} verification code is ${verificationCode}. Valid for 10 minutes."`);
      
    } catch (err) {
      setError('Failed to send SMS code');
      console.error('Error sending SMS code:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const getDeliveryById = (id: string): DeliveryRequest | null => {
    return [...allDeliveries, ...pendingOngoingDeliveries, ...smeDeliveries].find(d => d.id === id) || null;
  };

  return (
    <DeliveryContext.Provider value={{
      allDeliveries,
      pendingOngoingDeliveries,
      currentDelivery,
      smeDeliveries,
      loading,
      error,
      acceptDelivery,
      setCurrentDelivery,
      updateDeliveryTracker,
      completeDelivery,
      createNewDelivery,
      computeCharges,
      processPayment,
      deleteDelivery,
      updateDriverLocation,
      getDeliveryById,
      refreshDeliveries,
      uploadImage,
      verifyCode,
      updatePaymentStatus,
      sendSMSCode,
    }}>
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDelivery() {
  const context = useContext(DeliveryContext);
  if (context === undefined) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
}