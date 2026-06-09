import { prisma } from '@/lib/db'

export async function recoverStuckDocuments(): Promise<void> {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)

  const result = await prisma.document.updateMany({
    where: {
      status: 'PROCESSING',
      createdAt: { lt: tenMinutesAgo },
    },
    data: {
      status: 'FAILED',
    },
  })

  if (result.count > 0) {
    console.warn(`Recovered ${result.count} stuck documents`)
  }
}
