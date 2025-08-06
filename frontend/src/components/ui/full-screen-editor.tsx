import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
import { Badge } from "./badge";
import RichTextEditor from "./rich-text-editor";
import { X, Save, FileText, Minimize2, Sparkles } from "lucide-react";

interface FullScreenEditorProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onChange: (content: string) => void;
  title?: string;
  framework?: string;
  isAIGenerated?: boolean;
  onSave: (content: string) => void;
}

const FullScreenEditor: React.FC<FullScreenEditorProps> = ({
  isOpen,
  onClose,
  content,
  onChange,
  title = "Document Editor",
  framework,
  isAIGenerated = false,
  onSave,
}) => {
  const [localContent, setLocalContent] = useState(content);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalContent(content);
    setHasChanges(false);
  }, [content, isOpen]);

  const handleContentChange = (newContent: string) => {
    setLocalContent(newContent);
    setHasChanges(newContent !== content);
  };

  const handleSave = () => {
    onChange(localContent);
    onSave(localContent);
    setHasChanges(false);
    onClose();
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmDiscard = window.confirm(
        "You have unsaved changes. Are you sure you want to discard them?"
      );
      if (!confirmDiscard) return;
    }
    setLocalContent(content);
    setHasChanges(false);
    onClose();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    } else if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, hasChanges, localContent, content]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background"
        >
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">{title}</h1>
                <div className="flex items-center gap-2">
                  {framework && (
                    <Badge variant="outline" className="text-xs">
                      {framework}
                    </Badge>
                  )}
                  {isAIGenerated && (
                    <Badge
                      variant="secondary"
                      className="text-xs flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" />
                      AI Generated
                    </Badge>
                  )}
                  {hasChanges && (
                    <Badge variant="destructive" className="text-xs">
                      Unsaved Changes
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="ml-2"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* Editor Content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 overflow-auto p-4"
            style={{ height: "calc(100vh - 80px)" }}
          >
            <div className="h-full max-w-4xl mx-auto">
              <RichTextEditor
                content={localContent}
                onChange={handleContentChange}
                placeholder="Start writing your compliance document..."
                isExpanded={true}
              />
            </div>
          </motion.div>

          {/* Footer with shortcuts */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 backdrop-blur rounded-lg px-3 py-2 border"
          >
            <div className="flex items-center gap-4">
              <span>
                Press{" "}
                <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd>{" "}
                to cancel
              </span>
              <span>
                Press{" "}
                <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                  Ctrl+S
                </kbd>{" "}
                to save
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenEditor;
