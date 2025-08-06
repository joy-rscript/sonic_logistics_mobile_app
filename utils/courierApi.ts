import apiClient from './apiClient';

// Types for API responses
export interface CourierProfile {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleCapacity: string;
  insuranceCompany: string;
  paymentDetails: {
    bankName: string;
    accountNumber: string;
  };
}

export interface CourierDelivery {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  vehicleType: string;
  packageDescription: string;
  packageQualities: string[];
  optionalInstructions: string;
  insurance: number;
  fee: number;
  courierId: string;
  status: string;
  dateCreated: string;
  rating?: number;
  trackerDetails?: {
    confirmPickup?: string;
    imageAtPickup?: string;
    actualPickupLocation?: { lat: number; lng: number };
    confirmDelivery?: string;
    imageAtDelivery?: string;
    actualDropoffLocation?: { lat: number; lng: number };
  };
}

export interface CourierNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  delivery_id: string;
}

export interface CourierReview {
  id: string;
  rating: number;
  comment: string;
  date: string;
}

// ====== Open Deliveries ======

export const getOpenDeliveries = async (): Promise<CourierDelivery[]> => {
  try {
    const response = await apiClient.get('/deliveries/open');
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for open deliveries:', error);
    return [
        { 
            id: 'del87dd5', 
            pickupLocation: '123 Warehouse Ave, District A',
            dropoffLocation: '456 Industrial Blvd, District B',
            vehicleType: 'bike',
            packageDescription: 'Industrial machinery parts',
            packageQualities: ['cold chain', 'perishables', 'standard'],
            optionalInstructions: 'Requires forklift for loading/unloading',
            insurance: 5,
            fee: 15.50,
            smeId: 'SME_12345',
            status: 'pending',
            dateCreated: '2024-01-20T10:30:00Z'
          },
          { 
            id: 'del32sddd5', 
            pickupLocation: '123 Warehouse Ave, District A',
            dropoffLocation: '456 Industrial Blvd, District B',
            vehicleType: 'bike',
            packageDescription: 'Industrial machinery parts',
            packageQualities: ['cold chain', 'perishables', 'standard'],
            optionalInstructions: 'Requires forklift for loading/unloading',
            insurance: 5,
            fee: 15.50,
            smeId: 'SME_12345',
            status: 'pending',
            dateCreated: '2024-01-20T10:30:00Z'
          },
          { 
            id: 'del82d', 
            pickupLocation: '123 Warehouse Ave, District A',
            dropoffLocation: '456 Industrial Blvd, District B',
            vehicleType: 'medium_car',
            packageDescription: 'Industrial machinery parts',
            packageQualities: ['cold chain', 'perishables', 'standard'],
            optionalInstructions: 'Requires forklift for loading/unloading',
            insurance: 5,
            fee: 15.50,
            smeId: 'SME_12345',
            status: 'pending',
            dateCreated: '2024-01-20T10:30:00Z'
          },
          { 
            id: 'del0989n5', 
            pickupLocation: '123 Warehouse Ave, District A',
            dropoffLocation: '456 Industrial Blvd, District B',
            vehicleType: 'medium_car',
            packageDescription: 'Industrial machinery parts',
            packageQualities: ['cold chain', 'perishables', 'standard'],
            optionalInstructions: 'Requires forklift for loading/unloading',
            insurance: 5,
            fee: 15.50,
            smeId: 'SME_12345',
            status: 'pending',
            dateCreated: '2024-01-20T10:30:00Z'
          },
          { 
            id: 'delwsdd5', 
            pickupLocation: '123 Warehouse Ave, District A',
            dropoffLocation: '456 Industrial Blvd, District B',
            vehicleType: 'truck',
            packageDescription: 'Industrial machinery parts',
            packageQualities: ['cold chain', 'perishables', 'standard'],
            optionalInstructions: 'Requires forklift for loading/unloading',
            insurance: 5,
            fee: 15.50,
            smeId: 'SME_12345',
            status: 'pending',
            dateCreated: '2024-01-20T10:30:00Z'
          },
    ],
  }
};

