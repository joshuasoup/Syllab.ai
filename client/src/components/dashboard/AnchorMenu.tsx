import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface AnchorMenuProps {
  activeDot: number | null;
  scrollToTodoList: () => void;
  scrollToLeaderboard: () => void;
  scrollToCourses: () => void;
  scrollToHelp: () => void;
}

const AnchorMenu: React.FC<AnchorMenuProps> = ({
  activeDot,
  scrollToTodoList,
  scrollToLeaderboard,
  scrollToCourses,
  scrollToHelp,
}) => {
  const [hoveredDot, setHoveredDot] = useState<number | null>(null);

  // Define section names and their scroll functions
  const sections = [
    { name: "TodoList", scrollFn: scrollToTodoList },
    { name: "Leaderboard", scrollFn: scrollToLeaderboard },
    { name: "Courses", scrollFn: scrollToCourses },
    { name: "Help", scrollFn: scrollToHelp }
  ];
  
  return (
    <div className="fixed right-10 top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-4 z-20">
      {/* Render navigation dots for all sections */}
      {sections.map((section, index) => (
        <div key={`section-${section.name}`} className="relative flex items-center justify-center">
          {hoveredDot === index && (
            <motion.div 
              className="absolute right-full mr-2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {section.name}
            </motion.div>
          )}
          <motion.button
            className={`w-4 h-4 rounded-full ${
              activeDot === index ? 'bg-blue-500' : 'bg-black'
            } cursor-pointer hover:bg-blue-500 transition-colors`}
            onClick={section.scrollFn}
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHoveredDot(index)}
            onMouseLeave={() => setHoveredDot(null)}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          />
        </div>
      ))}
    </div>
  );
};

export default AnchorMenu;