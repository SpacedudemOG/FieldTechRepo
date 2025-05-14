import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { PhotoFilter } from '@shared/schema';
import { X, Plus } from 'lucide-react';

interface FilterPanelProps {
  onApplyFilter: (filter: PhotoFilter) => void;
  onClearFilter: () => void;
}

const FilterPanel = ({ onApplyFilter, onClearFilter }: FilterPanelProps) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [locationRadius, setLocationRadius] = useState<number>(25);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>('');

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleApplyFilter = () => {
    const filter: PhotoFilter = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      locationRadius: locationRadius || undefined,
      tags: tags.length > 0 ? tags : undefined
    };

    onApplyFilter(filter);
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setLocationRadius(25);
    setTags([]);
    onClearFilter();
  };

  return (
    <div className="bg-gray-50 border-b border-gray-200 p-4">
      <h2 className="text-lg font-medium text-gray-800 mb-3">Filters</h2>
      
      <div className="space-y-4">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">Date Range</Label>
          <div className="flex space-x-2">
            <div className="w-1/2">
              <Input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
                placeholder="Start date"
              />
            </div>
            <div className="w-1/2">
              <Input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
                placeholder="End date"
              />
            </div>
          </div>
        </div>
        
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">Location Radius</Label>
          <div className="flex items-center space-x-2">
            <Slider 
              value={[locationRadius]} 
              min={1} 
              max={100} 
              step={1}
              onValueChange={(value) => setLocationRadius(value[0])}
              className="w-full"
            />
            <span className="text-sm text-gray-600">{locationRadius} mi</span>
          </div>
        </div>
        
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">Tags</Label>
          <div className="flex items-center space-x-2 mb-2">
            <Input 
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag..."
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleAddTag}
              disabled={!newTag.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 px-2 py-1">
                {tag}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-3 w-3 p-0 text-blue-500 hover:text-blue-700"
                  onClick={() => handleRemoveTag(tag)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {tags.length === 0 && (
              <span className="text-sm text-gray-500">No tags selected</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={handleClearFilter}>
            Clear all
          </Button>
          <Button onClick={handleApplyFilter}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
