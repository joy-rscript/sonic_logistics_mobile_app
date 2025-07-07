import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DeliveryTracker {
  pickup: 'pending' | 'in_progress' | 'completed';
  pickupCode: string | null;
  pickupImage: string | null;
  dropoff: 'pending' | 'in_progress' | 'completed';
  dropoffCode: string | null;
  dropoffImage: string | null;
}

interface Coordinates {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface DeliveryRequest {
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
  status: 'pending' | 'ongoing' | 'completed';
  acceptedAt?: Date;
}

interface DeliveryContextType {
  allDeliveries: DeliveryRequest[];
  pendingOngoingDeliveries: DeliveryRequest[];
  currentDelivery: DeliveryRequest | null;
  acceptDelivery: (deliveryId: string) => void;
  setCurrentDelivery: (delivery: DeliveryRequest | null) => void;
  updateDeliveryTracker: (deliveryId: string, tracker: Partial<DeliveryTracker>) => void;
  completeDelivery: (deliveryId: string) => void;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

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
  {
    id: 'd3',
    location: 'Mombasa',
    price: 35,
    clientName: 'John Kamau',
    clientType: 'Ocean Freight Ltd',
    premium: true,
    badges: ['Premium', 'Heavy Cargo'],
    pickup: '45 Beach Road, Tudor',
    dropoff: 'Mombasa Port, Berth 16',
    estimate: '8km | 3hrs',
    pickupCord: {
      latitude: -4.0619,
      longitude: 39.6682,
      latitudeDelta: 0.0422,
      longitudeDelta: 0.0421,
    },
    dropoffCord: {
      latitude: -4.0435,
      longitude: 39.6682,
      latitudeDelta: 0.0440,
      longitudeDelta: 0.0421,
    },
    status: 'pending',
  },
  {
    id: 'd4',
    location: 'Nakuru',
    price: 45,
    clientName: 'Sarah Wanjiku',
    clientType: 'Lake Farms',
    premium: false,
    badges: ['Standard', 'Perishables'],
    pickup: '23 Lake View Drive',
    dropoff: 'Central Market, Nakuru',
    estimate: '4km | 1.5hrs',
    pickupCord: {
      latitude: -0.2827,
      longitude: 36.0800,
      latitudeDelta: 0.0422,
      longitudeDelta: 0.0421,
    },
    dropoffCord: {
      latitude: -0.3031,
      longitude: 36.0800,
      latitudeDelta: 0.0440,
      longitudeDelta: 0.0421,
    },
    status: 'pending',
  },
  {
    id: 'd5',
    location: 'Eldoret',
    price: 55,
    clientName: 'Mike Kiprop',
    clientType: 'Highland Distributors',
    premium: true,
    badges: ['Premium', 'Express', 'Fragile'],
    pickup: '78 Pioneer Road',
    dropoff: 'Eldoret International Airport',
    estimate: '6km | 2.5hrs',
    pickupCord: {
      latitude: 0.5200,
      longitude: 35.2697,
      latitudeDelta: 0.0422,
      longitudeDelta: 0.0421,
    },
    dropoffCord: {
      latitude: 0.5143,
      longitude: 35.2395,
      latitudeDelta: 0.0440,
      longitudeDelta: 0.0421,
    },
    status: 'pending',
  }
];

// Mock data for deliveries already accepted by the courier (would come from API)
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
    status: 'ongoing',
    acceptedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    tracker: {
      pickup: 'completed',
      pickupCode: '12345',
      pickupImage: 'https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
      dropoff: 'pending',
      dropoffCode: null,
      dropoffImage: null,
    }
  },
  {
    id: 'ongoing2',
    location: 'Karen',
    price: 45,
    clientName: 'Green Valley Farms',
    clientType: 'Agriculture',
    premium: false,
    badges: ['Standard', 'Perishables'],
    pickup: 'Karen Shopping Centre',
    dropoff: 'Galleria Mall, Karen',
    estimate: '3km | 30min',
    pickupCord: {
      latitude: -1.3197,
      longitude: 36.7025,
      latitudeDelta: 0.0422,
      longitudeDelta: 0.0421,
    },
    dropoffCord: {
      latitude: -1.3197,
      longitude: 36.7025,
      latitudeDelta: 0.0440,
      longitudeDelta: 0.0421,
    },
    status: 'ongoing',
    acceptedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    tracker: {
      pickup: 'pending',
      pickupCode: null,
      pickupImage: null,
      dropoff: 'pending',
      dropoffCode: null,
      dropoffImage: null,
    }
  }
];

export function DeliveryProvider({ children }: { children: ReactNode }) {
  const [allDeliveries, setAllDeliveries] = useState<DeliveryRequest[]>(allAvailableDeliveries);
  const [pendingOngoingDeliveries, setPendingOngoingDeliveries] = useState<DeliveryRequest[]>(mockAcceptedDeliveries);
  const [currentDelivery, setCurrentDeliveryState] = useState<DeliveryRequest | null>(
    // Default to the first ongoing delivery with pending pickup
    mockAcceptedDeliveries.find(d => d.tracker?.pickup === 'completed') || null
  );

  const acceptDelivery = (deliveryId: string) => {
    const delivery = allDeliveries.find(d => d.id === deliveryId);
    if (!delivery) return;

    // Create ongoing delivery with tracker
    const ongoingDelivery: DeliveryRequest = {
      ...delivery,
      status: 'ongoing',
      acceptedAt: new Date(),
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
    
    // Set as current delivery if none exists
    if (!currentDelivery) {
      setCurrentDeliveryState(ongoingDelivery);
    }

    // TODO: Send API update
    // acceptDeliveryAPI(deliveryId);
  };

  const setCurrentDelivery = (delivery: DeliveryRequest | null) => {
    setCurrentDeliveryState(delivery);
    // TODO: Store in API/AsyncStorage
    // storeCurrentDeliveryAPI(delivery?.id || null);
  };

  const updateDeliveryTracker = (deliveryId: string, trackerUpdate: Partial<DeliveryTracker>) => {
    setPendingOngoingDeliveries(prev => 
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

    // TODO: Send API update
    // updateDeliveryTrackerAPI(deliveryId, trackerUpdate);
  };

  const completeDelivery = (deliveryId: string) => {
    setPendingOngoingDeliveries(prev => prev.filter(d => d.id !== deliveryId));
    
    // Clear current delivery if it's the completed delivery
    if (currentDelivery?.id === deliveryId) {
      const nextOngoing = pendingOngoingDeliveries.find(d => d.id !== deliveryId);
      setCurrentDeliveryState(nextOngoing || null);
    }

    // TODO: Send API update and move to completed deliveries
    // completeDeliveryAPI(deliveryId);
  };

  return (
    <DeliveryContext.Provider value={{
      allDeliveries,
      pendingOngoingDeliveries,
      currentDelivery,
      acceptDelivery,
      setCurrentDelivery,
      updateDeliveryTracker,
      completeDelivery,
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