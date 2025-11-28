import React, { useState } from 'react';
import LandingPage from './LandingPage';
import MemeGenerator from './MemeGenerator';


export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'app'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Lobster&family=Roboto:wght@400;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; background: #000; margin: 0; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }

        .bg-checkered {
          background-image: 
            linear-gradient(45deg, #111827 25%, transparent 25%),
            linear-gradient(-45deg, #111827 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #111827 75%),
            linear-gradient(-45deg, transparent 75%, #111827 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}</style>

      {view === 'landing' ? (
        <LandingPage onStart={() => setView('app')} />
      ) : (
        <MemeGenerator onBack={() => setView('landing')} />
      )}
    </>
  );
}
