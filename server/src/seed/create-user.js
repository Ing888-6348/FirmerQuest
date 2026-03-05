const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const User = require('../models/User');
const Log = require('../models/Log');

const ACTIONS = [
    'labOrder', 'labResult', 'receive', 'accept', 'approve',
    'reapprove', 'unapprove', 'unreceive', 'rerun', 'save',
    'listTransactions', 'getTransaction', 'analyzerResult', 'analyzerRequest'
];
const METHODS = ['GET', 'POST', 'PUT', 'DELETE'];
const ENDPOINTS = [
    '/api/lab/order', '/api/lab/result', '/api/lab/receive',
    '/api/lab/accept', '/api/lab/approve', '/api/transactions',
    '/api/analyzer/result', '/api/analyzer/request', '/api/lab/save'
];
const STATUS_CODES = ['200', '201', '400', '404', '500'];
const MESSAGES = ['Success', 'Created', 'Bad Request', 'Not Found', 'OK', 'Completed'];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomLabNumber = () => `LAB${String(randomInt(10000, 99999))}`;

const generateLogs = (userId, count) => {
    const logs = [];
    const now = Date.now();
    for (let i = 0; i < count; i++) {
        const timestamp = new Date(now - randomInt(0, 30 * 24 * 60 * 60 * 1000));
        logs.push({
            labnumber: Array.from({ length: randomInt(1, 2) }, () => randomLabNumber()),
            timestamp,
            request: { method: randomItem(METHODS), endpoint: randomItem(ENDPOINTS) },
            response: {
                statusCode: randomItem(STATUS_CODES),
                message: randomItem(MESSAGES),
                timeMs: randomInt(5, 2000)
            },
            action: randomItem(ACTIONS),
            userId
        });
    }
    return logs;
};

// ===== รายชื่อ user ที่ต้องการสร้าง =====
const USERS = [
    {
        username: 'admin1',
        password: 'admin1234',
        code: 'ADM001',
        prefix: 'นาย',
        firstname: 'สมศักดิ์',
        lastname: 'ผู้ดูแล',
        level: 'admin',
        logCount: 80
    },
    {
        username: 'admin2',
        password: 'admin1234',
        code: 'ADM002',
        prefix: 'นาง',
        firstname: 'สมหญิง',
        lastname: 'จัดการ',
        level: 'admin',
        logCount: 60
    },
    {
        username: 'user1',
        password: 'user1234',
        code: 'USR001',
        prefix: 'นาย',
        firstname: 'สมชาย',
        lastname: 'ใจดี',
        level: 'user',
        logCount: 50
    },
    {
        username: 'user2',
        password: 'user1234',
        code: 'USR002',
        prefix: 'นางสาว',
        firstname: 'สมหญิง',
        lastname: 'รักดี',
        level: 'user',
        logCount: 40
    },
    {
        username: 'user3',
        password: 'user1234',
        code: 'USR003',
        prefix: 'นาย',
        firstname: 'สมบูรณ์',
        lastname: 'มั่นคง',
        level: 'user',
        logCount: 30
    }
];

const seedUsers = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) { console.error('❌ MONGODB_URI is required'); process.exit(1); }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(uri);

    try {
        console.log('🚀 Starting user seed...\n');

        for (const userData of USERS) {
            const { username, password, logCount, ...rest } = userData;

            let user = await User.findOne({ username });
            if (!user) {
                const hashed = await bcrypt.hash(password, 10);
                user = await User.create({
                    username,
                    password: hashed,
                    ...rest,
                    isActive: true,
                    isDel: false
                });
                console.log(`✅ Created user: ${username}`);
            } else {
                console.log(`⚠️  User "${username}" already exists, skipping...`);
            }

            // สร้าง logs สำหรับ user นี้
            const logs = generateLogs(user._id, logCount);
            await Log.insertMany(logs);
            console.log(`   📝 Inserted ${logCount} logs for "${username}"`);
        }

        console.log('\n========================================');
        console.log('🎉 Seed completed!');
        console.log('========================================');
        console.log('\n📋 User Credentials:');
        console.log('----------------------------------------');
        for (const u of USERS) {
            console.log(`  👤 ${u.username} | 🔑 ${u.password} | 🏷️  ${u.level} | ${u.prefix}${u.firstname} ${u.lastname}`);
        }
        console.log('----------------------------------------');
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB.');
    }
};

seedUsers().catch((err) => { console.error('❌ Seed failed:', err); process.exit(1); });
