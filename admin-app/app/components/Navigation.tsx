// components/Navigation.tsx

import React from 'react';

const Navigation: React.FC = () => {
  return (
    <nav className='p-4 border-b-2 shadow-md fixed top-0 w-full z-10'>
      <div className="container mx-auto flex items-center justify-between">
        <div>
          <a className="text-[#2C3463] text-xl font-bold">AskNarelle</a>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
