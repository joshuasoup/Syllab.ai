import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { LogoMarquee } from "@/components/features/LogoMarquee";

// Gradient style for SyllabAI text
const syllabAIGradientStyle = {
  background: "linear-gradient(to right, #2563eb, #9333ea)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text"
};

// Component for full page background
const FullPageBackground = ({ children }: { children: React.ReactNode; }) => {
  useEffect(() => {
    // Apply styles to html and body elements
    document.documentElement.style.height = "100%";
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.documentElement.style.overflow = "hidden";

    document.body.style.height = "100%";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "auto";
    document.body.style.background = "#ffffff";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";

    // Cleanup function
    return () => {
      document.documentElement.style.height = "";
      document.documentElement.style.margin = "";
      document.documentElement.style.padding = "";
      document.documentElement.style.overflow = "";

      document.body.style.height = "";
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.overflow = "";
      document.body.style.background = "";
      document.body.style.backgroundAttachment = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundPosition = "";
    };
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        background: "#ffffff",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
        overflowY: "auto",
      }}
    >
      {children}
    </div>
  );
};

export default function() {
  return (
    <FullPageBackground>
      <Navbar />
      <div className="w-full flex flex-col justify-start pt-32 px-4 sm:px-6 md:px-8 flex-grow">
        <div className="w-full max-w-7xl mx-auto"
          style={{
            backgroundColor: "#f8f9fa",
            backgroundImage: `
          radial-gradient(circle at center, rgba(255,255,255,0) 0%, white 95%),
          repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 25px),
          repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 25px)
        `,
            backgroundSize: "cover, 25px 25px, 25px 25px",
          }}>
          <div className="text-center space-y-10 mb-20 mt-20">
            <h1
              className="text-6xl md:text-8xl font-bold text-slate-900"
              style={{
                fontWeight: 800,
                letterSpacing: "0.02em",
                lineHeight: 1.1,
                fontFamily: "none",
              }}
            >
              Never Open<br />A <span
                className="inline-block"
                style={syllabAIGradientStyle}
              >Syllabus</span> Again.
            </h1>
            <h2
              className="font-bold mt-6"
              style={{
                letterSpacing: "0.02em",
                marginTop: "10px",
              }}
            >
              <span
                style={{
                  fontWeight: 500,
                  opacity: 0.85
                }}
              >
                Introducing{" "}
              </span>
              <span
                style={{
                  ...syllabAIGradientStyle,
                  fontWeight: 700
                }}
              >
                SyllabAI
              </span>
            </h2>
          </div>

          {/* University Logo Banner */}
          <div className="w-full my-16 overflow-hidden">
            <h4 className="text-center text-xs font-bold uppercase tracking-wide text-slate-400">
              Trusted By University Students Across The Country
            </h4>

            <LogoMarquee />

            {/* Login Button */}
            <div className="flex justify-center mb-6 mt-20">
              <Button
                className="w-52 h-14 rounded-xl text-white text-lg font-semibold transition-all hover:scale-105 hover:opacity-90 flex flex-row items-center justify-center"
                style={{
                  background: "linear-gradient(to right, #2563eb, #9333ea)",
                }}
                asChild
              >
                <Link to="auth/sign-in">See It in Action :)</Link>
              </Button>
            </div>
          </div>

          {/* Demo Section */}
          <div id="demo" className="w-full py-20 mt-20 bg-slate-50 rounded-3xl shadow-inner relative overflow-hidden">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12"
              style={{
                fontWeight: 700,
                letterSpacing: "0.03em"
              }}>
              <span style={syllabAIGradientStyle}>SyllabAI</span> Login to Experience SyllabAI
            </h2>

            <div className="max-w-6xl mx-auto px-4">
              {/* Demo Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Syllabus Upload Demo */}
                <div className="bg-white rounded-xl p-8 shadow-lg transform transition-all hover:scale-105">
                  <h3 className="text-xl font-semibold mb-4 text-slate-800">Upload Your Syllabus</h3>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg py-10 px-6 flex flex-col items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-slate-600 text-center mb-4">Drag & drop your syllabus PDF here</p>
                    <Button className="text-white" style={{
                      background: "linear-gradient(to right, #2563eb, #9333ea)"
                    }}>
                      Browse Files
                    </Button>
                  </div>
                </div>

                {/* Right Column: Extracted Information */}
                <div className="bg-white rounded-xl p-8 shadow-lg transform transition-all hover:scale-105">
                  <h3 className="text-xl font-semibold mb-4 text-slate-800">Get Intelligent Results</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 pl-4" style={{ borderColor: "#2563eb" }}>
                      <h4 className="text-md font-medium mb-1">Important Dates</h4>
                      <div className="bg-blue-50 p-3 rounded-md">
                        <div className="flex justify-between text-sm text-slate-700 mb-2">
                          <span>Midterm Exam</span>
                          <span className="font-semibold">Oct 15, 2023</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-700 mb-2">
                          <span>Assignment #2 Due</span>
                          <span className="font-semibold">Nov 5, 2023</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-700">
                          <span>Final Exam</span>
                          <span className="font-semibold">Dec 12, 2023</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-l-4 pl-4" style={{ borderColor: "#9333ea" }}>
                      <h4 className="text-md font-medium mb-1">Grade Breakdown</h4>
                      <div className="bg-purple-50 p-3 rounded-md">
                        <div className="flex justify-between text-sm text-slate-700 mb-2">
                          <span>Assignments</span>
                          <span className="font-semibold">30%</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-700 mb-2">
                          <span>Midterm</span>
                          <span className="font-semibold">25%</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-700">
                          <span>Final Exam</span>
                          <span className="font-semibold">45%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Features Preview */}
              <div className="mt-12 bg-white rounded-xl p-8 shadow-lg">
                <h3 className="text-xl font-semibold mb-6 text-center text-slate-800">
                  Everything you need to stay on top of your courses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h4 className="font-medium mb-2">Calendar Integration</h4>
                    <p className="text-sm text-slate-600">All your course deadlines synced to your calendar</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <h4 className="font-medium mb-2">Smart Reminders</h4>
                    <p className="text-sm text-slate-600">Never miss another assignment deadline</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h4 className="font-medium mb-2">Course Materials</h4>
                    <p className="text-sm text-slate-600">All your course content organized in one place</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-12 text-center">
                <Button
                  className="px-8 py-6 rounded-xl text-white text-lg font-semibold transition-all hover:scale-105 hover:opacity-90"
                  style={{
                    background: "linear-gradient(to right, #2563eb, #9333ea)",
                  }}
                  asChild
                >
                  <Link to="auth/sign-up">Try SyllabAI Free</Link>
                </Button>
                <p className="mt-4 text-slate-600 text-sm">No credit card required. Start organizing your courses today.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FullPageBackground>
  );
}