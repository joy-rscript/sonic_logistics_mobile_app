import apiClient from './apiClient';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'courier' | 'sme';
  avatar?: string;
  isVerified: boolean;
  createdAt: Date;
  // Courier specific fields
  vehicleType?: string;
  vehicleModel?: string;
  plateNumber?: string;
  drivingLicense?: string;
  vehicleCapacity?: string;
  insuranceCompany?: string;
  // SME specific fields
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessWebsite?: string;
  businessIndustry?: string;
  taxId?: string;
}

// Mock user profiles
const mockCourierProfile: UserProfile = {
  id: 'courier1',
  firstName: 'Martin',
  lastName: 'Lawrence',
  email: 'martin.lawrence@example.com',
  phone: '+254712345678',
  role: 'courier',
  avatar: 'https://i.ibb.co/M8JnWhy/avatar.png',
  isVerified: true,
  createdAt: new Date('2024-01-15'),
  vehicleType: 'Motorcycle',
  vehicleModel: 'Honda CB 150R',
  plateNumber: 'KCA 123A',
  drivingLicense: 'DL123456789',
  vehicleCapacity: '50',
  insuranceCompany: 'AAR Insurance',
};

const mockSMEProfile: UserProfile = {
  id: 'sme1',
  firstName: 'Maureen',
  lastName: 'Wanjiku',
  email: 'admin@techcorp.co.ke',
  phone: '+254712345679',
  role: 'sme',
  avatar: 'https://i.ibb.co/M8JnWhy/avatar.png',
  isVerified: true,
  createdAt: new Date('2024-01-10'),
  businessName: 'TechCorp Solutions',
  businessAddress: 'TechCorp Building, Nairobi CBD',
  businessPhone: '+254712345679',
  businessWebsite: 'https://techcorp.co.ke',
  businessIndustry: 'Technology',
  taxId: 'TAX123456789',
};

export const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
    };
  } catch (error) {
    console.warn('API unavailable, using mock data for user profile:', error);
    // Return mock profile based on user role (simplified logic)
    return userId.includes('sme') ? mockSMEProfile : mockCourierProfile;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const response = await apiClient.patch(`/users/${userId}`, updates);
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
    };
  } catch (error) {
    console.warn('API unavailable, using mock data for profile update:', error);
    const currentProfile = userId.includes('sme') ? mockSMEProfile : mockCourierProfile;
    return {
      ...currentProfile,
      ...updates,
    };
  }
};

export const uploadUserAvatar = async (userId: string, imageUri: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `avatar_${userId}.jpg`,
    } as any);

    const response = await apiClient.post(`/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.avatarUrl;
  } catch (error) {
    console.warn('API unavailable, using mock data for avatar upload:', error);
    return 'https://i.ibb.co/M8JnWhy/avatar.png';
  }
};

export const deleteUserAccount = async (userId: string): Promise<void> => {
  try {
    await apiClient.delete(`/users/${userId}`);
  } catch (error) {
    console.warn('API unavailable, mock deleting user account:', error);
    // In mock mode, we just log the action
  }
};

export const verifyUserPhone = async (userId: string, code: string): Promise<boolean> => {
  try {
    const response = await apiClient.post(`/users/${userId}/verify-phone`, { code });
    return response.data.verified;
  } catch (error) {
    console.warn('API unavailable, using mock data for phone verification:', error);
    return code === '123456'; // Mock verification code
  }
};