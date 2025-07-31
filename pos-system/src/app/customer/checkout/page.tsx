'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { Order, PaymentMethod } from '@/types';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, CheckCircle, Clock, Upload, Camera } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { user, userProfile } = useAuth();
  const { cart, totalAmount, clearCart } = useCart();
  const router = useRouter();
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [paymentSlipUrl, setPaymentSlipUrl] = useState<string>('');
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [showSlipUpload, setShowSlipUpload] = useState(false);

  useEffect(() => {
    if (!user || !userProfile) {
      router.push('/');
      return;
    }

    if (userProfile.role !== 'customer') {
      router.push('/');
      return;
    }

    // Check if cart is empty
    if (cart.length === 0) {
      router.push('/customer/menu');
      return;
    }
  }, [user, userProfile, cart, router]);

  const generatePromptPayQR = () => {
    // In a real app, you'd generate a proper PromptPay QR code
    // For demo purposes, we'll create a simple payment URL
    const promptPayId = '0812345678'; // Merchant's PromptPay ID
    const amount = totalAmount;
    return `00020101021229370016A000000677010112011300660000000005802TH5303764540${amount.toFixed(2)}6304`;
  };

  const uploadPaymentSlip = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `payment-slips/${user!.uid}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleSlipUpload = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setPaymentSlip(file);
    setUploadingSlip(true);
    
    try {
      const url = await uploadPaymentSlip(file);
      setPaymentSlipUrl(url);
      toast.success('อัปโหลดสลิปสำเร็จ!');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการอัปโหลดสลิป');
      setPaymentSlip(null);
    } finally {
      setUploadingSlip(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleSlipUpload,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handlePaymentConfirmation = async () => {
    if (!paymentSlipUrl) {
      toast.error('กรุณาอัปโหลดสลิปการชำระเงินก่อน');
      return;
    }

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
        notes: `Payment slip: ${paymentSlipUrl}`,
      };

      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        paymentSlipUrl: paymentSlipUrl,
      });

      setOrderId(docRef.id);
      setPaymentConfirmed(true);
      clearCart(); // Clear cart after successful order
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
                  onClick={() => setShowSlipUpload(true)}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Camera className="h-5 w-5" />
                  <span>อัปโหลดสลิปการชำระเงิน</span>
                </button>

                {paymentSlipUrl && (
                  <div className="text-center space-y-2">
                    <div className="text-green-600 flex items-center justify-center space-x-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>สลิปอัปโหลดเรียบร้อยแล้ว</span>
                    </div>
                    <img
                      src={paymentSlipUrl}
                      alt="Payment Slip"
                      className="w-32 h-40 object-cover rounded-lg mx-auto border-2 border-green-200"
                    />
                  </div>
                )}
                
                <button
                  onClick={handlePaymentConfirmation}
                  disabled={loading || !paymentSlipUrl}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'กำลังประมวลผล...' : 'ยืนยันการชำระเงิน'}
                </button>
                
                <p className="text-xs text-gray-500">
                  * กรุณาอัปโหลดสลิปการชำระเงินก่อนยืนยันออเดอร์
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

        {/* Payment Slip Upload Modal */}
        {showSlipUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">อัปโหลดสลิปการชำระเงิน</h3>
                <button
                  onClick={() => setShowSlipUpload(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-300 hover:border-indigo-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                
                {uploadingSlip ? (
                  <div className="space-y-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-sm text-gray-600">กำลังอัปโหลด...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์
                    </p>
                    <p className="text-xs text-gray-500">
                      รองรับไฟล์: PNG, JPG, JPEG (สูงสุด 5MB)
                    </p>
                  </div>
                )}
              </div>

              {paymentSlip && !uploadingSlip && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">อัปโหลดสำเร็จ: {paymentSlip.name}</span>
                  </div>
                </div>
              )}

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setShowSlipUpload(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => setShowSlipUpload(false)}
                  disabled={!paymentSlipUrl}
                  className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ตกลง
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}