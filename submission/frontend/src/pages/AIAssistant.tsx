import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { GlassCard } from '../components/GlassCard';
import {
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  User as UserIcon,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  message: string;
  created_at: string;
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Voice States
  const [isRecording, setIsRecording] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  // References
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Load chat history from backend on mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get('/chat/history');
        // Map backend sender string to match local typing
        const mapped = response.data.map((msg: any) => ({
          id: msg.id,
          sender: msg.sender === 'user' ? 'user' : 'ai',
          message: msg.message,
          created_at: msg.created_at
        }));
        setMessages(mapped);
      } catch (err) {
        console.log('Failed to fetch chat logs. Using empty chat state.');
      }
    };
    fetchChatHistory();
  }, []);

  // Initialize Speech Recognition API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsRecording(true);
        setError('');
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError('Voice capture error. Try typing instead.');
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Toggle voice speech recognition
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setError('Web Speech Recognition API is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Speaks AI message using web Speech Synthesis API
  const speakText = (text: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    
    // Stop any active speech
    window.speechSynthesis.cancel();
    
    // Clean markdown characters from speech string
    const cleanText = text.replace(/[*#`_\-]/g, '').trim();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Try to find a nice English voice
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Natural'));
    if (naturalVoice) utterance.voice = naturalVoice;

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    setInputText('');
    setLoading(true);
    setError('');

    // Append local user message immediately
    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      message: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await axios.post('/chat/message', { message: text });
      const aiMsg: ChatMessage = {
        id: response.data.id,
        sender: 'ai',
        message: response.data.message,
        created_at: response.data.created_at
      };
      
      setMessages(prev => [...prev, aiMsg]);
      
      // Speak response aloud if TTS is toggled on
      speakText(aiMsg.message);
    } catch (err: any) {
      setError('Failed to transmit message. Verify server connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col justify-between">
      {/* Page Header */}
      <div className="flex items-center justify-between shrink-0 border-b dark:border-slate-800 pb-3">
        <div className="space-y-1">
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">Generative AI Copilot</span>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Farmer AI Assistant</h2>
        </div>
        
        {/* TTS Toggle Button */}
        <button
          onClick={() => {
            setTtsEnabled(!ttsEnabled);
            if (ttsEnabled) window.speechSynthesis.cancel();
          }}
          className={`p-2.5 rounded-xl border dark:border-slate-800 transition-all ${
            ttsEnabled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'text-slate-400'
          }`}
          title={ttsEnabled ? "Mute Voice Responses" : "Enable Voice Responses"}
        >
          {ttsEnabled ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5" />}
        </button>
      </div>

      {/* Messages area */}
      <GlassCard className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 rounded-3xl flex flex-col justify-between min-h-0 bg-white/20 dark:bg-slate-900/15">
        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-70">
              <Bot className="h-12 w-12 text-emerald-500 mb-3 animate-bounce" />
              <h4 className="text-base font-bold dark:text-slate-200">Hello, I'm your SmartFarm Copilot</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                Ask me questions about crop diseases, organic composting, government schemes, market Mandi prices, soil pH, or pest management controls!
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Icon avatar */}
                <div className={`h-8.5 w-8.5 rounded-full shrink-0 flex items-center justify-center text-white shadow-md ${isUser ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                  {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                
                {/* Bubble content */}
                <div className={`p-4 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm ${
                  isUser 
                    ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border dark:border-slate-800'
                }`}>
                  <p className="whitespace-pre-line">{msg.message}</p>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
              <div className="h-8.5 w-8.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none border dark:border-slate-800 flex items-center gap-1.5 shadow-sm">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>
      </GlassCard>

      {/* Input panel controller */}
      <div className="shrink-0 space-y-3">
        {error && (
          <div className="p-2 text-[10px] bg-red-100 border border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 rounded-lg text-center font-bold">
            {error}
          </div>
        )}

        {/* Floating mic wave when recording */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs font-bold text-emerald-600 dark:text-emerald-400"
            >
              <span className="h-1.5 w-1.5 bg-emerald-600 rounded-full animate-ping" />
              <span>Voice capture active... Speak now</span>
              {/* Mic Waveform dots */}
              <div className="flex gap-1 items-end h-3 ml-2">
                <span className="w-0.5 bg-emerald-500 animate-bounce h-2" style={{ animationDelay: '0s' }} />
                <span className="w-0.5 bg-emerald-500 animate-bounce h-3" style={{ animationDelay: '0.15s' }} />
                <span className="w-0.5 bg-emerald-500 animate-bounce h-1.5" style={{ animationDelay: '0.3s' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSendMessage} className="flex gap-3">
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-3.5 rounded-2xl border transition-all shrink-0 shadow-md ${
              isRecording 
                ? 'bg-red-500 text-white border-red-500 animate-pulse' 
                : 'bg-white dark:bg-slate-800 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300'
            }`}
            title={isRecording ? "Stop Recording" : "Record Voice Input"}
          >
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          {/* Text Input Box */}
          <input
            type="text"
            required
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isRecording ? "Speak clearly..." : "Ask your farming query..."}
            className="flex-1 px-4 py-3.5 bg-white/50 border dark:border-slate-800 dark:bg-slate-900/40 rounded-2xl outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all text-sm font-semibold"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-500/25 shrink-0 disabled:opacity-40"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
