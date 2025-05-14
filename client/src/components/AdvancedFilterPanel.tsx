import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PhotoFilter, Tag } from '@shared/schema';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Filter,
  Calendar, 
  Tag as TagIcon, 
  MapPin, 
  User, 
  FileText,
  X,
  Search,
  Briefcase,
  FileSearch,
  Construction,
  CheckSquare,
  Building2,
  AlertTriangle,
  LayoutGrid
} from 'lucide-react';
import { Switch } from "@/components/ui/switch";

interface AdvancedFilterPanelProps {
  onApplyFilter: (filter: PhotoFilter) => void;
  onClearFilter: () => void;
  isOpen: boolean;
}

const AdvancedFilterPanel = ({ 
  onApplyFilter, 
  onClearFilter,
  isOpen 
}: AdvancedFilterPanelProps) => {
  // Basic filters
  const [searchText, setSearchText] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [location, setLocation] = useState<string>('');
  
  // Field technician filters
  const [employee, setEmployee] = useState<string>('');
  const [customer, setCustomer] = useState<string>('');
  const [workOrder, setWorkOrder] = useState<string>('');
  
  // Project and equipment filters
  const [projectId, setProjectId] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [equipmentId, setEquipmentId] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  
  // Boolean filters
  const [hasCoordinates, setHasCoordinates] = useState<boolean | undefined>(undefined);
  const [hasTags, setHasTags] = useState<boolean | undefined>(undefined);
  const [hasNotes, setHasNotes] = useState<boolean | undefined>(undefined);
  
  // Fetch tags
  const { data: tags } = useQuery<Tag[]>({
    queryKey: ['/api/tags'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch unique locations for dropdown (simulated, would come from API in production)
  const locations = [
    'San Francisco Office',
    'Oakland Site',
    'Sunset District',
    'Berkeley Campus'
  ];
  
  // Mock employees for demo, would come from API in production
  const employees = [
    'John Smith',
    'Maria Garcia',
    'David Chen',
    'Aisha Johnson'
  ];
  
  // Mock customers for demo, would come from API in production
  const customers = [
    'Acme Corp',
    'TechSolutions Inc',
    'BuildRight Construction',
    'City Power & Light'
  ];
  
  // Mock projects for demo
  const projects = [
    'SF-Downtown-Renovation',
    'Oakland-Office-Tower',
    'Berkeley-Campus-Upgrade',
    'Marin-Power-Station'
  ];

  // Mock categories for demo
  const categories = [
    'Electrical',
    'Mechanical',
    'Structural',
    'Plumbing',
    'Safety',
    'General'
  ];
  
  // Mock priorities for demo
  const priorities = [
    'High',
    'Medium',
    'Low',
    'Critical'
  ];
  
  // Mock statuses for demo
  const statuses = [
    'Open',
    'In Progress',
    'Resolved',
    'Closed',
    'Pending'
  ];
  
  const handleTagChange = (tagId: number) => {
    setSelectedTags(prevSelectedTags => {
      if (prevSelectedTags.includes(tagId)) {
        return prevSelectedTags.filter(id => id !== tagId);
      } else {
        return [...prevSelectedTags, tagId];
      }
    });
  };
  
  const handleApplyFilter = () => {
    // Build filter object
    const filter: PhotoFilter = {};
    
    // Search text
    if (searchText.trim() !== '') {
      filter.searchText = searchText;
    }
    
    // Date filters
    if (fromDate) {
      filter.fromDate = fromDate.toISOString();
    }
    
    if (toDate) {
      filter.toDate = toDate.toISOString();
    }
    
    // Location filter
    if (location) {
      filter.location = location;
    }
    
    // Tag filters
    if (selectedTags.length > 0) {
      filter.tagIds = selectedTags;
    }
    
    // Field technician filters
    if (employee) {
      filter.employee = employee;
    }
    
    if (customer) {
      filter.customer = customer;
    }
    
    if (workOrder) {
      filter.workOrderNumber = workOrder;
    }
    
    // Project and equipment filters
    if (projectId) {
      filter.projectId = projectId;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (equipmentId) {
      filter.equipmentId = equipmentId;
    }
    
    if (priority) {
      filter.priority = priority;
    }
    
    if (status) {
      filter.status = status;
    }
    
    // Boolean filters
    if (hasCoordinates !== undefined) {
      filter.hasCoordinates = hasCoordinates;
    }
    
    if (hasTags !== undefined) {
      filter.hasTags = hasTags;
    }
    
    if (hasNotes !== undefined) {
      filter.hasNotes = hasNotes;
    }
    
    onApplyFilter(filter);
  };
  
  const handleClearFilter = () => {
    // Reset basic filters
    setSearchText('');
    setSelectedTags([]);
    setFromDate(undefined);
    setToDate(undefined);
    setLocation('');
    
    // Reset field technician filters
    setEmployee('');
    setCustomer('');
    setWorkOrder('');
    
    // Reset project and equipment filters
    setProjectId('');
    setCategory('');
    setEquipmentId('');
    setPriority('');
    setStatus('');
    
    // Reset boolean filters
    setHasCoordinates(undefined);
    setHasTags(undefined);
    setHasNotes(undefined);
    
    onClearFilter();
  };
  
  // Only render if panel is open
  if (!isOpen) return null;
  
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Advanced Filters</CardTitle>
            <CardDescription>Filter photos by multiple criteria</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearFilter}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Global search input */}
        <div className="mt-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search across all fields..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Filters</TabsTrigger>
            <TabsTrigger value="field">Field Details</TabsTrigger>
            <TabsTrigger value="project">Project & Equipment</TabsTrigger>
          </TabsList>
          
          {/* Basic Filters Tab */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Range Filter */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <Label>Date Range</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-500">From</Label>
                    <DatePicker
                      date={fromDate}
                      setDate={setFromDate}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">To</Label>
                    <DatePicker
                      date={toDate}
                      setDate={setToDate}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              
              {/* Location Filter */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <Label>Location</Label>
                </div>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Locations</SelectLabel>
                      <SelectItem value="">All Locations</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Boolean filters */}
            <div className="space-y-2 mt-4">
              <Label className="text-sm font-medium">Photo Attributes:</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={hasCoordinates === true}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setHasCoordinates(true);
                      } else if (hasCoordinates === true) {
                        setHasCoordinates(undefined);
                      } else {
                        setHasCoordinates(false);
                      }
                    }}
                  />
                  <Label>Has GPS Coordinates</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={hasTags === true}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setHasTags(true);
                      } else if (hasTags === true) {
                        setHasTags(undefined);
                      } else {
                        setHasTags(false);
                      }
                    }}
                  />
                  <Label>Has Tags</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={hasNotes === true}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setHasNotes(true);
                      } else if (hasNotes === true) {
                        setHasNotes(undefined);
                      } else {
                        setHasNotes(false);
                      }
                    }}
                  />
                  <Label>Has Notes</Label>
                </div>
              </div>
            </div>
            
            {/* Tags Filter */}
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2">
                <TagIcon className="h-4 w-4 text-primary" />
                <Label>Tags</Label>
              </div>
              
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 border rounded-md">
                {tags && tags.length > 0 ? (
                  tags.map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`tag-${tag.id}`} 
                        checked={selectedTags.includes(tag.id)}
                        onCheckedChange={() => handleTagChange(tag.id)}
                      />
                      <label
                        htmlFor={`tag-${tag.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {tag.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No tags available</p>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Field Technician Tab */}
          <TabsContent value="field" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Employee Filter */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <Label>Employee</Label>
                </div>
                <Select value={employee} onValueChange={setEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Employees</SelectLabel>
                      <SelectItem value="">All Employees</SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp} value={emp}>
                          {emp}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Customer Filter */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <Label>Customer</Label>
                </div>
                <Select value={customer} onValueChange={setCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Customers</SelectLabel>
                      <SelectItem value="">All Customers</SelectItem>
                      {customers.map((cust) => (
                        <SelectItem key={cust} value={cust}>
                          {cust}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Work Order Filter */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <Label>Work Order #</Label>
                </div>
                <Input
                  type="text"
                  placeholder="Enter work order number"
                  value={workOrder}
                  onChange={(e) => setWorkOrder(e.target.value)}
                />
              </div>
              
              {/* Status Filter */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  <Label>Status</Label>
                </div>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Statuses</SelectLabel>
                      <SelectItem value="">Any Status</SelectItem>
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          {/* Project & Equipment Tab */}
          <TabsContent value="project" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project Filter */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <Label>Project</Label>
                </div>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Projects</SelectLabel>
                      <SelectItem value="">All Projects</SelectItem>
                      {projects.map((proj) => (
                        <SelectItem key={proj} value={proj}>
                          {proj}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Category Filter */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-primary" />
                  <Label>Category</Label>
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Categories</SelectLabel>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Equipment ID Filter */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Construction className="h-4 w-4 text-primary" />
                  <Label>Equipment ID</Label>
                </div>
                <Input
                  type="text"
                  placeholder="Enter equipment ID"
                  value={equipmentId}
                  onChange={(e) => setEquipmentId(e.target.value)}
                />
              </div>
              
              {/* Priority Filter */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  <Label>Priority</Label>
                </div>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Priorities</SelectLabel>
                      <SelectItem value="">Any Priority</SelectItem>
                      {priorities.map((pri) => (
                        <SelectItem key={pri} value={pri}>
                          {pri}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <Button variant="outline" onClick={handleClearFilter}>
          Clear All Filters
        </Button>
        <Button onClick={handleApplyFilter}>
          <Filter className="mr-2 h-4 w-4" />
          Apply Filters
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdvancedFilterPanel;