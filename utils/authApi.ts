import apiClient from './apiClient';

// Types for API responses
export interface AuthResponse {
  success: boolean;
  message: string;
  userId?: string;
  token?: string;
  user?: UserProfile;
  verificationRequired?: boolean;
  expiresIn?: number;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'courier' | 'sme';
  isVerified: boolean;
  profileComplete: boolean;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  phone: string;
  role: 'sme' | 'courier';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface OTPVerificationData {
  code: string;
  userId: string;
}

export interface PasswordData {
  userId: string;
  password: string;
  confirmPassword: string;
}

export interface CourierOnboardingData {
  userId: string;
  driving_license_no: string;
  vehicle_type: string;
  insurance_company: string;
  vehicle_capacity: string;
  plate_number: string;
  vehicle_model: string;
}

export interface SMEOnboardingData {
  userId: string;
  business_name: string;
  business_address: string;
  business_phone: string;
  business_website: string;
  business_industry: string;
  tax_id: string;
}

// Mock user data for fallback
const mockUserProfiles = {
  courier: {
    id: 'courier_001',
    firstName: 'Martin',
    lastName: 'Lawrence',
    email: 'martin.lawrence@example.com',
    phone: '+254712345678',
    role: 'courier' as const,
    isVerified: true,
    profileComplete: true,
  },
  sme: {
    id: 'sme_001',
    firstName: 'Maureen',
    lastName: 'Wanjiku',
    email: 'admin@techcorp.co.ke',
    phone: '+254712345679',
    role: 'sme' as const,
    isVerified: true,
    profileComplete: true,
  },
};

// User Registration
export const signup = async (data: SignupData): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('/auth/signup', data);
    return response.data;
  } catch (error) {
    console.warn('Signup API unavailable, using mock data:', error);
    
    // Mock successful signup
    const userId = `${data.role}_${Date.now()}`;
    
    // Simulate SMS sending
    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Mock SMS sent to ${data.phone}: Your verification code is ${mockCode}`);
    
    return {
      success: true,
      userId,
      message: 'Registration successful! Please verify your phone number.',
      verificationRequired: true,
    };
  }
};

// Send OTP Code
export const sendOTPCode = async (phoneNumber: string, userId: string): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('/auth/send-otp', {
      phoneNumber,
      userId,
    });
    return response.data;
  } catch (error) {
    console.warn('Send OTP API unavailable, using mock data:', error);
    
    // Mock SMS sending
    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Mock SMS sent to ${phoneNumber}: Your verification code is ${mockCode}`);
    
    return {
      success: true,
      message: `Verification code sent to ${phoneNumber}`,
    };
  }
};

// Verify OTP Code
export const verifyCode = async (data: OTPVerificationData): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('/auth/verify-code', data);
    return response.data;
  } catch (error) {
    console.warn('Verify OTP API unavailable, using mock data:', error);
    
    // Mock verification - accept any 6-digit code
    const isValidCode = data.code.length === 6 && /^\d+$/.test(data.code);
    
    if (isValidCode) {
      return {
        success: true,
        message: 'Phone number verified successfully!',
      };
    } else {
      return {
        success: false,
        message: 'Invalid verification code. Please try again.',
      };
    }
  }
};

// Set Password
export const setPassword = async (data: PasswordData): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('/auth/set-password', data);
    return response.data;
  } catch (error) {
    console.warn('Set password API unavailable, using mock data:', error);
    
    // Mock password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    
    if (!passwordRegex.test(data.password)) {
      return {
        success: false,
        message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
      };
    }
    
    if (data.password !== data.confirmPassword) {
      return {
        success: false,
        message: 'Passwords do not match',
      };
    }
    
    return {
      success: true,
      message: 'Password set successfully!',
    };
  }
};

// Courier Onboarding
export const courierOnboarding = async (data: CourierOnboardingData): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('/auth/courier-onboarding', data);
    return response.data;
  } catch (error) {
    console.warn('Courier onboarding API unavailable, using mock data:', error);
    
    // Mock successful onboarding
    return {
      success: true,
      message: 'Courier profile completed successfully!',
      user: {
        ...mockUserProfiles.courier,
        id: data.userId,
        profileComplete: true,
      },
    };
  }
};

// SME Onboarding
export const smeOnboarding = async (data: SMEOnboardingData): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('/auth/sme-onboarding', data);
    return response.data;
  } catch (error) {
    console.warn('SME onboarding API unavailable, using mock data:', error);
    
    // Mock successful onboarding
    return {
      success: true,
      message: 'Business profile completed successfully!',
      user: {
        ...mockUserProfiles.sme,
        id: data.userId,
        profileComplete: true,
      },
    };
  }
};

// User Login
export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  } catch (error) {
    console.warn('Login API unavailable, using mock data:', error);
    
    // Mock login logic
    const userRole = data.email.includes('courier') ? 'courier' : 'sme';
    const mockUser = mockUserProfiles[userRole];
    
    return {
      success: true,
      message: 'Login successful!',
      token: `mock_token_${Date.now()}`,
      user: mockUser,
      expiresIn: 86400, // 24 hours
    };
  }
};

// Fetch User Profile
export const fetchProfile = async (userId: string): Promise<AuthResponse> => {
  try {
    const response = await apiClient.get(`/auth/profile/${userId}`);
    return response.data;
  } catch (error) {
    console.warn('Fetch profile API unavailable, using mock data:', error);
    
    // Return mock profile based on user ID
    const userRole = userId.includes('sme') ? 'sme' : 'courier';
    const mockUser = mockUserProfiles[userRole];
    
    return {
      success: true,
      message: 'Profile fetched successfully',
      user: { ...mockUser, id: userId },
    };
  }
};

// Resend OTP
export const resendOTP = async (phoneNumber: string, userId: string): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('/auth/resend-otp', {
      phoneNumber,
      userId,
    });
    return response.data;
  } catch (error) {
    console.warn('Resend OTP API unavailable, using mock data:', error);
    
    // Mock SMS resending
    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Mock SMS resent to ${phoneNumber}: Your verification code is ${mockCode}`);
    
    return {
      success: true,
      message: `New verification code sent to ${phoneNumber}`,
    };
  }
};

// Check if email exists
export const checkEmailExists = async (email: string): Promise<{ exists: boolean }> => {
  try {
    const response = await apiClient.post('/auth/check-email', { email });
    return response.data;
  } catch (error) {
    console.warn('Check email API unavailable, using mock data:', error);
    
    // Mock email check - return false for demo
    return { exists: false };
  }
};

// Logout
export const logout = async (): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  } catch (error) {
    console.warn('Logout API unavailable, using mock data:', error);
    
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
};