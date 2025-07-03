// Quick test script to verify voice functionality
console.log('🎤 Testing Voice Functionality...')

// Test 1: Check if Speech Recognition is available
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  console.log('✅ Speech Recognition API is available')
} else {
  console.log('❌ Speech Recognition API is NOT available')
}

// Test 2: Check if Speech Synthesis is available
if ('speechSynthesis' in window) {
  console.log('✅ Speech Synthesis API is available')
  
  // Test speaking
  const utterance = new SpeechSynthesisUtterance('Voice test successful!')
  utterance.rate = 0.9
  utterance.pitch = 1.0
  utterance.volume = 0.8
  
  speechSynthesis.speak(utterance)
  console.log('🔊 Playing test voice message...')
} else {
  console.log('❌ Speech Synthesis API is NOT available')
}

// Test 3: Check environment variables (for browser console)
console.log('🔧 Environment Check:')
console.log('- VITE_OPENAI_API_KEY exists:', !!import.meta?.env?.VITE_OPENAI_API_KEY)
console.log('- VITE_USE_MOCK_APIS:', import.meta?.env?.VITE_USE_MOCK_APIS)

console.log('✨ Voice functionality test complete!')
