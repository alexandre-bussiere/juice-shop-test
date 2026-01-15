import config from 'config'
import * as fs from 'fs'
import * as path from 'path'

const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) 
{
  const envFile = fs.readFileSync(envPath, 'utf8')
  const envLines = envFile.split('\n')
  
  for (const line of envLines) 
  {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) 
    {
      continue
    }
    
    const equalIndex = trimmedLine.indexOf('=')
    if (equalIndex > 0) 
    {
      const key = trimmedLine.substring(0, equalIndex).trim()
      let value = trimmedLine.substring(equalIndex + 1).trim()
      
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) 
      {
        value = value.slice(1, -1)
      }
    
      if (!process.env[key]) 
      {
        process.env[key] = value
      }
    }
  }
}

export function getTestUserEmail (): string 
{
  const email = process.env.TEST_USER_EMAIL
  
  if (!email || email.trim() === '') {
    throw new Error(
      'TEST_USER_EMAIL is not set. Please provide test credentials:\n' +
      '  1. Create a .env file in the project root (copy from test/env.example)\n' +
      '  2. Add: TEST_USER_EMAIL=your-email@example.com\n' +
      '  3. Add: TEST_USER_PASSWORD=your-secure-password\n' +
      '  Or set environment variables: export TEST_USER_EMAIL=...'
    )
  }

  if (email.includes('@')) 
  {
    return email.trim()
  }
  return `${email.trim()}@${config.get<string>('application.domain')}`
}

export function getTestUserPassword (): string 
{
  const password = process.env.TEST_USER_PASSWORD
  
  if (!password || password.trim() === '') 
  {
    throw new Error(
      'TEST_USER_PASSWORD is not set. Please provide test credentials:\n' +
      '  1. Create a .env file in the project root (copy from test/env.example)\n' +
      '  2. Add: TEST_USER_EMAIL=your-email@example.com\n' +
      '  3. Add: TEST_USER_PASSWORD=your-secure-password\n' +
      '  Or set environment variables: export TEST_USER_PASSWORD=...'
    )
  }
  
  return password.trim()
}


export function getTestCredentials (): { email: string, password: string } 
{
  return {
    email: getTestUserEmail(),
    password: getTestUserPassword()
  }
}
