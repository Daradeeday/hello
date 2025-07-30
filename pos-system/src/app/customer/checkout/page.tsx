'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { CartItem, Order, PaymentMethod } from '@/types';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !userProfile) {
      router.push('/');
      return;
    }

    // In a real app, you'd get cart from context or localStorage
    // For demo purposes, we'll create some sample data
    const sampleCart: CartItem[] = [
      {
        menuItem: {
          id: '1',
          name: 'กาแฟดำ',
          price: 45,
          category: 'กาแฟ',
          available: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        quantity: 2,
      },
      {
        menuItem: {
          id: '2',
          name: 'ชาเขียว',
          price: 35,
          category: 'ชา',
          available: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        quantity: 1,
      },
    ];

    setCart(sampleCart);
    const total = sampleCart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    setTotalAmount(total);
  }, [user, userProfile, router]);

  const generatePromptPayQR = () => {
    // In a real app, you'd generate a proper PromptPay QR code
    // For demo purposes, we'll create a simple payment URL
    const promptPayId = '0812345678'; // Merchant's PromptPay ID
    const amount = totalAmount;
    return `00020101021229370016A000000677010112011300660000000005802TH5303764540${amount.toFixed(2)}6304`;
  };

  const handlePaymentConfirmation = async () => {
    setLoading(true);
    
    try {
      const orderData: Omit<Order, 'id'> = {
        customerId: user!.uid,
        customerName: userProfile!.name,
        customerPhone: userProfile!.phone,
        items: cart,
        totalAmount,
        status: 'pending',
        paymentStatus: 'paid',
        paymentMethod: 'promptpay' as PaymentMethod,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setOrderId(docRef.id);
      setPaymentConfirmed(true);
      toast.success('ออเดอร์ถูกสร้างเรียบร้อยแล้ว!');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการสร้างออเดอร์');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToMenu = () => {
    router.push('/customer/menu');
  };

  const handleViewOrders = () => {
    router.push('/customer/orders');
  };

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={handleBackToMenu}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              กลับไปเมนู
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!paymentConfirmed ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">สรุปออเดอร์</h2>
              
              <div className="space-y-3 mb-6">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.menuItem.name}</span>
                      <span className="text-gray-500 ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-medium">฿{(item.menuItem.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>รวมทั้งหมด:</span>
                  <span className="text-indigo-600">฿{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">ชำระเงินผ่าน PromptPay</h2>
              
              <div className="text-center mb-6">
                <div className="bg-gray-100 rounded-lg p-4 inline-block">
                  <QRCodeSVG
                    value={generatePromptPayQR()}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  สแกน QR Code เพื่อชำระเงิน ฿{totalAmount.toLocaleString()}
                </p>
                
                <button
                  onClick={handlePaymentConfirmation}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'กำลังประมวลผล...' : 'ยืนยันการชำระเงิน'}
                </button>
                
                <p className="text-xs text-gray-500">
                  * สำหรับการทดสอบ กรุณากดปุ่ม "ยืนยันการชำระเงิน" เพื่อจำลองการสแกน QR Code
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Order Confirmation */
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">ออเดอร์สำเร็จ!</h2>
            <p className="text-gray-600 mb-6">
              ออเดอร์ของคุณได้รับการยืนยันแล้ว รอการเตรียมอาหาร
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">หมายเลขออเดอร์:</p>
              <p className="font-mono text-lg font-semibold text-indigo-600">{orderId}</p>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-green-600 mb-6">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">ชำระเงินเรียบร้อยแล้ว</span>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-orange-600 mb-8">
              <Clock className="h-5 w-5" />
              <span className="font-medium">สถานะ: รอการเตรียมอาหาร</span>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleViewOrders}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                ดูออเดอร์ของฉัน
              </button>
              
              <button
                onClick={handleBackToMenu}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                สั่งอาหารเพิ่ม
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}