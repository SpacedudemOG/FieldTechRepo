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
  Filter, 
  Calendar, 
  Tag as TagIcon, 
  MapPin, 
  User, 
  FileText,
  X
} from 'lucide-react';

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
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [employee, setEmployee] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [customer, setCustomer] = useState<string>('');
  const [workOrder, setWorkOrder] = useState<string>('');
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  
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
    
    if (selectedTags.length > 0) {
      filter.tagIds = selectedTags;
    }
    
    if (location) {
      filter.location = location;
    }
    
    if (fromDate) {
      filter.fromDate = fromDate.toISOString();
    }
    
    if (toDate) {
      filter.toDate = toDate.toISOString();
    }
    
    // These fields would be added to the schema in a real implementation
    // Here we'd augment the filter object with these values
    
    onApplyFilter(filter);
  };
  
  const handleClearFilter = () => {
    setSelectedTags([]);
    setEmployee('');
    setLocation('');
    setCustomer('');
    setWorkOrder('');
    setFromDate(undefined);
    setToDate(undefined);
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
      </CardHeader>
      
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <User className="h-4 w-4 text-primary" />
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
        </div>
        
        {/* Tags Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TagIcon className="h-4 w-4 text-primary" />
            <Label>Tags</Label>
          </div>
          
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border rounded-md">
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
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleClearFilter}>
          Clear All
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