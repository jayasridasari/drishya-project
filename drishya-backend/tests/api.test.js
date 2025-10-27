const request = require('supertest');
const app = require('../src/app');

describe('Healthcheck', () => {
  it('responds with OK status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
  });
});

describe('API Tests', () => {
  describe('GET /health', () => {
    it('should return 200 status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: `apitest${Date.now()}@example.com`,
          password: 'Test@1234',
          name: 'Test User',
          role: 'member'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
    });
  });

  describe('POST /api/tasks', () => {
    let token;

    beforeAll(async () => {
      const userRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: `taskuser${Date.now()}@example.com`,
          password: 'Test@1234',
          name: 'Task User',
          role: 'member'
        });
      token = userRes.body.accessToken;
    });

    it('should create a new task', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Task',
          description: 'Description',
          priority: 'Medium',
          status: 'Todo',
          dueDate: tomorrow.toISOString()
        });
      
      expect(res.statusCode).toBe(201);
      
      // API returns task directly
      expect(res.body.id).toBeDefined();
      //expect(res.body.title).toBe('Test Task');
    });
  });
});
