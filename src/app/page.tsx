"use client";

import { useState, useRef, useEffect } from "react";
import type { Message, ChatSession } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Bot, BrainCircuit, FileText, Loader2, Send, User, Upload, Paperclip, PlusSquare, Trash2 } from "lucide-react";
import { handleSummarize, postToChat } from "./actions";
import ChatMessage from "@/components/chat-message";
import ReportDialog from "@/components/report-dialog";
import PhageLogo from "@/components/phage-logo";

const initialMlOutput = `{
  "pathogenicRisk": { "score": 0.85, "category": "High" },
  "crisprSystem": { "present": true, "details": "Type I-F system detected" },
  "resistanceGenes": ["ampC", "blaTEM-1"],
  "gcContent": "62.5%",
  "genomeLength": "4.8 Mbp",
  "orfCount": 4500
}`;

const initialResearchNotes = `Initial findings from sequencing run #A42. The sample is sourced from wastewater treatment facility. 
Preliminary BLAST results show homology with Escherichia coli strains.
Focus of this analysis is to identify novel bacteriophages capable of lysing multi-drug resistant E. coli.
The high GC content is unusual and warrants further investigation. The presence of ampC and blaTEM-1 confirms beta-lactam resistance.`;

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! I am PhazeGEN, your AI research assistant. Provide me with structured ML outputs and your research notes, and I'll help you interpret the results. How can I assist you today?",
  },
];


