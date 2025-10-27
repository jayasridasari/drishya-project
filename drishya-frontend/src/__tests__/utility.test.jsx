import { describe, it, expect } from 'vitest';

describe('Utility Functions', () => {
  it('should add two numbers', () => {
    const add = (a, b) => a + b;
    expect(add(2, 3)).toBe(5);
  });

  it('should check if string is empty', () => {
    const isEmpty = (str) => str.trim().length === 0;
    
    expect(isEmpty('   ')).toBe(true);
    expect(isEmpty('hello')).toBe(false);
  });

  it('should format date correctly', () => {
    const date = new Date('2025-01-15');
    expect(date.getFullYear()).toBe(2025);
  });

  it('should validate email format', () => {
    const isValidEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    };
    
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
  });
});
