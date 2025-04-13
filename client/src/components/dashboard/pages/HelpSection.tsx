// src/components/HelpSection.tsx
import React from 'react';
import { LifeBuoy } from 'lucide-react';

interface HelpSectionProps {
  // Extend with any props if needed, such as dynamic FAQ items or contact info
}

const HelpSection: React.FC<HelpSectionProps> = () => {
  return (
    <div className="w-full mt-8">
      <div className="flex items-center mb-6">
        <LifeBuoy className="h-10 w-10 text-red-500 mr-4" />
        <h2 className="text-4xl font-bold text-gray-900">Help</h2>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-5">
        <p className="text-lg text-gray-700">
          Need assistance? Our support team is here to help. Please check our FAQ or contact us directly.
        </p>
        <div className="mt-4">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Frequently Asked Questions</h3>
          <ul className="list-disc list-inside text-gray-700">
            <li>
              <strong>How do I enroll in a course?</strong> Click the enroll button on the course page to join.
            </li>
            <li>
              <strong>How can I track my progress?</strong> Your dashboard provides detailed progress information for each course.
            </li>
            <li>
              <strong>How do I contact support?</strong> Email our support team at <a href="mailto:support@example.com" className="text-blue-600 hover:underline">support@example.com</a>.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HelpSection;
