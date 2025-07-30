'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Order, MenuItem } from '@/types';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LogOut, Plus, Settings, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import OrderCard from '@/components/merchant/OrderCard';
import MenuManagement from '@/components/merchant/MenuManagement';

export default function MerchantDashboard() {
  const { user, userProfile, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');

  useEffect(() => {
    if (!user || !userProfile) {
      router.push('/');
      return;
    }

    if (userProfile.role !== 'merchant') {
      router.push('/');
      return;
    }

    // Subscribe to real-time order updates
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeOrders = onSnapshot(ordersQuery, (querySnapshot) => {
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

    // Subscribe to menu items
    const menuQuery = query(collection(db, 'menuItems'), orderBy('createdAt', 'desc'));
    
    const unsubscribeMenu = onSnapshot(menuQuery, (querySnapshot) => {
      const menuData: MenuItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        menuData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as MenuItem);
      });
      setMenuItems(menuData);
    }, (error) => {
      console.error('Error fetching menu items:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดเมนู');
    });

    return () => {
      unsubscribeOrders();
      unsubscribeMenu();
    };
  }, [user, userProfile, router]);

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: serverTimestamp(),
        ...(status === 'completed' && { completedAt: serverTimestamp() }),
      });
      toast.success('อัปเดตสถานะออเดอร์เรียบร้อยแล้ว');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการออกจากระบบ');
    }
  };

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const inProgressOrders = orders.filter(order => order.status === 'in-progress');
  const readyOrders = orders.filter(order => order.status === 'ready');

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">🏪 แดชบอร์ดร้านค้า</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{userProfile?.name}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>ออเดอร์</span>
                {orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length}
                  </span>
                )}
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('menu')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'menu'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>จัดการเมนู</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'orders' ? (
          <div className="space-y-8">
            {/* Orders Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <div className="text-2xl">⏳</div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">รอการเตรียม</p>
                    <p className="text-2xl font-semibold text-gray-900">{pendingOrders.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <div className="text-2xl">👨‍🍳</div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">กำลังเตรียม</p>
                    <p className="text-2xl font-semibold text-gray-900">{inProgressOrders.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <div className="text-2xl">✅</div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">พร้อมรับ</p>
                    <p className="text-2xl font-semibold text-gray-900">{readyOrders.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">ออเดอร์ล่าสุด</h2>
              
              {orders.filter(order => order.status !== 'completed' && order.status !== 'cancelled').length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีออเดอร์ใหม่</h3>
                  <p className="text-gray-600">รอลูกค้าสั่งอาหาร</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {orders
                    .filter(order => order.status !== 'completed' && order.status !== 'cancelled')
                    .map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onUpdateStatus={handleUpdateOrderStatus}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <MenuManagement menuItems={menuItems} />
        )}
      </main>
    </div>
  );
}