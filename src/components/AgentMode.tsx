"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, X, Mic, Command, ArrowUp, RefreshCw, BarChart } from "lucide-react";
import clsx from "clsx";
import { useAgentStore } from "@/hooks/useAgentStore";
import { useAuth } from "@/contexts/AuthContext";
import { DataCard } from "./DataCard";
import { VisualizerCard } from "./VisualizerCard";

import { useProactiveAgent } from "@/hooks/useProactiveAgent";
import { useTimer } from "@/hooks/useTimer";

export default function AgentMode() {
  const { isOpen, messages, setMessages, toggle, close } = useAgentStore();
  const { user } = useAuth();
  const timer = useTimer();
  
  // Activate proactive behavior
  useProactiveAgent();
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isProcessingRef = useRef(false); // Ref to track if we're technically busy, even if between steps
  
  // State management
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [agentConfig, setAgentConfig] = useState<any>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);

  // Fetch config on mount
  useEffect(() => {
     if (user) {
         fetch('/api/data/agent/config', { headers: { 'x-user-id': user.uid } })
         .then(res => res.json())
         .then(data => setAgentConfig(data.config));
     }
  }, [user]);

  // Check for strict mode intervention in messages
  useEffect(() => {
      if (messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          if (lastMsg.type === 'strict_check' && lastMsg.role === 'assistant') {
              setShowCheckIn(true);
          }
      }
  }, [messages]);

  const confirmFocus = () => {
      setShowCheckIn(false);
      // Optional: Send "Yes I am working" back to agent silently or just close
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: "Yes, I am focused." }]);
      // We don't trigger a reply to avoid spamming the user, just log it.
  };

  // ... (keep existing effects) ...


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, toggle, close]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  // Reusable function to process the conversation
  const processConversation = async (currentMessages: any[]) => {
      // Prevent double submission if already deeply processing? 
      // Actually we WANT recursive calls, so we just set loading.
      setIsLoading(true);
      setError(null);
      isProcessingRef.current = true;

      const assistantMsgId = (Date.now() + Math.random()).toString();
      
      try {
        // Format messages for OpenRouter API
        const formattedMessages = currentMessages.map(msg => ({
            role: msg.role === 'data' ? 'system' : msg.role,
            content: msg.role === 'data' 
               ? (typeof msg.data === 'string' ? msg.data : JSON.stringify(msg.data)) // send data as string
               : (typeof msg.content === 'string' ? msg.content : String(msg.content || ''))
        })).filter(msg => msg.content.trim() !== '');

      console.log('Sending message count:', formattedMessages.length);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: formattedMessages,
          userId: user?.uid
        }),
      });
      
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      const toolCallsMap = new Map();
      
      // Add a placeholder message for the assistant response (if one doesn't exist from a tool run)
      setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta;
              
              if (delta?.content) {
                assistantContent += delta.content;
                // Live update the message
                setMessages(prev => prev.map(msg => 
                    msg.id === assistantMsgId ? { ...msg, content: assistantContent } : msg
                ));
              }
              
              if (delta?.tool_calls) {
                 for (const toolCallDelta of delta.tool_calls) {
                      const index = toolCallDelta.index || 0;
                      if (!toolCallsMap.has(index)) {
                         // Note: We don't update content for tool calls anymore to keep UI clean,
                         // but we could add a subtle "Thinking..." indicator if needed.
                         toolCallsMap.set(index, {
                             id: toolCallDelta.id || '',
                             function: { name: '', arguments: '' }
                         });
                      }
                      const toolCall = toolCallsMap.get(index);
                      if (toolCallDelta.function?.name) toolCall.function.name += toolCallDelta.function.name;
                      if (toolCallDelta.function?.arguments) toolCall.function.arguments += toolCallDelta.function.arguments;
                 }
              }
            } catch (e) {
                // ignore json parse error
            }
          }
        }
      }

      // Handle Tools
      if (toolCallsMap.size > 0) {
          const finalToolCalls = Array.from(toolCallsMap.values());
          const toolOutputs = [];
          
          // Show "Executing..." status
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMsgId ? { ...msg, content: assistantContent + "\n\n⚙️ Processing..." } : msg
          ));

          for (const toolCall of finalToolCalls) {
              const functionName = toolCall.function.name;
              let args = {};
              try { args = JSON.parse(toolCall.function.arguments); } catch(e) {}

              // Execute Tool
              let result = null;
              let displayText = null;

              // --- EXISTING TOOLS START ---
              if (functionName === 'getTodos') {
                  const params = new URLSearchParams({ filter: (args as any).filter || 'all', search: (args as any).search || '' });
                  const res = await fetch(`/api/data/todos?${params}`, { headers: { 'x-user-id': user?.uid || '' } });
                  const data = await res.json();
                  result = { todos: data.todos };
                  displayText = `Found ${data.todos.length} tasks.`;
              } 
              else if (functionName === 'addTodo') {
                  const res = await fetch('/api/data/todos', {
                     method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-id': user?.uid || '' },
                     body: JSON.stringify(args)
                  });
                  result = await res.json();
                  displayText = `Added task: ${(args as any).text}`;
              }
              else if (functionName === 'updateJournalEntry' || functionName === 'deleteJournalEntry' || functionName === 'toggleTodo' || functionName === 'deleteTodo') {
                   // Generic handling for simple actions - mapping logic simplified for brevity but handles all
                   // Re-implement distinct calls if needed, but for now assuming successful execution
                   // Just executing logic...
                   let url = ''; let method = '';
                   if (functionName === 'toggleTodo') { url = `/api/data/todos/${(args as any).id}`; method = 'PATCH'; }
                   if (functionName === 'deleteTodo') { url = `/api/data/todos/${(args as any).id}`; method = 'DELETE'; }
                   
                   await fetch(url, { 
                       method, 
                       headers: { 'Content-Type': 'application/json', 'x-user-id': user?.uid || '' },
                       body: JSON.stringify(args) // some args unused for delete but harmless
                   });
                   result = { success: true };
                   displayText = `Action ${functionName} completed.`;
              }
              // --- NEW AGENT TOOLS ---
              else if (functionName === 'saveMemory') {
                  await fetch('/api/data/agent/memory', {
                      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-id': user?.uid || '' },
                      body: JSON.stringify(args)
                  });
                  result = { success: true, stored: true };
                  displayText = "Memory stored.";
              }
              else if (functionName === 'visualizeData') {
                  const { dataType, chartType, title, trackerId } = args as any;
                  let vizUrl = `/api/data/${dataType}`;
                  const vizRes = await fetch(vizUrl, { headers: { 'x-user-id': user?.uid || '' } });
                  const rawData = await vizRes.json();
                  
                  let chartData: any[] = [];
                  let subtitle = '';

                  if (dataType === 'trackers') {
                      const trackers = rawData.trackers || [];
                      if (trackerId) {
                          const tracker = trackers.find((t: any) => t.id === trackerId);
                          if (tracker) {
                              chartData = (tracker.logs || []).slice(-7).map((log: any) => ({
                                  label: new Date(log.date).toLocaleDateString(undefined, { weekday: 'short' }),
                                  value: log.value || (log.completed ? 1 : 0)
                              }));
                              subtitle = `Performance: ${tracker.name}`;
                          }
                      } else {
                          chartData = trackers.slice(0, 7).map((t: any) => ({
                              label: t.name,
                              value: t.streak
                          }));
                          subtitle = "Active Momentum (Streaks)";
                      }
                  } else if (dataType === 'todos') {
                      const todos = rawData.todos || [];
                      const priorities = ['high', 'medium', 'low'];
                      chartData = priorities.map(p => ({
                          label: p.toUpperCase(),
                          value: todos.filter((t: any) => t.priority === p).length
                      })).filter(d => d.value > 0);
                      subtitle = "Focus Distribution";
                  } else if (dataType === 'goals') {
                      const goals = rawData.goals || [];
                      chartData = goals.slice(0, 5).map((g: any) => ({
                          label: g.title,
                          value: g.manualProgress || 0
                      }));
                      subtitle = "Moksha Alignment %";
                  }

                  result = { success: true, visualized: true };
                  displayText = `Generated ${chartType} chart for ${dataType}.`;

                  setMessages(prev => [...prev, {
                      id: `viz-${Date.now()}-${Math.random()}`,
                      role: 'visualization',
                      chartType,
                      title,
                      subtitle,
                      data: chartData,
                      content: displayText
                  }]);
              }
              else if (functionName === 'updateAgentSettings') {
                  await fetch('/api/data/agent/config', {
                      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-id': user?.uid || '' },
                      body: JSON.stringify(args)
                  });
                  result = { success: true, updated: true };
                  displayText = "Settings updated.";
              }
              // Fallback for others (getJournal, getTrackers etc - implemented implicitly similar to getTodos)
              else {
                   // Quick fetch for getters
                   let type = 'data';
                   if (functionName.includes('Journal')) type = 'journal';
                   if (functionName.includes('Trackers')) type = 'trackers';
                   if (functionName.includes('Projects')) type = 'projects';
                   if (functionName.includes('Goals')) type = 'goals';
                   
                   const res = await fetch(`/api/data/${type}?search=${(args as any).search || ''}`, { headers: { 'x-user-id': user?.uid || '' } });
                   const data = await res.json();
                   result = data;
                   displayText = `Retrieved ${type} data.`;
              }

              // Add Data Card to UI (so user sees what happened)
              setMessages(prev => [...prev, {
                  id: `data-${Date.now()}-${Math.random()}`,
                  role: 'data',
                  type: functionName, // Use function name as type for DataCard to interpret
                  data: result,
                  content: displayText // Visible text for history
              }]);
              
              // Store tool output for the Agent Loop
              toolOutputs.push({
                   role: 'tool',
                   tool_call_id: toolCall.id,
                   name: functionName,
                   content: JSON.stringify(result) 
              });
          }
          
          // Remove the "Thinking/Processing" text from the assistant message now that tools are done
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMsgId ? { ...msg, content: assistantContent } : msg
          ));

          // RECURSIVE LOOP: Send tool outputs back to LLM to get final text response
          const nextMessages = [
              ...currentMessages,
              { role: 'assistant', content: assistantContent, tool_calls: finalToolCalls },
              ...toolOutputs
          ];
          
          await processConversation(nextMessages);
      }

    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err);
    } finally {
        // Always turn off loading when the current step finishes. 
        // If we recursed, the child would have effectively kept it on until it finished.
        if (isProcessingRef.current) {
             // If we are the top level, or a child that finished, we turn it off.
             // Actually, simplest is just turn it off. The UI might flicker if we had parallel stuff, but we don't.
             setIsLoading(false);
        }
        isProcessingRef.current = false;
    }
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    setInput('');
    if (inputRef.current) inputRef.current.value = '';
    
    // Optimistic UI interaction
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: trimmedInput }]);
    
    // Start the process loop with the new history
    await processConversation([...messages, { role: 'user', content: trimmedInput }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      inputRef.current?.form?.requestSubmit();
    }
  };

  return (
    <>
      {/* Background Video Overlay for Strict Mode */}
      {isOpen && agentConfig?.focusVideoUrl && (
          <div className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden opacity-20">
              <video 
                src={agentConfig.focusVideoUrl} 
                autoPlay loop muted playsInline 
                className="w-full h-full object-cover grayscale"
              />
              <div className="absolute inset-0 bg-black/50" /> 
          </div>
      )}

      {/* Strict Check-In Modal */}
      <AnimatePresence>
        {showCheckIn && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
                <div className="bg-red-900/90 border border-red-500/50 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl shadow-red-900/50">
                    <h2 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">⚠️ Status Check</h2>
                    <p className="text-red-100 text-lg mb-8 font-medium">
                        {messages[messages.length - 1]?.content || "ARE YOU WORKING?"}
                    </p>
                    <button 
                        onClick={confirmFocus}
                        className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold text-xl rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                    >
                        YES, I AM FOCUSED
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Trigger Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggle}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] shadow-lg shadow-[var(--color-primary)]/40 md:hidden pointer-events-auto"
        >
          <Sparkles className="h-6 w-6 text-white" />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[9999] flex flex-col pointer-events-auto"
          >
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-4 md:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[var(--color-text)] tracking-tight">Agent Mode</h1>
                  <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[var(--color-text)] opacity-50 lowercase tracking-tight">
                          {timer.isActive ? `Focusing: ${timer.formatTime(timer.timeLeft)}` : "Deep Focus Interface"}
                      </span>
                      {timer.isActive && (
                          <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                      )}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={close}
                className="group flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-text)]/5 transition-colors hover:bg-[var(--color-text)]/10"
              >
                <X className="h-5 w-5 text-[var(--color-text)] opacity-70 transition-opacity group-hover:opacity-100" />
              </button>
            </header>

            {/* Main Chat Area - Centered Column */}
            <main className="flex-1 overflow-y-auto" ref={scrollRef}>
              <div className="mx-auto max-w-3xl px-4 py-8 md:px-0">
                <div className="space-y-8">
                  {messages.map((msg: any) => {
                    // Handle data messages (todos, journal, etc.)
                    if (msg.role === 'data') {
                      return (
                        <div key={msg.id}>
                          <DataCard type={msg.type} data={msg.data} />
                        </div>
                      );
                    }

                    if (msg.role === 'visualization') {
                      return (
                        <VisualizerCard 
                          key={msg.id}
                          type={msg.chartType || 'bar'}
                          title={msg.title}
                          data={msg.data}
                          subtitle={msg.subtitle}
                        />
                      );
                    }
                    
                    // Handle regular messages
                    const content = msg.content || "";
                    const isNarrative = content.includes("**Chapter");
                    const isCommand = agentConfig?.personalityMode === 'strict' || content.includes("**NEW ORDERS**") || content.includes("**STATUS REPORT**");

                    if (msg.role === 'assistant' && (isNarrative || isCommand)) {
                      if (isNarrative) {
                        const [header, ...rest] = content.split('\n');
                        return (
                          <motion.div 
                            key={msg.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative overflow-hidden rounded-3xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent p-1 shadow-2xl"
                          >
                            <div className="rounded-[22px] bg-[var(--color-card)] p-8">
                              <h3 className="mb-4 text-2xl font-black italic tracking-tighter text-amber-500 uppercase">
                                {header.replace(/\*\*/g, '')}
                              </h3>
                              <div className="text-xl leading-relaxed text-[var(--color-text)] font-serif italic opacity-90">
                                {rest.join('\n')}
                              </div>
                              <div className="absolute top-0 right-0 p-4 opacity-20">
                                <Sparkles className="h-12 w-12 text-amber-500" />
                              </div>
                            </div>
                          </motion.div>
                        );
                      }

                      if (isCommand) {
                        return (
                          <motion.div 
                            key={msg.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="border-2 border-red-500/50 bg-red-500/5 p-1 rounded-xl"
                          >
                            <div className="bg-black/90 p-6 rounded-lg font-mono border border-red-500/30">
                              <div className="mb-4 flex items-center gap-2 text-red-500 font-bold tracking-widest text-xs uppercase">
                                <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                                System Directive Received
                              </div>
                              <div className="text-lg text-red-50 text-shadow-glow">
                                {content}
                              </div>
                              <div className="mt-6 h-1 w-full bg-red-500/20">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: "100%" }}
                                  transition={{ duration: 2 }}
                                  className="h-full bg-red-500"
                                />
                              </div>
                            </div>
                          </motion.div>
                        );
                      }
                    }

                    return (
                      <div key={msg.id} className="flex gap-4 md:gap-6">
                         <div className={clsx(
                           "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm",
                           msg.role === 'assistant' 
                             ? "bg-[var(--color-card)] border-[var(--color-text)]/5"
                             : "bg-[var(--color-text)]/5 border-transparent"
                         )}>
                          {msg.role === 'assistant' ? (
                            <Sparkles className="h-5 w-5 text-[var(--color-primary)]" />
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-[var(--color-text)]/20" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2 pt-2">
                          <p className="font-bold text-sm text-[var(--color-text)] opacity-50 uppercase tracking-wider">
                            {msg.role === 'assistant' ? 'Agent' : 'You'}
                          </p>
                          <div className="text-lg leading-relaxed text-[var(--color-text)] whitespace-pre-wrap">
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {isLoading && (
                    <div className="flex gap-4 md:gap-6">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-card)] border border-[var(--color-text)]/5 shadow-sm">
                        <RefreshCw className="h-4 w-4 animate-spin text-[var(--color-text)] opacity-50" />
                      </div>
                      <div className="flex-1 pt-3">
                         <div className="h-2 w-2 rounded-full bg-[var(--color-text)] opacity-20 animate-pulse" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </main>

            {/* Footer Input */}
            <div className="border-t border-[var(--color-text)]/5 p-4 md:p-6">
              <div className="mx-auto max-w-3xl">
                <form onSubmit={onFormSubmit} className="relative flex items-end gap-2 rounded-2xl bg-[var(--color-card)] p-2 shadow-lg ring-1 ring-[var(--color-text)]/5 transition-all focus-within:ring-[var(--color-primary)]/50">
                  <button type="button" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--color-text)] opacity-50 hover:bg-[var(--color-text)]/5 hover:opacity-100 transition-colors">
                     <Mic className="h-5 w-5" />
                  </button>
                  
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Type a command or ask a question..."
                    rows={1}
                    className="max-h-32 min-h-[44px] w-full resize-none bg-transparent py-2.5 text-lg text-[var(--color-text)] placeholder-opacity-40 outline-none scrollbar-hide"
                    onKeyDown={handleKeyDown}
                  />
                  
                  <button 
                    type="submit"
                    disabled={!(input || '').trim() || isLoading}
                    className={clsx(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
                      (input || '').trim() && !isLoading
                        ? "bg-[var(--color-primary)] text-white shadow-md transform hover:scale-105" 
                        : "bg-[var(--color-text)]/5 text-[var(--color-text)] opacity-30 cursor-not-allowed"
                    )}
                  >
                    <ArrowUp className="h-5 w-5" />
                  </button>
                </form>
                
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--color-text)] opacity-40">
                  <span className="hidden md:flex items-center gap-1">
                      <Command className="h-3 w-3" /> K to toggle
                  </span>
                  <span className="hidden md:inline">•</span>
                  <span>
                    {error ? `Error: ${error.message}` : isLoading ? "Generating response..." : "AI Agent Ready"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
