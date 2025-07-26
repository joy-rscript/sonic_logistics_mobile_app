import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  fetchAvailableDeliveries, 
  fetchCourierDeliveries, 
  fetchSMEDeliveries,
  acceptDeliveryRequest,
  updateDeliveryStatus,
  createDeliveryRequest,
  uploadDeliveryImage,
  verifyDeliveryCode,
  DeliveryRequest as APIDeliveryRequest
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

export interface DeliveryRequest {
  id: string;
  location: string;
  price: number;
  clientName: string;
  clientType: string;
  premium: boolean;
  badges: string[];
  pickup: string;
  dropoff: string;
  estimate: string;
  instructions?: string;
  pickupCord: Coordinates;
  dropoffCord: Coordinates;
  tracker?: DeliveryTracker;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  acceptedAt?: Date;
  driverId?: string;
  driverName?: string;
  driverLocation?: Coordinates;
  // SME form fields
  destination?: string;
  packageName?: string;
  packageDescription?: string;
  insurance?: 'yes' | 'no' | '';
  selectedQualities?: string[];
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
  createNewDelivery: (delivery: Partial<DeliveryRequest>) => void;
  updateDriverLocation: (deliveryId: string, location: Coordinates) => void;
  getDeliveryById: (id: string) => DeliveryRequest | null;
  refreshDeliveries: () => Promise<void>;
  uploadImage: (deliveryId: string, imageUri: string, type: 'pickup' | 'dropoff') => Promise<void>;
  verifyCode: (deliveryId: string, code: string, type: 'pickup' | 'dropoff') => Promise<boolean>;
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
    location: 'Nairobi',
    price: 50,
    clientName: 'Ben Njoki',
    clientType: 'Bamburi Cement',
    premium: true,
    badges: ['Premium', 'Cold Chain', 'Perishables'],
    pickup: 'No 2, Balonny Close, Allen Avenue',
    dropoff: '87, South Lester Street, London Close Belgium',
    estimate: '5km | ESTIMATE TIME 4hrs',
    instructions: 'Please ensure the package is properly packaged and labeled.',
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
  },
  {
    id: 'd2',
    location: 'Kisumu',
    price: 40,
    clientName: 'Alice Mumo',
    clientType: 'FreshFarms',
    premium: false,
    badges: ['Standard', 'Fragile'],
    pickup: 'Plot 6, Otieno Lane',
    dropoff: 'Main Market Rd, Kisumu',
    estimate: '3km | 2hrs',
    instructions: 'Handle with care - fragile items inside.',
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
  },
];

// Mock data for deliveries already accepted by the courier
const mockAcceptedDeliveries: DeliveryRequest[] = [
  {
    id: 'ongoing1',
    location: 'Westlands',
    price: 60,
    clientName: 'TechCorp Solutions',
    clientType: 'Technology Company',
    premium: true,
    badges: ['Premium', 'Express'],
    pickup: 'Westlands Square, Nairobi',
    dropoff: 'KICC, Nairobi CBD',
    estimate: '7km | 1hr',
    instructions: 'Deliver to reception desk on 5th floor.',
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
    acceptedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    driverId: 'driver1',
    driverName: 'Martin Lawrence',
    driverLocation: {
      latitude: -1.2650,
      longitude: 36.8080,
      latitudeDelta: 0.0422,
      longitudeDelta: 0.0421,
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
    location: 'Nairobi CBD',
    price: 45,
    clientName: 'TechCorp Solutions',
    clientType: 'Technology Company',
    premium: true,
    badges: ['Premium', 'Fragile'],
    pickup: 'TechCorp Building, Nairobi CBD',
    dropoff: 'Karen Shopping Centre',
    estimate: '12km | 45min',
    instructions: 'Handle with care - electronics inside.',
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
    acceptedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    driverId: 'driver2',
    driverName: 'John Kamau',
    driverLocation: {
      latitude: -1.2950,
      longitude: 36.8100,
      latitudeDelta: 0.0422,
      longitudeDelta: 0.0421,
    },
    // SME form data
    destination: 'Karen Shopping Centre',
    packageName: 'Laptop Computer',
    packageDescription: 'Dell Laptop for office use',
    insurance: 'yes',
    selectedQualities: ['Fragile', 'Urgent'],
  },
  {
    id: 'sme2',
    location: 'Westlands',
    price: 35,
    clientName: 'TechCorp Solutions',
    clientType: 'Technology Company',
    premium: false,
    badges: ['Standard'],
    pickup: 'TechCorp Building, Nairobi CBD',
    dropoff: 'Westlands Mall',
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
    // SME form data
    destination: 'Westlands Mall',
    packageName: 'Office Supplies',
    packageDescription: 'Stationery and office materials',
    insurance: 'no',
    selectedQualities: ['Standard'],
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
            ? { ...d, status: 'accepted', driverId: acceptedDelivery.driverId, driverName: acceptedDelivery.driverName, acceptedAt: new Date() }
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
            ? { ...d, status: 'accepted', driverId: randomDriver.id, driverName: randomDriver.name, acceptedAt: new Date() }
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

  const createNewDelivery = async (deliveryData: Partial<DeliveryRequest>) => {
    setLoading(true);
    setError(null);
    try {
      const newDelivery = await createDeliveryRequest(deliveryData);
      
      // Add to both SME deliveries and available deliveries
      setSmeDeliveries(prev => [...prev, newDelivery]);
      setAllDeliveries(prev => [...prev, newDelivery]);
    } catch (err) {
      setError('Failed to create delivery');
      console.error('Error creating delivery:', err);
      
      // Fallback to original logic
      createNewDeliveryFallback(deliveryData);
    } finally {
      setLoading(false);
    }
  };

  // Original createNewDelivery logic moved to fallback
  const createNewDeliveryFallback = (deliveryData: Partial<DeliveryRequest>) => {
    const newDelivery: DeliveryRequest = {
      id: `sme-${Date.now()}`,
      location: deliveryData.destination || 'Unknown',
      price: Math.floor(Math.random() * 50) + 30, // Random price between 30-80
      clientName: 'TechCorp Solutions', // This would come from user context
      clientType: 'Technology Company',
      premium: deliveryData.selectedQualities?.includes('Premium') || false,
      badges: deliveryData.selectedQualities || ['Standard'],
      pickup: deliveryData.pickup || 'TechCorp Building, Nairobi CBD',
      dropoff: deliveryData.dropoff || deliveryData.destination || 'Unknown destination',
      estimate: '5km | 30min', // This would be calculated
      instructions: deliveryData.instructions,
      pickupCord: deliveryData.pickupCord || {
        latitude: -1.2921,
        longitude: 36.8219,
        latitudeDelta: 0.0422,
        longitudeDelta: 0.0421,
      },
      dropoffCord: deliveryData.dropoffCord || {
        latitude: -1.2921,
        longitude: 36.8219,
        latitudeDelta: 0.0422,
        longitudeDelta: 0.0421,
      },
      status: 'pending',
      ...deliveryData,
    };

    // Add to both SME deliveries and available deliveries
    setSmeDeliveries(prev => [...prev, newDelivery]);
    setAllDeliveries(prev => [...prev, newDelivery]);
  };

  const updateDriverLocation = async (deliveryId: string, location: Coordinates) => {
    try {
      await updateDeliveryStatus(deliveryId, { driverLocation: location });
    } catch (err) {
      console.warn('Failed to update driver location via API, updating locally:', err);
    }

    const updateLocation = (delivery: DeliveryRequest) => 
      delivery.id === deliveryId ? { ...delivery, driverLocation: location } : delivery;

    setPendingOngoingDeliveries(prev => prev.map(updateLocation));
    setSmeDeliveries(prev => prev.map(updateLocation));
    
    if (currentDelivery?.id === deliveryId) {
      setCurrentDeliveryState(prev => prev ? { ...prev, driverLocation: location } : null);
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
      updateDriverLocation,
      getDeliveryById,
      refreshDeliveries,
      uploadImage,
      verifyCode,
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