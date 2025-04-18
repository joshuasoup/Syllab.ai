import React, { useState, useEffect } from 'react';
import { BookOpen, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '@/services/api';
import { eventEmitter } from '../../../utils/eventEmitter';
import type { Syllabus } from '@/types/syllabus';

const UserSyllabuses: React.FC = () => {
  const [syllabuses, setSyllabuses] = useState<Syllabus[] | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  
  // Get current syllabus ID from URL if available
  const currentSyllabusId = location.pathname.match(/\/user\/syllabus-results\/([^\/]+)/)?.[1];
  const [themeColor, setThemeColor] = useState('#3b82f6'); // Default blue color
  
  // Load theme color from localStorage
  useEffect(() => {
    if (currentSyllabusId) {
      const savedColor = localStorage.getItem(`syllabus_color_${currentSyllabusId}`);
      if (savedColor) {
        setThemeColor(savedColor);
      } else {
        setThemeColor('#3b82f6'); // Default blue color
      }
    }
    
    // Listen for theme color changes
    const handleThemeColorChange = (e: CustomEvent) => {
      if (e.detail && e.detail.color) {
        setThemeColor(e.detail.color);
      }
    };
    
    window.addEventListener('themeColorChange', handleThemeColorChange as EventListener);
    
    return () => {
      window.removeEventListener('themeColorChange', handleThemeColorChange as EventListener);
    };
  }, [currentSyllabusId]);

  // Function to fetch syllabuses
  const fetchSyllabuses = async () => {
    setFetching(true);
    setError(null);
    try {
      const response = await api.syllabus.getAll();
      setSyllabuses(response);
    } catch (err) {
      setError("Error loading syllabuses");
    } finally {
      setFetching(false);
    }
  };

  // Fetch syllabuses on component mount
  useEffect(() => {
    fetchSyllabuses();
    
    // Listen for the "syllabusAdded" event
    const handleSyllabusAdded = () => {
      fetchSyllabuses(); // Re-fetch syllabuses
    };

    eventEmitter.on("syllabusAdded", handleSyllabusAdded);

    // Cleanup listener on unmount
    return () => {
      eventEmitter.off("syllabusAdded", handleSyllabusAdded);
    };
  }, []);

  // Extract course info for display
  const getCourseInfo = (syllabus: Syllabus): string => {
    const courseInfo = syllabus.highlights?.course_info;
    if (courseInfo?.code && courseInfo?.name) {
      return `${courseInfo.code} - ${courseInfo.name}`;
    } else if (courseInfo?.name) {
      return courseInfo.name;
    } else if (courseInfo?.code) {
      return courseInfo.code;
    }
    return syllabus.title;
  };

  return (
    <div className="w-full mt-8">
      <div className="flex items-center mb-6">
        <BookOpen className="h-10 w-10 mr-4" style={{ color: themeColor }} />
        <h2 className="text-4xl font-bold text-gray-900">My Syllabuses</h2>
      </div>
      
      {fetching && (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-500">
          Loading syllabuses...
        </div>
      )}
      
      {error && (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center text-red-500">
          {error}
        </div>
      )}
      
      {!fetching && !error && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div 
            className="p-5 flex font-semibold text-gray-700 text-lg" 
            style={{ backgroundColor: `${themeColor}20` }}  // Using hex color with 20% opacity
          >
            <div className="flex-1">Syllabus Title</div>
            <div className="w-40 text-center">Date Added</div>
            <div className="w-40 text-center">Processing Status</div>
            <div className="w-24 text-right">Action</div>
          </div>
          <div className="divide-y divide-gray-200">
            {syllabuses && syllabuses.length > 0 ? (
              syllabuses.map((syllabus) => (
                <div key={syllabus.id} className="flex items-center p-5 text-lg">
                  <div className="flex-1 font-medium flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-gray-500" />
                    {getCourseInfo(syllabus)}
                  </div>
                  <div className="w-40 text-center">
                    {new Date(syllabus.createdAt).toLocaleDateString()}
                  </div>
                  <div className="w-40 text-center">
                    {syllabus.processed ? (
                      <span className="text-green-600 text-sm bg-green-100 px-2 py-1 rounded-full">
                        Processed
                      </span>
                    ) : (
                      <span className="text-amber-600 text-sm bg-amber-100 px-2 py-1 rounded-full">
                        Processing
                      </span>
                    )}
                  </div>
                  <div className="w-24 text-right">
                    <Link 
                      to={`/user/syllabus-results/${syllabus.id}`}
                      className="font-medium"
                      style={{ color: themeColor }}
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No syllabuses uploaded yet. 
                <Link 
                  to="/user/syllabus-upload" 
                  className="ml-2"
                  style={{ color: themeColor }}
                >
                  Upload your first syllabus
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSyllabuses;