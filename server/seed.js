const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');

// Fix SRV DNS resolution issues on Windows/ISPs
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore
}

const Parcel = require('./models/Parcel');
const Resident = require('./models/Resident');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://quiz:hegazy2003@cluster0.hv6iycd.mongodb.net/mivida?retryWrites=true&w=majority&appName=Cluster0';

const initialParcels = [
  'Parcel 1', 'Parcel 2', 'Parcel 3', 'Parcel 4', 'Parcel 5',
  'Parcel 6', 'Parcel 7', 'Parcel 8', 'Parcel 9', 'Parcel 10',
  'Parcel 11', 'Parcel 12', 'Parcel 13', 'Parcel 14', 'Parcel 15',
  'Parcel 16', 'Parcel 17', 'Parcel 18', 'Parcel 19', 'Parcel 20',
  'Parcel 21', 'Parcel 22', 'Parcel 23', 'Parcel 24', 'Parcel 25',
  'Parcel 26', 'Parcel 27', 'Parcel 28', 'Parcel 29', 'Parcel 30',
  'Mivida Boulevard', 'Springs', 'Greens', 'The Crescent', 'Gardens'
];

const initialResidents = [
  {
    name: 'أحمد محمد حجازي',
    apartmentNumber: '101',
    carNumber: 'أ ب ج 1234',
    children: ['عمر', 'سلمى'],
    parcel: 'Parcel 1'
  },
  {
    name: 'محمود حسن السيد',
    apartmentNumber: '204',
    carNumber: 'س ص ع 5678',
    children: ['علي', 'فريدة'],
    parcel: 'Parcel 2'
  },
  {
    name: 'سارة عبد الفتاح',
    apartmentNumber: '302',
    carNumber: 'ط ي ك 9012',
    children: ['يوسف'],
    parcel: 'Parcel 3'
  },
  {
    name: 'خالد إبراهيم مصطفى',
    apartmentNumber: '405',
    carNumber: 'م ن هـ 3456',
    children: ['نور', 'أحمد', 'مريم'],
    parcel: 'Parcel 4'
  },
  {
    name: 'رانيا طارق عبد العزيز',
    apartmentNumber: '102',
    carNumber: 'و ز ح 7890',
    children: ['ليان'],
    parcel: 'Parcel 5'
  },
  {
    name: 'عمرو عادل كامل',
    apartmentNumber: '501',
    carNumber: 'ق ر ش 2345',
    children: ['ياسين', 'جودي'],
    parcel: 'Parcel 1'
  },
  {
    name: 'داليا شريف صلاح',
    apartmentNumber: '203',
    carNumber: 'ت ث ج 6789',
    children: ['حمزة', 'مالك'],
    parcel: 'Mivida Boulevard'
  },
  {
    name: 'محمد سعيد فاروق',
    apartmentNumber: '304',
    carNumber: 'ح خ د 1122',
    children: ['كنزي'],
    parcel: 'Springs'
  }
];

async function seedDB() {
  console.log('جاري الاتصال بقاعدة البيانات في MongoDB Atlas...');
  console.log('URI:', MONGODB_URI.replace(/:([^@]+)@/, ':****@'));

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    console.log('✅ تم الاتصال بنجاح بقاعدة البيانات!');

    // Create Indexes
    console.log('جاري إنشاء الفهارس (Indexes)...');
    await Parcel.createIndexes();
    await Resident.createIndexes();

    // Check existing count
    const existingParcelsCount = await Parcel.countDocuments();
    const existingResidentsCount = await Resident.countDocuments();

    console.log(`عدد البارسيل الحالي: ${existingParcelsCount}`);
    console.log(`عدد السكان الحالي: ${existingResidentsCount}`);

    // Seed Parcels if empty or add missing ones
    for (const pName of initialParcels) {
      await Parcel.updateOne(
        { name: pName },
        { $setOnInsert: { name: pName } },
        { upsert: true }
      );
    }
    console.log('✅ تم تجهيز واستيراد جميع البارسيل بنجاح!');

    // Seed Residents if collection is empty
    if (existingResidentsCount === 0) {
      await Resident.insertMany(initialResidents);
      console.log('✅ تم استيراد بيانات السكان الابتدائية بنجاح!');
    } else {
      console.log('بيانات السكان موجودة بالفعل، لم يتم المساس بها.');
    }

    const finalParcelsCount = await Parcel.countDocuments();
    const finalResidentsCount = await Resident.countDocuments();

    console.log(`\n🎉 ملخص قاعدة البيانات النهائي على MongoDB Atlas:`);
    console.log(`- إجمالي عدد البارسيل (Parcels): ${finalParcelsCount}`);
    console.log(`- إجمالي عدد السكان (Residents): ${finalResidentsCount}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ خطأ أثناء الاتصال أو رفع البيانات:', err);
    process.exit(1);
  }
}

seedDB();
