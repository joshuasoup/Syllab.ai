// src/pages/Dashboard.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import AnchorMenu from '@/components/dashboard/AnchorMenu';
import TodoList from '@/components/dashboard/pages/TodoList';
import Leaderboard, { LeaderboardEntry } from '@/components/dashboard/pages/Leaderboard';
import EnrolledCourses from '@/components/dashboard/pages/Courses';
import HelpSection from '@/components/dashboard/pages/HelpSection';
import '@styles/dashboard.css'

export default function Dashboard() {
  // Sample leaderboard data (already provided)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { id: '1', name: 'You', score: 450, rank: 1 },
    { id: '2', name: 'John D.', score: 380, rank: 2 },
    { id: '3', name: 'Sarah M.', score: 350, rank: 3 },
    { id: '4', name: 'Alex K.', score: 300, rank: 4 },
    { id: '5', name: 'Jamie L.', score: 250, rank: 5 },
  ]);

  // Create refs for each full-screen section
  const todoListRef = useRef<HTMLDivElement>(null);
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const enrolledCoursesRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  
  // Store all refs in an array for easier access
  const sectionRefs = [todoListRef, leaderboardRef, enrolledCoursesRef, helpRef];

  // Track active section (0: TodoList, 1: Leaderboard, 2: Courses, 3: Help)
  const [activeDot, setActiveDot] = useState<number>(0);
  
  // Track if we're currently animating
  const [isAnimating, setIsAnimating] = useState(false);

  // Smooth scroll animation function
  const smoothScrollTo = (ref: React.RefObject<HTMLDivElement>, index: number) => {
    if (ref.current && !isAnimating) {
      setIsAnimating(true);
      
      // Set active dot before animation starts
      setActiveDot(index);
      
      // Get the target position
      const targetPosition = ref.current.offsetTop;
      
      // Use Framer Motion's animate function to animate the scroll
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // Reset animation lock after animation completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 800); // Animation duration
    }
  };

  // Individual scroll functions for each section
  const scrollToTodoList = () => smoothScrollTo(todoListRef, 0);
  const scrollToLeaderboard = () => smoothScrollTo(leaderboardRef, 1);
  const scrollToCourses = () => smoothScrollTo(enrolledCoursesRef, 2);
  const scrollToHelp = () => smoothScrollTo(helpRef, 3);

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

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.7,
        ease: "easeInOut"
      }
    },
    exit: { 
      opacity: 0,
      y: -50,
      transition: { 
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="relative overflow-hidden">
  
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
        <motion.div 
          className="max-w-3xl w-full px-6"
          initial="hidden"
          animate={activeDot === 0 ? "visible" : "hidden"}
          variants={sectionVariants}
        >
          <TodoList />
        </motion.div>
      </section>

      {/* 2. Leaderboard Section */}
      <section ref={leaderboardRef} className="h-screen w-full flex items-center justify-center">
        <motion.div 
          className="max-w-3xl w-full px-6"
          initial="hidden"
          animate={activeDot === 1 ? "visible" : "hidden"}
          variants={sectionVariants}
        >
          <Leaderboard leaderboard={leaderboard} />
        </motion.div>
      </section>

      {/* 3. Enrolled Courses Section */}
      <section ref={enrolledCoursesRef} className="h-screen w-full flex items-center justify-center">
        <motion.div 
          className="max-w-3xl w-full px-6"
          initial="hidden"
          animate={activeDot === 2 ? "visible" : "hidden"}
          variants={sectionVariants}
        >
          <EnrolledCourses  />
        </motion.div>
      </section>

      {/* 4. Help Section */}
      <section ref={helpRef} className="h-screen w-full flex items-center justify-center">
        <motion.div 
          className="max-w-3xl w-full px-6"
          initial="hidden"
          animate={activeDot === 3 ? "visible" : "hidden"}
          variants={sectionVariants}
        >
          <HelpSection />
        </motion.div>
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