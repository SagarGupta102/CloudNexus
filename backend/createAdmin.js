require('dotenv').config()

const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve)
  })
}

async function createAdmin() {
  try {
    const name = await ask('Admin name: ')
    const email = await ask('Admin email: ')
    const password = await ask('Admin password: ')

    const setupSecret = process.env.ADMIN_SETUP_SECRET

    if (!setupSecret) {
      throw new Error('ADMIN_SETUP_SECRET was not found in backend/.env')
    }

    const response = await fetch(
      'http://localhost:5000/api/auth/setup/admin',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          password,
          setupSecret
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Admin setup failed')
    }

    console.log('\nAdmin account created successfully!')
    console.log('Name:', data.user.name)
    console.log('Email:', data.user.email)
    console.log('Role:', data.user.role)
  } catch (error) {
    console.error('\nAdmin setup failed:', error.message)
  } finally {
    rl.close()
  }
}

createAdmin()