jest.mock('@/lib/env', () => ({
  env: {
    DATABASE_URL: 'postgresql://test',
    JWT_SECRET: 'test-secret-minimum-32-characters-long',
    GEMINI_API_KEY: 'test-key',
    NODE_ENV: 'test',
  },
}))

jest.mock('jose', () => ({
  SignJWT: class {
    constructor(payload: any) {
      this.payload = payload
    }
    setProtectedHeader() { return this }
    setIssuedAt() { return this }
    setExpirationTime() { return this }
    async sign() { return 'header.payload.signature' }
    payload: any
  },
  jwtVerify: async (token: string) => {
    if (token === 'invalid.token.here' || token === '') {
      throw new Error('Invalid token')
    }
    return { payload: { userId: '123' } }
  },
}))

import { hashPassword, comparePassword, signJwt, verifyJwt } from '@/lib/auth'

describe('auth', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-minimum-32-characters-long'
    process.env.GEMINI_API_KEY = 'test-key'
    process.env.DATABASE_URL = 'postgresql://test'
  })

  describe('hashPassword', () => {
    it('hashes password to different value', async () => {
      const password = 'testpassword123'
      const hash = await hashPassword(password)
      expect(hash).not.toBe(password)
      expect(hash).toBeDefined()
    })
  })

  describe('comparePassword', () => {
    it('returns true for correct password', async () => {
      const password = 'testpassword123'
      const hash = await hashPassword(password)
      const result = await comparePassword(password, hash)
      expect(result).toBe(true)
    })

    it('returns false for incorrect password', async () => {
      const password = 'testpassword123'
      const hash = await hashPassword(password)
      const result = await comparePassword('wrongpassword', hash)
      expect(result).toBe(false)
    })
  })

  describe('signJwt', () => {
    it('returns JWT string with 3 parts separated by dots', async () => {
      const payload = { userId: '123' }
      const token = await signJwt(payload)
      const parts = token.split('.')
      expect(parts).toHaveLength(3)
    })
  })

  describe('verifyJwt', () => {
    it('returns payload for valid token', async () => {
      const payload = { userId: '123' }
      const token = await signJwt(payload)
      const result = await verifyJwt(token)
      expect(result).toEqual(payload)
    })

    it('returns null for invalid token', async () => {
      const result = await verifyJwt('invalid.token.here')
      expect(result).toBeNull()
    })

    it('returns null for empty string', async () => {
      const result = await verifyJwt('')
      expect(result).toBeNull()
    })
  })
})
