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

  const saveChatHistory = (newMessages: Message[]) => {
    setMessages(newMessages);
    localStorage.setItem('syntaxflow_chat_history', JSON.stringify(newMessages));
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
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

    let activeTitle = contextTitle;
    let activeContent = contextContent;

    if (typeof window !== 'undefined' && pathname.startsWith('/articles/')) {
      const titleEl = document.querySelector('article h1') || document.querySelector('h1');
      const contentEl = document.querySelector('.article-content') || document.querySelector('article');

      activeTitle = titleEl?.textContent?.trim() || '';
      activeContent = contentEl?.textContent?.trim() || '';

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
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
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
        content: `Notice: ${error.message || 'Unable to retrieve answer. Please try again.'}`,
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
    if (confirm('Clear assistant conversation history?')) {
      saveChatHistory([]);
    }
  };

  const triggerQuickAction = (action: string) => {
    let promptText = '';
    if (action === 'interview') {
      promptText = `Can you start a mock technical interview (acting as the interviewer) on the concepts covered in "${contextTitle}"? Ask me one question at a time and wait for my response.`;
    } else if (action === 'dsa_patterns') {
      promptText = `What are the core algorithmic patterns, time/space trade-offs, and edge cases related to "${contextTitle}"?`;
    } else if (action === 'placement_tips') {
      promptText = `What optimization strategies and implementation details do interviewers look for when discussing topics like those in "${contextTitle}"?`;
    } else if (action === 'dsa') {
      promptText = `What are the most foundational algorithmic patterns tested in tier-1 tech interviews, and how should I structure my practice?`;
    }

    if (promptText) {
      handleSend(promptText);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* CHAT PANEL */}
      {isOpen && (
        <div
          className={`mb-3 bg-card-bg border border-card-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in transition-all duration-200 ${
            isMaximized
              ? 'w-[calc(100vw-2.5rem)] sm:w-[calc(100vw-5rem)] md:w-[720px] lg:w-[880px] h-[calc(100vh-7rem)] max-h-none'
              : 'w-[360px] sm:w-[400px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-7rem)]'
          }`}
        >
          {/* Header */}
          <div className="bg-card-bg border-b border-card-border px-4 py-3 flex items-center justify-between text-foreground">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-foreground text-background flex items-center justify-center font-mono font-bold text-[11px]">
                SF
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs tracking-tight">Technical Assistant</h3>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted px-1.5 py-0.2 rounded border border-card-border">
                    Study
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-muted">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  title="Clear conversation"
                  className="p-1 rounded hover:text-foreground hover:bg-card-border/40 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                title={isMaximized ? 'Exit expanded view' : 'Expand view'}
                className="p-1 rounded hover:text-foreground hover:bg-card-border/40 transition-colors"
              >
                {isMaximized ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5A1.5 1.5 0 0110.5 3h9A1.5 1.5 0 0121 4.5v9a1.5 1.5 0 01-1.5 1.5H15" />
                    <rect x="3" y="9" width="12" height="12" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:text-foreground hover:bg-card-border/40 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Context Banner */}
          {contextTitle && (
            <div className="bg-background/80 border-b border-card-border px-3.5 py-1.5 flex items-center justify-between text-[11px] text-muted">
              <span className="truncate">
                Active Context: <span className="text-foreground font-semibold">{contextTitle}</span>
              </span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-4 space-y-4">
                <div className="w-9 h-9 rounded-lg bg-card-bg border border-card-border flex items-center justify-center text-foreground font-mono font-bold text-xs">
                  &gt;_
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground text-sm">Engineering Study Assistant</h4>
                  <p className="text-xs text-muted max-w-[260px] leading-relaxed">
                    Ask questions about code architecture, time complexity, or interview questions on the active topic.
                  </p>
                </div>

                <div className="w-full max-w-[320px] space-y-1.5 pt-2">
                  {contextTitle && (
                    <>
                      <button
                        onClick={() => triggerQuickAction('interview')}
                        className="w-full text-left text-xs bg-card-bg hover:bg-card-border/30 border border-card-border text-foreground p-2 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span>Start technical mock questions</span>
                        <span className="text-muted">→</span>
                      </button>
                      <button
                        onClick={() => triggerQuickAction('dsa_patterns')}
                        className="w-full text-left text-xs bg-card-bg hover:bg-card-border/30 border border-card-border text-foreground p-2 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span>Explain algorithmic complexity</span>
                        <span className="text-muted">→</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => triggerQuickAction('dsa')}
                    className="w-full text-left text-xs bg-card-bg hover:bg-card-border/30 border border-card-border text-foreground p-2 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Core patterns for coding rounds</span>
                    <span className="text-muted">→</span>
                  </button>
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-foreground text-background font-medium'
                        : 'bg-card-bg border border-card-border text-foreground'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm space-y-2">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <span>{msg.content}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted/60 mt-1 px-1 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted p-2">
                <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
                <span>Generating response…</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form */}
          <form
            onSubmit={handleFormSubmit}
            className="p-2.5 bg-card-bg border-t border-card-border flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={contextTitle ? 'Ask about this article…' : 'Ask technical question…'}
              disabled={isLoading}
              className="flex-1 bg-background border border-card-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-foreground placeholder:text-muted transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* DOCK TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-3.5 rounded-xl bg-card-bg border border-card-border hover:border-card-border-hover text-foreground flex items-center gap-2 shadow-sm hover:shadow transition-all duration-150 cursor-pointer group"
        aria-label="Toggle technical assistant"
      >
        <span className="font-mono text-xs font-bold">&gt;_</span>
        <span className="text-xs font-semibold">Assistant</span>
      </button>
    </div>
  );
}