export default function Home() {
  const { toast } = useToast();
  const [mlOutput, setMlOutput] = useState(initialMlOutput);
  const [researchNotes, setResearchNotes] = useState(initialResearchNotes);
  const [keyFindings, setKeyFindings] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const researchNotesInputRef = useRef<HTMLInputElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('phazegen_chat_history');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
    const newSessionId = `session_${Date.now()}`;
    setActiveSessionId(newSessionId);
  }, []);

  useEffect(() => {
    if(chatHistory.length > 0) {
      localStorage.setItem('phazegen_chat_history', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  useEffect(() => {
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [messages]);

  const handleFileUpload = (setter: (content: string) => void) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setter(content);
        toast({
          title: "File Loaded",
          description: `${file.name} has been loaded successfully.`,
        });
      };
      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "File Read Error",
          description: `Could not read the file ${file.name}.`,
        });
      };
      reader.readAsText(file);
    }
  };

  const onSummarize = async () => {
    setIsSummaryLoading(true);
    try {
      const result = await handleSummarize(mlOutput, researchNotes);
      if (result.error) {
        throw new Error(result.error);
      }
      const summary = result.summary || "No summary could be generated.";
      setKeyFindings(summary);
      
       if (activeSessionId) {
        const sessionTitle = messages.find(m => m.role === 'user')?.content.substring(0, 30) || 'New Session';
        const updatedHistory = chatHistory.filter(s => s.id !== activeSessionId);
        setChatHistory([{ id: activeSessionId, title: sessionTitle, mlOutput, researchNotes, keyFindings: summary, messages }, ...updatedHistory]);
      }
      
      toast({
        title: "Analysis Complete",
        description: "Key findings have been summarized.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Summarization Failed",
        description: errorMessage,
      });
    } finally {
      setIsSummaryLoading(false);
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage: Message = {
      id: String(Date.now()),
      role: "user",
      content: chatInput,
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const result = await postToChat(chatInput, researchNotes, keyFindings, JSON.stringify(messages.slice(-5)));
      if (result.error) throw new Error(result.error);
      
      const assistantMessage: Message = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: result.answer || "I couldn't process that. Please try again.",
      };
      
      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      if (activeSessionId) {
        const sessionTitle = finalMessages.find(m => m.role === 'user')?.content.substring(0, 30) || 'New Session';
        const existingSessionIndex = chatHistory.findIndex(s => s.id === activeSessionId);
        let updatedHistory;
        if (existingSessionIndex > -1) {
            updatedHistory = [...chatHistory];
            updatedHistory[existingSessionIndex] = { ...updatedHistory[existingSessionIndex], title: sessionTitle, messages: finalMessages };
        } else {
            updatedHistory = [{ id: activeSessionId, title: sessionTitle, mlOutput, researchNotes, keyFindings, messages: finalMessages }, ...chatHistory];
        }
        setChatHistory(updatedHistory);
      }


    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
       const errorResponseMessage: Message = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: `Sorry, an error occurred: ${errorMessage}`,
      };
      setMessages((prev) => [...prev, errorResponseMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const startNewChat = () => {
    setMlOutput(initialMlOutput);
    setResearchNotes(initialResearchNotes);
    setKeyFindings('');
    setMessages(initialMessages);
    const newSessionId = `session_${Date.now()}`;
    setActiveSessionId(newSessionId);
    toast({
      title: "New Chat Started",
      description: "You can start a new analysis session now.",
    });
  };

  const loadSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setMlOutput(session.mlOutput);
    setResearchNotes(session.researchNotes);
    setKeyFindings(session.keyFindings);
    setMessages(session.messages);
     toast({
      title: "Session Loaded",
      description: `Loaded session "${session.title}".`,
    });
  }

  const deleteSession = (sessionId: string) => {
    const updatedHistory = chatHistory.filter(s => s.id !== sessionId);
    setChatHistory(updatedHistory);
    localStorage.setItem('phazegen_chat_history', JSON.stringify(updatedHistory));
    if (activeSessionId === sessionId) {
        startNewChat();
    }
    toast({
        title: "Session Deleted",
        description: "The chat session has been removed.",
        variant: "destructive"
    });
  }


  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="w-1/3 min-w-[450px] max-w-[600px] flex flex-col border-r p-4 gap-4">
        <header className="flex items-center justify-between pb-2 border-b">
          <div className="flex items-center gap-2">
            <PhageLogo className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold font-headline">PhazeGEN</h1>
          </div>
          <Button variant="outline" size="sm" onClick={startNewChat}>
            <PlusSquare className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </header>

        <div className="flex-grow flex flex-col gap-4 overflow-y-auto pr-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-headline">
                  <BrainCircuit /> Data Analysis
                </CardTitle>
                <CardDescription>
                  Input your ML data and notes, then summarize.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ml-output" className="font-medium">Structured ML Outputs</Label>
                  <Textarea
                    id="ml-output"
                    placeholder="Paste your structured ML outputs here..."
                    value={mlOutput}
                    onChange={(e) => setMlOutput(e.target.value)}
                    className="h-32 font-code text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="research-notes" className="font-medium">Research Notes</Label>
                     <Button variant="outline" size="sm" onClick={() => researchNotesInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload File
                    </Button>
                     <input
                        type="file"
                        ref={researchNotesInputRef}
                        className="hidden"
                        onChange={handleFileUpload(setResearchNotes)}
                        accept=".txt,.md,.json,.csv"
                    />
                  </div>
                  <Textarea
                    id="research-notes"
                    placeholder="Paste your research notes here or upload a file..."
                    value={researchNotes}
                    onChange={(e) => setResearchNotes(e.target.value)}
                    className="h-28"
                  />
                </div>
                <Button onClick={onSummarize} disabled={isSummaryLoading || !mlOutput} className="w-full bg-primary hover:bg-primary/90">
                  {isSummaryLoading ? <Loader2 className="animate-spin" /> : "Summarize Key Findings"}
                </Button>
              </CardContent>
            </Card>

            {keyFindings && (
              <Card className="flex-shrink-0">
                <CardHeader>
                  <CardTitle className="text-lg font-headline">Key Findings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{keyFindings}</p>
                </CardContent>
              </Card>
            )}

            {chatHistory.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline">Chat History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {chatHistory.map(session => (
                                <div key={session.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                    <button onClick={() => loadSession(session)} className="text-sm truncate flex-1 text-left">
                                        {session.title}
                                    </button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteSession(session.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
        
        <div className="flex-shrink-0 pt-4 border-t">
            <Button variant="outline" className="w-full" onClick={() => setIsReportOpen(true)}>
              <FileText className="mr-2" /> Generate Report
            </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isChatLoading && (
            <ChatMessage message={{id: 'loading', role: 'assistant', content: ''}} isLoading />
          )}
        </div>
        
        <div className="px-6 py-4 border-t bg-background">
          <form onSubmit={handleSendMessage} className="flex items-start gap-4">
             <Button type="button" variant="ghost" size="icon" className="flex-shrink-0" onClick={() => chatFileInputRef.current?.click()}>
                <Paperclip />
                <span className="sr-only">Attach file</span>
            </Button>
            <input type="file" ref={chatFileInputRef} className="hidden" onChange={handleFileUpload(setChatInput)} accept=".txt,.md,.json,.csv" />
            <Textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question about the analysis, or upload a file..."
              className="flex-1 resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <Button type="submit" size="icon" disabled={isChatLoading || !chatInput.trim()}>
              <Send />
            </Button>
          </form>
        </div>
      </main>

      <ReportDialog
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        keyFindings={keyFindings}
        chatHistory={messages}
        mlOutput={mlOutput}
      />
    </div>
  );
}
