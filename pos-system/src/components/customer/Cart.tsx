'use client';

import { CartItem } from '@/types';
import { X, Minus, Plus, Trash2 } from 'lucide-react';

interface CartProps {
  cart: CartItem[];
  totalAmount: number;
  onClose: () => void;
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onRemoveItem: (menuItemId: string) => void;
  onCheckout: () => void;
}

export default function Cart({
  cart,
  totalAmount,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">ตะกร้าสินค้า</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🛒</div>
              <p className="text-gray-500">ตะกร้าว่างเปล่า</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.menuItem.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.menuItem.name}</h3>
                    <p className="text-sm text-gray-600">฿{item.menuItem.price.toLocaleString()}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity - 1)}
                      className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    
                    <button
                      onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity + 1)}
                      className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => onRemoveItem(item.menuItem.id)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">รวมทั้งหมด:</span>
              <span className="text-xl font-bold text-indigo-600">
                ฿{totalAmount.toLocaleString()}
              </span>
            </div>
            
            <button
              onClick={onCheckout}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              ดำเนินการสั่งซื้อ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}