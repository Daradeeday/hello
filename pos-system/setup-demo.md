# Demo Setup Guide

## Quick Start for Testing

### 1. Set up Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google provider
4. Create Firestore Database:
   - Go to Firestore Database
   - Create database in test mode
5. Enable Storage:
   - Go to Storage
   - Get started with default rules

### 2. Environment Setup
Copy the Firebase config to `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3. Start the Application
```bash
npm install
npm run dev
```

### 4. Create Demo Accounts

#### Admin Access
- URL: `http://localhost:3000/admin`
- Email: `admin@pos.com`
- Password: `admin123`

#### Create a Merchant
1. Go to admin panel
2. Click "เพิ่มร้านค้า" (Add Merchant)
3. Fill in details:
   - Name: `ร้านกาแฟดี`
   - Email: `merchant@cafe.com`
   - Password: `merchant123`
   - Phone: `081-234-5678`

#### Customer Account
1. Go to `http://localhost:3000`
2. Click "เข้าสู่ระบบ" (Login)
3. Use Google OAuth or register with email

### 5. Add Sample Menu
Once you have a merchant account:
1. Login as merchant
2. Go to "จัดการเมนู" (Menu Management) tab
3. Add some menu items:
   - Coffee items: ฿35-65
   - Tea items: ฿30-50
   - Beverages: ฿40-70

### 6. Test the Full Flow
1. **Customer**: Browse menu, add to cart
2. **Customer**: Checkout with PromptPay QR
3. **Customer**: Upload payment slip image
4. **Customer**: Confirm order
5. **Merchant**: View order in dashboard
6. **Merchant**: Update order status
7. **Customer**: See real-time status updates

### 7. Demo Scenarios

#### Scenario 1: Coffee Order
- Customer orders 2x กาแฟลาเต้ (฿55 each)
- Total: ฿110
- Upload payment slip
- Merchant processes: Pending → In Progress → Ready → Completed

#### Scenario 2: Multiple Items
- Customer orders mixed items
- Test cart functionality
- Test real-time updates

### 8. Testing Mobile
- Open on mobile device or use browser dev tools
- Test responsive design
- Test touch interactions

### 9. Sample Data Structure

#### Menu Items
```json
{
  "name": "กาแฟดำ",
  "description": "กาแฟดำร้อน 100% อาราบิก้า",
  "price": 45,
  "category": "กาแฟ",
  "imageUrl": "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
  "available": true
}
```

#### Order Flow
```
Customer Creates Order
       ↓
Status: pending (รอการเตรียม)
       ↓
Merchant: "เริ่มเตรียมอาหาร"
       ↓
Status: in-progress (กำลังเตรียม)
       ↓
Merchant: "พร้อมรับอาหาร"
       ↓
Status: ready (พร้อมรับ)
       ↓
Merchant: "เสร็จสิ้น"
       ↓
Status: completed (เสร็จสิ้น)
```

### 10. Troubleshooting

#### Firebase Connection Issues
- Check console for errors
- Verify environment variables
- Ensure Firebase services are enabled

#### Authentication Problems
- Check Google OAuth configuration
- Verify Firebase Auth settings
- Clear browser cache/localStorage

#### Real-time Updates Not Working
- Check Firestore security rules
- Verify network connection
- Check browser console for errors

### 11. Production Deployment

#### Environment Variables for Production
```env
# Production Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=prod-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prod-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prod-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prod-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=prod-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=prod-app-id
```

#### Security Rules for Production
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /menuItems/{itemId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'merchant';
    }
    
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        (resource.data.customerId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'merchant');
    }
  }
}
```

---

**Ready to test! 🚀**