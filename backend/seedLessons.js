const mongoose = require('mongoose')
require('dotenv').config()

const Lesson = require('./models/Lesson')
const Course = require('./models/Course')

// Initial Cloud Computing lessons
const lessons = [
  {
    title: 'Introduction to Cloud Computing',
    slug: 'introduction-to-cloud-computing',
    course: 'Cloud Computing',
    description:
      'Understand cloud computing, its benefits, and common AWS services.',
    order: 1,
    durationMinutes: 10,
    level: 'Beginner',
    content:
      'Cloud computing provides computing resources such as servers, storage, databases, and networking over a network. Common benefits include flexibility, scalability, and cost efficiency. Amazon S3 provides object storage, Amazon EC2 provides virtual servers, and Amazon RDS helps manage relational databases.',
    quiz: {
      passingPercentage: 70,
      questions: [
        {
          question: 'Which AWS service is commonly used to store files as objects?',
          options: ['Amazon S3', 'Amazon EC2', 'Amazon Route 53'],
          correctOption: 0,
          explanation: 'Amazon S3 is AWS object storage.'
        }
      ]
    },

      videoUrl: 'https://www.youtube.com/watch?v=mxT233EdY5c',

    isPublished: true
  },
  {
    title: 'Cloud Service Models',
    slug: 'cloud-service-models',
    course: 'Cloud Computing',
    description:
      'Understand IaaS, PaaS, and SaaS using simple examples.',
    order: 2,
    durationMinutes: 15,
    level: 'Beginner',
    content:
      'IaaS provides computing infrastructure, such as virtual servers. PaaS provides a platform for developing and deploying applications. SaaS provides software that users can access over a network. These models offer different levels of control and management.',

      sections: [
  {
    heading: '1. What Are Cloud Service Models?',
    body:
      'Cloud service models describe how computing resources and software are delivered over a network. They help users choose the right combination of control, convenience, and management responsibility.',
    example:
      'A business might rent a virtual server, use a managed application platform, or subscribe to ready-to-use software. These represent different ways of consuming cloud services.'
  },
  {
    heading: '2. Infrastructure as a Service (IaaS)',
    body:
      'IaaS provides fundamental computing resources such as virtual machines, storage, and networking. The cloud provider manages the underlying physical infrastructure, while the customer configures and manages much of the software environment, such as the operating system and applications.',
    example:
      'Amazon EC2 lets you launch virtual servers in AWS. You choose the instance type and configure the operating system and software needed for your application.'
  },
  {
    heading: '3. Platform as a Service (PaaS)',
    body:
      'PaaS provides a managed environment for developing and deploying applications. The provider manages more of the underlying infrastructure, allowing developers to focus on application code and deployment rather than managing every server component.',
    example:
      'AWS Elastic Beanstalk helps you deploy applications while AWS manages the underlying infrastructure resources used by the environment.'
  },
  {
    heading: '4. Software as a Service (SaaS)',
    body:
      'SaaS delivers ready-to-use software over a network. The provider manages the application and its underlying infrastructure, while the customer uses the software and manages relevant settings and data.',
    example:
      'Gmail is an example of SaaS. You use the email application through a web browser or supported app without managing the servers that run it.'
  },
  {
    heading: '5. Compare IaaS, PaaS, and SaaS',
    body:
      'IaaS generally provides the greatest infrastructure control but requires more management. PaaS reduces the operational work involved in deploying applications. SaaS provides ready-to-use software and generally requires the least infrastructure management from the user.',
    example:
      'Remember it this way: IaaS gives you infrastructure, PaaS gives you a platform for applications, and SaaS gives you software that is ready to use.'
  }
],

      videoUrl: 'https://www.youtube.com/watch?v=YQXX4paUiUs',

    isPublished: true
  },
  {
    title: 'Cloud Deployment Models',
    slug: 'cloud-deployment-models',
    course: 'Cloud Computing',
    description:
      'Explore public, private, hybrid, and community cloud models.',
    order: 3,
    durationMinutes: 15,
    level: 'Beginner',
    content:
      'A public cloud provides resources through a cloud provider. A private cloud is dedicated to an organization. A hybrid cloud combines public and private cloud environments. A community cloud is shared by organizations with common requirements.',
    
    videoUrl: 'https://www.youtube.com/watch?v=Brjm7s8qUKE',

      isPublished: true
  },
  {
    title: 'Introduction to AWS',
    slug: 'introduction-to-aws',
    course: 'Cloud Computing',
    description:
      'Discover AWS and learn about EC2, S3, and RDS.',
    order: 4,
    durationMinutes: 20,
    level: 'Beginner',
    content:
      'Amazon Web Services is a cloud computing platform. Amazon EC2 provides virtual servers, Amazon S3 provides object storage, and Amazon RDS helps users set up and manage relational databases. Each service solves a different cloud computing problem.',
    
    videoUrl: 'https://www.youtube.com/watch?v=eQJrlMRBJ3c',
    
      isPublished: true
  },
  {
    title: 'Cloud Security Basics',
    slug: 'cloud-security-basics',
    course: 'Cloud Computing',
    description:
      'Learn the fundamentals of cloud security and access control.',
    order: 5,
    durationMinutes: 15,
    level: 'Beginner',
    content:
      'Cloud security includes identity and access management, strong authentication, secure network configuration, and data protection. Grant users only the permissions they need, protect credentials, and never publish database passwords or secret keys.',
    
    
    videoUrl: 'https://www.youtube.com/watch?v=U632-ND7dKQ',
    
      isPublished: true
  }
]

