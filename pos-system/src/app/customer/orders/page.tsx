'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Order } from '@/types';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeft, Clock, CheckCircle, Package, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function CustomerOrders() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !userProfile) {
      router.push('/');
      return;
    }

    if (userProfile.role !== 'customer') {
      router.push('/');
      return;
    }

    // Subscribe to real-time order updates for this customer
    const ordersQuery = query(
      collection(db, 'orders'),
      where('customerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(ordersQuery, (querySnapshot) => {
      const ordersData: Order[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        ordersData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate(),
        } as Order);
      });
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดออเดอร์');
      setLoading(false);
    });

    return unsubscribe;
  }, [user, userProfile, router]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'in-progress':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'ready':
        return <Truck className="h-5 w-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'รอการเตรียม';
      case 'in-progress':
        return 'กำลังเตรียม';
      case 'ready':
        return 'พร้อมรับ';
      case 'completed':
        return 'เสร็จสิ้น';
      default:
        return 'ไม่ทราบสถานะ';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.push('/customer/menu')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              กลับไปเมนู
            </button>
            <h1 className="ml-4 text-xl font-semibold text-gray-900">ออเดอร์ของฉัน</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีออเดอร์</h3>
            <p className="text-gray-600 mb-6">เริ่มสั่งเครื่องดื่มกันเถอะ!</p>
            <button
              onClick={() => router.push('/customer/menu')}
              className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              ดูเมนู
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-mono text-sm text-gray-600">#{order.id.slice(-8)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.createdAt.toLocaleDateString('th-TH')} {order.createdAt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-indigo-600">
                      ฿{order.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t pt-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">รายการที่สั่ง:</h4>
                  <div className="space-y-2">
                    {order.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex justify-between items-center text-sm">
                        <span>{item.menuItem.name} x{item.quantity}</span>
                        <span>฿{(item.menuItem.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className="text-sm font-medium">{getStatusText(order.status)}</span>
                    </div>
                    
                    {order.status === 'ready' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        🎉 พร้อมรับแล้ว!
                      </motion.div>
                    )}
                    
                    {order.status === 'completed' && order.completedAt && (
                      <div className="text-sm text-gray-600">
                        เสร็จสิ้นเมื่อ: {order.completedAt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>รอการเตรียม</span>
                    <span>กำลังเตรียม</span>
                    <span>พร้อมรับ</span>
                    <span>เสร็จสิ้น</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-indigo-600 h-2 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ 
                        width: order.status === 'pending' ? '25%' :
                               order.status === 'in-progress' ? '50%' :
                               order.status === 'ready' ? '75%' :
                               order.status === 'completed' ? '100%' : '0%'
                      }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}