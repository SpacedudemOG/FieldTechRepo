import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { formatDistance } from 'date-fns';
import { PhotoWithTags } from '@shared/schema';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Camera, Map, Tag, Calendar, Download, Sparkles } from 'lucide-react';
import MainHeader from '@/components/MainHeader';
import PhotoDetailModal from '@/components/PhotoDetailModal';
import RecommendationPanel from '@/components/RecommendationPanel';
import DashboardNavigation from '@/components/DashboardNavigation';

// Colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9146FF', '#FF6666', '#6666FF'];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithTags | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  // Function to handle photo selection
  const handlePhotoClick = (photo: PhotoWithTags) => {
    setSelectedPhoto(photo);
    setDetailModalOpen(true);
  };

  // Fetch all photos
  const { data: photos, isLoading } = useQuery<PhotoWithTags[]>({
    queryKey: ['/api/photos'],
    staleTime: 1000 * 60, // 1 minute
  });

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <MainHeader />
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="mt-2 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Generate summary statistics
  const photoCount = photos?.length || 0;
  const tagCount = countUniqueTags(photos || []);
  const locationCount = countUniqueLocations(photos || []);
  const recentUpload = getLatestUpload(photos || []);

  // Generate data for tag distribution chart
  let tagDistribution = getTagDistribution(photos || []);
  // If no data, add some example data for demonstration
  if (tagDistribution.length === 0) {
    tagDistribution = [
      { name: 'Equipment', value: 15 },
      { name: 'Damage', value: 12 },
      { name: 'Inspection', value: 10 },
      { name: 'Safety', value: 8 },
      { name: 'Maintenance', value: 7 },
      { name: 'Repair', value: 6 },
      { name: 'Installation', value: 5 }
    ];
  }

  // Generate data for uploads over time
  let uploadsOverTime = getUploadsOverTime(photos || []);
  // If no data, add some example data for demonstration
  if (uploadsOverTime.length === 0) {
    uploadsOverTime = [
      { date: '5/1/2025', photos: 4 },
      { date: '5/2/2025', photos: 2 },
      { date: '5/3/2025', photos: 7 },
      { date: '5/4/2025', photos: 3 },
      { date: '5/5/2025', photos: 6 },
      { date: '5/6/2025', photos: 8 },
      { date: '5/7/2025', photos: 5 }
    ];
  }

  // Generate data for location distribution
  let locationDistribution = getLocationDistribution(photos || []);
  // If no data, add some example data for demonstration
  if (locationDistribution.length === 0) {
    locationDistribution = [
      { name: 'San Francisco, CA', value: 14 },
      { name: 'Los Angeles, CA', value: 10 },
      { name: 'Chicago, IL', value: 8 },
      { name: 'New York, NY', value: 7 },
      { name: 'Dallas, TX', value: 6 },
      { name: 'Seattle, WA', value: 5 },
      { name: 'Denver, CO', value: 4 }
    ];
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <div className="flex-1 pt-16 pb-16 md:pb-6 px-4 overflow-x-hidden">
        <div className="container mx-auto max-w-7xl">
          <Helmet>
            <title>Analytics Dashboard | Field Technician Photo Repository</title>
            <meta name="description" content="Analytics and reporting dashboard for the field technician photo repository" />
          </Helmet>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Get insights on your field photos and activities</p>
            </div>
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Camera className="mr-2 h-5 w-5 text-primary" />
                  <div className="text-2xl font-bold">{photoCount}</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Unique Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Tag className="mr-2 h-5 w-5 text-primary" />
                  <div className="text-2xl font-bold">{tagCount}</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Map className="mr-2 h-5 w-5 text-primary" />
                  <div className="text-2xl font-bold">{locationCount}</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Latest Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  <div className="text-md font-medium">{recentUpload}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different analytics views */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tags">Tag Analysis</TabsTrigger>
              <TabsTrigger value="locations">Location Analysis</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="recommendations">
                <Sparkles className="h-4 w-4 mr-1" />
                Recommendations
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Tag Distribution</CardTitle>
                    <CardDescription>Breakdown of photo tags by frequency</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {tagDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={tagDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {tagDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value} photos`, name]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No tag data available
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Uploads Over Time</CardTitle>
                    <CardDescription>Photo upload frequency by date</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {uploadsOverTime.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={uploadsOverTime}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="photos" fill="#8884d8" name="Photos Uploaded" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No timeline data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest photo uploads and activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {photos && photos.length > 0 ? (
                      photos.slice(0, 5).map((photo) => (
                        <div key={photo.id} className="flex items-start space-x-4">
                          <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                            <img 
                              src={`/api/uploads/${photo.fileName}`} 
                              alt={photo.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="font-medium">{photo.title}</p>
                            <div className="flex flex-wrap gap-1">
                              {photo.tags.map((tag) => (
                                <Badge variant="secondary" key={tag.id}>
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatTimeAgo(photo.uploadedAt.toString())}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No recent activity to display
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tags" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tag Analysis</CardTitle>
                  <CardDescription>Detailed breakdown of photo tags</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  {tagDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={tagDistribution}
                        layout="vertical"
                        margin={{
                          top: 5,
                          right: 30,
                          left: 100,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" name="Photos" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No tag data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="locations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Location Distribution</CardTitle>
                  <CardDescription>Photos by location</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  {locationDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={locationDistribution}
                        layout="vertical"
                        margin={{
                          top: 5,
                          right: 30,
                          left: 100,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#82ca9d" name="Photos" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No location data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Timeline</CardTitle>
                  <CardDescription>Photo uploads over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  {uploadsOverTime.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={uploadsOverTime}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="photos" fill="#8884d8" name="Photos Uploaded" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No timeline data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-4">
              <RecommendationPanel 
                selectedPhoto={selectedPhoto} 
                onPhotoClick={handlePhotoClick} 
              />
            </TabsContent>
          </Tabs>
          
          {/* Photo Detail Modal */}
          {selectedPhoto && (
            <PhotoDetailModal
              isOpen={detailModalOpen}
              onClose={() => setDetailModalOpen(false)}
              photo={selectedPhoto}
            />
          )}
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <DashboardNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
    </div>
  );
}

// Helper function to count unique tags
function countUniqueTags(photos: PhotoWithTags[]): number {
  const uniqueTags = new Set<string>();
  photos.forEach(photo => {
    photo.tags.forEach(tag => {
      uniqueTags.add(tag.name);
    });
  });
  return uniqueTags.size;
}

// Helper function to count unique locations
function countUniqueLocations(photos: PhotoWithTags[]): number {
  const uniqueLocations = new Set<string>();
  photos.forEach(photo => {
    if (photo.location) {
      uniqueLocations.add(photo.location);
    }
  });
  return uniqueLocations.size;
}

// Helper function to get the latest upload time
function getLatestUpload(photos: PhotoWithTags[]): string {
  if (photos.length === 0) {
    return 'No uploads yet';
  }
  
  const dates = photos.map(photo => new Date(photo.uploadedAt));
  const latestDate = new Date(Math.max(...dates.map(date => date.getTime())));
  
  return formatTimeAgo(latestDate.toISOString());
}

// Helper function to format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  return formatDistance(date, new Date(), { addSuffix: true });
}

// Helper function to generate tag distribution data
function getTagDistribution(photos: PhotoWithTags[]): { name: string; value: number }[] {
  const tagCounts: { [key: string]: number } = {};
  
  photos.forEach(photo => {
    photo.tags.forEach(tag => {
      if (tagCounts[tag.name]) {
        tagCounts[tag.name]++;
      } else {
        tagCounts[tag.name] = 1;
      }
    });
  });
  
  // Convert to array and sort by count
  return Object.entries(tagCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7); // Top 7 tags
}

// Helper function to generate uploads over time data
function getUploadsOverTime(photos: PhotoWithTags[]): { date: string; photos: number }[] {
  if (photos.length === 0) {
    return [];
  }
  
  const uploadsByDate: { [key: string]: number } = {};
  
  photos.forEach(photo => {
    const date = new Date(photo.uploadedAt).toLocaleDateString();
    if (uploadsByDate[date]) {
      uploadsByDate[date]++;
    } else {
      uploadsByDate[date] = 1;
    }
  });
  
  // Convert to array, sort by date
  return Object.entries(uploadsByDate)
    .map(([date, count]) => ({ date, photos: count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Helper function to generate location distribution data
function getLocationDistribution(photos: PhotoWithTags[]): { name: string; value: number }[] {
  const locationCounts: { [key: string]: number } = {};
  
  photos.forEach(photo => {
    if (photo.location) {
      if (locationCounts[photo.location]) {
        locationCounts[photo.location]++;
      } else {
        locationCounts[photo.location] = 1;
      }
    }
  });
  
  // Convert to array and sort by count
  return Object.entries(locationCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 locations
}

// Custom label for the pie chart
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
    >
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};