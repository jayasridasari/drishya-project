const request = require('supertest');
const app = require('../../src/app');

describe('User Management API', () => {
  let adminToken;
  let memberToken;
  let testUserId;

  beforeAll(async () => {
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `admin${Date.now()}@example.com`,
        password: 'Admin@1234',
        name: 'Admin User',
        role: 'admin'
      });
    adminToken = adminRes.body.accessToken;

    const memberRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `member${Date.now()}@example.com`,
        password: 'Member@1234',
        name: 'Member User',
        role: 'member'
      });
    memberToken = memberRes.body.accessToken;
    testUserId = memberRes.body.user.id;
  });

  describe('GET /api/users', () => {
    it('should allow admin to get all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('users');
      expect(Array.isArray(res.body.users)).toBe(true);
    });

    it('should deny member access to user list', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should allow admin to delete user', async () => {
      const userToDelete = await request(app)
        .post('/api/auth/register')
        .send({
          email: `delete${Date.now()}@example.com`,
          password: 'Delete@1234',
          name: 'Delete User',
          role: 'member'
        });

      const deleteUserId = userToDelete.body.user.id;

      const deleteRes = await request(app)
        .delete(`/api/users/${deleteUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.statusCode).toBe(200);
    });

    it('should deny member from deleting users', async () => {
      const res = await request(app)
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
