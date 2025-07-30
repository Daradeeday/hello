'use client';

import { useState } from 'react';
import { MenuItem } from '@/types';
import { addDoc, doc, updateDoc, deleteDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Edit, Trash2, Eye, EyeOff, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import { seedSampleData } from '@/lib/sampleData';

interface MenuManagementProps {
  menuItems: MenuItem[];
}

export default function MenuManagement({ menuItems }: MenuManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    available: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      imageUrl: '',
      available: true,
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      const menuItemData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrl: formData.imageUrl || undefined,
        available: formData.available,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (editingItem) {
        await updateDoc(doc(db, 'menuItems', editingItem.id), {
          ...menuItemData,
          updatedAt: serverTimestamp(),
        });
        toast.success('อัปเดตเมนูเรียบร้อยแล้ว');
      } else {
        await addDoc(collection(db, 'menuItems'), menuItemData);
        toast.success('เพิ่มเมนูเรียบร้อยแล้ว');
      }
      
      resetForm();
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึกเมนู');
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      imageUrl: item.imageUrl || '',
      available: item.available,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('คุณต้องการลบเมนูนี้หรือไม่?')) return;
    
    try {
      await deleteDoc(doc(db, 'menuItems', itemId));
      toast.success('ลบเมนูเรียบร้อยแล้ว');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการลบเมนู');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await updateDoc(doc(db, 'menuItems', item.id), {
        available: !item.available,
        updatedAt: serverTimestamp(),
      });
      toast.success(`เมนู ${item.available ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'} เรียบร้อยแล้ว`);
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  const handleSeedSampleData = async () => {
    if (!confirm('คุณต้องการเพิ่มข้อมูลตัวอย่างหรือไม่? การดำเนินการนี้จะเพิ่มเมนูตัวอย่าง 10 รายการ')) {
      return;
    }
    
    try {
      const success = await seedSampleData();
      if (success) {
        toast.success('เพิ่มข้อมูลตัวอย่างเรียบร้อยแล้ว');
      } else {
        toast.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูลตัวอย่าง');
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูลตัวอย่าง');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">จัดการเมนู</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleSeedSampleData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Database className="h-4 w-4" />
            <span>เพิ่มข้อมูลตัวอย่าง</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>เพิ่มเมนู</span>
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingItem ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อเมนู *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  หมวดหมู่ *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">เลือกหมวดหมู่</option>
                  <option value="กาแฟ">กาแฟ</option>
                  <option value="ชา">ชา</option>
                  <option value="น้ำผลไม้">น้ำผลไม้</option>
                  <option value="ของหวาน">ของหวาน</option>
                  <option value="อาหาร">อาหาร</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                คำอธิบาย
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ราคา (บาท) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL รูปภาพ
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                เปิดใช้งาน
              </label>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                {editingItem ? 'อัปเดต' : 'เพิ่มเมนู'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu Items List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เมนู
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  หมวดหมู่
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ราคา
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {menuItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-gray-500">{item.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ฿{item.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.available ? (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          เปิดใช้งาน
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3 mr-1" />
                          ปิดใช้งาน
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {menuItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีเมนู</h3>
            <p className="text-gray-600">เริ่มต้นเพิ่มเมนูแรกของคุณ</p>
          </div>
        )}
      </div>
    </div>
  );
}