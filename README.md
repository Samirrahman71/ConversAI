# 🎙️ Voice AI Assistant

A modern, full-stack conversational AI voice agent built with React, TypeScript, and TailwindCSS. Features real-time voice synthesis, dynamic prompt engineering, and seamless integration with OpenAI GPT-3.5 and ElevenLabs APIs.

![Voice AI Assistant Demo](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Voice+AI+Assistant+Demo)

## ✨ Features

### 🤖 **AI-Powered Conversations**
- **OpenAI GPT-3.5 Integration**: Intelligent responses with context awareness
- **Real-time Chat Interface**: Smooth, responsive conversation flow
- **Error Handling**: Graceful fallbacks and user-friendly error messages

### 🎵 **Voice Capabilities**
- **Text-to-Speech**: ElevenLabs API integration for natural voice synthesis
- **Speech Recognition**: Browser-based voice input with Web Speech API
- **Audio Playback**: Custom audio player with controls
- **Voice Toggle**: Easy enable/disable for voice features

### 🎨 **Modern UI/UX**
- **Dark/Light Mode**: System preference detection with manual toggle
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Glassmorphism Effects**: Modern backdrop blur and transparency
- **Smooth Animations**: Typing indicators, message transitions, and micro-interactions

### 🛠️ **Developer Experience**
- **TypeScript**: Full type safety and IntelliSense support
- **Custom Hooks**: Reusable logic for LLM and voice operations
- **Component Architecture**: Modular, maintainable React components
- **Testing Suite**: Vitest setup with coverage reporting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key
- ElevenLabs API key (optional, falls back to browser speech synthesis)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/voice-ai-assistant.git
   cd voice-ai-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── InputBox.tsx     # Text input with voice controls
│   ├── AudioPlayer.tsx  # Custom audio playback
│   ├── DarkModeToggle.tsx
│   └── ConversationHistory.tsx
├── hooks/               # Custom React hooks
│   ├── useLLM.ts       # OpenAI API integration
│   └── useVoice.ts     # Voice synthesis logic
├── utils/              # Utility functions
│   ├── api.ts          # API calls and rate limiting
│   └── formatter.ts    # Text formatting helpers
├── types/              # TypeScript definitions
│   └── index.ts        # Shared interfaces
└── tests/              # Test files
    ├── components/
    └── hooks/
```

## 🧪 Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 📦 Deployment

### Netlify (Recommended)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard

3. **Environment Variables**
   Add these in your Netlify dashboard:
   ```
   VITE_OPENAI_API_KEY=your_key_here
   VITE_ELEVENLABS_API_KEY=your_key_here
   ```

### Manual Deployment
```bash
npm run build
# Upload the 'dist' folder to your hosting provider
```

## 🔧 Configuration

### API Keys Setup

#### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add to your `.env` file

#### ElevenLabs API Key (Optional)
1. Sign up at [ElevenLabs](https://elevenlabs.io/)
2. Get your API key from the dashboard
3. Add to your `.env` file

*Note: Without ElevenLabs, the app falls back to browser speech synthesis*

### Voice Settings
```typescript
// Customize voice parameters in src/utils/api.ts
const voiceSettings = {
  stability: 0.5,        // Voice consistency (0-1)
  similarity_boost: 0.75, // Voice similarity (0-1)
  style: 0.0,            // Voice style (0-1)
  use_speaker_boost: true // Enhanced clarity
}
```

## 🎯 Usage Examples

### Basic Chat
```typescript
// Type or speak your message
"What's the weather like today?"

// AI responds with text and optional voice
"I'd be happy to help with weather information..."
```

### Voice Commands
- **Enable Voice**: Click the volume icon in the header
- **Start Listening**: Click the microphone icon
- **Stop Listening**: Click again or wait for timeout

### Keyboard Shortcuts
- `Enter`: Send message
- `Shift + Enter`: New line
- `Escape`: Clear input

## 🔍 API Reference

### Custom Hooks

#### `useLLM()`
```typescript
const { generateResponse, isLoading, error } = useLLM()

// Generate AI response
const response = await generateResponse("Hello, AI!")
```

#### `useVoice()`
```typescript
const { synthesizeVoice, isLoading, error } = useVoice()

// Convert text to speech
const audioUrl = await synthesizeVoice("Hello, world!")
```

### Components

#### `<InputBox />`
```typescript
<InputBox 
  onSubmit={handleSubmit}
  disabled={isLoading}
  placeholder="Type your message..."
/>
```

#### `<AudioPlayer />`
```typescript
<AudioPlayer 
  audioUrl={audioUrl}
  onEnded={() => setAudioUrl(null)}
/>
```

## 🚦 Rate Limiting

The app includes built-in rate limiting:
- **Default**: 10 requests per hour
- **Storage**: Browser localStorage
- **Customizable**: Set `VITE_RATE_LIMIT` environment variable

## 🐛 Troubleshooting

### Common Issues

**Voice input not working**
- Ensure HTTPS connection (required for Web Speech API)
- Check browser permissions for microphone access
- Verify browser compatibility (Chrome/Edge recommended)

**API errors**
- Verify API keys are correctly set
- Check rate limits and quotas
- Ensure network connectivity

**Build failures**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version (18+ required)
- Verify all dependencies are installed

## 📊 Performance

### Optimization Features
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and font optimization
- **Caching**: Service worker for offline functionality

### Metrics
- **Bundle Size**: ~150KB gzipped
- **First Paint**: <1s on 3G
- **Interactive**: <2s on 3G
- **Lighthouse Score**: 95+ across all metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-3.5 API
- **ElevenLabs** for voice synthesis
- **Vercel** for the amazing developer experience
- **Tailwind CSS** for the utility-first CSS framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/voice-ai-assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/voice-ai-assistant/discussions)
- **Email**: your.email@example.com

---

**Built with ❤️ using React, TypeScript, and modern web technologies**

*Perfect for showcasing full-stack development skills, AI integration, and modern web development practices in your portfolio.*
