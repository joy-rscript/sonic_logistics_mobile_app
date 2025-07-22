import apiClient from './apiClient';

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
  apiClient.get('/deliveries/ongoing');
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
          
          }
    ],
  };
};


export const getSMEHistory = () => {
  apiClient.get('/deliveries/history');
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
};

// Get the current SME profile
export const getSMEProfile = () => {
    apiClient.get('/profile/sme');
    return {
        data: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        business_name: 'Logistics Pro Inc.',
        business_address: '123 Commerce Street, Industrial Zone, City A',
        business_phone: '+1234567890',
        business_website: 'https://logisticspro.example.com',
        business_industry: 'Transportation and Logistics',
        tax_id: 'TAX-987654321',
        },
      };
  };
  
  // Update SME profile
  export const updateSMEProfile = (data: {
    business_name?: string;
    business_address?: string;
    business_phone?: string; 
    business_website?: string;
    business_industry?: string;
    tax_id?: string;
  }) => {
    apiClient.put('/profile/sme', data);
    return {
        data: {
            success: true,
            message: 'profile updated successfully!',
            status: 'OK',
          },
    }
  };
  
 
  
