import apiClient from './apiClient'; // Assuming you have one setup

export const signup = (data: {
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
}) =>
  apiClient.post('/auth/signup', data);

export const courierOnboarding = (data: { 
    driving_license_no: string; 
    vehicle_type: string; 
    insurance_company: string; 
    vehicle_capacity: string}) =>   
    apiClient.post('/auth/courier-onboarding', data);

export const smeOnboarding = (data: {
    business_name: string;
    business_address: string;
    business_phone: string;
    business_website: string;
    business_industry: string;
    tax_id: string}) => 
        apiClient.post('/auth/sme-onboarding', data);
    
export const login = (data: { email: string; password: string }) =>
  apiClient.post('/auth/login', data);


export const verifyCode = (data: { code: string }) =>
  apiClient.post('/auth/verify-code', data);

export const fetchProfile = () =>
  apiClient.get('/auth/profile');