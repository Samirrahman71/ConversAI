// Mock API responses to avoid external dependencies

export const generateLLMResponse = async (prompt: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple response based on input
  if (prompt.toLowerCase().includes('hello') || prompt.toLowerCase().includes('hi')) {
    return "Hello! I'm your AI assistant. How can I help you today?";
  }
  
  if (prompt.toLowerCase().includes('your name')) {
    return "I'm your friendly AI assistant!";
  }
  
  return `I received your message: "${prompt}"`;
};

export const synthesizeVoiceResponse = async (text: string): Promise<string> => {
  // Use browser's speech synthesis if available
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  }
  
  // Return empty string to indicate we're using browser TTS
  return '';
};
