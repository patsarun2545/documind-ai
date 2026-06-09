import { NextRequest } from 'next/server'

describe('rateLimit', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-minimum-32-characters-long'
    process.env.GEMINI_API_KEY = 'test-key'
    process.env.DATABASE_URL = 'postgresql://test'
  })

  beforeEach(() => {
    // Clear the in-memory store before each test
    jest.resetModules()
  })

  const createMockRequest = (ip: string) => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === 'x-forwarded-for') return ip
          if (name === 'x-real-ip') return ip
          return null
        },
      },
    } as unknown as NextRequest
    return request
  }

  it('returns null for first request (passes)', () => {
    const { rateLimit } = require('@/lib/rateLimit')
    const request = createMockRequest('127.0.0.1')
    const result = rateLimit(request, 'auth')
    expect(result).toBeNull()
  })

  it('returns null when under auth limit (10 requests)', () => {
    const { rateLimit } = require('@/lib/rateLimit')
    const request = createMockRequest('127.0.0.1')
    
    for (let i = 0; i < 10; i++) {
      const result = rateLimit(request, 'auth')
      expect(result).toBeNull()
    }
  })

  it('returns 429 response when exceeding auth limit (>10)', () => {
    const { rateLimit } = require('@/lib/rateLimit')
    const request = createMockRequest('127.0.0.1')
    
    // Make 11 requests
    for (let i = 0; i < 11; i++) {
      rateLimit(request, 'auth')
    }
    
    const result = rateLimit(request, 'auth')
    expect(result).not.toBeNull()
    expect(result?.status).toBe(429)
  })

  it('returns 429 response when exceeding api limit (>60)', () => {
    const { rateLimit } = require('@/lib/rateLimit')
    const request = createMockRequest('127.0.0.1')
    
    // Make 61 requests
    for (let i = 0; i < 61; i++) {
      rateLimit(request, 'api')
    }
    
    const result = rateLimit(request, 'api')
    expect(result).not.toBeNull()
    expect(result?.status).toBe(429)
  })

  it('allows requests again after reset window', async () => {
    const { rateLimit } = require('@/lib/rateLimit')
    const request = createMockRequest('127.0.0.1')
    
    // Make 61 requests to exceed api limit (1 minute window)
    for (let i = 0; i < 61; i++) {
      rateLimit(request, 'api')
    }
    
    let result = rateLimit(request, 'api')
    expect(result).not.toBeNull()
    
    // Wait for window to reset (60 seconds)
    await new Promise(resolve => setTimeout(resolve, 61000))
    
    result = rateLimit(request, 'api')
    expect(result).toBeNull()
  }, 65000)

  it('rate limits separately for different IPs', () => {
    const { rateLimit } = require('@/lib/rateLimit')
    const request1 = createMockRequest('127.0.0.1')
    const request2 = createMockRequest('127.0.0.2')
    
    // Exceed limit for IP 1
    for (let i = 0; i < 11; i++) {
      rateLimit(request1, 'auth')
    }
    
    const result1 = rateLimit(request1, 'auth')
    expect(result1).not.toBeNull()
    
    // IP 2 should still pass
    const result2 = rateLimit(request2, 'auth')
    expect(result2).toBeNull()
  })
})
