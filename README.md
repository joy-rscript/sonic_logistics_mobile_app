# Sonic Africa Logistics - Backend API Documentation

## Overview

This document provides comprehensive API specifications for the Sonic Africa Logistics delivery system. The APIs support both SME (Small and Medium Enterprises) and Courier workflows with real-time tracking, payment processing, and communication features.

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Delivery Management APIs](#delivery-management-apis)
3. [Payment Processing APIs](#payment-processing-apis)
4. [User Management APIs](#user-management-apis)
5. [Chat & Messaging APIs](#chat--messaging-apis)
6. [Notification APIs](#notification-apis)
7. [Courier-Specific APIs](#courier-specific-apis)
8. [SME-Specific APIs](#sme-specific-apis)
9. [Data Models](#data-models)
10. [Error Handling](#error-handling)

---

## Authentication APIs

### 1. User Registration
```typescript
POST /auth/signup
```
**Purpose**: Register new users (SME or Courier)
**Parameters**:
```typescript
{
  firstName: string;
  lastName: string;
  phone: string;
  role: 'sme' | 'courier';
}
```

**Returns**:
```typescript
{
  success: boolean;
  userId: string;
  message: string;
  verificationRequired: boolean;
}
```

### 2. User Login
```typescript
POST /auth/login
```

**Purpose**: Authenticate existing users

**Parameters**:
```typescript
{
  email: string;
  password: string;
}
```

**Returns**:
```typescript
{
  success: boolean;
  token: string;
  user: UserProfile;
  expiresIn: number;
}
```

### 3. OTP Verification
```typescript
POST /auth/verify-code
```

**Purpose**: Verify phone number with OTP code

**Parameters**:
```typescript
{
  code: string;
  userId: string;
}
```

**Returns**:
```typescript
{
  success: boolean;
  verified: boolean;
  message: string;
}
```

### 4. Courier Onboarding
```typescript
POST /auth/courier-onboarding
```

**Purpose**: Complete courier profile with vehicle information

**Parameters**:
```typescript
{
  driving_license_no: string;
  vehicle_type: string;
  insurance_company: string;
  vehicle_capacity: string;
}
```

**Returns**:
```typescript
{
  success: boolean;
  message: string;
  profileComplete: boolean;
}
```

### 5. SME Onboarding
```typescript
POST /auth/sme-onboarding
```

**Purpose**: Complete SME profile with business information

**Parameters**:
```typescript
{
  business_name: string;
  business_address: string;
  business_phone: string;
  business_website: string;
  business_industry: string;
  tax_id: string;
}
```

**Returns**:
```typescript
{
  success: boolean;
  message: string;
  profileComplete: boolean;
}
```

---

## Delivery Management APIs

### 1. Create Delivery Request
```typescript
POST /deliveries/create
```

**Purpose**: SME creates a new delivery request

**Parameters**:
```typescript
{
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
  pickupCord: Coordinates;
  dropoffCord: Coordinates;
  pickupLocation: string;
  dropoffLocation: string;
  estimate: string;
  status: 'pending';
}
```

**Returns**:
```typescript
{
  success: boolean;
  deliveryId: string;
  message: string;
  deliveryRequest: DeliveryRequest;
}
```

### 2. Compute Delivery Charges
```typescript
POST /deliveries/compute-charges
```

**Purpose**: Calculate delivery charges based on package and route details

**Parameters**:
```typescript
{
  packageWeight: string;
  courierCapacity: string;
  insurance: boolean;
  itemValue: string;
  valueRange: number;
  vehicleType: string;
  pickupCord: Coordinates;
  dropoffCord: Coordinates;
}
```

**Returns**:
```typescript
{
  charges: number;
  delayPayment: boolean; // true if SME can pay later
  breakdown: {
    basePrice: number;
    distanceCharge: number;
    weightCharge: number;
    insuranceCharge: number;
    premiumCharge: number;
  };
}
```

### 3. Fetch Available Deliveries
```typescript
GET /deliveries/available
```

**Purpose**: Get all pending delivery requests for couriers

**Parameters**: None (uses authentication token)

**Returns**:
```typescript
{
  success: boolean;
  deliveries: DeliveryRequest[];
  count: number;
}
```

### 4. Accept Delivery Request
```typescript
POST /deliveries/accept
```

**Purpose**: Courier accepts a delivery request

**Parameters**:
```typescript
{
  deliveryId: string;
  courierId: string;
}
```

**Returns**:
```typescript
{
  success: boolean;
  message: string;
  delivery: DeliveryRequest;
}
```

### 5. Update Delivery Status
```typescript
PATCH /deliveries/{deliveryId}
```

**Purpose**: Update delivery progress and tracking information

**Parameters**:
```typescript
{
  tracker?: {
    pickup?: 'pending' | 'in_progress' | 'completed';
    pickupCode?: string;
    pickupImage?: string;
    dropoff?: 'pending' | 'in_progress' | 'completed';
    dropoffCode?: string;
    dropoffImage?: string;
  };
  driverLocation?: Coordinates;
  status?: 'pending' | 'accepted' | 'in_progress' | 'completed';
}
```

**Returns**:
```typescript
{
  success: boolean;
  message: string;
  delivery: DeliveryRequest;
}
```

### 6. Upload Delivery Image
```typescript
POST /deliveries/upload-image
```

**Purpose**: Upload pickup or delivery confirmation images

**Parameters**:
```typescript
FormData {
  image: File;
  deliveryId: string;
  type: 'pickup' | 'dropoff';
}
```

**Returns**:
```typescript
{
  success: boolean;
  imageUrl: string;
  message: string;
}
```

### 7. Verify Delivery Code
```typescript
POST /deliveries/verify-code
```

**Purpose**: Verify SMS codes for pickup/delivery confirmation

**Parameters**:
```typescript
{
  deliveryId: string;
  code: string;
  type: 'pickup' | 'dropoff';
}
```

**Returns**:
```typescript
{
  success: boolean;
  verified: boolean;
  message: string;
}
```

### 8. Delete Delivery Request
```typescript
DELETE /deliveries/{deliveryId}
```

**Purpose**: SME deletes their own delivery request

**Parameters**:
```typescript
{
  smeId: string; // for validation
}
```

**Returns**:
```typescript
{
  success: boolean;
  message: string;
}
```

### 9. Fetch Courier Deliveries
```typescript
GET /deliveries/courier/{courierId}
```

**Purpose**: Get all deliveries assigned to a specific courier

**Parameters**: `courierId` in URL path

**Returns**:
```typescript
{
  success: boolean;
  deliveries: DeliveryRequest[];
  ongoing: DeliveryRequest[];
  completed: DeliveryRequest[];
}
```

### 10. Fetch SME Deliveries
```typescript
GET /deliveries/sme/{smeId}
```

**Purpose**: Get all delivery requests created by an SME

**Parameters**: `smeId` in URL path

**Returns**:
```typescript
{
  success: boolean;
  deliveries: DeliveryRequest[];
  pending: DeliveryRequest[];
  active: DeliveryRequest[];
  completed: DeliveryRequest[];
}
```

---

## Payment Processing APIs

### 1. Process Payment
```typescript
POST /payments/process
```

**Purpose**: Process payment for delivery requests

**Parameters**:
```typescript
{
  deliveryRequestId: string;
  amount: number;
  method: 'card' | 'mobile_money' | 'bank_transfer';
  smeId: string;
  provider?: 'mpesa' | 'airtel' | 'tkash'; // for mobile money
}
```

**Returns**:
```typescript
{
  success: boolean;
  transactionId: string;
  paymentGatewayUrl?: string; // for redirects
  message: string;
}
```

### 2. Verify Payment
```typescript
POST /payments/verify
```

**Purpose**: Verify payment status from payment gateway

**Parameters**:
```typescript
{
  transactionId: string;
  deliveryRequestId: string;
}
```

**Returns**:
```typescript
{
  success: boolean;
  verified: boolean;
  paymentStatus: 'pending' | 'completed' | 'failed';
  message: string;
}
```

---

## User Management APIs

### 1. Fetch User Profile
```typescript
GET /users/{userId}
```

**Purpose**: Get detailed user profile information

**Parameters**: `userId` in URL path

**Returns**:
```typescript
{
  success: boolean;
  user: UserProfile;
}
```

### 2. Update User Profile
```typescript
PATCH /users/{userId}
```

**Purpose**: Update user profile information

**Parameters**:
```typescript
{
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  // Courier specific
  vehicleType?: string;
  vehicleModel?: string;
  plateNumber?: string;
  // SME specific
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
}
```

**Returns**:
```typescript
{
  success: boolean;
  user: UserProfile;
  message: string;
}
```

### 3. Upload User Avatar
```typescript
POST /users/{userId}/avatar
```

**Purpose**: Upload user profile picture

**Parameters**:
```typescript
FormData {
  avatar: File;
}
```

**Returns**:
```typescript
{
  success: boolean;
  avatarUrl: string;
  message: string;
}
```

---

## Chat & Messaging APIs

### 1. Fetch User Chats
```typescript
GET /chats/user/{userId}
```

**Purpose**: Get all chat conversations for a user

**Parameters**: `userId` in URL path

**Returns**:
```typescript
{
  success: boolean;
  chats: Chat[];
}
```

### 2. Fetch Chat Messages
```typescript
GET /chats/{chatId}/messages
```

**Purpose**: Get messages for a specific chat

**Parameters**: 
- `chatId` in URL path
- Query params: `page`, `limit`

**Returns**:
```typescript
{
  success: boolean;
  messages: ChatMessage[];
  hasMore: boolean;
  totalCount: number;
}
```

### 3. Send Message
```typescript
POST /chats/{chatId}/messages
```

**Purpose**: Send a new message in a chat

**Parameters**:
```typescript
{
  senderId: string;
  message: string;
  type: 'text' | 'image' | 'location';
  imageUrl?: string; // for image messages
  location?: {
    latitude: number;
    longitude: number;
  }; // for location messages
}
```

**Returns**:
```typescript
{
  success: boolean;
  message: ChatMessage;
}
```

### 4. Mark Messages as Read
```typescript
PATCH /chats/{chatId}/read
```

**Purpose**: Mark messages as read by a user

**Parameters**:
```typescript
{
  userId: string;
}
```

**Returns**:
```typescript
{
  success: boolean;
  message: string;
}
```

### 5. Create or Get Chat
```typescript
POST /chats
```

**Purpose**: Create a new chat or get existing chat between participants

**Parameters**:
```typescript
{
  participants: string[];
  deliveryId?: string;
}
```

**Returns**:
```typescript
{
  success: boolean;
  chat: Chat;
  isNew: boolean;
}
```

### 6. Upload Chat Image
```typescript
POST /chats/{chatId}/upload-image
```

**Purpose**: Upload image for chat message

**Parameters**:
```typescript
FormData {
  image: File;
}
```

**Returns**:
```typescript
{
  success: boolean;
  imageUrl: string;
  message: string;
}
```

---

## Notification APIs

### 1. Fetch Notifications
```typescript
GET /notifications/{userId}
```

**Purpose**: Get all notifications for a user

**Parameters**: `userId` in URL path

**Returns**:
```typescript
{
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
}
```

### 2. Mark Notification as Read
```typescript
PATCH /notifications/{notificationId}/read
```

**Purpose**: Mark a specific notification as read

**Parameters**: `notificationId` in URL path

**Returns**:
```typescript
{
  success: boolean;
  message: string;
}
```

### 3. Create Notification
```typescript
POST /notifications
```

**Purpose**: Create a new notification for a user

**Parameters**:
```typescript
{
  title: string;
  message: string;
  type: 'delivery' | 'update' | 'system';
  userId: string;
  deliveryId?: string;
}
```

**Returns**:
```typescript
{
  success: boolean;
  notification: Notification;
  message: string;
}
```

### 4. Delete Notification
```typescript
DELETE /notifications/{notificationId}
```

**Purpose**: Delete a notification

**Parameters**: `notificationId` in URL path

**Returns**:
```typescript
{
  success: boolean;
  message: string;
}
```

---

## Courier-Specific APIs

### 1. Get Open Deliveries
```typescript
GET /deliveries/open
```

**Purpose**: Get all available delivery requests for couriers

**Returns**:
```typescript
{
  success: boolean;
  deliveries: DeliveryRequest[];
  count: number;
}
```

### 2. Get Deliveries by Vehicle Type
```typescript
GET /deliveries/open/{vehicleType}
```

**Purpose**: Get deliveries filtered by vehicle type

**Parameters**: `vehicleType` in URL path (`bike`, `medium_car`, `truck`)

**Returns**:
```typescript
{
  success: boolean;
  deliveries: DeliveryRequest[];
  count: number;
}
```

### 3. Accept Delivery
```typescript
POST /deliveries/accept
```

**Purpose**: Courier accepts a delivery request

**Parameters**:
```typescript
{
  deliveryId: string;
}
```

**Returns**:
```typescript
{
  success: boolean;
  deliveryId: string;
  message: string;
}
```

### 4. Update Delivery Progress
```typescript
POST /deliveries/ongoing/pickup_location
POST /deliveries/ongoing/dropoff_location
POST /deliveries/ongoing/pickup_image
POST /deliveries/ongoing/pickup_code
POST /deliveries/ongoing/dropoff_image
POST /deliveries/ongoing/dropoff_code
```

**Purpose**: Update various stages of delivery progress

**Parameters**:
```typescript
{
  deliveryId: string;
  // Additional parameters based on endpoint
  smsCode?: string; // for code endpoints
  // FormData for image endpoints
}
```

**Returns**:
```typescript
{
  success: boolean;
  message: string;
  imageUrl?: string; // for image uploads
}
```

### 5. Get Courier History
```typescript
GET /deliveries/courier_history
```

**Purpose**: Get courier's delivery history

**Returns**:
```typescript
{
  success: boolean;
  deliveries: DeliveryRequest[];
  stats: {
    totalDeliveries: number;
    completedDeliveries: number;
    averageRating: number;
  };
}
```

### 6. Get Courier Profile
```typescript
GET /courier/profile
```

**Purpose**: Get courier profile and vehicle information

**Returns**:
```typescript
{
  success: boolean;
  profile: {
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
  };
}
```

### 7. Update Courier Profile
```typescript
PATCH /courier/profile
```

**Purpose**: Update courier profile information

**Parameters**:
```typescript
{
  vehicleCapacity?: string;
  vehicleType?: string;
  vehicleInsuranceCompany?: string;
}
```

**Returns**:
```typescript
{
  success: boolean;
  message: string;
}
```

### 8. Update Payment Details
```typescript
PATCH /courier/profile/payment
```

**Purpose**: Update courier payment information

**Parameters**:
```typescript
{
  type: string;
  bankName: string;
  accountNumber: string;
}
```

**Returns**:
```typescript
{
  success: boolean;
  message: string;
}
```

---

## SME-Specific APIs

### 1. Create Delivery
```typescript
POST /sme/create
```

**Purpose**: SME creates a new delivery request

**Parameters**:
```typescript
{
  pickupLocation: string;
  dropoffLocation: string;
  vehicleType: string;
  packageDescription: string;
  packageQualities: string[];
  optionalInstructions: string;
  insurance: boolean;
}
```

**Returns**:
```typescript
{
  success: boolean;
  deliveryId: string;
  message: string;
}
```

### 2. Start Payment
```typescript
POST /sme/pay
```

**Purpose**: Initiate payment for delivery request

**Parameters**:
```typescript
{
  deliveryId: string;
  standardFee: number;
  premium: number;
  totalAmount: number;
  paymentMethod: string;
}
```

**Returns**:
```typescript
{
  success: boolean;
  transactionRef: string;
  paymentGatewayUrl: string;
  message: string;
}
```

### 3. Verify Payment
```typescript
POST /sme/verify-payment
```

**Purpose**: Verify payment completion

**Parameters**:
```typescript
{
  transactionRef: string;
  otp: string;
}
```

**Returns**:
```typescript
{
  success: boolean;
  message: string;
  deliveryStatus: string;
}
```

### 4. Calculate Fare
```typescript
POST /deliveries/calculate-fare
```

**Purpose**: Calculate delivery fare estimate

**Parameters**:
```typescript
{
  pickupLocation: string;
  dropoffLocation: string;
  vehicleType: string;
}
```

**Returns**:
```typescript
{
  estimatedFare: number;
  distanceKm: number;
  timeMinutes: number;
}
```

### 5. Get SME Deliveries
```typescript
GET /deliveries/ongoing
```

**Purpose**: Get SME's ongoing deliveries

**Returns**:
```typescript
{
  success: boolean;
  deliveries: DeliveryRequest[];
}
```

### 6. Get SME History
```typescript
GET /deliveries/history
```

**Purpose**: Get SME's delivery history

**Returns**:
```typescript
{
  success: boolean;
  deliveries: DeliveryRequest[];
  stats: {
    totalDeliveries: number;
    totalSpent: number;
    averageDeliveryTime: number;
  };
}
```

### 7. Get SME Profile
```typescript
GET /profile/sme
```

**Purpose**: Get SME business profile

**Returns**:
```typescript
{
  success: boolean;
  profile: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    business_name: string;
    business_address: string;
    business_phone: string;
    business_website: string;
    business_industry: string;
    tax_id: string;
  };
}
```

### 8. Update SME Profile
```typescript
PUT /profile/sme
```

**Purpose**: Update SME business profile

**Parameters**:
```typescript
{
  business_name?: string;
  business_address?: string;
  business_phone?: string;
  business_website?: string;
  business_industry?: string;
  tax_id?: string;
}
```

**Returns**:
```typescript
{
  success: boolean;
  message: string;
  status: string;
}
```

---

## Data Models

### DeliveryRequest
```typescript
interface DeliveryRequest {
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
  pickupCord: Coordinates;
  dropoffCord: Coordinates;
  pickupLocation: string;
  dropoffLocation: string;
  tracker?: {
    pickup: 'pending' | 'in_progress' | 'completed';
    pickupCode: string | null;
    pickupImage: string | null;
    dropoff: 'pending' | 'in_progress' | 'completed';
    dropoffCode: string | null;
    dropoffImage: string | null;
  };
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  payment: 'pending' | 'completed' | 'failed';
  acceptedAt?: Date;
  CourierDetails?: {
    CourierId?: string;
    CourierName?: string;
    CourierLocation?: string;
    CourierCoordinates?: Coordinates;
  };
}
```

### Coordinates
```typescript
interface Coordinates {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
```

### UserProfile
```typescript
interface UserProfile {
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
```

### Chat
```typescript
interface Chat {
  id: string;
  participants: string[];
  participantNames: string[];
  participantAvatars: string[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  deliveryId?: string;
  online: boolean;
}
```

### ChatMessage
```typescript
interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'image' | 'location';
  imageUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}
```

### Notification
```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'delivery' | 'update' | 'system';
  read: boolean;
  createdAt: Date;
  deliveryId?: string;
  userId: string;
}
```

### DeliveryCharges
```typescript
interface DeliveryCharges {
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
```

### PaymentRequest
```typescript
interface PaymentRequest {
  deliveryRequestId: string;
  amount: number;
  method: 'card' | 'mobile_money' | 'bank_transfer';
  smeId: string;
  provider?: 'mpesa' | 'airtel' | 'tkash';
}
```

---

## Error Handling

### Standard Error Response
```typescript
{
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

### Common Error Codes
- `VALIDATION_ERROR` - Invalid input parameters
- `AUTHENTICATION_ERROR` - Invalid or expired token
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict (e.g., delivery already accepted)
- `PAYMENT_ERROR` - Payment processing failed
- `NETWORK_ERROR` - External service unavailable
- `INTERNAL_ERROR` - Server error

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error
- `502` - Bad Gateway
- `503` - Service Unavailable

---

## Authentication & Security

### JWT Token Structure
```typescript
{
  userId: string;
  role: 'sme' | 'courier';
  email: string;
  iat: number;
  exp: number;
}
```

### Required Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
X-API-Key: <api_key> // if required
```

### Rate Limiting
- Authentication endpoints: 5 requests per minute
- General endpoints: 100 requests per minute
- File upload endpoints: 10 requests per minute

---

## Environment Configuration

### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Payment Gateways
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...

# File Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...

# SMS Service
SMS_API_KEY=...
SMS_SENDER_ID=...

# Push Notifications
FCM_SERVER_KEY=...

# External APIs
GOOGLE_MAPS_API_KEY=...
```

---

## Testing Guidelines

### Mock Data Requirements
- All API endpoints should support mock data responses during development
- Mock data should match the exact structure of production responses
- Include realistic edge cases and error scenarios

### API Testing Checklist
- [ ] Authentication flow (signup, login, verification)
- [ ] Delivery creation and management
- [ ] Payment processing (success, failure, cancellation)
- [ ] Real-time updates (location tracking, status changes)
- [ ] File uploads (images, documents)
- [ ] Chat and messaging functionality
- [ ] Notification delivery
- [ ] Error handling and edge cases

### Performance Requirements
- Response time: < 500ms for most endpoints
- File upload: < 5MB per file
- Real-time updates: < 2 seconds latency
- Database queries: Optimized with proper indexing

---

## Deployment Notes

### Database Migrations
- Use versioned migration files
- Include rollback scripts
- Test migrations on staging environment

### API Versioning
- Use URL versioning: `/api/v1/...`
- Maintain backward compatibility
- Document breaking changes

### Monitoring & Logging
- Log all API requests and responses
- Monitor error rates and response times
- Set up alerts for critical failures
- Track business metrics (deliveries, payments, user activity)

---

## Support & Contact

For technical questions or clarifications about these API specifications, please contact:

- **Backend Team Lead**: [email]
- **API Documentation**: [link to detailed docs]
- **Development Environment**: [staging URL]
- **Issue Tracking**: [GitHub/Jira link]

---

*Last Updated: [Current Date]*
*Version: 1.0.0*