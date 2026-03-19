import { useEffect, type ReactNode } from 'react';

interface MarkdownPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  markdown: string;
  onExport: () => void;
}

function renderMarkdown(markdown: string): ReactNode[] {
  const lines = markdown.split('\n');
  const elements: ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="text-lg font-semibold text-gray-800 mt-4 mb-1">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-xl font-bold text-gray-900 mt-6 mb-2 pb-1 border-b border-gray-200">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} className="text-2xl font-bold text-gray-900 mb-4">
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith('- ')) {
      const text = line.slice(2);
      const percentMatch = text.match(/\((\d+)%\)/);
      const percent = percentMatch ? parseInt(percentMatch[1]) : null;

      elements.push(
        <div key={key++} className="flex items-center gap-3 py-1.5 pl-4">
          <span className="text-gray-400 text-sm">&#8226;</span>
          <span className="text-sm text-gray-700 flex-1">{text}</span>
          {percent !== null && (
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    percent >= 100 ? 'bg-green-500' : percent >= 70 ? 'bg-blue-500' : percent >= 40 ? 'bg-yellow-500' : 'bg-red-400'
                  }`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className="h-1" />);
    }
  }

  return elements;
}

export function MarkdownPreviewModal({ isOpen, onClose, title, markdown, onExport }: MarkdownPreviewModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col transform transition-all">
          <div className="flex items-center justify-between p-6 pb-3 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={onExport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-6 overflow-y-auto">
            {renderMarkdown(markdown)}
          </div>
        </div>
      </div>
    </div>
  );
}
