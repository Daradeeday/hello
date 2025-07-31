'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Users, Store, TrendingUp, Activity, Plus, LogOut } from 'lucide-react';
import { Order, UserProfile } from '@/types';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface MerchantFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [merchants, setMerchants] = useState<UserProfile[]>([]);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [showCreateMerchant, setShowCreateMerchant] = useState(false);
  const [merchantForm, setMerchantForm] = useState<MerchantFormData>({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // Check admin authentication
    const adminSession = localStorage.getItem('admin-session');
    if (!adminSession) {
      router.push('/admin');
      return;
    }

    setIsAuthenticated(true);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      // Fetch orders
      const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
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
      });

      // Fetch users
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const allUsers: UserProfile[] = [];
      usersSnapshot.forEach((doc) => {
        allUsers.push({ id: doc.id, ...doc.data() } as UserProfile);
      });

      setMerchants(allUsers.filter(user => user.role === 'merchant'));
      setCustomers(allUsers.filter(user => user.role === 'customer'));

      return () => unsubscribeOrders();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        merchantForm.email, 
        merchantForm.password
      );
      const user = userCredential.user;

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        role: 'merchant',
        name: merchantForm.name,
        phone: merchantForm.phone,
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);

      // Update local state
      setMerchants(prev => [...prev, userProfile]);
      setMerchantForm({ name: '', email: '', password: '', phone: '' });
      setShowCreateMerchant(false);
      
      toast.success('สร้างบัญชีร้านค้าสำเร็จ!');
    } catch (error: any) {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการสร้างบัญชี');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin-session');
    router.push('/admin');
  };

  const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const todayOrders = orders.filter(order => {
    const today = new Date();
    const orderDate = order.createdAt;
    return orderDate.toDateString() === today.toDateString();
  });

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-600"></div>
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
              <h1 className="text-xl font-semibold text-gray-900">🔐 Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ยอดขายรวม</p>
                <p className="text-2xl font-semibold text-gray-900">฿{totalSales.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ออเดอร์วันนี้</p>
                <p className="text-2xl font-semibold text-gray-900">{todayOrders.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Store className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ร้านค้า</p>
                <p className="text-2xl font-semibold text-gray-900">{merchants.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ลูกค้า</p>
                <p className="text-2xl font-semibold text-gray-900">{customers.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Merchants Management */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">จัดการร้านค้า</h2>
              <button
                onClick={() => setShowCreateMerchant(true)}
                className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>เพิ่มร้านค้า</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {merchants.length === 0 ? (
              <div className="text-center py-8">
                <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">ยังไม่มีร้านค้าในระบบ</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {merchants.map((merchant, index) => (
                  <motion.div
                    key={merchant.uid}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{merchant.name}</h3>
                      <p className="text-sm text-gray-600">{merchant.email}</p>
                      {merchant.phone && (
                        <p className="text-sm text-gray-600">{merchant.phone}</p>
                      )}
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      ✓ Active
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">ออเดอร์ล่าสุด</h2>
          </div>
          
          <div className="p-6">
            {orders.slice(0, 10).map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-gray-900">#{order.id.slice(-8)}</p>
                  <p className="text-sm text-gray-600">{order.customerName}</p>
                  <p className="text-xs text-gray-500">
                    {order.createdAt.toLocaleDateString('th-TH')} {order.createdAt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">฿{order.totalAmount.toLocaleString()}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {order.status === 'completed' ? 'เสร็จสิ้น' :
                     order.status === 'ready' ? 'พร้อมรับ' :
                     order.status === 'in-progress' ? 'กำลังเตรียม' :
                     'รอการเตรียม'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Merchant Modal */}
      {showCreateMerchant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">เพิ่มร้านค้าใหม่</h3>
              <button
                onClick={() => setShowCreateMerchant(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMerchant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อร้านค้า
                </label>
                <input
                  type="text"
                  value={merchantForm.name}
                  onChange={(e) => setMerchantForm({...merchantForm, name: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อีเมล
                </label>
                <input
                  type="email"
                  value={merchantForm.email}
                  onChange={(e) => setMerchantForm({...merchantForm, email: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  value={merchantForm.password}
                  onChange={(e) => setMerchantForm({...merchantForm, password: e.target.value})}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  value={merchantForm.phone}
                  onChange={(e) => setMerchantForm({...merchantForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateMerchant(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2 px-4 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  {creating ? 'กำลังสร้าง...' : 'สร้างบัญชี'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}