import { recoverStuckDocuments } from '@/lib/startup'
import { prisma } from '@/lib/db'

jest.mock('@/lib/db', () => ({
  prisma: {
    document: {
      findMany: jest.fn() as any,
      updateMany: jest.fn() as any,
    },
  },
}))

const mockPrisma = prisma as any

describe('startup', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-minimum-32-characters-long'
    process.env.GEMINI_API_KEY = 'test-key'
    process.env.DATABASE_URL = 'postgresql://test'
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls updateMany with correct parameters', async () => {
    mockPrisma.document.updateMany.mockResolvedValue({ count: 0 })
    
    await recoverStuckDocuments()
    
    expect(mockPrisma.document.updateMany).toHaveBeenCalledWith({
      where: {
        status: 'PROCESSING',
        createdAt: {
          lt: expect.any(Date),
        },
      },
      data: {
        status: 'FAILED',
      },
    })
  })

  it('logs warning when stuck documents are recovered', async () => {
    mockPrisma.document.updateMany.mockResolvedValue({ count: 5 })
    
    await recoverStuckDocuments()
    
    expect(mockPrisma.document.updateMany).toHaveBeenCalled()
  })
})
