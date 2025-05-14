import { useState } from 'react';
import { useMap } from '@/lib/MapContext';
import { PhotoWithTags } from '@shared/schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  Share2, 
  Pencil, 
  X, 
  Plus, 
  Bot, 
  User 
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';
import usePhotoStorage from '@/hooks/usePhotoStorage';
import { useToast } from '@/hooks/use-toast';

interface PhotoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo: PhotoWithTags;
}

const PhotoDetailModal = ({ isOpen, onClose, photo }: PhotoDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(photo.title);
  const [editNotes, setEditNotes] = useState(photo.notes || '');
  const [newTag, setNewTag] = useState('');
  const detailMapRef = useRef<HTMLDivElement>(null);
  const [detailMap, setDetailMap] = useState<mapboxgl.Map | null>(null);
  const { updatePhoto, addTagToPhoto, removeTagFromPhoto } = usePhotoStorage();
  const { toast } = useToast();
  
  // Format date
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };
  
  // Initialize mini map
  useEffect(() => {
    if (!isOpen || !detailMapRef.current || !photo.latitude || !photo.longitude || detailMap) {
      return;
    }
    
    const lng = photo.longitude ? parseFloat(photo.longitude) : 0;
    const lat = photo.latitude ? parseFloat(photo.latitude) : 0;
    
    const map = new mapboxgl.Map({
      container: detailMapRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [lng, lat],
      zoom: 12,
      interactive: false
    });
    
    // Add marker
    const el = document.createElement('div');
    el.className = 'w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white shadow-md';
    el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>';
    
    new mapboxgl.Marker(el)
      .setLngLat([lng, lat])
      .addTo(map);
    
    setDetailMap(map);
    
    // Return a cleanup function that just resets state
    return () => {
      // Just reset the state
      setDetailMap(null);
      
      // For debugging purposes
      console.log('Detail map component unmounted, state reset');
    };
  }, [isOpen, photo.latitude, photo.longitude, detailMap]);
  
  const handleSaveChanges = async () => {
    try {
      await updatePhoto.mutateAsync({
        id: photo.id, 
        data: { 
          title: editTitle,
          notes: editNotes
        }
      });
      
      toast({
        title: "Changes saved",
        description: "Photo details updated successfully"
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update photo details",
        variant: "destructive"
      });
    }
  };
  
  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    
    try {
      await addTagToPhoto.mutateAsync({
        photoId: photo.id,
        tagName: newTag.trim()
      });
      
      toast({
        title: "Tag added",
        description: `Added "${newTag}" to photo tags`
      });
      
      setNewTag('');
    } catch (error) {
      toast({
        title: "Failed to add tag",
        description: "An error occurred while adding the tag",
        variant: "destructive"
      });
    }
  };
  
  const handleRemoveTag = async (tagId: number) => {
    try {
      await removeTagFromPhoto.mutateAsync({
        photoId: photo.id,
        tagId
      });
      
      toast({
        title: "Tag removed",
        description: "Tag removed from photo"
      });
    } catch (error) {
      toast({
        title: "Failed to remove tag",
        description: "An error occurred while removing the tag",
        variant: "destructive"
      });
    }
  };
  
  const handleDownload = () => {
    // Create a temporary link to download the image
    const link = document.createElement('a');
    link.href = `data:${photo.fileType};base64,${photo.base64Data}`;
    link.download = photo.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="font-medium"
              />
            ) : (
              photo.title
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          <div className="md:flex">
            <div className="md:w-2/3 p-4">
              <img 
                src={`data:${photo.fileType};base64,${photo.base64Data}`}
                alt={photo.title} 
                className="w-full h-auto rounded-lg"
              />
            </div>
            
            <div className="md:w-1/3 p-4 border-t md:border-t-0 md:border-l border-gray-200">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">UPLOADED BY</h4>
                <div className="flex items-center mt-1">
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium">Field Technician</p>
                    <p className="text-xs text-gray-500">tech@fieldvision.com</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">DATE & TIME</h4>
                <p className="mt-1">{formatDate(photo.uploadedAt)}</p>
              </div>
              
              {(photo.latitude && photo.longitude) && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500">LOCATION</h4>
                  <p className="mt-1">{photo.location}</p>
                  <div className="mt-2 h-32 bg-gray-200 rounded-md">
                    <div ref={detailMapRef} className="w-full h-full rounded-md"></div>
                  </div>
                </div>
              )}
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">TAGS</h4>
                <div className="mt-1 flex flex-wrap gap-1">
                  {photo.tags.map((tag) => (
                    <Badge 
                      key={tag.id} 
                      variant="secondary"
                      className={tag.aiGenerated ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-blue-100 text-blue-800 hover:bg-blue-200"}
                    >
                      {tag.aiGenerated && <Bot className="h-3 w-3 mr-1 text-green-500" />}
                      {tag.name}
                      {isEditing && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-3 w-3 p-0 ml-1"
                          onClick={() => handleRemoveTag(tag.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </Badge>
                  ))}
                  
                  {isEditing && (
                    <div className="flex items-center mt-1 w-full">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tag..."
                        className="text-xs h-7"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-1"
                        onClick={handleAddTag}
                        disabled={!newTag.trim()}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500">NOTES</h4>
                {isEditing ? (
                  <Input
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add notes..."
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-600">
                    {photo.notes || "No notes added yet."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="border-t border-gray-200 pt-3">
          <div className="flex justify-between w-full">
            <div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mr-2"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
            
            {isEditing ? (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mr-2"
                  onClick={() => {
                    setIsEditing(false);
                    setEditTitle(photo.title);
                    setEditNotes(photo.notes || '');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoDetailModal;
