'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { useState } from 'react';

export default function Home() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    if (!loading && user && userProfile) {
      if (userProfile.role === 'merchant') {
        router.push('/merchant/dashboard');
      } else {
        router.push('/customer/menu');
      }
    }
  }, [user, userProfile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (user && userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🛍️ POS System
          </h1>
          <p className="text-xl text-gray-600">
            Modern Point of Sale System for Merchants and Customers
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex mb-6">
              <button
                onClick={() => setShowLogin(true)}
                className={`flex-1 py-2 px-4 rounded-l-lg font-medium transition-colors ${
                  showLogin
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => setShowLogin(false)}
                className={`flex-1 py-2 px-4 rounded-r-lg font-medium transition-colors ${
                  !showLogin
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                สมัครสมาชิก
              </button>
            </div>

            {showLogin ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">🏪</div>
              <h3 className="text-xl font-semibold mb-2">สำหรับร้านค้า</h3>
              <p className="text-gray-600">
                จัดการเมนู รับออเดอร์ และติดตามการขายแบบเรียลไทม์
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">👤</div>
              <h3 className="text-xl font-semibold mb-2">สำหรับลูกค้า</h3>
              <p className="text-gray-600">
                ดูเมนู สั่งอาหาร และชำระเงินผ่าน PromptPay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
