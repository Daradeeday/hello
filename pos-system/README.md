# 🛍️ Modern POS System

A modern, fast, and fully functional web-based Point of Sale (POS) system inspired by the Grab app. Built with Next.js, TypeScript, Tailwind CSS, and Firebase.

## ✨ Features

### 🔐 Authentication System
- **Google OAuth** for customers
- **Email/Password** authentication for merchants
- **Admin panel** for merchant management
- Role-based access control

### 👤 Customer Interface
- Google login integration
- Browse drink menu with images and descriptions
- Add items to cart with quantity management
- **PromptPay QR code** for payments
- **Payment slip upload** before order confirmation
- Real-time order tracking with progress bar
- Beautiful animations with Framer Motion

### 🏪 Merchant Interface
- Real-time order dashboard
- View uploaded payment slips
- Order status management (Pending → In Progress → Ready → Completed)
- Menu management (add/edit items)
- Live order notifications

### 🔐 Admin Panel
- Create and manage merchant accounts
- System overview with sales statistics
- Monitor all orders and users
- Secure admin authentication

### 🎨 Design & UX
- **Mobile-first** responsive design
- **Grab-inspired** UI/UX
- Smooth animations and transitions
- Loading skeletons and states
- Toast notifications
- Modern gradient backgrounds

## 🚀 Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Authentication:** Firebase Auth with Google OAuth
- **Database:** Cloud Firestore (real-time)
- **Storage:** Firebase Storage (payment slips)
- **Icons:** Lucide React, Heroicons
- **Animations:** Framer Motion
- **UI Components:** Headless UI
- **File Upload:** React Dropzone
- **QR Codes:** qrcode.react
- **Notifications:** React Hot Toast

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pos-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication with Google provider
   - Create a Firestore database
   - Enable Firebase Storage
   - Get your Firebase configuration

4. **Environment Configuration**
   - Copy `.env.local.example` to `.env.local`
   - Replace with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Seed sample data** (optional)
   - Visit the merchant dashboard
   - Add some menu items or use the sample data

## 🎯 Demo Credentials

### Admin Panel
- **URL:** `/admin`
- **Email:** `admin@pos.com`
- **Password:** `admin123`

### Customer Login
- Use Google OAuth or create a new account

### Merchant Login
- Create merchants through the admin panel

## 📱 User Flow

### Customer Journey
1. **Login** → Google OAuth authentication
2. **Menu** → Browse drinks with images and prices
3. **Cart** → Add items and manage quantities
4. **Checkout** → View PromptPay QR code
5. **Payment** → Scan QR and upload payment slip
6. **Confirmation** → Order created and tracking begins
7. **Tracking** → Real-time order status updates

### Merchant Journey
1. **Login** → Email/password authentication
2. **Dashboard** → View incoming orders in real-time
3. **Order Management** → Update order status
4. **Payment Verification** → View customer payment slips
5. **Menu Management** → Add/edit menu items

### Admin Journey
1. **Login** → Admin credentials
2. **Dashboard** → System overview and statistics
3. **Merchant Management** → Create new merchant accounts
4. **Monitoring** → View all orders and users

## 🏗️ Project Structure

```
pos-system/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── customer/          # Customer pages
│   │   ├── merchant/          # Merchant pages
│   │   ├── admin/            # Admin panel
│   │   └── globals.css       # Global styles
│   ├── components/           # Reusable components
│   │   ├── auth/            # Authentication components
│   │   ├── customer/        # Customer-specific components
│   │   └── merchant/        # Merchant-specific components
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.tsx  # Authentication state
│   │   └── CartContext.tsx  # Shopping cart state
│   ├── lib/                 # Utilities and configurations
│   │   ├── firebase.ts      # Firebase configuration
│   │   └── sampleData.ts    # Sample menu data
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
└── package.json            # Dependencies and scripts
```

## 🔧 Key Components

### Authentication System
- **AuthContext**: Manages user authentication state
- **LoginForm**: Email/password and Google OAuth
- **RegisterForm**: Customer registration

### Cart Management
- **CartContext**: Persistent cart state with localStorage
- **Cart**: Shopping cart sidebar with item management

### Real-time Features
- **Firebase Firestore**: Real-time order updates
- **Order tracking**: Live status changes
- **Notifications**: Toast messages for actions

### Payment Flow
- **PromptPay QR**: Generate payment QR codes
- **File Upload**: Drag-and-drop payment slip upload
- **Order Creation**: Secure order processing

## 🎨 Design System

### Colors
- **Primary**: Indigo (600, 700)
- **Success**: Green (500, 600)
- **Warning**: Orange (500, 600)
- **Error**: Red (500, 600)
- **Gray**: Various shades for text and backgrounds

### Typography
- **Font**: Inter (Google Fonts)
- **Sizes**: Responsive typography scale
- **Weights**: Regular, Medium, Semibold, Bold

### Animations
- **Framer Motion**: Smooth page transitions
- **Loading states**: Skeleton screens
- **Micro-interactions**: Hover and click effects

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
- **Netlify**: Support for Next.js
- **Firebase Hosting**: Direct integration
- **Docker**: Container deployment

## 🧪 Testing

### Manual Testing Checklist
- [ ] Customer registration and login
- [ ] Menu browsing and cart management
- [ ] Order placement with payment slip
- [ ] Merchant order management
- [ ] Admin merchant creation
- [ ] Real-time updates

### Automated Testing (Future)
- Unit tests with Jest
- Integration tests with Cypress
- E2E testing scenarios

## 🔒 Security Features

- **Firebase Security Rules**: Protect user data
- **Role-based Access**: Customer/Merchant/Admin roles
- **Input Validation**: Form validation and sanitization
- **File Upload Security**: Image validation and size limits

## 📈 Performance Optimizations

- **Next.js App Router**: Modern routing with streaming
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Caching**: Firebase caching strategies
- **Lazy Loading**: Components and routes

## 🛠️ Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Firebase**: Backend services
- **Vercel**: Hosting and deployment
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Lucide**: Beautiful icons

## 📞 Support

For support, email support@yourcompany.com or create an issue in the repository.

---

Built with ❤️ using modern web technologies
