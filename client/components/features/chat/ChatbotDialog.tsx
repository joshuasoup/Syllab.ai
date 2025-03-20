import React, { useState, useEffect, useRef, useCallback } from "react";
import { useFindMany, useGlobalAction } from "@gadgetinc/react";
import { api } from "../api";
import ReactMarkdown from "react-markdown";

// Shadcn UI components
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// Types for the chat interface
type ChatMessage = {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: Date;
};

type ChatbotDialogProps = {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const ChatbotDialog: React.FC<ChatbotDialogProps> = ({
  trigger = <Button>Ask about your syllabi</Button>,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}) => {
  // State for chat functionality
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [isOpen, setIsOpen] = useState(externalOpen || false);
  const [isCommandMode, setIsCommandMode] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Sync with external open state
  useEffect(() => {
    if (externalOpen !== undefined) {
      setIsOpen(externalOpen);
    }
  }, [externalOpen]);
  
  // Handle open change
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setIsCommandMode(false);
    }
    if (externalOnOpenChange) {
      externalOnOpenChange(open);
    }
  }, [externalOnOpenChange]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Command+K / Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandMode(true);
        setIsOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch syllabi to check if processed syllabi exist
  const [{ data: syllabi, fetching: fetchingSyllabi, error: syllabiError }] = useFindMany(api.syllabus, {
    select: {
      id: true,
      processed: true,
    },
    filter: {
      processed: { equals: true }
    }
  });

  // Chat with Syllabi action
  const [{ fetching: chatFetching, error: chatError }, chat] = useGlobalAction(api.chatWithSyllabi);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  // Check if there are processed syllabi available
  const hasProcessedSyllabi = syllabi && syllabi.length > 0;

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!question.trim() || chatFetching || !hasProcessedSyllabi) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: question,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");

    try {
      // Call the chatWithSyllabi action (without syllabusId)
      const result = await chat({
        query: question,
      });

      // Add AI response to chat
      if (result.data) {
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          content: typeof result.data === 'string' ? result.data : result.data?.response || JSON.stringify(result.data),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // Handle error response
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          sender: "ai",
          content: "Sorry, I couldn't process your request. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      // Handle exceptions
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: "ai",
        content: "An error occurred while processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent 
        className={`${
          isCommandMode 
            ? "sm:max-w-[650px] max-h-[80vh] flex flex-col shadow-lg border-0 rounded-xl" 
            : "sm:max-w-[600px] max-h-[80vh] flex flex-col"
        }`}
      >
        {!isCommandMode && (
          <DialogHeader>
            <DialogTitle>Chat with your Syllabi</DialogTitle>
            <DialogDescription>
              Ask questions about all your syllabi and get AI-powered answers.
            </DialogDescription>
          </DialogHeader>
        )}
        
        {isCommandMode && (
          <div className="py-2">
            <div className="flex items-center px-1 mb-2">
              <div className="bg-muted text-xs rounded px-2 py-1 mr-2 font-mono">⌘K</div>
              <h4 className="text-sm font-medium">Syllabus Assistant</h4>
            </div>
          </div>
        )}

        {!hasProcessedSyllabi && !fetchingSyllabi && (
          <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-md">
            <p className="text-sm">You need to upload and process at least one syllabus before you can chat.</p>
          </div>
        )}
        
        {fetchingSyllabi && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm">Loading syllabi...</p>
          </div>
        )}
        
        {syllabiError && (
          <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md">
            <p className="text-sm">Error loading syllabi</p>
          </div>
        )}

        {/* Chat Messages */}
        <style data-markdown-styles>{`
          .markdown-content h1 {
            font-size: 1.2rem;
            font-weight: bold;
            margin-top: 0.3rem;
            margin-bottom: 0.3rem;
          }
          .markdown-content h2 {
            font-size: 1.1rem;
            font-weight: bold;
            margin-top: 0.3rem;
            margin-bottom: 0.3rem;
          }
          .markdown-content h3 {
            font-size: 1rem;
            font-weight: bold;
            margin-top: 0.3rem;
            margin-bottom: 0.3rem;
          }
          .markdown-content ul, .markdown-content ol {
            padding-left: 1.2rem;
            margin: 0.3rem 0;
          }
          .markdown-content li {
            margin: 0.15rem 0;
            font-size: 0.875rem;
          }
          .markdown-content p {
            margin: 0.3rem 0;
            font-size: 0.875rem;
          }
          .markdown-content code {
            background-color: rgba(0, 0, 0, 0.05);
            padding: 0.1rem 0.2rem;
            border-radius: 0.2rem;
            font-family: monospace;
            font-size: 0.8rem;
          }
          .markdown-content pre {
            background-color: rgba(0, 0, 0, 0.05);
            padding: 0.5rem;
            border-radius: 0.2rem;
            overflow-x: auto;
            margin: 0.3rem 0;
          }
          .markdown-content pre code {
            background-color: transparent;
            padding: 0;
          }
          .markdown-content a {
            color: #0070f3;
            text-decoration: underline;
            font-size: 0.875rem;
          }
          .markdown-content blockquote {
            border-left: 3px solid #ddd;
            padding-left: 0.75rem;
            margin: 0.3rem 0;
            color: #666;
            font-size: 0.875rem;
          }
          .markdown-content table {
            border-collapse: collapse;
            width: 100%;
            margin: 0.3rem 0;
            font-size: 0.875rem;
          }
          .markdown-content table th, .markdown-content table td {
            border: 1px solid #ddd;
            padding: 0.3rem;
            font-size: 0.875rem;
          }
        `}</style>
        <ScrollArea 
          className={`flex-1 ${isCommandMode ? 'p-3' : 'p-4'} border rounded-md overflow-y-auto mb-4 ${
            isCommandMode ? 'h-[250px]' : 'h-[300px]'
          }`} 
          ref={scrollAreaRef}
        >
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 h-full flex items-center justify-center">
              <p>Start a conversation by asking a question about your syllabi</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === "user" ? "bg-primary text-white text-sm" : "bg-muted text-sm"
                    }`}
                  >
                    <div className="flex flex-col space-y-1">
                      <div className="flex-grow">
                        {message.sender === "user" ? (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <div className="markdown-content">
                            <div className="prose prose-xs dark:prose-invert max-w-none !text-sm">
                              <ReactMarkdown>
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end w-full mt-0">
                        <p className="text-[10px] opacity-70 font-bold">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {chatFetching && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-lg bg-muted">
                    <p className="text-sm">AI is thinking...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Command Palette */}
        {isCommandMode && (
          <div className="mb-2">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setQuestion("What are my upcoming assignments?")}
                disabled={chatFetching}
              >
                Upcoming assignments
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setQuestion("What are the office hours for my courses?")}
                disabled={chatFetching}
              >
                Office hours
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setQuestion("What are the exam dates for all my classes?")}
                disabled={chatFetching}
              >
                Exam dates
              </Button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            placeholder={isCommandMode ? "Ask about your courses..." : "Type your question here..."}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSendMessage();
              }
              if (e.key === "Escape") {
                handleOpenChange(false);
              }
            }}
            disabled={chatFetching || !hasProcessedSyllabi || fetchingSyllabi}
            className={`flex-1 ${isCommandMode ? "border-primary focus-visible:ring-0 focus-visible:ring-offset-0" : ""}`}
          />
          <Button 
            onClick={() => void handleSendMessage()}
            disabled={!question.trim() || chatFetching || !hasProcessedSyllabi || fetchingSyllabi}
          >
            Send
          </Button>
        </div>
        {chatError && (
          <p className="text-sm text-red-500 mt-2">
            Error: {typeof chatError === "string" ? chatError : "Failed to send message"}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChatbotDialog;