"use client";

import * as React from "react";
import { UploadCloud, File, X, CheckCircle2 } from "lucide-react";
import { Button } from "./button";

interface UploadedFile {
  name: string;
  size: string;
  url: string;
}

interface FileUploadProps {
  onFilesChange?: (files: UploadedFile[]) => void;
  maxFiles?: number;
}

export function FileUpload({ onFilesChange, maxFiles = 3 }: FileUploadProps) {
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const simulateUpload = (selectedFiles: FileList) => {
    if (files.length >= maxFiles) return;
    
    setUploading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          
          // Add to local state
          const newFiles: UploadedFile[] = [];
          for (let i = 0; i < Math.min(selectedFiles.length, maxFiles - files.length); i++) {
            const file = selectedFiles[i];
            const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
            newFiles.push({
              name: file.name,
              size: `${sizeMB} MB`,
              url: "#",
            });
          }
          
          const updated = [...files, ...newFiles];
          setFiles(updated);
          if (onFilesChange) onFilesChange(updated);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      simulateUpload(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      simulateUpload(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    if (onFilesChange) onFilesChange(updated);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-primary bg-primary/5 scale-[0.99]"
            : "border-border hover:border-primary/60 hover:bg-muted/40"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
        />
        <UploadCloud className="h-10 w-10 text-muted-foreground" />
        <div className="text-sm font-medium text-center">
          <span className="text-primary hover:underline">Click to upload</span> or drag and drop
        </div>
        <div className="text-xs text-muted-foreground text-center">
          PNG, JPG, PDF, XLSX or ZIP (max {maxFiles} files, up to 10MB each)
        </div>
      </div>

      {uploading && (
        <div className="space-y-2 p-3 border border-border rounded-lg bg-muted/20">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-muted-foreground">Uploading attachments...</span>
            <span className="text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">Uploaded Attachments ({files.length})</div>
          <div className="grid gap-2">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 border border-border rounded-lg bg-card text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <File className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium truncate max-w-[200px] md:max-w-xs">{file.name}</span>
                  <span className="text-xs text-muted-foreground">({file.size})</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(idx);
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
