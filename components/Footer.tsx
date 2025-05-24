import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-6 text-center text-slate-600 text-sm"> {/* Light background and text */}
      <p>&copy; {new Date().getFullYear()} Deutsch lernen mit Jurgita. Powered by React, Tailwind CSS & Gemini API.</p>
    </footer>
  );
};