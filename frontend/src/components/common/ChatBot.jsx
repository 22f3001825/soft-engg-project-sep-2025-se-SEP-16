import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, ThumbsUp, ThumbsDown, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useAuth } from '../../context/AuthContext';
import chatApi from '../../services/chatApi';
import { toast } from 'react-hot-toast';

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [serviceAvailable, setServiceAvailable] = useState(true);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation when chat is opened
  useEffect(() => {
    if (isOpen && !conversationId && !isInitializing) {
      initializeChat();
    }
  }, [isOpen]);

  const initializeChat = async () => {
    setIsInitializing(true);
    try {
      // Assume service is available and start conversation directly
      setServiceAvailable(true);

      // Start conversation WITHOUT initial message (no greeting parameter)
      const conversation = await chatApi.startChat();
      
      setConversationId(conversation.id);
      
      // Add only the AI greeting message (don't send it to backend)
      setMessages([{
        id: 'greeting-1',
        sender: 'ai',
        message: "Hello! I'm here to help you with orders, returns, refunds, and any questions you have.",
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setServiceAvailable(false);
      // Add fallback message
      setMessages([{
        id: 'fallback-1',
        sender: 'ai',
        message: "Hello! I'm currently experiencing technical difficulties. You can still create a support ticket for assistance.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !conversationId) return;

    const userMessageText = inputMessage;
    setInputMessage('');

    // Add user message to UI immediately
    const tempUserMsg = {
      id: `temp-user-${Date.now()}`,
      sender: 'customer',
      message: userMessageText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsTyping(true);

    try {
      // Send message to backend RAG service
      const response = await chatApi.sendMessage(conversationId, userMessageText);
      
      // Add AI response
      const aiMessage = {
        id: response.id,
        sender: 'ai',
        message: response.content,
        timestamp: new Date().toISOString(), // Use current time
        sources: response.rag_sources,
        messageId: response.id
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
      
      // Add error message
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        sender: 'ai',
        message: "I'm sorry, I'm having trouble processing your request right now. Please try again or create a support ticket.",
        timestamp: new Date().toISOString(),
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedback = async (messageId, isPositive) => {
    try {
      await chatApi.submitFeedback(messageId, isPositive ? 5 : 1);
      toast.success('Thank you for your feedback!');
      
      // Update message to show feedback was given
      setMessages(prev => prev.map(msg => 
        msg.messageId === messageId 
          ? { ...msg, feedbackGiven: true }
          : msg
      ));
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleEscalate = async () => {
    if (!conversationId) return;
    
    try {
      await chatApi.escalateToAgent(conversationId, 'Customer requested human assistance');
      toast.success('Your conversation has been escalated to our support team. They will contact you shortly.');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to escalate:', error);
      toast.error('Failed to escalate. Please create a support ticket instead.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl hover:scale-110 btn-transition z-50"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[380px] h-[600px] shadow-xl z-50 flex flex-col animate-slide-in-right">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary to-accent">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 bg-white">
                <AvatarFallback className="bg-white text-primary font-bold">
                  AI
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-primary-foreground">Intellica AI</h3>
                <p className="text-xs text-primary-foreground/80">Always here to help</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isInitializing ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Connecting to AI assistant...</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex w-full ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'} animate-slide-in-up`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.sender === 'ai'
                          ? msg.isError
                            ? 'bg-red-50 text-red-900 border border-red-200'
                            : 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      
                      {/* Show sources if available */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-300">
                          <p className="text-xs opacity-70 flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            Sources: {msg.sources.length} knowledge base article(s)
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        
                        {/* Feedback buttons for AI messages */}
                        {msg.sender === 'ai' && msg.messageId && !msg.feedbackGiven && !msg.isError && (
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() => handleFeedback(msg.messageId, true)}
                              className="p-1 hover:bg-white/20 rounded transition-colors"
                              title="Helpful"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleFeedback(msg.messageId, false)}
                              className="p-1 hover:bg-white/20 rounded transition-colors"
                              title="Not helpful"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        
                        {msg.feedbackGiven && (
                          <span className="text-xs opacity-50 ml-2">✓ Feedback sent</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-secondary rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">AI is thinking...</span>
                      </div>
                      <p className="text-xs text-muted-foreground opacity-70">
                        This may take 20-30 seconds
                      </p>
                    </div>
                  </div>
                )}
                
                {!serviceAvailable && messages.length > 0 && (
                  <div className="flex justify-center">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2 max-w-[90%]">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-yellow-800">
                        <p className="font-medium">Limited functionality</p>
                        <p>AI service is currently unavailable. You can still create a support ticket.</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-gray-50">
            {/* Escalate button */}
            {conversationId && messages.length > 2 && (
              <div className="mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEscalate}
                  className="w-full text-xs"
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Need human help? Escalate to agent
                </Button>
              </div>
            )}
            
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isInitializing || !conversationId}
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                disabled={!inputMessage.trim() || isInitializing || !conversationId}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Powered by RAG AI • Press Enter to send
            </p>
          </div>
        </Card>
      )}
    </>
  );
};
