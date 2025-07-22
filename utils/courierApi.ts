import apiClient from './apiClient';

// ====== Open Deliveries ======

export const getOpenDeliveries = () => {
  apiClient.get('/deliveries/open');
  return {
    data: [
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
  };
};

export const getBikeDeliveries = () => {
  apiClient.get('/deliveries/open/bike');
  return {
    data: [
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
  };
};

export const getMediumCarDeliveries = () => {
  apiClient.get('/deliveries/open/medium_car');
  return {
    data: [
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
  };
};

export const getTruckDeliveries = () => {
  apiClient.get('/deliveries/open/truck');
  return {
    data: [
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
    ],  };
};

// ====== Accept and Progress Delivery ======

export const acceptDelivery = (data: { deliveryId: string }) => {
  apiClient.post(`/deliveries/accept`, data);
  return {
    data: { success: true, deliveryId: data.deliveryId, message: 'Delivery accepted' },
  };
};

export const markPickupLocation = (data: { deliveryId: string }) => {
  apiClient.post(`/deliveries/ongoing/pickup_location`, data);
  return {
    data: { success: true, message: 'Pickup location marked' },
  };
};

export const markDropoffLocation = (data: { deliveryId: string }) => {
  apiClient.post(`/deliveries/ongoing/dropoff_location`, data);
  return {
    data: { success: true, message: 'Dropoff location marked' },
  };
};

export const imageAtPickup = (deliveryId: string, formData: FormData) => {
  apiClient.post(`/deliveries/ongoing/pickup_image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return {
    data: { success: true, imageUrl: `https://dummyimage.com/pickup_${deliveryId}.jpg` },
  };
};

export const confirmPickup = (data: { deliveryId: string; smsCode: string }) => {
    apiClient.post(`/deliveries/ongoing/pickup_code`, data);
    return {
      data: { success: true, message: 'Pickup confirmed', deliveryId: data.deliveryId },
    };
  };

export const imageAtDelivery = (deliveryId: string, formData: FormData) => {
  apiClient.post(`/deliveries/ongoing/dropoff_image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return {
    data: { success: true, imageUrl: `https://dummyimage.com/delivery_${deliveryId}.jpg` },
  };
};

export const confirmDelivery = (data: { deliveryId: string; smsCode: string }) => {
    apiClient.post(`/deliveries/ongoing/dropoff_code`, data);
    return {
      data: { success: true, message: 'Delivery confirmed', deliveryId: data.deliveryId },
    };
  };

// ====== Courier Static Content ======

export const getCourierHistory = () => {
  apiClient.get('/deliveries/courier_history');
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
  };
};

export const getCourierDeliveries = () => {
  apiClient.get('/deliveries/courier_all');
  return {
    data: [
      { id: 'deliv1', status: 'ongoing', packageType: 'truck' },
      { id: 'deliv1', status: 'pending pickup', packageType: 'truck' },
      { id: 'deliv2', status: 'delivered', packageType: 'truck' },
    ],
  };
};

export const getCourierNotifications = () => {
  apiClient.get('/courier/notifications');
  return {
    data: [
      { id: 'notif1', title: 'New delivery', message: 'You have a new delivery nearby!', date: '2024-01-20T10:30:00Z', delivery_id: 'del23435' },
      { id: 'notif2', title: 'Ongoing Delivery', message: 'A delivery is pending pick up', date: '2024-01-20T10:30:00Z', delivery_id: 'del23435'},
      { id: 'notif3', title: 'Ongoing Delivery', message: "you've arrived at pickup location!", date: '2024-01-20T10:30:00Z', delivery_id: 'del23435'},
    ],
  };
};

// ====== Courier Profile ======

export const getProfile = () => {
  apiClient.get('/courier/profile');
  return {
    data: {
      id: 'courier001',
      name: 'Jane Doe',
      phone: '+123456789',
      vehicleType: 'Motorbike',
      paymentDetails: { bankName: 'Global Bank', accountNumber: '987654321' },
    },
  };
};

export const updatePaymentDetails = (paymentData: { type: string; bankName: string; accountNumber: string }) => {
  apiClient.patch('/courier/profile/payment', paymentData);
  return {
    data: { success: true, message: 'Payment details updated successfully' },
  };
};

export const updateProfile = (
    profileData: { vehicleCapacity?: string;
         vehicleType?: string , 
         vehicleInsuranceCompany?:string}) => {
  apiClient.patch('/courier/profile', profileData);
  return {
    data: { success: true, message: 'Profile updated successfully' },
  };
};

export const getCourierReviews = () => {
  apiClient.get('/courier/reviews');
  return {
    data: [
      { id: 'review1', rating: 4, comment: 'Great service!', date: '2025-04-24' },
      { id: 'review2', rating: 5, comment: 'Excellent courier!', date: '2025-04-25' },
    ],
  };
};
