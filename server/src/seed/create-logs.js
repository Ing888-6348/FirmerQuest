const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Log = require('../models/Log');

dotenv.config();

const ACTIONS = [
    'labOrder', 'labResult', 'receive', 'accept', 'approve',
    'reapprove', 'unapprove', 'unreceive', 'rerun', 'save',
    'listTransactions', 'getTransaction', 'analyzerResult', 'analyzerRequest'
];

const METHODS = ['GET', 'POST', 'PUT', 'DELETE'];

const ENDPOINTS = [
    '/api/lab/order', '/api/lab/result', '/api/lab/receive',
    '/api/lab/accept', '/api/lab/approve', '/api/lab/reapprove',
    '/api/transactions', '/api/transactions/detail',
    '/api/analyzer/result', '/api/analyzer/request',
    '/api/lab/save', '/api/lab/rerun'
];

const STATUS_CODES = ['200', '201', '400', '401', '404', '500'];

const MESSAGES = [
    'Success', 'Created', 'Bad Request', 'Unauthorized',
    'Not Found', 'Internal Server Error', 'OK', 'Completed'
];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomLabNumber = () => `LAB${String(randomInt(10000, 99999))}`;

const generateLogs = (userId, count) => {
    const logs = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
        // สุ่มวันที่ย้อนหลัง 30 วัน
        const timestamp = new Date(now - randomInt(0, 30 * 24 * 60 * 60 * 1000));
        const labCount = randomInt(1, 3);
        const labnumber = Array.from({ length: labCount }, () => randomLabNumber());

        logs.push({
            labnumber,
            timestamp,
            request: {
                method: randomItem(METHODS),
                endpoint: randomItem(ENDPOINTS)
            },
            response: {
                statusCode: randomItem(STATUS_CODES),
                message: randomItem(MESSAGES),
                timeMs: randomInt(5, 3000)
            },
            action: randomItem(ACTIONS),
            userId
        });
    }

    return logs;
};

const seedLogs = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI is required');
        process.exit(1);
    }

    await mongoose.connect(uri);

    try {
        // หา admin user ที่สร้างไว้
        const adminUser = await User.findOne({ username: 'admin' });
        if (!adminUser) {
            console.error('Admin user not found. Run create-admin.js first.');
            process.exit(1);
        }

        const existingCount = await Log.countDocuments();
        console.log(`Existing logs: ${existingCount}`);

        // สร้าง 100 logs
        const logs = generateLogs(adminUser._id, 100);
        await Log.insertMany(logs);

        const totalCount = await Log.countDocuments();
        console.log(`Inserted 100 sample logs. Total logs: ${totalCount}`);
    } finally {
        await mongoose.disconnect();
    }
};

seedLogs().catch((err) => {
    console.error(err);
    process.exit(1);
});
