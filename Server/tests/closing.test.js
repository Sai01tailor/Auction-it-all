const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user.model');
const Item = require('../models/item.model');
const Handoff = require('../models/Handoff.model');
const Dispute = require('../models/Dispute.model');

describe('Phase 5 Closing & Operations Endpoints', () => {
  let adminToken, userToken;
  let adminUser, normalUser;
  let testItem;
  let handoffRoom;

  beforeAll(async () => {
    // Connect to mongoose if not connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bidkar_test');
    }

    // Clear test tables
    await User.deleteMany({});
    await Item.deleteMany({});
    await Handoff.deleteMany({});
    await Dispute.deleteMany({});

    // Create Admin User
    adminUser = await User.create({
      username: 'testadmin',
      email: 'admin@test.com',
      password: 'Password123',
      role: 'ADMIN',
      kycStatus: 'Verified',
      isVerified: true
    });

    // Create Normal User
    normalUser = await User.create({
      username: 'testbuyer',
      email: 'buyer@test.com',
      password: 'Password123',
      role: 'USER',
      kycStatus: 'Pending',
      isVerified: true
    });

    // Generate JWTs (mocked for simplicity or standard logins)
    // For test context, we assume Supertest will pass standard headers or we use authentication controllers.
    // If auth routes exist, we can login to get token. Let's register & login.
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/admin/pulse', () => {
    it('should return 401 if token is missing', async () => {
      const res = await request(app).get('/api/admin/pulse');
      expect(res.status).toBe(401);
    });
  });
});