export const getBikeDeliveries = async (): Promise<CourierDelivery[]> => {
  try {
    const response = await apiClient.get('/deliveries/open/bike');
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for bike deliveries:', error);
    return [
        { 
            id: 'del82w9g', 
            pickupLocation: '123 Warehouse Ave, District A',
            dropoffLocation: '456 Industrial Blvd, District B',
            vehicleType: 'bike',
            packageDescription: 'Industrial machinery parts',
            packageQualities: ['cold chain', 'perishables', 'standard'],
            optionalInstructions: 'Requires forklift for loading/unloading',
            insurance: 5,
            fee: 15.50,
            smeId: 'SME_12345',
            status: 'pending',
            dateCreated: '2024-01-20T10:30:00Z'
          },
          { 
            id: 'del87900', 
            pickupLocation: '123 Warehouse Ave, District A',
            dropoffLocation: '456 Industrial Blvd, District B',
            vehicleType: 'bike',
            packageDescription: 'Industrial machinery parts',
            packageQualities: ['cold chain', 'perishables', 'standard'],
            optionalInstructions: 'Requires forklift for loading/unloading',
            insurance: 5,
            fee: 15.50,
            smeId: 'SME_12345',
            status: 'pending',
            dateCreated: '2024-01-20T10:30:00Z'
          },
          { 
            id: 'del82125', 
            pickupLocation: '123 Warehouse Ave, District A',
            dropoffLocation: '456 Industrial Blvd, District B',
            vehicleType: 'bike',
            packageDescription: 'Industrial machinery parts',
            packageQualities: ['cold chain', 'perishables', 'standard'],
            optionalInstructions: 'Requires forklift for loading/unloading',
            insurance: 5,
            fee: 15.50,
            smeId: 'SME_12345',
            status: 'pending',
            dateCreated: '2024-01-20T10:30:00Z'
          },
    ],
  }
};

export const getMediumCarDeliveries = async (): Promise<CourierDelivery[]> => {
  try {
    const response = await apiClient.get('/deliveries/open/medium_car');
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for medium car deliveries:', error);
    return [
        { 
            id: 'del87dd5', 
            pickupLocation: '123 Warehouse Ave, District A',
            dropoffLocation: '456 Industrial Blvd, District B',
            vehicleType: 'medium_car',
            packageDescription: 'Industrial machinery parts',
            packageQualities: ['cold chain', 'perishables', 'standard'],
            optionalInstructions: 'Requires forklift for loading/unloading',
            insurance: 5,
            fee: 15.50,
            smeId: 'SME_12345',
            status: 'pending',
            dateCreated: '2024-01-20T10:30:00Z'
          },
          { 
            id: 'del156d5', 
            pickupLocation: '123 Warehouse Ave, District A',
            dropoffLocation: '456 Industrial Blvd, District B',
            vehicleType: 'medium_car',
            packageDescription: 'Industrial machinery parts',
            packageQualities: ['cold chain', 'perishables', 'standard'],
            optionalInstructions: 'Requires forklift for loading/unloading',
            insurance: 5,
            fee: 15.50,
            smeId: 'SME_12345',
            status: 'pending',
            dateCreated: '2024-01-20T10:30:00Z'
          },
          { 
            id: 'del12995', 
            pickupLocation: '123 Warehouse Ave, District A',
            dropoffLocation: '456 Industrial Blvd, District B',
            vehicleType: 'medium_car',
            packageDescription: 'Industrial machinery parts',
            packageQualities: ['cold chain', 'perishables', 'standard'],
            optionalInstructions: 'Requires forklift for loading/unloading',
            insurance: 5,
            fee: 15.50,
            smeId: 'SME_12345',
            status: 'pending',
            dateCreated: '2024-01-20T10:30:00Z'
          },
    ],
  }
};

