"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Message } from "@/lib/types";
import { Bot, User } from "lucide-react";

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  keyFindings: string;
  chatHistory: Message[];
  mlOutput: string;
}

const ReportDialog = ({
  isOpen,
  onClose,
  keyFindings,
  chatHistory,
  mlOutput,
}: ReportDialogProps) => {
  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=800,width=800');
    if (printWindow) {
      const reportContent = document.getElementById('report-content')?.innerHTML;
      printWindow.document.write('<html><head><title>PhazeGEN Report</title>');
      printWindow.document.write('<style>body { font-family: sans-serif; } h1,h2,h3 { font-family: "Space Grotesk", sans-serif; } pre { white-space: pre-wrap; background-color: #f5f5f5; padding: 1rem; border-radius: 0.5rem; font-family: "Source Code Pro", monospace; } blockquote { border-left: 2px solid #ccc; padding-left: 1rem; margin-left: 0; } </style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(reportContent || '');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Research Report</DialogTitle>
          <DialogDescription>
            A summary of the analysis and conversation from this session.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <ScrollArea className="flex-grow my-4">
          <div id="report-content" className="prose prose-sm max-w-none pr-6">
            <h2 className="font-headline">Key Findings</h2>
            <p>{keyFindings || "No key findings were generated in this session."}</p>
            
            <h2 className="font-headline mt-6">Structured ML Input</h2>
            <pre className="font-code text-xs"><code>{mlOutput}</code></pre>

            <h2 className="font-headline mt-6">Conversation Transcript</h2>
            {chatHistory
              .filter(msg => msg.id !== '1' && msg.role !== 'system') // Filter out initial message and system messages
              .map((message) => (
                <div key={message.id} className="mt-4">
                  <h3 className="font-semibold flex items-center gap-2 font-headline">
                    {message.role === "assistant" ? <><Bot size={16}/> Assistant</> : <><User size={16}/> User</>}
                  </h3>
                  <blockquote>
                    <p>{message.content}</p>
                  </blockquote>
                </div>
              ))}
          </div>
        </ScrollArea>
        <Separator />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90">Print Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
