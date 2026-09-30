import { useState, useRef, useEffect } from 'react';
import { X, Send, User, Bot } from 'lucide-react';
import { baseUrl } from '../lib/base-url';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatbot({ isOpen, onClose }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hey human 👋 I'm your AI assistant. Ask me anything about Muhammad's work, projects, or skills!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const typeMessage = (fullMessage: string, messageId: string) => {
    let currentIndex = 0;
    const typingSpeed = 20; // milliseconds per character

    const typeInterval = setInterval(() => {
      if (currentIndex <= fullMessage.length) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: fullMessage.slice(0, currentIndex), isTyping: true }
              : msg
          )
        );
        currentIndex++;
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, isTyping: false } : msg
          )
        );
        clearInterval(typeInterval);
      }
    }, typingSpeed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input.trim();
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          conversationHistory: messages.slice(-5),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const aiMessageId = (Date.now() + 1).toString();
      const aiResponse: Message = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isTyping: true,
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
      
      // Start typing animation
      typeMessage(data.response, aiMessageId);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessageId = (Date.now() + 1).toString();
      const errorMessage: Message = {
        id: errorMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isTyping: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false);
      typeMessage("Oops! Something went wrong. Please try again.", errorMessageId);
    }
  };

  const quickQuestions = [
    "Tell me about your projects",
    "What are your skills?",
    "How can I contact you?",
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[1002] flex items-center justify-center p-4 transition-opacity duration-200"
      style={{ backgroundColor: 'hsla(0, 0%, 0%, 0.92)' }}
    >
      <div 
        className="relative w-full max-w-[50rem] h-[80vh] max-h-[700px] flex flex-col overflow-hidden border border-[#272727] backdrop-blur-[5px] transition-opacity duration-200"
        style={{ mixBlendMode: 'screen' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center text-[#00adcc] hover:text-white transition-colors duration-200"
          aria-label="Close chat"
        >
          <svg width="100%" height="100%" viewBox="0 0 29 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M28.4141 0.707031L14.9141 14.207L27.707 27L27 27.707L14.207 14.9141L1.41406 27.707L0.707031 27L13.5 14.207L0 0.707031L0.707031 0L14.207 13.5L27.707 0L28.4141 0.707031Z" fill="currentColor"/>
          </svg>
        </button>

        {/* Header with Orb GIF */}
        <div className="relative pt-8 pb-4 flex justify-center">
          <img 
            src="https://cdn.prod.website-files.com/68f3884d9e35f473a885d321/69087928063763f8e5773073_bouncing%20blinking%20orb.gif"
            alt="AI Orb"
            className="w-32 h-auto md:w-40"
          />
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-4 space-y-4 scrollbar-thin scrollbar-thumb-[#00adcc]/20 scrollbar-track-transparent">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-in slide-in-from-bottom-2 duration-300 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-[#00adcc] ${
                  message.role === 'user'
                    ? 'bg-[#00adcc]'
                    : 'bg-black'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-black" />
                ) : (
                  <Bot className="w-4 h-4 text-[#00adcc]" />
                )}
              </div>
              <div
                className={`max-w-[75%] px-4 py-3 backdrop-blur-[20px] ${
                  message.role === 'user'
                    ? 'bg-[#00adcc]/10 border border-[#00adcc] rounded-[30px_30px_0px_30px] text-right'
                    : 'bg-black/20 border border-[#00adcc] rounded-[30px_30px_30px_0px]'
                }`}
              >
                <p className="text-xs md:text-sm leading-relaxed text-white font-mono" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  {message.content}
                  {message.isTyping && message.role === 'assistant' && (
                    <span className="inline-block w-1.5 h-4 bg-[#00adcc] ml-1 animate-pulse" />
                  )}
                </p>
                {message.content && (
                  <p className="text-[9px] mt-1 opacity-60 text-[#00adcc]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-[#00adcc] bg-black">
                <Bot className="w-4 h-4 text-[#00adcc]" />
              </div>
              <div className="bg-black/20 border border-[#00adcc] rounded-[30px_30px_30px_0px] px-4 py-3 backdrop-blur-[20px]">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-[#00adcc] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[#00adcc] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[#00adcc] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {messages.length === 1 && !isTyping && (
            <div className="space-y-2 animate-in fade-in duration-500 delay-300 px-4">
              <p className="text-[10px] text-[#00adcc]/70 text-center mb-3 font-mono" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                Quick questions:
              </p>
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="w-full text-left px-4 py-3 rounded-[20px] bg-black/20 hover:bg-[#00adcc]/10 text-xs md:text-sm transition-all duration-200 border border-[#00adcc]/30 hover:border-[#00adcc] backdrop-blur-[20px] text-white font-mono"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="px-4 md:px-8 pb-6 pt-4 border-t border-[#272727]">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full px-4 py-3 rounded-full bg-black/40 border border-[#00adcc]/50 text-white text-xs md:text-sm placeholder:text-[#00adcc]/50 focus:outline-none focus:border-[#00adcc] transition-all duration-200 backdrop-blur-[20px] font-mono"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                disabled={isTyping}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-12 h-12 rounded-full bg-black text-[#00adcc] border border-[#00adcc] flex items-center justify-center hover:bg-[#00adcc] hover:text-black hover:border-black disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-[#00adcc] disabled:hover:border-[#00adcc] transition-all duration-300"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-[9px] text-[#00adcc]/50 text-center mt-3 font-mono" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            Powered by AI • Responses may vary
          </p>
        </div>

        {/* Decorative Ellipses */}
        <img 
          src="https://cdn.prod.website-files.com/68f3884d9e35f473a885d321/68f4858aac250343d662c890_2c81f5cced6abafded484e934f41324a_Ellipse%204.png"
          alt=""
          className="absolute top-0 left-0 w-32 h-32 opacity-30 pointer-events-none"
          style={{ mixBlendMode: 'screen' }}
        />
        <img 
          src="https://cdn.prod.website-files.com/68f3884d9e35f473a885d321/68f4858aac250343d662c890_2c81f5cced6abafded484e934f41324a_Ellipse%204.png"
          alt=""
          className="absolute bottom-0 right-0 w-32 h-32 opacity-30 pointer-events-none"
          style={{ mixBlendMode: 'screen' }}
        />
      </div>
    </div>
  );
}
