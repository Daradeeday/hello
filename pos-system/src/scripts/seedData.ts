import { seedSampleData } from '@/lib/sampleData';

async function runSeed() {
  try {
    console.log('Starting to seed sample data...');
    const success = await seedSampleData();
    if (success) {
      console.log('✅ Sample data seeded successfully!');
    } else {
      console.log('❌ Failed to seed sample data');
    }
  } catch (error) {
    console.error('Error running seed:', error);
  }
}

runSeed();