async function seedLessons() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing from the .env file.')
    }

    await mongoose.connect(process.env.MONGODB_URI)

    console.log('Connected to MongoDB Atlas.')

    const courseSeeds = [
      ['cloud-computing', 'Cloud Computing', 'Learn cloud concepts, AWS services, and secure cloud infrastructure from the ground up.', 'Cloud', ['cloud', 'aws', 'infrastructure']],
      ['linux', 'Linux Fundamentals', 'Build confidence with the command line, files, permissions, and system operations.', 'Linux', ['linux', 'command line']],
      ['python', 'Python Programming', 'Learn programming fundamentals with readable, practical Python examples.', 'Programming', ['python', 'coding']],
      ['database', 'Database Fundamentals', 'Understand data modeling, queries, and reliable database design.', 'Databases', ['database', 'sql']],
      ['networking', 'Networking Basics', 'Learn the concepts behind networks, protocols, addressing, and troubleshooting.', 'Networking', ['networking', 'tcp/ip']],
      ['docker', 'Docker Essentials', 'Package and run applications consistently with containers.', 'DevOps', ['docker', 'containers']],
      ['git-and-github', 'Git and GitHub', 'Track changes, collaborate, and ship software with Git workflows.', 'DevOps', ['git', 'github']]
    ]
    await Course.bulkWrite(courseSeeds.map(([slug, title, description, category, tags]) => ({
      updateOne: { filter: { slug }, update: { $setOnInsert: { title, slug, description, category, tags, isPublished: true, isPremium: false, price: 0 } }, upsert: true }
    })))

    // Insert new lessons or update existing lessons with matching slugs.
    const result = await Lesson.bulkWrite(
      lessons.map((lesson) => ({
        updateOne: {
          filter: { slug: lesson.slug },
          update: { $set: lesson },
          upsert: true
        }
      }))
    )

    console.log('Lesson seeding completed successfully!')
    console.log(`New lessons inserted: ${result.upsertedCount}`)
    console.log(`Existing lessons updated: ${result.modifiedCount}`)
    console.log(`Lessons processed: ${lessons.length}`)
  } catch (error) {
    console.error('Error seeding lessons:', error.message)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}

seedLessons()