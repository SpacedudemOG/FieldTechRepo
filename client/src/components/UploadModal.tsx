import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Image, MapPin, Bot, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import usePhotoStorage from '@/hooks/usePhotoStorage';
import { getTagSuggestions } from '@/lib/OpenAIService';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadModal = ({ isOpen, onClose }: UploadModalProps) => {
  const { uploadPhoto } = usePhotoStorage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [aiTags, setAiTags] = useState<{name: string, confidence?: number}[]>([]);
  const [coords, setCoords] = useState<{ lat?: string, lng?: string, location?: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Only accept image files
      if (!selectedFile.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPEG, PNG, etc.)",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
      
      // Auto-generate title from filename if not set
      if (!title) {
        const fileName = selectedFile.name.split('.')[0];
        setTitle(
          fileName
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase())
        );
      }
      
      // Simulate EXIF data for demonstration
      // In production, this would come from the server after processing
      setCoords({
        lat: "37.7749",
        lng: "-122.4194", 
        location: "37.7749° N, 122.4194° W"
      });
      
      // Get AI tag suggestions
      const suggestions = getTagSuggestions(selectedFile.name);
      setAiTags(suggestions);
    }
  };
  
  const handleTagAdd = () => {
    if (newTag && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };
  
  const handleTagRemove = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  const handleAiTagAdd = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      if (!droppedFile.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPEG, PNG, etc.)",
          variant: "destructive"
        });
        return;
      }
      
      // Set the file in the input element
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        fileInputRef.current.files = dataTransfer.files;
        
        // Trigger the change event handler
        const event = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
      }
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No photo selected",
        description: "Please select a photo to upload",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('title', title || 'Untitled Photo');
      if (notes) formData.append('notes', notes);
      if (tags.length > 0) formData.append('tags', JSON.stringify(tags));
      
      // Upload photo
      await uploadPhoto.mutateAsync(formData);
      
      toast({
        title: "Photo uploaded",
        description: "Your photo has been uploaded successfully"
      });
      
      // Reset form
      handleClose();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleClose = () => {
    // Reset form
    setFile(null);
    setPreview(null);
    setTitle('');
    setNotes('');
    setTags([]);
    setNewTag('');
    setAiTags([]);
    setCoords(null);
    setIsUploading(false);
    
    // Close modal
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Photo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="photo">Photo</Label>
              {!preview ? (
                <div 
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <div className="space-y-1 text-center">
                    <Image className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-blue-500">
                        <span>Upload a file</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          className="sr-only"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-1 relative">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-40 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for this photo"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex items-center mt-1 border border-gray-300 rounded-md px-3 py-2">
                <Input
                  id="tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tags..."
                  className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTagAdd();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleTagAdd}
                  disabled={!newTag.trim()}
                >
                  <Plus className="h-4 w-4 text-primary" />
                </Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 px-2 py-1">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-3 w-3 p-0 text-blue-500 hover:text-blue-700"
                        onClick={() => handleTagRemove(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            {aiTags.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <div className="flex items-start">
                  <Bot className="h-4 w-4 text-primary mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">AI Tag Suggestions</h4>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {aiTags.map((tag) => (
                        <Button
                          key={tag.name}
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs bg-gray-100 text-gray-800 hover:bg-green-100 hover:text-green-800"
                          onClick={() => handleAiTagAdd(tag.name)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {tag.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {coords && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-primary mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Location Data</h4>
                    <p className="text-sm text-gray-500">GPS coordinates extracted from image EXIF data</p>
                    <p className="text-sm font-medium mt-1">{coords.location}</p>
                    <p className="text-xs text-gray-500">San Francisco, California, USA</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!file || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Photo'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;
