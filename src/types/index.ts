// Advanced TypeScript interfaces and types for technical demonstration

export interface Message {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: number;
  isError?: boolean;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  apiSource?: 'openai' | 'weather' | 'news' | 'translation';
  processingTime?: number;
  confidence?: number;
  language?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface VoiceSettings {
  enabled: boolean;
  voice?: SpeechSynthesisVoice;
  rate: number;
  pitch: number;
  volume: number;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  timestamp: number;
  processingTime: number;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  voice: VoiceSettings;
  apis: {
    openai: boolean;
    weather: boolean;
    news: boolean;
    translation: boolean;
  };
  debugging: {
    enabled: boolean;
    showPerformanceMetrics: boolean;
    logAPIRequests: boolean;
  };
}

export interface PerformanceMetrics {
  renderTime: number;
  apiLatency: number;
  memoryUsage: number;
  errorRate: number;
}

export interface WebhookPayload {
  event: string;
  data: Record<string, any>;
  timestamp: number;
  source: 'zapier' | 'retool' | 'postman' | 'custom';
}

// Union types for type safety
export type MiniAppType = 'weather' | 'news' | 'translator' | 'tasks' | 'dashboard';
export type APIProvider = 'openai' | 'weather' | 'news' | 'translation';
export type VoiceCommand = 'weather' | 'news' | 'translate' | 'clear' | 'help';

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredField<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Event types for better type safety
export interface AppEvents {
  'message:sent': { message: Message };
  'voice:started': { settings: VoiceSettings };
  'voice:stopped': void;
  'api:request': { provider: APIProvider; endpoint: string };
  'api:response': { provider: APIProvider; response: APIResponse };
  'error:occurred': { error: APIError; context: string };
  'performance:measured': { metrics: PerformanceMetrics };
}

export type EventHandler<T = any> = (data: T) => void;
export type EventMap = Record<string, EventHandler>;
