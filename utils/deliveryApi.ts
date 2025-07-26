import apiClient from './apiClient';

// Types for API responses
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
  pickupCord: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  dropoffCord: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  tracker?: {
    pickup: 'pending' | 'in_progress' | 'completed';
    pickupCode: string | null;
    pickupImage: string | null;
    dropoff: 'pending' | 'in_progress' | 'completed';
    dropoffCode: string | null;
    dropoffImage: string | null;
  };
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  acceptedAt?: Date;
  driverId?: string;
  driverName?: string;
  driverLocation?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  destination?: string;
  packageName?: string;
  packageDescription?: string;
  insurance?: 'yes' | 'no' | '';
  selectedQualities?: string[];
}

// Mock data for fallback
const mockAvailableDeliveries: DeliveryRequest[] = [
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
    destination: 'Westlands Mall',
    packageName: 'Office Supplies',
    packageDescription: 'Stationery and office materials',
    insurance: 'no',
    selectedQualities: ['Standard'],
  },
];

// API functions with fallback to mock data
export const fetchAvailableDeliveries = async (): Promise<DeliveryRequest[]> => {
  try {
    const response = await apiClient.get('/deliveries/available');
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for available deliveries:', error);
    return mockAvailableDeliveries;
  }
};

export const fetchCourierDeliveries = async (courierId: string): Promise<DeliveryRequest[]> => {
  try {
    const response = await apiClient.get(`/deliveries/courier/${courierId}`);
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for courier deliveries:', error);
    return mockAcceptedDeliveries;
  }
};

export const fetchSMEDeliveries = async (smeId: string): Promise<DeliveryRequest[]> => {
  try {
    const response = await apiClient.get(`/deliveries/sme/${smeId}`);
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for SME deliveries:', error);
    return mockSMEDeliveries;
  }
};

export const acceptDeliveryRequest = async (deliveryId: string, courierId: string): Promise<DeliveryRequest> => {
  try {
    const response = await apiClient.post('/deliveries/accept', {
      deliveryId,
      courierId,
    });
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for accept delivery:', error);
    // Return mock accepted delivery
    const delivery = mockAvailableDeliveries.find(d => d.id === deliveryId);
    if (delivery) {
      return {
        ...delivery,
        status: 'accepted',
        acceptedAt: new Date(),
        driverId: courierId,
        driverName: 'Mock Driver',
        tracker: {
          pickup: 'pending',
          pickupCode: null,
          pickupImage: null,
          dropoff: 'pending',
          dropoffCode: null,
          dropoffImage: null,
        }
      };
    }
    throw new Error('Delivery not found');
  }
};

export const updateDeliveryStatus = async (
  deliveryId: string,
  updates: {
    tracker?: Partial<DeliveryRequest['tracker']>;
    driverLocation?: DeliveryRequest['driverLocation'];
    status?: DeliveryRequest['status'];
  }
): Promise<DeliveryRequest> => {
  try {
    const response = await apiClient.patch(`/deliveries/${deliveryId}`, updates);
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for delivery update:', error);
    // Return mock updated delivery
    const delivery = mockAcceptedDeliveries.find(d => d.id === deliveryId);
    if (delivery) {
      return {
        ...delivery,
        ...updates,
        tracker: { ...delivery.tracker, ...updates.tracker },
      };
    }
    throw new Error('Delivery not found');
  }
};

export const createDeliveryRequest = async (deliveryData: Partial<DeliveryRequest>): Promise<DeliveryRequest> => {
  try {
    const response = await apiClient.post('/deliveries/create', deliveryData);
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for create delivery:', error);
    // Return mock created delivery
    const newDelivery: DeliveryRequest = {
      id: `mock-${Date.now()}`,
      location: deliveryData.destination || 'Unknown',
      price: Math.floor(Math.random() * 50) + 30,
      clientName: 'TechCorp Solutions',
      clientType: 'Technology Company',
      premium: deliveryData.selectedQualities?.includes('Premium') || false,
      badges: deliveryData.selectedQualities || ['Standard'],
      pickup: deliveryData.pickup || 'TechCorp Building, Nairobi CBD',
      dropoff: deliveryData.dropoff || deliveryData.destination || 'Unknown destination',
      estimate: '5km | 30min',
      instructions: deliveryData.instructions,
      pickupCord: deliveryData.pickupCord || {
        latitude: -1.2921,
        longitude: 36.8219,
        latitudeDelta: 0.0422,
        longitudeDelta: 0.0421,
      },
      dropoffCord: deliveryData.dropoffCord || {
        latitude: -1.2921 + (Math.random() - 0.5) * 0.1,
        longitude: 36.8219 + (Math.random() - 0.5) * 0.1,
        latitudeDelta: 0.0440,
        longitudeDelta: 0.0421,
      },
      status: 'pending',
      ...deliveryData,
    };
    return newDelivery;
  }
};

export const uploadDeliveryImage = async (deliveryId: string, imageUri: string, type: 'pickup' | 'dropoff'): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `${type}_${deliveryId}.jpg`,
    } as any);
    formData.append('deliveryId', deliveryId);
    formData.append('type', type);

    const response = await apiClient.post('/deliveries/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.imageUrl;
  } catch (error) {
    console.warn('API unavailable, using mock data for image upload:', error);
    return `https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2`;
  }
};

export const verifyDeliveryCode = async (deliveryId: string, code: string, type: 'pickup' | 'dropoff'): Promise<boolean> => {
  try {
    const response = await apiClient.post('/deliveries/verify-code', {
      deliveryId,
      code,
      type,
    });
    return response.data.verified;
  } catch (error) {
    console.warn('API unavailable, using mock data for code verification:', error);
    return code.length === 5; // Mock verification - any 5-digit code is valid
  }
};