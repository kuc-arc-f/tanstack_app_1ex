import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Todo } from './types';

interface TodoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (todo: Omit<Todo, 'id' | 'createdAt' | 'completed'>) => void;
  todo?: Todo | null;
}

export function TodoDialog({ isOpen, onClose, onSave, todo }: TodoDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Update local state when dialog opens or selected todo changes
  useEffect(() => {
    if (isOpen) {
      setTitle(todo?.title || '');
      setDescription(todo?.description || '');
    }
  }, [isOpen, todo]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stone-100">
          <h2 className="text-lg font-semibold text-stone-900">
            {todo ? 'TODO詳細・編集' : '新規TODO'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-sm font-medium text-stone-700">
              タイトル
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="TODOを入力"
              className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
              autoFocus
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium text-stone-700">
              詳細
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="詳しい内容を追加（任意）"
              rows={5}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all resize-none"
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
