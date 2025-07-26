import apiClient from './apiClient';

// Types for API responses
export interface DeliveryRequest {
  id: string;
  ClientDetails: {
    smeName: string;
    businessIndustry: string;
    smeId: string;
  };
  PackageDetails: {
    price: number;
    insurance: boolean;
    packageDescription?: string;
    selectedQualities?: string[];
    packageWeight: string;
    courierCapacity: string;
    itemValue: string;
    valueRange: number;
    vehicleType: string;
    qualities: string[];
    weightType: string;
  };
  estimate: string;
  pickupCord: {
    latitude: number;
  pickupLocation: string;
  dropoffLocation: string;
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
  CourierDetails?: {
    CourierId?: string;
    CourierName?: string;
    CourierLocation?: string;
    CourierCoordinates?: Coordinates;
  };
}

export interface DeliveryCharges {
  charges: number;
  delayPayment: boolean;
  breakdown: {
    basePrice: number;
    distanceCharge: number;
    weightCharge: number;
    insuranceCharge: number;
    premiumCharge: number;
  };
}

export interface PaymentRequest {
  deliveryRequestId: string;
  amount: number;
  method: 'card' | 'mobile_money' | 'bank_transfer';
  smeId: string;
}

// Mock data for fallback
const mockAvailableDeliveries: DeliveryRequest[] = [
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
  },
];

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
  },
];

// New API functions for SME workflow
export const createDeliveryRequest = async (deliveryData: {
  ClientDetails: {
    smeName: string;
    businessIndustry: string;
    smeId: string;
  };
  PackageDetails: any;
  pickupCord: Coordinates;
  dropoffCord: Coordinates;
  pickupLocation: string;
  dropoffLocation: string;
  estimate: string;
  status: string;
}): Promise<DeliveryRequest> => {
  try {
    const response = await apiClient.post('/deliveries/create', deliveryData);
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for create delivery:', error);
    // Return mock created delivery
    const newDelivery: DeliveryRequest = {
      id: `del-${Date.now()}`,
      ...deliveryData,
    };
    return newDelivery;
  }
};

export const computeDeliveryCharges = async (input: {
  packageWeight: string;
  courierCapacity: string;
  insurance: boolean;
  itemValue: string;
  valueRange: number;
  vehicleType: string;
  pickupCord: Coordinates;
  dropoffCord: Coordinates;
}): Promise<DeliveryCharges> => {
  try {
    const response = await apiClient.post('/deliveries/compute-charges', input);
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for compute charges:', error);
    
    // Mock calculation logic
    const basePrice = 30;
    const distance = Math.random() * 20 + 5; // Mock distance 5-25km
    const distanceCharge = distance * 2;
    const weightCharge = parseInt(input.packageWeight) * 0.5;
    const insuranceCharge = input.insurance ? parseFloat(input.itemValue) * 0.02 : 0;
    const premiumCharge = input.vehicleType === 'bike' ? 10 : input.vehicleType === 'truck' ? 25 : 15;
    
    const totalCharges = basePrice + distanceCharge + weightCharge + insuranceCharge + premiumCharge;
    
    return {
      charges: Math.round(totalCharges),
      delayPayment: totalCharges > 100, // Allow delay payment for orders > 100
      breakdown: {
        basePrice,
        distanceCharge: Math.round(distanceCharge),
        weightCharge: Math.round(weightCharge),
        insuranceCharge: Math.round(insuranceCharge),
        premiumCharge,
      },
    };
  }
};

export const makePayment = async (paymentData: PaymentRequest): Promise<{ success: boolean; transactionId: string }> => {
  try {
    const response = await apiClient.post('/payments/process', paymentData);
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for payment:', error);
    return {
      success: true,
      transactionId: `txn_${Date.now()}`,
    };
  }
};

export const deleteDeliveryRequest = async (smeId: string, deliveryRequestId: string): Promise<{ success: boolean }> => {
  try {
    const response = await apiClient.delete(`/deliveries/${deliveryRequestId}`, {
      data: { smeId }
    });
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for delete delivery:', error);
    return { success: true };
  }
};

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