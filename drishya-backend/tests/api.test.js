const request = require('supertest');
const app = require('../src/app'); // Import your Express app (without app.listen)
describe('Healthcheck', () => {
  it('responds with OK status', async () => {
    const res = await request(app).get('/health');
    expect(res.body.status).toBe('OK');
  });
});
describe('API Tests', () => {
  // Test health endpoint
  describe('GET /health', () => {
    it('should return 200 status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
    });
  });

  // Test authentication endpoint
  describe('POST /api/auth/register', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: '[email protected]',
          password: 'password123',
          name: 'Test User'
        });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
    });
  });

  // Test task creation
  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      // First, get a token by logging in
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: '[email protected]',
          password: 'password123'
        });
      
      const token = loginRes.body.token;
      
      // Create a task
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Task',
          description: 'This is a test task',
          priority: 'High',
          status: 'Todo'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.task).toHaveProperty('id');
      expect(res.body.task.title).toBe('Test Task');
    });
  });
});
