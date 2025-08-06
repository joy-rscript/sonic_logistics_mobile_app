import apiClient from './apiClient';

// ============ SME Profile Management ============

export const getSMEProfile = async () => {
  try {
    const response = await apiClient.get('/profile/sme');
    return response;
  } catch (error) {
    console.warn('SME profile API unavailable, using mock data:', error);
    return {
      data: {
        id: 'sme_003',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+254712345678',
        business_name: 'TechCorp Solutions',
        business_address: '123 Commerce Street, Industrial Zone, Nairobi',
        business_phone: '+254712345678',
        business_website: 'https://techcorp.co.ke',
        business_industry: 'Technology',
        tax_id: 'TAX-987654321',
      },
    };
  }
};

export const updateSMEProfile = async (data: {
  business_name?: string;
  business_address?: string;
  business_phone?: string; 
  business_website?: string;
  business_industry?: string;
  tax_id?: string;
}) => {
  try {
    const response = await apiClient.put('/profile/sme', data);
    return response;
  } catch (error) {
    console.warn('SME profile update API unavailable, using mock data:', error);
    return {
      data: {
        success: true,
        message: 'Profile updated successfully!',
        status: 'OK',
      },
    };
  }
};

// ============ SME Delivery Actions ============

export const createDelivery = (data: {
  pickupLocation: string;
  dropoffLocation: string;
  vehicleType: string;
  packageDescription: string;
  packageQualities: string[];
  optionalInstructions: string;
  insurance: boolean;
}) => {
  apiClient.post('sme/create', data);
  return {
    data: {
      success: true,
      deliveryId: 'del_12345',
      message: 'Delivery created successfully',
    },
  };
};

export const startPayment = (data: {
  deliveryId: string;
  standardFee: number;
  premium: number;
  totalAmount: number;
  paymentMethod: string;
}) => {
  apiClient.post('sme/pay', data);
  return {
    data: {
      success: true,
      transactionRef: 'txn_67890', //txn
      paymentGatewayUrl: 'https://dummy-payment-gateway.com/pay?txn=txn_67890',
      message: 'Payment initiated. Complete payment and verify with OTP.',
    },
  };
};

export const verifyPayment = (data: { transactionRef: string; otp: string }) => {
  apiClient.post('/sme/verify-payment', data);
  return {
    data: {
      success: true,
      message: 'Payment verified successfully!',
      deliveryStatus: 'payment_confirmed',
    },
  };
};

export const calculateFare = (data: {
  pickupLocation: string;
  dropoffLocation: string;
  vehicleType: string;
}) => {
  apiClient.post('/deliveries/calculate-fare', data);
  return {
    data: {
      estimatedFare: 50.0,
      distanceKm: 12.3,
      timeMinutes: 25,
    },
  };
};

export const getSMEDeliveries = () => {
  try {
    const response = apiClient.get('/deliveries/ongoing');
    return response;
  } catch (error) {
    console.warn('SME deliveries API unavailable, using mock data:', error);
    return {
      data: [
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
                  courierId: 'COURIER_12345',
                  status: 'ongoing',
                  dateCreated: '2024-01-20T10:30:00Z',
                  rating: 4.5,
                  trackerDetails: {
                    confirmPickup: '2024-01-21T10:30:00Z',
                    imageAtPickup: 'https://dummyimage.com/pickup_del87dd5.jpg',
                    actualPickupLocation: { 
                      lat: 37.7749, 
                      lng: -122.4194 
                    }, // real-time GPS of pickup not exact to th stated delivery location 
                    confirmDelivery: '',
                    imageAtDelivery: '',
                   
                  },
            
               
            
            },
      ],
    };
  }
                pickupLocation: '123 Warehouse Ave, District A',
                dropoffLocation: '456 Industrial Blvd, District B',
                vehicleType: 'truck',
                packageDescription: 'Industrial machinery parts',
                packageQualities: ['cold chain', 'perishables', 'standard'],
                optionalInstructions: 'Requires forklift for loading/unloading',
                insurance: 5,
                fee: 15.50,
                courierId: 'COURIER_12345',
                status: 'ongoing',
                dateCreated: '2024-01-20T10:30:00Z',
                rating: 4.5,
                trackerDetails: {
                  confirmPickup: '2024-01-21T10:30:00Z',
                  imageAtPickup: 'https://dummyimage.com/pickup_del87dd5.jpg',
                  actualPickupLocation: { 
                    lat: 37.7749, 
                    lng: -122.4194 
                  }, // real-time GPS of pickup not exact to th stated delivery location 
                  confirmDelivery: '',
                  imageAtDelivery: '',
                 
                },
          
          }
    ],
  };
};


export const getSMEHistory = () => {
  try {
    const response = apiClient.get('/deliveries/history');
    return response;
  } catch (error) {
    console.warn('SME history API unavailable, using mock data:', error);
    return {
      data: [
        { 
            id: 'del8567dd5', 
            pickupLocation: '123 Warehouse Ave, District A',
            dropoffLocation: '456 Industrial Blvd, District B',
            vehicleType: 'truck',
            packageDescription: 'Industrial machinery parts',
            packageQualities: ['cold chain', 'perishables', 'standard'],
            optionalInstructions: 'Requires forklift for loading/unloading',
            insurance: 5,
            fee: 15.50,
            courierId: 'COURIER_12345',
            status: 'complete',
            dateCreated: '2024-01-20T10:30:00Z',
            rating: 4.5,
            trackerDetails: {
              confirmPickup: '2024-01-21T10:30:00Z',
              imageAtPickup: 'https://dummyimage.com/pickup_del87dd5.jpg',
              actualPickupLocation: { 
                lat: 37.7749, 
                lng: -122.4194 
              }, 
              confirmDelivery: '2024-01-22T10:30:00Z',
              imageAtDelivery: 'https://dummyimage.com/delivery_del87dd5.jpg',
              actualDropoffLocation: { 
                lat: 37.8044, 
                lng: -122.2711 
              },
            },
          },
          { 
            id: 'del83435', 
            pickupLocation: '123 Warehouse Ave, District A',
            dropoffLocation: '456 Industrial Blvd, District B',
            vehicleType: 'truck',
            packageDescription: 'Industrial machinery parts',
            packageQualities: ['cold chain', 'perishables', 'standard'],
            optionalInstructions: 'Requires forklift for loading/unloading',
            insurance: 5,
            fee: 15.50,
            courierId: 'COURIER_12345',
            status: 'complete',
            dateCreated: '2024-01-20T10:30:00Z',
            rating: 4.5,
            trackerDetails: {
              confirmPickup: '2024-01-21T10:30:00Z',
              imageAtPickup: 'https://dummyimage.com/pickup_del87dd5.jpg',
              actualPickupLocation: { 
                lat: 37.7749, 
                lng: -122.4194 
              }, 
              confirmDelivery: '2024-01-22T10:30:00Z',
              imageAtDelivery: 'https://dummyimage.com/delivery_del87dd5.jpg',
              actualDropoffLocation: { 
                lat: 37.8044, 
                lng: -122.2711 
              }, 
            },
          },
      ],
    };
  }
};


// ============ SME Notifications ============

export const getSMENotifications = async () => {
  try {
    const response = await apiClient.get('/notifications/sme');
    return response;
  } catch (error) {
    console.warn('SME notifications API unavailable, using mock data:', error);
    return {
      data: [
        {
          id: '1',
          title: 'Delivery Accepted',
          message: 'Your delivery request has been accepted by Martin Lawrence.',
          type: 'delivery',
          read: false,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          deliveryId: 'sme1',
        },
        {
          id: '2',
          title: 'Payment Processed',
          message: 'Your payment for delivery #SME1 has been processed successfully.',
          type: 'update',
          read: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: '3',
          title: 'Delivery Completed',
          message: 'Your package has been successfully delivered to Karen Shopping Centre.',
          type: 'delivery',
          read: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          deliveryId: 'sme2',
        },
      ],
    };
  }
};