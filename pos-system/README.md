# 🛍️ Modern POS System

A professional web-based Point of Sale (POS) system built with Next.js, TypeScript, TailwindCSS, and Firebase. The system supports both merchant and customer interfaces with real-time order management and PromptPay integration.

## ✨ Features

### 🔐 Authentication & User Management
- **Role-based access control** (Merchant/Customer)
- **Secure authentication** with Firebase Auth
- **User profile management** with name, phone, and role

### 🏪 Merchant Interface
- **Real-time order dashboard** with live updates
- **Order status management** (Pending → In Progress → Ready → Completed)
- **Menu management** with CRUD operations
- **Order notifications** and status tracking
- **Sales overview** with order statistics

### 👤 Customer Interface
- **Browse menu items** with categories and images
- **Shopping cart** with quantity management
- **PromptPay QR code** payment integration
- **Order tracking** with real-time status updates
- **Order history** and receipt management

### 💳 Payment System
- **PromptPay QR code** generation
- **Payment confirmation** workflow
- **Order status** synchronization

### 📱 Modern UI/UX
- **Responsive design** for mobile and desktop
- **Clean and professional** interface
- **Smooth animations** and transitions
- **Thai language** support
- **Real-time notifications** with toast messages

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pos-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Enable Storage (optional, for image uploads)

4. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Set up Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read/write their own profile
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Anyone can read menu items
       match /menuItems/{itemId} {
         allow read: if true;
         allow write: if request.auth != null && 
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'merchant';
       }
       
       // Users can read/write their own orders
       match /orders/{orderId} {
         allow read, write: if request.auth != null && 
           (resource.data.customerId == request.auth.uid || 
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'merchant');
       }
     }
   }
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
pos-system/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── customer/          # Customer pages
│   │   │   ├── menu/          # Menu browsing
│   │   │   ├── checkout/      # Payment page
│   │   │   └── orders/        # Order history
│   │   ├── merchant/          # Merchant pages
│   │   │   └── dashboard/     # Merchant dashboard
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable components
│   │   ├── auth/             # Authentication components
│   │   ├── customer/         # Customer-specific components
│   │   └── merchant/         # Merchant-specific components
│   ├── contexts/             # React contexts
│   │   └── AuthContext.tsx   # Authentication context
│   ├── lib/                  # Utility libraries
│   │   └── firebase.ts       # Firebase configuration
│   └── types/                # TypeScript type definitions
│       └── index.ts          # Main type definitions
├── public/                   # Static assets
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## 🎯 Usage Guide

### For Merchants
1. **Register/Login** as a merchant
2. **Add menu items** in the Menu Management tab
3. **Monitor incoming orders** in real-time
4. **Update order status** as you prepare items
5. **Track sales** and order history

### For Customers
1. **Register/Login** as a customer
2. **Browse menu** and add items to cart
3. **Proceed to checkout** and scan PromptPay QR
4. **Track order status** in real-time
5. **View order history** and receipts

## 🔧 Customization

### Adding New Menu Categories
Edit the category options in `MenuManagement.tsx`:
```typescript
<option value="กาแฟ">กาแฟ</option>
<option value="ชา">ชา</option>
<option value="น้ำผลไม้">น้ำผลไม้</option>
<option value="ของหวาน">ของหวาน</option>
<option value="อาหาร">อาหาร</option>
```

### Customizing PromptPay Integration
Update the QR code generation in `checkout/page.tsx`:
```typescript
const generatePromptPayQR = () => {
  // Implement your PromptPay QR generation logic
  const promptPayId = 'your_promptpay_id';
  const amount = totalAmount;
  return `your_qr_generation_logic`;
};
```

### Styling Customization
The project uses TailwindCSS. You can customize:
- Colors in `tailwind.config.js`
- Global styles in `src/app/globals.css`
- Component-specific styles in individual components

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- Docker containers

## 🔒 Security Considerations

- **Firebase Security Rules** are configured for proper access control
- **Authentication** is required for all sensitive operations
- **Role-based permissions** prevent unauthorized access
- **Input validation** on all forms
- **HTTPS** is enforced in production

## 📱 Mobile Optimization

The system is fully responsive and optimized for:
- **Mobile phones** (portrait and landscape)
- **Tablets** (all orientations)
- **Desktop** computers
- **Touch interactions** and gestures

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the Firebase documentation
- Review the Next.js documentation

## 🔮 Future Enhancements

- [ ] **Admin panel** for user management
- [ ] **Analytics dashboard** with charts
- [ ] **Inventory management** system
- [ ] **Multi-location** support
- [ ] **Offline mode** with sync
- [ ] **Push notifications** for orders
- [ ] **Loyalty program** integration
- [ ] **Multi-language** support
- [ ] **Advanced reporting** features
- [ ] **API endpoints** for third-party integrations

---

**Built with ❤️ using Next.js, TypeScript, TailwindCSS, and Firebase**
