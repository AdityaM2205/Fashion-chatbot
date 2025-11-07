import { useState, useRef, useEffect } from 'react';
import { ThemeProvider } from './components/theme-provider';
import { ModeToggle } from './components/mode-toggle';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { chatApi, type Message } from './utils/api';

type ChatMessage = Message & {
  id: string;
  timestamp: Date;
};

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check API connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await chatApi.getHealth();
        setIsConnected(true);
        
        // Add welcome message
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: 'Hello! I\'m your fashion assistant. How can I help you with your style today?',
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error('Failed to connect to API:', error);
        setMessages([
          {
            id: 'error',
            role: 'assistant',
            content: 'I\'m having trouble connecting to the fashion assistant service. Some features may be limited.',
            timestamp: new Date(),
          },
        ]);
      }
    };

    checkConnection();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    // Update UI immediately with user message
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare conversation history for the API
      const conversationHistory = messages
        .filter(msg => msg.role !== 'assistant' || !msg.content.startsWith('I\'m having trouble'))
        .map(({ role, content }) => ({ role, content }));

      // Call the API
      const response = await chatApi.sendMessage(input, conversationHistory);
      
      const botMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        content: response.response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                Fashion Assistant
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center text-sm font-medium ${isConnected ? 'text-green-500' : 'text-amber-500'}`}>
                <div className={`h-2.5 w-2.5 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-amber-500'}`} />
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
              <ModeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto flex flex-col p-4 max-w-4xl">
          <div className="chat-container flex-1 overflow-y-auto p-6 mb-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-8">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-pink-500 rounded-full opacity-20 blur-xl"></div>
                  <div className="relative bg-white/80 dark:bg-gray-800/80 p-4 rounded-full shadow-lg">
                    <Sparkles className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-3">Welcome to Fashion Assistant</h2>
                <p className="max-w-md text-gray-600 dark:text-gray-300 mb-6">Ask me anything about fashion, styling tips, or outfit recommendations!</p>
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <p className="font-medium text-gray-700 dark:text-gray-200">Try asking:</p>
                  <p className="px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">"What should I wear to a summer wedding?"</p>
                  <p className="px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">"How do I style a denim jacket?"</p>
                  <p className="px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">"What colors go well with navy blue?"</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex max-w-[90%] md:max-w-[80%] p-4 ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
                    >
                      <div className="mr-3 mt-0.5">
                        {message.role === 'user' ? (
                          <User className="h-5 w-5" />
                        ) : (
                          <Bot className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {message.content.split('\n').map((line, i) => (
                            <p key={i} className="mb-2 last:mb-0">
                              {line || <br />}
                            </p>
                          ))}
                        </div>
                        <div className="mt-1 text-xs opacity-70 flex justify-end">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center space-x-2 pl-4">
                    <Bot className="h-5 w-5 text-muted-foreground" />
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex space-x-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-2 rounded-full border border-gray-100 dark:border-gray-800 shadow-lg">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about fashion..."
              className="flex-1 rounded-full px-6 h-12 focus-visible:ring-2 focus-visible:ring-primary/50 border-0 bg-transparent"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-12 w-12 rounded-full"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </main>

        <footer className="border-t py-4 text-center text-sm text-muted-foreground">
          <p>Fashion Assistant &copy; {new Date().getFullYear()} - Your Personal Style Guide</p>
        </footer>
      </div>
    </ThemeProvider>
  );
}
