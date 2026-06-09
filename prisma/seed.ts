import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create demo user
  const hashedPassword = await bcrypt.hash('Demo1234!', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@documind.app' },
    update: {},
    create: {
      email: 'demo@documind.app',
      password: hashedPassword,
      name: 'Demo User',
    },
  })

  console.log('Created demo user:', user.email)

  // Create sample document
  const document = await prisma.document.create({
    data: {
      userId: user.id,
      title: 'Sample Document',
      fileName: 'sample.pdf',
      fileSize: 1024,
      fileType: 'application/pdf',
      status: 'READY',
    },
  })

  console.log('Created sample document:', document.title)

  // Create sample chat session
  const chatSession = await prisma.chatSession.create({
    data: {
      userId: user.id,
      documentId: document.id,
      title: 'Chat about Sample Document',
    },
  })

  console.log('Created sample chat session:', chatSession.title)

  // Create sample messages
  await prisma.chatMessage.createMany({
    data: [
      {
        sessionId: chatSession.id,
        role: 'USER',
        content: 'What is this document about?',
      },
      {
        sessionId: chatSession.id,
        role: 'ASSISTANT',
        content: 'This is a sample document for demonstration purposes.',
        sources: { pages: [1, 2] },
      },
    ],
  })

  console.log('Created sample messages')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
