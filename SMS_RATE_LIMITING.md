# SMS Rate Limiting Feature

## Overview
This feature implements SMS rate limiting to prevent spam and abuse. Users are limited to 3 SMS attempts per hour, after which they are blocked for 1 hour.

## Features

### Rate Limiting Rules
- **Maximum Attempts**: 3 SMS requests per phone number
- **Block Duration**: 1 hour after exceeding the limit
- **OTP Validity**: 5 minutes
- **Storage**: Redis (no database storage for OTPs)

### API Endpoints

#### 1. Send OTP
```http
POST /v1/sms/send-otp
Content-Type: application/json

{
  "phoneNumber": "01712345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully. 2 attempts remaining."
}
```

#### 2. Verify OTP
```http
POST /v1/sms/verify-otp
Content-Type: application/json

{
  "phoneNumber": "01712345678",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully."
}
```

#### 3. Check SMS Status
```http
GET /v1/sms/status/01712345678
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attempts": 1,
    "isBlocked": false,
    "remainingAttempts": 2
  }
}
```

#### 4. Reset SMS Cache (Admin Only)
```http
POST /v1/sms/reset-cache?phoneNumber=01712345678
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "SMS cache reset for 01712345678"
}
```

### Redis Keys Structure

- `sms_attempts:{phoneNumber}` - Tracks SMS attempts (TTL: 1 hour)
- `sms_blocked:{phoneNumber}` - Tracks blocked status (TTL: 1 hour)
- `sms_otp:{phoneNumber}` - Stores OTP (TTL: 5 minutes)

### Environment Variables

Add these to your `.env` file:
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Bulk SMS Configuration
BULKSMS_API_KEY=your_api_key
BULKSMS_SENDER_ID=your_sender_id
```

### Installation

1. Install Redis dependencies:
```bash
pnpm add redis @nestjs/cache-manager cache-manager cache-manager-redis-store
```

2. Start Redis server:
```bash
redis-server
```

### Security Features

1. **Rate Limiting**: Prevents spam by limiting SMS requests
2. **Temporary Blocking**: Blocks users for 1 hour after 3 attempts
3. **OTP Expiration**: OTPs expire after 5 minutes
4. **Redis Storage**: No sensitive data stored in database
5. **Admin Reset**: Admins can reset cache for specific users or all users

### Error Handling

- **Blocked User**: Returns appropriate message with block duration
- **Invalid OTP**: Returns error message
- **Expired OTP**: Returns error message
- **Redis Failure**: Graceful degradation (allows SMS if Redis is down)

### Usage Examples

#### Frontend Integration

```javascript
// Send OTP
const sendOtp = async (phoneNumber) => {
  const response = await fetch('/v1/sms/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber })
  });
  return response.json();
};

// Verify OTP
const verifyOtp = async (phoneNumber, otp) => {
  const response = await fetch('/v1/sms/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, otp })
  });
  return response.json();
};
```

#### Admin Panel

```javascript
// Reset cache for specific user
const resetUserCache = async (phoneNumber) => {
  const response = await fetch(`/v1/sms/reset-cache?phoneNumber=${phoneNumber}`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json' 
    }
  });
  return response.json();
};

// Reset all cache
const resetAllCache = async () => {
  const response = await fetch('/v1/sms/reset-cache', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json' 
    }
  });
  return response.json();
};
``` 