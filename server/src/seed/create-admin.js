const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createAdmin = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI is required');
        process.exit(1);
    }

    await mongoose.connect(uri);

    const username = 'admin';
    const password = 'admin1234';

    const exists = await User.findOne({ username });
    if (exists) {
        console.log(`User "${username}" already exists.`);
        await mongoose.disconnect();
        return;
    }

    await User.create({
        username,
        password: password, // Store as plain text
        code: 'ADM001',
        prefix: '',
        firstname: 'Admin',
        lastname: 'User',
        level: 'admin',
        isActive: true,
        isDel: false
    });

    console.log(`Admin user created!`);
    console.log(`  username: ${username}`);
    console.log(`  password: ${password}`);

    await mongoose.disconnect();
};

createAdmin().catch((err) => {
    console.error(err);
    process.exit(1);
});
