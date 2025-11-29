import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Flame, 
  Shield, 
  DoorOpen, 
  Video, 
  Zap, 
  Cable, 
  FireExtinguisher,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Annotation, 
  ANNOTATION_SYMBOLS, 
  SymbolType,
  PhotoWithTags 
} from '@shared/schema';

interface PhotoAnnotationEditorProps {
  photo: PhotoWithTags;
  isOpen: boolean;
  onClose: () => void;
}

const symbolIcons: Record<SymbolType, typeof Flame> = {
  fire_alarm: Flame,
  security: Shield,
  access_control: DoorOpen,
  cctv: Video,
  electrical: Zap,
  wiring: Cable,
  fire_suppression: FireExtinguisher,
};

const statusColors = {
  ok: 'bg-green-500',
  issue: 'bg-red-500',
  warning: 'bg-yellow-500',
};

export default function PhotoAnnotationEditor({ 
  photo, 
  isOpen, 
  onClose 
}: PhotoAnnotationEditorProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolType | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [editingNote, setEditingNote] = useState('');
  const [editingStatus, setEditingStatus] = useState<string>('ok');
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [pendingAnnotation, setPendingAnnotation] = useState<{x: number, y: number} | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const annotationQueryKey = [`/api/photos/${photo.id}/annotations`];

  const { data: annotations = [], isLoading, refetch } = useQuery<Annotation[]>({
    queryKey: annotationQueryKey,
    queryFn: async () => {
      const res = await fetch(`/api/photos/${photo.id}/annotations`);
      if (!res.ok) throw new Error('Failed to fetch annotations');
      return res.json();
    },
    enabled: isOpen,
  });

  const createAnnotation = useMutation({
    mutationFn: async (data: { symbolType: SymbolType; x: number; y: number; note?: string; status?: string }) => {
      return apiRequest('POST', `/api/photos/${photo.id}/annotations`, data);
    },
    onSuccess: async () => {
      await refetch();
      toast({ title: 'Annotation added', description: 'Device marker has been placed on the photo' });
      setIsPlacing(false);
      setSelectedSymbol(null);
      setPendingAnnotation(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add annotation', variant: 'destructive' });
    }
  });

  const updateAnnotation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Annotation> }) => {
      return apiRequest('PATCH', `/api/annotations/${id}`, data);
    },
    onSuccess: async () => {
      await refetch();
      toast({ title: 'Annotation updated', description: 'Changes have been saved' });
      setSelectedAnnotation(null);
      setShowNoteDialog(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update annotation', variant: 'destructive' });
    }
  });

  const deleteAnnotation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/annotations/${id}`);
    },
    onSuccess: async () => {
      await refetch();
      toast({ title: 'Annotation deleted', description: 'Device marker has been removed' });
      setSelectedAnnotation(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete annotation', variant: 'destructive' });
    }
  });

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacing || !selectedSymbol || !imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    setPendingAnnotation({ x, y });
    setShowNoteDialog(true);
  };

  const handleSaveAnnotation = () => {
    if (!pendingAnnotation || !selectedSymbol) return;

    createAnnotation.mutate({
      symbolType: selectedSymbol,
      x: pendingAnnotation.x,
      y: pendingAnnotation.y,
      note: editingNote || undefined,
      status: editingStatus,
    });

    setEditingNote('');
    setEditingStatus('ok');
    setShowNoteDialog(false);
  };

  const handleAnnotationClick = (annotation: Annotation, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAnnotation(annotation);
    setEditingNote(annotation.note || '');
    setEditingStatus(annotation.status || 'ok');
  };

  const handleUpdateNote = () => {
    if (!selectedAnnotation) return;
    updateAnnotation.mutate({
      id: selectedAnnotation.id,
      data: { note: editingNote, status: editingStatus },
    });
  };

  const handleStartPlacing = (symbolType: SymbolType) => {
    setSelectedSymbol(symbolType);
    setIsPlacing(true);
    setSelectedAnnotation(null);
  };

  const handleCancelPlacing = () => {
    setIsPlacing(false);
    setSelectedSymbol(null);
    setPendingAnnotation(null);
    setShowNoteDialog(false);
    setEditingNote('');
    setEditingStatus('ok');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5" />
            Annotate Photo: {photo.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-24 md:w-32 border-r bg-muted/30 p-2 flex flex-col gap-2 overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground px-2 py-1">DEVICE TYPES</p>
            {(Object.keys(ANNOTATION_SYMBOLS) as SymbolType[]).map((symbolType) => {
              const symbol = ANNOTATION_SYMBOLS[symbolType];
              const Icon = symbolIcons[symbolType];
              const isSelected = selectedSymbol === symbolType && isPlacing;
              
              return (
                <Button
                  key={symbolType}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  className={`flex flex-col h-auto py-2 px-1 gap-1 text-xs ${isSelected ? '' : 'hover:bg-muted'}`}
                  onClick={() => handleStartPlacing(symbolType)}
                  data-testid={`symbol-btn-${symbolType}`}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: isSelected ? 'white' : symbol.color }}
                  >
                    <Icon 
                      className="h-4 w-4" 
                      style={{ color: isSelected ? symbol.color : 'white' }}
                    />
                  </div>
                  <span className="text-center leading-tight whitespace-normal">
                    {symbol.name}
                  </span>
                </Button>
              );
            })}
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {isPlacing && selectedSymbol && (
              <div className="bg-primary/10 px-4 py-2 flex items-center justify-between">
                <p className="text-sm">
                  Click on the photo to place a <strong>{ANNOTATION_SYMBOLS[selectedSymbol].name}</strong> marker
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCancelPlacing}
                  data-testid="cancel-placing-btn"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            )}

            <div className="flex-1 p-4 overflow-auto bg-muted/20">
              <div 
                ref={imageContainerRef}
                className={`relative inline-block max-w-full ${isPlacing ? 'cursor-crosshair' : ''}`}
                onClick={handleImageClick}
                data-testid="annotation-canvas"
              >
                <img
                  src={`data:${photo.fileType};base64,${photo.base64Data}`}
                  alt={photo.title}
                  className="max-w-full h-auto rounded-lg shadow-lg"
                  draggable={false}
                />

                {annotations.map((annotation) => {
                  const symbol = ANNOTATION_SYMBOLS[annotation.symbolType as SymbolType];
                  const Icon = symbolIcons[annotation.symbolType as SymbolType];
                  const isSelected = selectedAnnotation?.id === annotation.id;
                  const statusColor = statusColors[annotation.status as keyof typeof statusColors] || statusColors.ok;

                  return (
                    <div
                      key={annotation.id}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                        isSelected ? 'z-20 scale-125' : 'z-10 hover:scale-110'
                      }`}
                      style={{ 
                        left: `${annotation.x}%`, 
                        top: `${annotation.y}%` 
                      }}
                      onClick={(e) => handleAnnotationClick(annotation, e)}
                      data-testid={`annotation-marker-${annotation.id}`}
                    >
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 ${
                          isSelected ? 'border-white ring-2 ring-primary' : 'border-white/80'
                        }`}
                        style={{ backgroundColor: symbol?.color || '#666' }}
                      >
                        {Icon && <Icon className="h-5 w-5 text-white" />}
                      </div>
                      <div 
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${statusColor}`}
                      />
                      {annotation.note && (
                        <div className="absolute -top-1 -left-1">
                          <MessageSquare className="h-4 w-4 text-primary fill-primary" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedAnnotation && (
              <div className="border-t p-4 bg-muted/30">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {(() => {
                        const Icon = symbolIcons[selectedAnnotation.symbolType as SymbolType];
                        const symbol = ANNOTATION_SYMBOLS[selectedAnnotation.symbolType as SymbolType];
                        return (
                          <>
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: symbol?.color }}
                            >
                              {Icon && <Icon className="h-4 w-4 text-white" />}
                            </div>
                            <span className="font-medium">{symbol?.name}</span>
                            <Badge 
                              variant="secondary"
                              className={
                                selectedAnnotation.status === 'issue' ? 'bg-red-100 text-red-800' :
                                selectedAnnotation.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }
                            >
                              {selectedAnnotation.status || 'OK'}
                            </Badge>
                          </>
                        );
                      })()}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-muted-foreground w-16">Status:</label>
                        <Select value={editingStatus} onValueChange={setEditingStatus}>
                          <SelectTrigger className="w-32" data-testid="status-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ok">OK</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="issue">Issue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-start gap-2">
                        <label className="text-sm text-muted-foreground w-16 pt-2">Note:</label>
                        <Input
                          value={editingNote}
                          onChange={(e) => setEditingNote(e.target.value)}
                          placeholder="Add a note about this device..."
                          className="flex-1"
                          data-testid="annotation-note-input"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      size="sm" 
                      onClick={handleUpdateNote}
                      disabled={updateAnnotation.isPending}
                      data-testid="save-annotation-btn"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => deleteAnnotation.mutate(selectedAnnotation.id)}
                      disabled={deleteAnnotation.isPending}
                      data-testid="delete-annotation-btn"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setSelectedAnnotation(null)}
                      data-testid="cancel-edit-btn"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              {annotations.length} annotation{annotations.length !== 1 ? 's' : ''} on this photo
            </p>
            <Button onClick={onClose} data-testid="close-annotation-editor-btn">
              Done
            </Button>
          </div>
        </DialogFooter>

        <Dialog open={showNoteDialog} onOpenChange={() => { setShowNoteDialog(false); setPendingAnnotation(null); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedSymbol && (() => {
                  const Icon = symbolIcons[selectedSymbol];
                  const symbol = ANNOTATION_SYMBOLS[selectedSymbol];
                  return (
                    <>
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: symbol.color }}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      Add {symbol.name}
                    </>
                  );
                })()}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={editingStatus} onValueChange={setEditingStatus}>
                  <SelectTrigger data-testid="new-annotation-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ok">OK - Working properly</SelectItem>
                    <SelectItem value="warning">Warning - Needs attention</SelectItem>
                    <SelectItem value="issue">Issue - Problem detected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Note (optional)</label>
                <Input
                  value={editingNote}
                  onChange={(e) => setEditingNote(e.target.value)}
                  placeholder="Describe the device or issue..."
                  data-testid="new-annotation-note"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={handleCancelPlacing}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveAnnotation}
                disabled={createAnnotation.isPending}
                data-testid="confirm-annotation-btn"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Marker
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