export const getTruckDeliveries = async (): Promise<CourierDelivery[]> => {
  try {
    const response = await apiClient.get('/deliveries/open/truck');
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for truck deliveries:', error);
    return [
      { 
        id: 'del12dd5', 
        pickupLocation: '123 Warehouse Ave, District A',
        dropoffLocation: '456 Industrial Blvd, District B',
        vehicleType: 'truck',
        packageDescription: 'Industrial machinery parts',
        packageQualities: ['cold chain', 'perishables', 'standard'],
        optionalInstructions: 'Requires forklift for loading/unloading',
        insurance: 5,
        fee: 15.50,
        smeId: 'SME_12345',
        status: 'pending',
        dateCreated: '2024-01-20T10:30:00Z'
      },
      { 
        id: 'del111d5', 
        pickupLocation: '123 Warehouse Ave, District A',
        dropoffLocation: '456 Industrial Blvd, District B',
        vehicleType: 'truck',
        packageDescription: 'Industrial machinery parts',
        packageQualities: ['cold chain', 'perishables', 'standard'],
        optionalInstructions: 'Requires forklift for loading/unloading',
        insurance: 5,
        fee: 15.50,
        smeId: 'SME_12345',
        status: 'pending',
        dateCreated: '2024-01-20T10:30:00Z'
      },
      { 
        id: 'del4055', 
        pickupLocation: '123 Warehouse Ave, District A',
        dropoffLocation: '456 Industrial Blvd, District B',
        vehicleType: 'truck',
        packageDescription: 'Industrial machinery parts',
        packageQualities: ['cold chain', 'perishables', 'standard'],
        optionalInstructions: 'Requires forklift for loading/unloading',
        insurance: 5,
        fee: 15.50,
        smeId: 'SME_12345',
        status: 'pending',
        dateCreated: '2024-01-20T10:30:00Z'
      },
    ];
  }
};

// ====== Accept and Progress Delivery ======

export const acceptDelivery = async (data: { deliveryId: string }): Promise<{ success: boolean; deliveryId: string; message: string }> => {
  try {
    const response = await apiClient.post(`/deliveries/accept`, data);
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for accept delivery:', error);
    return { success: true, deliveryId: data.deliveryId, message: 'Delivery accepted' };
  }
};

export const markPickupLocation = async (data: { deliveryId: string }): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post(`/deliveries/ongoing/pickup_location`, data);
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for pickup location:', error);
    return { success: true, message: 'Pickup location marked' };
  }
};

export const markDropoffLocation = async (data: { deliveryId: string }): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post(`/deliveries/ongoing/dropoff_location`, data);
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for dropoff location:', error);
    return { success: true, message: 'Dropoff location marked' };
  }
};

