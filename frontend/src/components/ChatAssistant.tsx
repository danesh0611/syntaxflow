'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contextTitle, setContextTitle] = useState('');
  const [contextContent, setContextContent] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);

  const pathname = usePathname();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedChat = localStorage.getItem('syntaxflow_chat_history');
    if (savedChat) {
      try {
        setMessages(JSON.parse(savedChat));
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
  }, []);

  // Save chat history when messages change
  const saveChatHistory = (newMessages: Message[]) => {
    setMessages(newMessages);
    localStorage.setItem('syntaxflow_chat_history', JSON.stringify(newMessages));
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Scrape page context when pathname changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Small timeout to ensure DOM has rendered
      const timer = setTimeout(() => {
        if (pathname.startsWith('/articles/')) {
          const titleEl = document.querySelector('article h1');
          const contentEl = document.querySelector('.article-content');
          
          setContextTitle(titleEl?.textContent?.trim() || '');
          setContextContent(contentEl?.textContent?.trim() || '');
        } else {
          setContextTitle('');
          setContextContent('');
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: Message = {
      role: 'user',
      content: trimmed,
      timestamp,
    };

    // Scrape context dynamically at send time to prevent timing/race conditions
    let activeTitle = contextTitle;
    let activeContent = contextContent;
    
    if (typeof window !== 'undefined' && pathname.startsWith('/articles/')) {
      const titleEl = document.querySelector('article h1') || document.querySelector('h1');
      const contentEl = document.querySelector('.article-content') || document.querySelector('article');
      
      activeTitle = titleEl?.textContent?.trim() || '';
      activeContent = contentEl?.textContent?.trim() || '';
      
      // Update state for consistency
      setContextTitle(activeTitle);
      setContextContent(activeContent);
    }

    const updatedMessages = [...messages, userMessage];
    saveChatHistory(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          contextTitle: activeTitle || undefined,
          contextContent: activeContent || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch response');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      saveChatHistory([...updatedMessages, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `⚠️ **Error:** ${error.message || 'Something went wrong. Please check your internet connection or try again later.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      saveChatHistory([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const clearChat = () => {
    if (confirm('Are you sure you want to clear your chat history?')) {
      saveChatHistory([]);
    }
  };

  // Quick Action triggers
  const triggerQuickAction = (action: string) => {
    let promptText = '';
    if (action === 'interview') {
      promptText = `Can you start a mock technical interview (acting as the interviewer) on the concepts covered in the article "${contextTitle}"? Ask me one question at a time and wait for my response.`;
    } else if (action === 'dsa_patterns') {
      promptText = `What are the common coding interview questions, DSA patterns (like Two Pointers, Sliding Window, DFS/BFS, etc.), and expected complexities related to "${contextTitle}"?`;
    } else if (action === 'placement_tips') {
      promptText = `What are the key optimization strategies, edge cases, and time/space complexity analysis that interviewers look for when discussing topics like those in "${contextTitle}"?`;
    } else if (action === 'dsa') {
      promptText = `What are the most frequently asked Data Structures & Algorithms (DSA) questions in product-based companies (FAANG/MAANG) and how should I prepare for college placements?`;
    }

    if (promptText) {
      handleSend(promptText);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* ── CHAT PANEL ────────────────────────────────────────── */}
      {isOpen && (
        <div className={`mb-4 bg-card-bg/95 backdrop-blur-xl border border-card-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in transition-all duration-300 ${
          isMaximized
            ? 'w-[calc(100vw-3rem)] sm:w-[calc(100vw-6rem)] md:w-[750px] lg:w-[950px] h-[calc(100vh-8rem)] max-h-none'
            : 'w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-8rem)]'
        }`}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-accent to-accent-2 px-4 py-3.5 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
                </svg>
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-tight">SyntaxFlow AI</h3>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] opacity-90 font-medium">Assistant Online</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  title="Clear chat history"
                  className="p-1.5 rounded-lg hover:bg-white/10 active:scale-95 transition-all text-white/95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                title={isMaximized ? "Exit full screen" : "Full screen"}
                className="p-1.5 rounded-lg hover:bg-white/10 active:scale-95 transition-all text-white/95"
              >
                {isMaximized ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5A1.5 1.5 0 0110.5 3h9A1.5 1.5 0 0121 4.5v9a1.5 1.5 0 01-1.5 1.5H15" />
                    <rect x="3" y="9" width="12" height="12" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 active:scale-95 transition-all text-white/95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Context Banner */}
          {contextTitle && (
            <div className="bg-card-border/30 border-b border-card-border/60 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse flex-shrink-0" />
                <span className="text-[11px] text-muted font-medium truncate">
                  Context: <span className="text-foreground font-semibold">{contextTitle}</span>
                </span>
              </div>
            </div>
          )}

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/30">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-6">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent animate-bounce">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.904-4.813a9.049 9.049 0 004.096-7.187C22 3.976 18.024 0 13.096 0A9.097 9.097 0 004 9.096c0 2.875 1.332 5.437 3.42 7.145l2.393-.337z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-foreground text-base">Crack Placement & Interviews!</h4>
                  <p className="text-xs text-muted max-w-[280px]">
                    Ask me about coding rounds, mock interviews, DSA optimization, FAANG questions, or the current article!
                  </p>
                </div>

                <div className={`w-full grid grid-cols-1 gap-2 ${
                  isMaximized ? 'max-w-[640px] sm:grid-cols-2' : 'max-w-[320px]'
                }`}>
                  {contextTitle && (
                    <>
                      <button
                        onClick={() => triggerQuickAction('interview')}
                        className="text-left text-xs bg-card-bg hover:bg-card-border/30 border border-card-border text-foreground/90 p-2.5 rounded-xl transition duration-200 flex items-center justify-between group"
                      >
                        <span>🎯 Start Mock Interview</span>
                        <svg className="w-3 h-3 text-muted group-hover:text-accent transition" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                        </svg>
                      </button>
                      <button
                        onClick={() => triggerQuickAction('dsa_patterns')}
                        className="text-left text-xs bg-card-bg hover:bg-card-border/30 border border-card-border text-foreground/90 p-2.5 rounded-xl transition duration-200 flex items-center justify-between group"
                      >
                        <span>🔑 DSA patterns & complexity</span>
                        <svg className="w-3 h-3 text-muted group-hover:text-accent transition" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                        </svg>
                      </button>
                      <button
                        onClick={() => triggerQuickAction('placement_tips')}
                        className="text-left text-xs bg-card-bg hover:bg-card-border/30 border border-card-border text-foreground/90 p-2.5 rounded-xl transition duration-200 flex items-center justify-between group"
                      >
                        <span>💡 Interview optimization tips</span>
                        <svg className="w-3 h-3 text-muted group-hover:text-accent transition" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                        </svg>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => triggerQuickAction('dsa')}
                    className="text-left text-xs bg-card-bg hover:bg-card-border/30 border border-card-border text-foreground/90 p-2.5 rounded-xl transition duration-200 flex items-center justify-between group"
                  >
                    <span>🚀 Top DSA Placement Questions</span>
                    <svg className="w-3 h-3 text-muted group-hover:text-accent transition" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] w-full px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words min-w-0 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-tr from-accent to-accent-2 text-white rounded-tr-none'
                        : 'bg-card-bg border border-card-border text-foreground rounded-tl-none markdown-container'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          pre: ({ node, ...props }) => (
                            <pre className="bg-black/5 dark:bg-black/35 rounded-xl p-3 my-2 overflow-x-auto text-[13px] font-mono leading-normal border border-card-border/30" {...props} />
                          ),
                          code: ({ node, className, children, ...props }) => {
                            const isInline = !className;
                            return isInline ? (
                              <code className="bg-accent/10 text-accent dark:bg-accent-glow px-1.5 py-0.5 rounded text-[13px] font-mono font-semibold" {...props}>
                                {children}
                              </code>
                            ) : (
                              <code className={`${className} text-foreground`} {...props}>
                                {children}
                              </code>
                            );
                          },
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li>{children}</li>,
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-semibold">
                              {children}
                            </a>
                          ),
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto w-full my-3 border border-card-border rounded-xl">
                              <table className="min-w-full divide-y divide-card-border text-[12px] border-collapse" {...props} />
                            </div>
                          ),
                          th: ({ node, ...props }) => (
                            <th className="px-3 py-2 bg-card-border/30 font-bold text-left text-foreground border-b border-card-border" {...props} />
                          ),
                          td: ({ node, ...props }) => (
                            <td className="px-3 py-2 text-muted border-b border-card-border" {...props} />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                  <span className="text-[9px] text-muted mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="bg-card-bg border border-card-border px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form Input */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 bg-card-bg border-t border-card-border flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={contextTitle ? "Ask about this article..." : "Ask the assistant..."}
              disabled={isLoading}
              className="flex-1 bg-background/50 border border-card-border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-accent/60 placeholder:text-muted transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent/90 active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all shadow-md shadow-accent/20 cursor-pointer"
            >
              <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* ── FAB TRIGGER BUTTON ────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-accent to-accent-2 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-accent/30 relative group cursor-pointer"
      >
        {isOpen ? (
          <svg className="w-6 h-6 transition-all duration-300 transform rotate-90" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.904-4.813a9.049 9.049 0 004.096-7.187C22 3.976 18.024 0 13.096 0A9.097 9.097 0 004 9.096c0 2.875 1.332 5.437 3.42 7.145l2.393-.337z" />
          </svg>
        )}
        
        {/* Unopened hover tooltip */}
        {!isOpen && (
          <span className="absolute right-16 scale-0 group-hover:scale-100 bg-foreground text-background text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg transition-all duration-200 origin-right">
            Crack placement & interviews with AI 🎯
          </span>
        )}
      </button>
    </div>
  );
}
