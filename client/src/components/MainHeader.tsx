import { Link } from 'wouter';
import { Camera, BarChart2, Settings } from 'lucide-react';

const MainHeader = () => {
  return (
    <header className="bg-white border-b border-gray-200 fixed w-full top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Camera className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-gray-800">FieldVision</h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/">
            <a className="flex items-center text-gray-600 hover:text-primary transition-colors">
              <Camera className="mr-1 h-4 w-4" />
              <span>Photos</span>
            </a>
          </Link>
          <Link href="/dashboard">
            <a className="flex items-center text-gray-600 hover:text-primary transition-colors">
              <BarChart2 className="mr-1 h-4 w-4" />
              <span>Dashboard</span>
            </a>
          </Link>
          <Link href="/settings">
            <a className="flex items-center text-gray-600 hover:text-primary transition-colors">
              <Settings className="mr-1 h-4 w-4" />
              <span>Settings</span>
            </a>
          </Link>
        </nav>
        
        <div className="md:hidden flex items-center">
          <button className="p-2 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation - Shown when menu button is clicked */}
      <nav className="hidden bg-white border-t border-gray-200 md:hidden">
        <div className="container mx-auto py-2 px-4 space-y-2">
          <Link href="/">
            <a className="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
              <Camera className="mr-2 h-5 w-5" />
              <span>Photos</span>
            </a>
          </Link>
          <Link href="/dashboard">
            <a className="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
              <BarChart2 className="mr-2 h-5 w-5" />
              <span>Dashboard</span>
            </a>
          </Link>
          <Link href="/settings">
            <a className="flex items-center py-2 text-gray-600 hover:text-primary transition-colors">
              <Settings className="mr-2 h-5 w-5" />
              <span>Settings</span>
            </a>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default MainHeader;