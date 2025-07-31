import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Button } from './button';
import FullScreenEditor from './full-screen-editor';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onFullScreenEdit?: (content: string) => void;
  title?: string;
  framework?: string;
  isAIGenerated?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start writing...',
  editable = true,
  isExpanded = false,
  onToggleExpand,
  onFullScreenEdit,
  title = 'Document Editor',
  framework,
  isAIGenerated = false,
}) => {
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleFullScreenEdit = () => {
    setIsFullScreenOpen(true);
  };

  const handleFullScreenSave = (newContent: string) => {
    onChange(newContent);
    if (onFullScreenEdit) {
      onFullScreenEdit(newContent);
    }
  };

  return (
    <>
      <div className="border rounded-lg overflow-hidden flex flex-col h-full">
      {editable && (
        <div className="sticky top-0 z-10 border-b p-2 flex flex-wrap gap-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-muted' : ''}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-muted' : ''}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-muted' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-muted' : ''}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'bg-muted' : ''}
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addLink}
            className={editor.isActive('link') ? 'bg-muted' : ''}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <div className="border-l mx-2" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
          <div className="border-l mx-2" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleFullScreenEdit}
            title="Full screen editor"
            className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 hover:from-blue-600/20 hover:to-purple-600/20"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        <EditorContent
          editor={editor}
          className={`prose prose-sm max-w-none p-4 focus:outline-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:mb-4 prose-ul:mb-4 prose-ol:mb-4 prose-li:mb-1 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic ${
            isExpanded ? 'h-full min-h-[calc(100vh-200px)]' : 'min-h-[200px]'
          }`}
        />
      </div>
    </div>

    {/* Full Screen Editor */}
    <FullScreenEditor
      isOpen={isFullScreenOpen}
      onClose={() => setIsFullScreenOpen(false)}
      content={content}
      onChange={onChange}
      onSave={handleFullScreenSave}
      title={title}
      framework={framework}
      isAIGenerated={isAIGenerated}
    />
  </>
  );
};

export default RichTextEditor;