export const imageAtPickup = async (deliveryId: string, formData: FormData): Promise<{ success: boolean; imageUrl: string }> => {
  try {
    const response = await apiClient.post(`/deliveries/ongoing/pickup_image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for pickup image:', error);
    return { success: true, imageUrl: `https://dummyimage.com/pickup_${deliveryId}.jpg` };
  }
};

export const confirmPickup = async (data: { deliveryId: string; smsCode: string }): Promise<{ success: boolean; message: string; deliveryId: string }> => {
  try {
    const response = await apiClient.post(`/deliveries/ongoing/pickup_code`, data);
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for pickup confirmation:', error);
    return { success: true, message: 'Pickup confirmed', deliveryId: data.deliveryId };
  }
};

export const imageAtDelivery = async (deliveryId: string, formData: FormData): Promise<{ success: boolean; imageUrl: string }> => {
  try {
    const response = await apiClient.post(`/deliveries/ongoing/dropoff_image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for delivery image:', error);
    return { success: true, imageUrl: `https://dummyimage.com/delivery_${deliveryId}.jpg` };
  }
};

export const confirmDelivery = async (data: { deliveryId: string; smsCode: string }): Promise<{ success: boolean; message: string; deliveryId: string }> => {
  try {
    const response = await apiClient.post(`/deliveries/ongoing/dropoff_code`, data);
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for delivery confirmation:', error);
    return { success: true, message: 'Delivery confirmed', deliveryId: data.deliveryId };
  }
};

// ====== Courier Static Content ======

export const getCourierHistory = async (): Promise<CourierDelivery[]> => {
  try {
    const response = await apiClient.get('/deliveries/courier_history');
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for courier history:', error);
    return [
        { 
            id: 'del87dd5', 
            pickupLocation: '123 Warehouse Ave, District A',
            dropoffLocation: '456 Industrial Blvd, District B',
            vehicleType: 'truck',
            packageDescription: 'Industrial machinery parts',
            packageQualities: ['cold chain', 'perishables', 'standard'],
            optionalInstructions: 'Requires forklift for loading/unloading',
            insurance: 5,
            fee: 15.50,
            smeId: 'SME_12345',
            status: 'complete',
            dateCreated: '2024-01-20T10:30:00Z',
            rating: 4.5,
            trackerDetails: {
                confirmPickup : '2024-01-21T10:30:00Z',
                imageAtPickup: 'https://dummyimage.com/pickup_87dd5.jpg',
                confirmDelivery : '2024-01-22T10:30:00Z',
                imageAtDelivery: 'https://dummyimage.com/delivery_87dd5.jpg'    
            }
          },
    ],
  }
};

export const getCourierDeliveries = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/deliveries/courier_all');
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for courier deliveries:', error);
    return [
      { id: 'deliv1', status: 'ongoing', packageType: 'truck' },
      { id: 'deliv1', status: 'pending pickup', packageType: 'truck' },
      { id: 'deliv2', status: 'delivered', packageType: 'truck' },
    ],
  }
};

export const getCourierNotifications = async (): Promise<CourierNotification[]> => {
  try {
    const response = await apiClient.get('/courier/notifications');
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for courier notifications:', error);
    return [
      { id: 'notif1', title: 'New delivery', message: 'You have a new delivery nearby!', date: '2024-01-20T10:30:00Z', delivery_id: 'del23435' },
      { id: 'notif2', title: 'Ongoing Delivery', message: 'A delivery is pending pick up', date: '2024-01-20T10:30:00Z', delivery_id: 'del23435'},
      { id: 'notif3', title: 'Ongoing Delivery', message: "you've arrived at pickup location!", date: '2024-01-20T10:30:00Z', delivery_id: 'del23435'},
    ],
  }
};

// ====== Courier Profile ======

export const getProfile = async (): Promise<CourierProfile> => {
  try {
    const response = await apiClient.get('/courier/profile');
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for courier profile:', error);
    return {
      id: 'courier001',
      name: 'Jane Doe',
      phone: '+123456789',
      vehicleType: 'Motorbike',
      paymentDetails: { bankName: 'Global Bank', accountNumber: '987654321' },
    },
  }
};

export const updatePaymentDetails = async (paymentData: { type: string; bankName: string; accountNumber: string }): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.patch('/courier/profile/payment', paymentData);
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for payment update:', error);
    return { success: true, message: 'Payment details updated successfully' };
  }
};

export const updateProfile = async (profileData: { 
  vehicleCapacity?: string;
  vehicleType?: string; 
  vehicleInsuranceCompany?: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.patch('/courier/profile', profileData);
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for profile update:', error);
    return { success: true, message: 'Profile updated successfully' };
  }
};

export const getCourierReviews = async (): Promise<CourierReview[]> => {
  try {
    const response = await apiClient.get('/courier/reviews');
    return response.data;
  } catch (error) {
    console.warn('API unavailable, using mock data for courier reviews:', error);
    return [
      { id: 'review1', rating: 4, comment: 'Great service!', date: '2025-04-24' },
      { id: 'review2', rating: 5, comment: 'Excellent courier!', date: '2025-04-25' },
    ],
  }
};
