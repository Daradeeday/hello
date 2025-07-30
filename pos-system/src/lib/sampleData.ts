import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { MenuItem } from '@/types';

export const sampleMenuItems: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'กาแฟดำ',
    description: 'กาแฟดำร้อน 100% อาราบิก้า',
    price: 45,
    category: 'กาแฟ',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
    available: true,
  },
  {
    name: 'กาแฟลาเต้',
    description: 'กาแฟลาเต้ร้อน นมสด 100%',
    price: 55,
    category: 'กาแฟ',
    imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&h=300&fit=crop',
    available: true,
  },
  {
    name: 'ชาเขียว',
    description: 'ชาเขียวญี่ปุ่นแท้ 100%',
    price: 35,
    category: 'ชา',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    available: true,
  },
  {
    name: 'ชานม',
    description: 'ชานมร้อน นมสด 100%',
    price: 40,
    category: 'ชา',
    imageUrl: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400&h=300&fit=crop',
    available: true,
  },
  {
    name: 'น้ำส้มคั้น',
    description: 'น้ำส้มคั้นสด 100% ไม่ใส่น้ำตาล',
    price: 60,
    category: 'น้ำผลไม้',
    imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop',
    available: true,
  },
  {
    name: 'น้ำแอปเปิ้ล',
    description: 'น้ำแอปเปิ้ลคั้นสด 100%',
    price: 65,
    category: 'น้ำผลไม้',
    imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=300&fit=crop',
    available: true,
  },
  {
    name: 'เค้กช็อกโกแลต',
    description: 'เค้กช็อกโกแลตชิ้นใหญ่',
    price: 85,
    category: 'ของหวาน',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    available: true,
  },
  {
    name: 'บราวนี่',
    description: 'บราวนี่ช็อกโกแลตชิ้นใหญ่',
    price: 75,
    category: 'ของหวาน',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop',
    available: true,
  },
  {
    name: 'แซนด์วิชไก่',
    description: 'แซนด์วิชไก่ย่าง สดใหม่ทุกวัน',
    price: 95,
    category: 'อาหาร',
    imageUrl: 'https://images.unsplash.com/photo-1528735602786-469f3812393c?w=400&h=300&fit=crop',
    available: true,
  },
  {
    name: 'สลัดซีซาร์',
    description: 'สลัดซีซาร์ ผักสด น้ำสลัดพิเศษ',
    price: 120,
    category: 'อาหาร',
    imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
    available: true,
  },
];

export const seedSampleData = async () => {
  try {
    const menuItemsRef = collection(db, 'menuItems');
    
    for (const item of sampleMenuItems) {
      await addDoc(menuItemsRef, {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    
    console.log('Sample data seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding sample data:', error);
    return false;
  }
};