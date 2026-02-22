import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Download, 
  RefreshCw, 
  User, 
  Briefcase, 
  MessageSquare, 
  Mail, 
  Phone,
  Layout,
  ChevronRight,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { generateBannerImage } from './lib/gemini';

interface BannerData {
  name: string;
  title: string;
  tagline: string;
  email: string;
  phone: string;
  style: string;
}

const STYLES = [
  { id: 'tech', name: 'Futuristic Tech', description: 'Dark charcoal, deep navy, neural networks, digital grids.' },
  { id: 'minimal', name: 'Minimalist Corporate', description: 'Clean white/gray, professional typography, subtle textures.' },
  { id: 'creative', name: 'Creative Modern', description: 'Vibrant gradients, abstract shapes, bold and energetic.' },
  { id: 'luxury', name: 'Dark Luxury', description: 'Black and gold, elegant lines, premium feel.' },
];

export default function App() {
  const [data, setData] = useState<BannerData>({
    name: 'Muhammad Ijaz',
    title: 'Full-Stack Developer | Generative AI & AI Agents',
    tagline: 'Helping Businesses Automate & Scale',
    email: 'ajazk5574@gmail.com',
    phone: '+92 3495731779',
    style: 'tech',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    
    const selectedStyle = STYLES.find(s => s.id === data.style);
    
    const prompt = `A professional LinkedIn banner, size 1584x396. 
    Style: ${selectedStyle?.description}
    The text is on the right side. 
    Main title in bold premium font: '${data.name}'. 
    Subtitle: '${data.title}'. 
    Tagline: '${data.tagline}'. 
    In a sleek contact box at the bottom right, list: 'WhatsApp: ${data.phone}' and 'Email: ${data.email}'. 
    The left 30% of the image is empty to accommodate the profile picture. 
    High-end, enterprise consultant branding, cinematic lighting.`;

    try {
      const imageUrl = await generateBannerImage(prompt);
      setGeneratedImage(imageUrl);
    } catch (err) {
      setError('Failed to generate banner. Please try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `linkedin-banner-${data.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Pro Banner AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-500 hidden sm:inline-block">Powered by Gemini 2.5 Flash</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Layout className="w-5 h-5 text-indigo-400" />
              Banner Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input 
                    type="text" 
                    name="name"
                    value={data.name}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g. John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Professional Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input 
                    type="text" 
                    name="title"
                    value={data.title}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Tagline / Value Prop</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input 
                    type="text" 
                    name="tagline"
                    value={data.tagline}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g. Building the future of web"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input 
                      type="email" 
                      name="email"
                      value={data.email}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Phone / WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input 
                      type="text" 
                      name="phone"
                      value={data.phone}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-400" />
              Visual Style
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setData(prev => ({ ...prev, style: style.id }))}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    data.style === style.id 
                      ? 'bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500' 
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-medium text-sm">{style.name}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{style.description}</div>
                </button>
              ))}
            </div>
          </section>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Banner
              </>
            )}
          </button>
          
          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[400px]">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                <span className="ml-2 text-xs font-medium text-zinc-500 uppercase tracking-widest">Live Preview</span>
              </div>
              
              {generatedImage && (
                <button 
                  onClick={downloadImage}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PNG
                </button>
              )}
            </div>

            <div className="flex-1 relative flex items-center justify-center p-8 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/50 via-zinc-900 to-zinc-950">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="flex flex-col items-center gap-4 text-center"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-400 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Crafting your brand...</h3>
                      <p className="text-sm text-zinc-500 max-w-xs mx-auto mt-2">
                        Gemini is designing a professional banner based on your profile and style.
                      </p>
                    </div>
                  </motion.div>
                ) : generatedImage ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full space-y-6"
                  >
                    <div className="relative group rounded-2xl overflow-hidden border border-zinc-700 shadow-2xl aspect-[1584/396] bg-zinc-800">
                      <img 
                        src={generatedImage} 
                        alt="Generated LinkedIn Banner" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button 
                          onClick={downloadImage}
                          className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all"
                         >
                           <Download className="w-5 h-5" />
                           Save Banner
                         </button>
                      </div>
                    </div>
                    
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-indigo-500 rounded-lg">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-indigo-300">AI Design Complete</h4>
                          <p className="text-sm text-zinc-400 mt-1">
                            Your banner has been generated with a 1584x396 aspect ratio, optimized for LinkedIn. 
                            The left side is kept clear for your profile picture.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-4"
                  >
                    <div className="w-24 h-24 bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto border border-zinc-700 border-dashed">
                      <ImageIcon className="w-10 h-10 text-zinc-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-zinc-300">Ready to design?</h3>
                      <p className="text-sm text-zinc-500 max-w-sm mx-auto mt-2">
                        Fill in your professional details and click generate to see your custom AI-powered LinkedIn banner.
                      </p>
                    </div>
                    <button 
                      onClick={handleGenerate}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-sm font-medium transition-all"
                    >
                      Quick Start with Sample Data
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Tips Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Layout className="w-4 h-4 text-indigo-400" />
                LinkedIn Best Practices
              </h4>
              <ul className="text-sm text-zinc-500 space-y-2">
                <li>• Keep the left 30% clear for your profile photo.</li>
                <li>• Use high-contrast text for readability.</li>
                <li>• Include clear contact information.</li>
                <li>• Align your banner with your industry's vibe.</li>
              </ul>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-indigo-400">
                <RefreshCw className="w-4 h-4" />
                Iterative Design
              </h4>
              <p className="text-sm text-zinc-500">
                Not happy with the first result? Try changing the style or tweaking your title. AI generation produces unique results every time.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-800 py-8 mt-12 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} Pro Banner AI. Crafted for professional excellence.
          </p>
        </div>
      </footer>
    </div>
  );
}
