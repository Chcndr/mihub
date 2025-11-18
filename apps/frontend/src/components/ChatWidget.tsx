import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatWidgetProps {
  userRole?: 'cliente' | 'operatore' | 'pa';
  userId?: string;
  context?: {
    lat?: number;
    lng?: number;
    currentPage?: string;
    [key: string]: any;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://8000-iot4ac202gehqh0qqxx5z-ce5d3831.manusvm.computer/api/v1';

export default function ChatWidget({ userRole = 'cliente', userId, context }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load suggestions on open
  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      loadSuggestions();
    }
  }, [isOpen]);

  const loadSuggestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRole, context }),
      });
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userId,
          userRole,
          context,
          history: messages,
        }),
      });

      const data = await response.json();

      // Add AI response
      setMessages(prev => [...prev, data.message]);

      // Update suggestions
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Scusa, ho avuto un problema. Riprova tra poco! 😅',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#14b8a6] hover:bg-[#0d9488] text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        aria-label="Apri chat AI"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <Card className="fixed z-50 bg-[#0b1220] border-[#14b8a6] flex flex-col md:bottom-6 md:right-6 md:w-96 md:h-[600px] md:rounded-lg md:shadow-2xl max-md:top-0 max-md:left-0 max-md:right-0 max-md:bottom-0 max-md:w-full max-md:h-[100dvh] max-md:rounded-none max-md:border-0" style={{ maxHeight: 'calc(100dvh - env(safe-area-inset-bottom))' }}>
      {/* Header */}
      <div className="bg-[#14b8a6] p-4 flex items-center justify-between md:rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-white" />
          <div>
            <h3 className="font-semibold text-white">DMS AI Assistant</h3>
            <p className="text-xs text-[#e8fbff]">
              {userRole === 'cliente' && 'Assistente Clienti'}
              {userRole === 'operatore' && 'Assistente Operatori'}
              {userRole === 'pa' && 'Assistente PA'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-[#0d9488] min-w-[44px] min-h-[44px]"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-[#9bd6de] text-sm py-8">
            <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Ciao! Come posso aiutarti oggi?</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[#14b8a6] flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            <div
              className={`max-w-[75%] p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-[#14b8a6] text-white'
                  : 'bg-[#1a2332] text-[#e8fbff] border border-[#2a3342]'
              }`}
            >
              <p className="text-base md:text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-[#9bd6de] flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-[#0b1220]" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2 justify-start">
            <div className="w-8 h-8 rounded-full bg-[#14b8a6] flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-[#1a2332] text-[#e8fbff] border border-[#2a3342] p-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#14b8a6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-[#14b8a6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-[#14b8a6] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && messages.length === 0 && (
        <div className="px-4 pb-2 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-sm md:text-xs px-4 py-2 md:px-3 md:py-1.5 bg-[#1a2332] hover:bg-[#2a3342] text-[#14b8a6] border border-[#14b8a6] rounded-full transition-colors whitespace-nowrap min-h-[44px] md:min-h-0"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-[#2a3342]">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
            placeholder="Scrivi un messaggio..."
            className="flex-1 bg-[#1a2332] border-[#2a3342] text-[#e8fbff] placeholder:text-[#6b7280]"
          />
          <Button
            onClick={() => sendMessage(inputMessage)}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-[#14b8a6] hover:bg-[#0d9488] text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
