
const request = require('supertest');
const { createApp } = require('../src/app');
const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');

describe('Security Vulnerability Check', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('should not allow creating a user via POST /api/users/login', async () => {
    // Attempt to create a user by sending a user creation payload to the login endpoint
    // If the vulnerability exists (router mounted at /api/users/login), this might trigger the root handler of userRoutes (Create User)
    // or if the path is mishandled.

    const payload = {
      username: 'hacker',
      password: 'password123',
      name: 'Hacker',
      role: 'admin'
    };

    const res = await request(app)
      .post('/api/users/login')
      .send(payload);

    // If it hits the login handler, it should fail with 401 (Invalid credentials) or 200 (if we successfully guessed credentials, which is unlikely here)
    // But importantly, it should NOT return 201 (Created)

    console.log('Response status:', res.status);
    console.log('Response body:', res.body);

    expect(res.status).not.toBe(201);

    // Also verify that the response structure looks like a login failure, not a user creation success
    // Login failure usually has { message: ... } or similar error
    // User creation success has { data: ... }
  });

  it('should require authentication for POST /api/users', async () => {
    const payload = {
      username: 'hacker2',
      password: 'password123',
      name: 'Hacker2',
      role: 'admin'
    };

    const res = await request(app)
      .post('/api/users')
      .send(payload);

    expect(res.status).toBe(401); // Unauthorized
  });
});
