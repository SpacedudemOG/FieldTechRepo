import { PhotoWithTags } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { MapPin, MoreVertical, Bot } from 'lucide-react';
import { formatAiTag } from '@/lib/OpenAIService';

interface PhotoCardProps {
  photo: PhotoWithTags;
  viewMode: 'grid' | 'list';
  onClick: () => void;
}

const PhotoCard = ({ photo, viewMode, onClick }: PhotoCardProps) => {
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

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex items-center"
        onClick={onClick}
      >
        <div className="h-16 w-16 relative">
          <div 
            className="w-full h-full bg-gray-200"
            style={{ 
              backgroundImage: `url(data:${photo.fileType};base64,${photo.base64Data})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }} 
          />
        </div>
        <div className="flex-1 p-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium truncate">{photo.title}</h3>
              <p className="text-xs text-gray-500">{formatDate(photo.uploadedAt)}</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        <div 
          className="w-full h-40 bg-gray-200"
          style={{ 
            backgroundImage: `url(data:${photo.fileType};base64,${photo.base64Data})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} 
        />
        {photo.location && (
          <div className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {photo.location.split(',')[0].trim()}
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{photo.title}</h3>
            <p className="text-xs text-gray-500">{formatDate(photo.uploadedAt)}</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600" onClick={(e) => e.stopPropagation()}>
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
        {photo.tags && photo.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {photo.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag.id} 
                variant="secondary"
                className={tag.aiGenerated ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-blue-100 text-blue-800 hover:bg-blue-200"}
              >
                {tag.aiGenerated && <Bot className="h-3 w-3 mr-1 text-green-500" />}
                {tag.name}
              </Badge>
            ))}
            {photo.tags.length > 3 && (
              <Badge variant="outline" className="text-gray-500">
                +{photo.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoCard;
