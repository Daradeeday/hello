'use client';

import { Order } from '@/types';
import { Clock, CheckCircle, Package, Truck, User, Phone, Image, Eye } from 'lucide-react';
import { useState } from 'react';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: string) => void;
}

export default function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
  const [showPaymentSlip, setShowPaymentSlip] = useState(false);
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
        return 'รอการเตรียมอาหาร';
      case 'in-progress':
        return 'กำลังเตรียมอาหาร';
      case 'ready':
        return 'พร้อมรับอาหาร';
      case 'completed':
        return 'เสร็จสิ้น';
      case 'cancelled':
        return 'ยกเลิก';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-orange-600 bg-orange-100';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      case 'ready':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-green-700 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return 'in-progress';
      case 'in-progress':
        return 'ready';
      case 'ready':
        return 'completed';
      default:
        return currentStatus;
    }
  };

  const getNextStatusText = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return 'เริ่มเตรียมอาหาร';
      case 'in-progress':
        return 'พร้อมรับอาหาร';
      case 'ready':
        return 'เสร็จสิ้น';
      default:
        return '';
    }
  };

  const canUpdateStatus = order.status !== 'completed' && order.status !== 'cancelled';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-indigo-500">
      {/* Order Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              ออเดอร์ #{order.id.slice(-8)}
            </h3>
            <p className="text-sm text-gray-600">
              {order.createdAt.toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusIcon(order.status)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>{order.customerName}</span>
          </div>
          {order.customerPhone && (
            <div className="flex items-center space-x-1">
              <Phone className="h-4 w-4" />
              <span>{order.customerPhone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="p-6">
        <div className="space-y-3 mb-4">
          {order.items.map((item, index) => (
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
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">รวมทั้งหมด:</span>
            <span className="text-xl font-bold text-indigo-600">฿{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>
        
        {/* Payment Slip */}
        {(order as any).paymentSlipUrl && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Image className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">สลิปการชำระเงิน</span>
              </div>
              <button
                onClick={() => setShowPaymentSlip(true)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span className="text-sm">ดูสลิป</span>
              </button>
            </div>
          </div>
        )}

        {order.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">หมายเหตุ:</span> {order.notes}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {canUpdateStatus && (
        <div className="px-6 pb-6">
          <button
            onClick={() => onUpdateStatus(order.id, getNextStatus(order.status))}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            {getNextStatusText(order.status)}
          </button>
        </div>
      )}

      {/* Payment Slip Modal */}
      {showPaymentSlip && (order as any).paymentSlipUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">สลิปการชำระเงิน - ออเดอร์ #{order.id.slice(-8)}</h3>
              <button
                onClick={() => setShowPaymentSlip(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center">
              <img
                src={(order as any).paymentSlipUrl}
                alt="Payment Slip"
                className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.png';
                }}
              />
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowPaymentSlip(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}