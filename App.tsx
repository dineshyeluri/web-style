
import React from 'react';
import KineticHero from './components/KineticHero';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500">
      <main className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <KineticHero 
          content={{ headline: "", subheadline: "", ctaText: "" }} 
          isLoading={false} 
        />
      </main>
    </div>
  );
};

export default App;
