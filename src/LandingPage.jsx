import React from 'react';
import {
  Smile, Layers, Type, Download, Search, Undo, Move,
  Zap, Share2, Shield, ArrowRight,
  Github, Twitter, Linkedin, MapPin
} from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-black border-t border-gray-900 text-gray-400 py-12 px-6 font-sans text-center">
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        <div className="flex items-center gap-2 text-white font-bold text-xl mb-6">
          <Smile className="text-purple-500" /> MemeHub Pro
        </div>
        
        <p className="text-sm leading-relaxed mb-8 max-w-md mx-auto text-gray-500">
           The professional's choice for meme generation. Built for speed, flexibility, and viral potential.
        </p>

        <div className="flex items-center gap-6 justify-center bg-gray-900/50 px-6 py-4 rounded-2xl border border-gray-800">
          <a
            href="https://github.com/ranjan-builds"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:text-white transition-colors group"
          >
             <Github size={20} className="group-hover:text-purple-400 transition-colors" />
             <span className="font-medium">ranjan-builds</span>
          </a>
          <div className="h-4 w-px bg-gray-700" />
          <a
            href="https://linkedin.com/in/ranjan-kashyap"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:text-white transition-colors group"
          >
             <Linkedin size={20} className="group-hover:text-blue-400 transition-colors" />
             <span className="font-medium">Ranjan Kashyap</span>
          </a>
          <div className="h-4 w-px bg-gray-700" />
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
          >
            <Twitter size={20} className="hover:text-blue-400 transition-colors" />
          </a>
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-600">
            <MapPin size={12} />
            <span>Made in India</span>
            <span>•</span>
            <span>&copy; 2024 MemeHub Pro</span>
        </div>
      </div>
    </footer>
  );
}

function LandingPage({ onStart }) {
  const features = [
    {
      icon: <Layers className="text-blue-400" />,
      title: "Layer-Based Editing",
      desc: "Complex compositions made easy. Reorder text, images, and stickers with a familiar layer system."
    },
    {
      icon: <Type className="text-green-400" />,
      title: "Pro Typography",
      desc: "Access the classic Impact font along with modern Google Fonts. Full control over stroke, color, and shadows."
    },
    {
      icon: <Download className="text-pink-400" />,
      title: "HD Export",
      desc: "No watermarks. No compression artifacts. Download crisp PNGs ready for any social platform."
    },
    {
      icon: <Search className="text-yellow-400" />,
      title: "Live Template Search",
      desc: "Direct integration with ImgFlip API to fetch the hottest trending templates instantly."
    },
    {
      icon: <Undo className="text-purple-400" />,
      title: "History & Safety",
      desc: "Made a mistake? Ctrl+Z support is built-in. Your work is safe while you edit."
    },
    {
      icon: <Move className="text-orange-400" />,
      title: "Drag & Drop",
      desc: "Upload your own assets and position them with pixel-perfect precision using our canvas engine."
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
      {/* Navbar */}
      <nav className="border-b border-gray-900 sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Smile className="text-purple-600" /> MemeHub Pro
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">About</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-gray-400 hover:text-white hidden sm:block">
              Log in
            </button>
            <button
              onClick={onStart}
              className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105"
            >
              Launch App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-xs font-medium text-purple-400 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
            </span>
            v2.0 Now Available with AI Templates
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
            Make memes that <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              go viral instantly.
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The professional-grade meme generator for creators, marketers, and shitposters. 
            Layer-based editing, high-res export, and a library of 1000+ templates.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStart}
              className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-lg shadow-purple-900/40 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Start Creating Free <ArrowRight size={20} />
            </button>
            <button className="bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white px-8 py-4 rounded-full text-lg font-medium transition-all w-full sm:w-auto">
              View Examples
            </button>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-gray-500 grayscale opacity-60">
             <div className="font-bold text-xl flex items-center gap-2">
               <Zap size={18}/> REDDIT
             </div>
             <div className="font-bold text-xl flex items-center gap-2">
               <Share2 size={18}/> TWITTER
             </div>
             <div className="font-bold text-xl flex items-center gap-2">
               <Shield size={18}/> DISCORD
             </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 bg-gray-950 px-6">
        <div className="max-w-7xl mx-auto">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">
                Everything you need to ship quality posts
              </h2>
              <p className="text-gray-400">
                Stop wrestling with Paint. Start using a real tool.
              </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((f, i) => (
                  <div
                    key={i}
                    className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl hover:bg-gray-900 transition-colors"
                  >
                      <div className="bg-gray-800 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                          {f.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                      <p className="text-gray-400 leading-relaxed">{f.desc}</p>
                  </div>
              ))}
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 border-t border-gray-900">
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/20 rounded-3xl p-12 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             <h2 className="text-4xl font-bold mb-6 relative z-10">
               Ready to make the internet laugh?
             </h2>
             <p className="text-gray-300 mb-8 max-w-2xl mx-auto relative z-10">
               Join thousands of creators using MemeHub Pro to generate content that engages.
             </p>
             <button
               onClick={onStart}
               className="bg-white text-black hover:bg-gray-100 px-8 py-3 rounded-full font-bold text-lg transition-all relative z-10"
             >
                 Open Creator Studio
             </button>
          </div>
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;
