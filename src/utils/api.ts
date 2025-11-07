import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  conversation_history: Message[];
}

export interface ChatResponse {
  response: string;
  metadata?: Record<string, any>;
}

export const chatApi = {
  async sendMessage(message: string, conversationHistory: Message[] = []): Promise<ChatResponse> {
    try {
      const response = await api.post<ChatResponse>('/chat', {
        message,
        conversation_history: conversationHistory,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async getHealth(): Promise<{ status: string }> {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error checking API health:', error);
      throw error;
    }
  },
};

export default api;
