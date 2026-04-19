const request = require('supertest');
// Export the app from server.js for testing, or require it
const app = require('../server');

describe('API Endpoints', () => {
  it('GET /api/venue/density should return stadium density stats', async () => {
    const res = await request(app).get('/api/venue/density');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('timestamp');
  });

  it('POST /api/auth/login should return a mock user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
  });
});
