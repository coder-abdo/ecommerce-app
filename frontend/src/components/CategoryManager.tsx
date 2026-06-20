import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { FolderPlus, Sparkles, Loader2 } from 'lucide-react';
import { Category } from '../api/productQueries';

interface CategoryManagerProps {
  categories: Category[];
  isLoading: boolean;
  onCreateCategory: (name: string) => Promise<void>;
  isCreating: boolean;
}

export default function CategoryManager({ categories, isLoading, onCreateCategory, isCreating }: CategoryManagerProps) {
  const [newCatName, setNewCatName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await onCreateCategory(newCatName.trim());
    setNewCatName('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Add New Category Panel */}
      <Card className="bg-card/45 border-white/10 backdrop-blur-xl">
        <CardHeader className="pb-3 border-b border-white/5">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-white font-outfit uppercase tracking-wider">
            <FolderPlus className="h-4 w-4 text-purple-400" />
            Add Category Node
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input 
              type="text" 
              placeholder="e.g. Virtual Reality"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              required
              className="bg-background/50 border-muted text-xs text-white rounded-xl"
            />
            <Button 
              type="submit" 
              size="sm" 
              disabled={isCreating}
              className="bg-purple-600 hover:bg-purple-500 rounded-xl"
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Categories List Info Card */}
      <Card className="bg-card/45 border-white/10 backdrop-blur-xl md:col-span-2 flex flex-col justify-between">
        <CardHeader className="pb-3 border-b border-white/5">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-white font-outfit uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            Active Store Nodes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 flex flex-wrap gap-2">
          {isLoading ? (
            <span className="text-xs text-muted-foreground">Loading categories...</span>
          ) : categories.length === 0 ? (
            <span className="text-xs text-muted-foreground">No categories defined yet.</span>
          ) : (
            categories.map(cat => (
              <span key={cat.id} className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white font-medium">
                {cat.name}
              </span>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
