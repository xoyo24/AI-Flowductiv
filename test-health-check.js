// Simple test to verify health check functionality
import { $fetch } from 'ofetch'

async function testHealthCheck() {
  console.log('Testing AI provider health checks...')
  
  try {
    // Start dev server first
    const spawn = require('child_process').spawn
    const server = spawn('bun', ['dev'], { detached: true })
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Test Claude provider
    console.log('\n1. Testing Claude provider:')
    const claudeResult = await $fetch('http://localhost:3000/api/ai/health-check?provider=claude')
    console.log('   Result:', JSON.stringify(claudeResult, null, 2))
    
    // Test OpenAI provider
    console.log('\n2. Testing OpenAI provider:')
    const openaiResult = await $fetch('http://localhost:3000/api/ai/health-check?provider=openai')
    console.log('   Result:', JSON.stringify(openaiResult, null, 2))
    
    // Test all providers
    console.log('\n3. Testing all providers:')
    const allResult = await $fetch('http://localhost:3000/api/ai/health-check')
    console.log('   Result:', JSON.stringify(allResult, null, 2))
    
    // Kill server
    process.kill(-server.pid)
    
  } catch (error) {
    console.error('Test failed:', error.message)
  }
}

testHealthCheck()