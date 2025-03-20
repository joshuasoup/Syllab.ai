import { Link, redirect } from "react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  FileIcon, 
  UserIcon, 
  ClockIcon, 
  BookOpenIcon, 
  CalendarIcon, 
  GraduationCapIcon,
  MailIcon,
  FileTextIcon
} from "lucide-react";

export function loader() {
  return redirect("/syllabus-upload");
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center p-4">
      {/* Header with SyllabAI logo */}
      <div className="flex items-center justify-between w-full max-w-6xl mb-6 py-5">
        <h1 className="text-3xl font-serif">
          <span className="text-navy-600 font-bold">Syllab</span>
          <span className="text-amber-600 font-bold">AI</span>
        </h1>
        <Link to="/profile" className="flex items-center text-slate-700 hover:text-navy-600 transition-colors">
          <UserIcon className="h-5 w-5 mr-2" />
          <span>My Account</span>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="w-full max-w-6xl mb-16 mt-8">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 mb-5 leading-tight">
            Understand Your Syllabus <span className="text-navy-600">at a Glance</span>
          </h2>
          <p className="text-slate-600 text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
            SyllabAI parses your course syllabi to extract key dates, requirements, and 
            contact information — helping you organize your academic life with ease.
          </p>
          <Button asChild size="lg" className="bg-navy-600 hover:bg-navy-700 text-white font-medium text-lg py-6 px-8 rounded-md shadow-md">
            <Link to="/syllabus-upload">Upload Your Syllabus</Link>
          </Button>
        </div>
        
        {/* Academic visual element */}
        <div className="flex justify-center mt-12 opacity-10">
          <div className="flex items-center space-x-4">
            <GraduationCapIcon className="h-16 w-16" />
            <BookOpenIcon className="h-20 w-20" />
            <FileTextIcon className="h-16 w-16" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full max-w-6xl mb-16 bg-white py-12 px-8 rounded-lg shadow-sm">
        <h3 className="text-2xl font-serif font-bold text-center text-slate-800 mb-10 border-b border-slate-200 pb-4">
          Core Features
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-white border border-slate-200 p-6 rounded-lg hover:shadow-md transition-all duration-300">
            <div className="flex items-start">
              <div className="bg-navy-50 p-3 rounded-lg mr-4">
                <CalendarIcon className="h-7 w-7 text-navy-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800 mb-2">Deadline Extraction</h4>
                <p className="text-slate-600">Automatically identifies and organizes assignment due dates, exam schedules, and project deadlines into a timeline view.</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white border border-slate-200 p-6 rounded-lg hover:shadow-md transition-all duration-300">
            <div className="flex items-start">
              <div className="bg-navy-50 p-3 rounded-lg mr-4">
                <BookOpenIcon className="h-7 w-7 text-navy-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800 mb-2">Course Information</h4>
                <p className="text-slate-600">Extracts and clearly presents course objectives, required materials, textbooks, and grading policies for easy reference.</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white border border-slate-200 p-6 rounded-lg hover:shadow-md transition-all duration-300">
            <div className="flex items-start">
              <div className="bg-navy-50 p-3 rounded-lg mr-4">
                <MailIcon className="h-7 w-7 text-navy-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800 mb-2">Contact Details</h4>
                <p className="text-slate-600">Organizes professor contact information, office hours, and TA details in an easily accessible format for when you need assistance.</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white border border-slate-200 p-6 rounded-lg hover:shadow-md transition-all duration-300">
            <div className="flex items-start">
              <div className="bg-navy-50 p-3 rounded-lg mr-4">
                <ClockIcon className="h-7 w-7 text-navy-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800 mb-2">Schedule Sync</h4>
                <p className="text-slate-600">Converts important dates into a format that can be easily imported into your digital calendar for automatic reminders.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md border border-slate-200 mb-16">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-serif font-bold text-slate-800 mb-3">
            Upload Your Syllabus
          </h3>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            PDF, Word document, or text file — our academic AI assistant will analyze it in seconds
          </p>
        </div>

        <Link to="/syllabus-upload" className="block">
          <div className="bg-slate-50 border-2 border-dashed border-navy-200 rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all duration-300">
            <div className="bg-navy-50 p-4 rounded-full mb-4">
              <FileIcon className="h-12 w-12 text-navy-600" />
            </div>
            <p className="text-slate-800 text-lg font-medium">
              Drop your syllabus here
            </p>
            <p className="text-slate-500 mt-1">
              or click to browse from your files
            </p>
            <Button className="mt-6 bg-navy-600 hover:bg-navy-700 text-white font-medium px-6 py-2 rounded-md">
              Select File
            </Button>
          </div>
        </Link>
        
        <div className="flex justify-center mt-8 text-sm text-slate-500">
          <p>Supports PDF, DOCX, and TXT formats • Your data is kept private and secure</p>
        </div>
      </Card>
      
      {/* Testimonial / Social Proof */}
      <div className="w-full max-w-4xl text-center mb-16">
        <p className="text-slate-600 font-serif italic">
          "SyllabAI helped me organize my courses and never miss a deadline. It's an essential tool for any serious student."
        </p>
        <p className="text-slate-500 mt-2 text-sm">— Computer Science Major, University of Michigan</p>
      </div>
      
      {/* Footer */}
      <div className="w-full max-w-6xl border-t border-slate-200 pt-6 pb-8 text-center">
        <p className="text-slate-500 text-sm">© 2023 SyllabAI • A tool for academic success</p>
      </div>
    </div>
  );
}