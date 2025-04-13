// src/pages/Dashboard.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnchorMenu from '@/components/dashboard/AnchorMenu';
import TodoList from '@/components/dashboard/pages/TodoList';
import Leaderboard, { LeaderboardEntry } from '@/components/dashboard/pages/Leaderboard';
import EnrolledCourses, { EnrolledCourse } from '@/components/dashboard/pages/Courses';
import HelpSection from '@/components/dashboard/pages/HelpSection';

export default function Dashboard() {
  // Sample leaderboard data (already provided)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { id: '1', name: 'You', score: 450, rank: 1 },
    { id: '2', name: 'John D.', score: 380, rank: 2 },
    { id: '3', name: 'Sarah M.', score: 350, rank: 3 },
    { id: '4', name: 'Alex K.', score: 300, rank: 4 },
    { id: '5', name: 'Jamie L.', score: 250, rank: 5 },
  ]);

  // Sample data for enrolled courses
  const enrolledCourses: EnrolledCourse[] = [
    { id: '1', title: 'Introduction to Programming', instructor: 'Jane Smith', progress: 80 },
    { id: '2', title: 'Data Structures', instructor: 'John Doe', progress: 60 },
    { id: '3', title: 'Algorithms', instructor: 'Alice Brown', progress: 45 },
  ];

  // Create refs for each full-screen section
  const todoListRef = useRef<HTMLDivElement>(null);
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const enrolledCoursesRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  // Track active section (0: TodoList, 1: Leaderboard, 2: Courses, 3: Help)
  const [activeDot, setActiveDot] = useState<number>(0);

  // Individual scroll functions for each section
  const scrollToTodoList = () => {
    if (todoListRef.current) {
      todoListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveDot(0);
    }
  };

  const scrollToLeaderboard = () => {
    if (leaderboardRef.current) {
      leaderboardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveDot(1);
    }
  };

  const scrollToCourses = () => {
    if (enrolledCoursesRef.current) {
      enrolledCoursesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveDot(2);
    }
  };

  const scrollToHelp = () => {
    if (helpRef.current) {
      helpRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveDot(3);
    }
  };

  // Set up an intersection observer to update the active section indicator on scroll
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === todoListRef.current) {
            setActiveDot(0);
          } else if (entry.target === leaderboardRef.current) {
            setActiveDot(1);
          } else if (entry.target === enrolledCoursesRef.current) {
            setActiveDot(2);
          } else if (entry.target === helpRef.current) {
            setActiveDot(3);
          }
        }
      });
    }, options);

    if (todoListRef.current) observer.observe(todoListRef.current);
    if (leaderboardRef.current) observer.observe(leaderboardRef.current);
    if (enrolledCoursesRef.current) observer.observe(enrolledCoursesRef.current);
    if (helpRef.current) observer.observe(helpRef.current);

    return () => {
      if (todoListRef.current) observer.unobserve(todoListRef.current);
      if (leaderboardRef.current) observer.unobserve(leaderboardRef.current);
      if (enrolledCoursesRef.current) observer.unobserve(enrolledCoursesRef.current);
      if (helpRef.current) observer.unobserve(helpRef.current);
    };
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="w-[872px] h-[874px] right-[-400px] bottom-[-400px] absolute bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_rgba(37,_99,_235,_0.61)_0%,_rgba(255,_255,_255,_0.61)_100%)] rounded-full"></div>
        <div className="w-[1207px] h-[1221px] left-[-785px] top-[-661px] absolute bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_#2563EB_0%,_rgba(255,_255,_255,_0.61)_100%)] rounded-full"></div>
      </div>

      {/* Upload Syllabus Button - Fixed position */}
      <div className="fixed top-6 left-6 z-20">
        <Link to="/user/syllabus-upload">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Syllabus
          </Button>
        </Link>
      </div>

      {/* Full-screen Sections */}
      {/* 1. TodoList Section */}
      <section ref={todoListRef} className="h-screen w-full flex items-center justify-center">
        <div className="max-w-3xl w-full px-6">
          <TodoList />
        </div>
      </section>

      {/* 2. Leaderboard Section */}
      <section ref={leaderboardRef} className="h-screen w-full flex items-center justify-center">
        <div className="max-w-3xl w-full px-6">
          <Leaderboard leaderboard={leaderboard} />
        </div>
      </section>

      {/* 3. Enrolled Courses Section */}
      <section ref={enrolledCoursesRef} className="h-screen w-full flex items-center justify-center">
        <div className="max-w-3xl w-full px-6">
          <EnrolledCourses courses={enrolledCourses} />
        </div>
      </section>

      {/* 4. Help Section */}
      <section ref={helpRef} className="h-screen w-full flex items-center justify-center">
        <div className="max-w-3xl w-full px-6">
          <HelpSection />
        </div>
      </section>

      {/* Anchor Menu - Fixed position */}
      <AnchorMenu
        activeDot={activeDot}
        scrollToTodoList={scrollToTodoList}
        scrollToLeaderboard={scrollToLeaderboard}
        scrollToCourses={scrollToCourses}
        scrollToHelp={scrollToHelp}
      />
    </div>
  );
}