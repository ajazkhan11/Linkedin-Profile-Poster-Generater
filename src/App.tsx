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
  style: string;
}

const STYLES = [
  { id: 'tech', name: 'Futuristic Tech', description: 'Dark charcoal, deep navy, neural networks, digital grids.' },
  { id: 'minimal', name: 'Minimalist Corporate', description: 'Clean white/gray, professional typography, subtle textures.' },
  { id: 'creative', name: 'Creative Modern', description: 'Vibrant gradients, abstract shapes, bold and energetic.' },
  { id: 'luxury', name: 'Dark Luxury', description: 'Black and gold, elegant lines, premium feel.' },
  { id: 'nature', name: 'Organic & Calm', description: 'Soft greens, natural textures, serene landscapes, eco-friendly.' },
  { id: 'geometric', name: 'Bold Geometric', description: 'Sharp angles, high contrast colors, mathematical precision.' },
  { id: 'retro', name: 'Vintage Aesthetic', description: 'Muted tones, grain textures, 80s/90s professional vibe.' },
  { id: 'neon', name: 'Cyberpunk Neon', description: 'Electric blues and pinks, dark backgrounds, high energy.' },
  { id: 'mesh', name: 'Gradient Mesh', description: 'Soft, flowing color transitions, modern and sophisticated.' },
  { id: 'architect', name: 'Architectural', description: 'Structured lines, blueprint aesthetic, professional and solid.' },
  { id: 'minimal_dark', name: 'Sleek Dark', description: 'Monochromatic dark tones, ultra-minimalist, high-end tech.' },
  { id: 'abstract', name: 'Abstract Art', description: 'Fluid shapes, artistic expression, unique and memorable.' },
];

export default function App() {
  const [data, setData] = useState<BannerData>({
    name: '',
    title: '',
    tagline: '',
    email: '',
    style: 'tech',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationCount, setGenerationCount] = useState<number>(0);

  // Fetch initial count from backend
  React.useEffect(() => {
    fetch('/api/usage')
      .then(async res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Not a JSON response");
        }
        return res.json();
      })
      .then(data => setGenerationCount(data.count))
      .catch(err => {
        console.error('Failed to fetch usage:', err);
        // Fallback to 0 if backend is missing (e.g. static deployment)
        setGenerationCount(0);
      });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    if (generationCount >= 3) {
      setError('You have reached the limit of 3 banner generations.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    const selectedStyle = STYLES.find(s => s.id === data.style);
    
    const prompt = `A professional LinkedIn banner, size 1584x396. 
    Style: ${selectedStyle?.description}
    The text is on the right side. 
    Main title in bold premium font: '${data.name}'. 
    Subtitle: '${data.title}'. 
    Tagline: '${data.tagline}'. 
    In a sleek contact box at the bottom right, list: 'Contact: ${data.email}'. 
    The left 30% of the image is empty to accommodate the profile picture. 
    High-end, enterprise consultant branding, cinematic lighting.`;

    try {
      // 1. Check/Increment limit on backend first
      const usageRes = await fetch('/api/usage/increment', { method: 'POST' });
      
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setGenerationCount(usageData.count);
      } else {
        // If backend is missing or erroring, we might still want to allow generation 
        // in a "demo" mode or show a specific error.
        const contentType = usageRes.headers.get("content-type");
        if (usageRes.status === 403 && contentType?.includes("application/json")) {
          const errData = await usageRes.json();
          throw new Error(errData.error || 'Limit reached');
        }
        console.warn('Backend usage API failed, proceeding anyway in demo mode');
      }

      // 2. Generate image
      const imageUrl = await generateBannerImage(prompt);
      setGeneratedImage(imageUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to generate banner. Please try again.');
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

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 space-y-12">
        {/* Banner Preview Area - The "Main Screen" */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[300px]">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              <span className="ml-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">LinkedIn Canvas</span>
            </div>
            
            {generatedImage && (
              <button 
                onClick={downloadImage}
                className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition-colors"
              >
                <Download className="w-3 h-3" />
                Download
              </button>
            )}
          </div>

          <div className="relative aspect-[1584/396] bg-zinc-950 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3"
                >
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <span className="text-xs font-medium text-zinc-400">AI is painting...</span>
                </motion.div>
              ) : generatedImage ? (
                <motion.img 
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={generatedImage} 
                  alt="Generated Banner" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center p-8">
                  <ImageIcon className="w-12 h-12 text-zinc-800 mx-auto mb-3" />
                  <p className="text-sm text-zinc-600">Your masterpiece will appear here</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Identity + Generate */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <User className="w-4 h-4" />
                Identity
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase ml-1">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={data.name}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g. Alex Rivera"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase ml-1">Headline</label>
                  <input 
                    type="text" 
                    name="title"
                    value={data.title}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g. Product Designer @ TechCo"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase ml-1">Contact (Email/Web)</label>
                  <input 
                    type="text" 
                    name="email"
                    value={data.email}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g. hello@alex.design"
                  />
                </div>
              </div>
            </div>

            {/* Generate Button Area */}
            <div className="flex flex-col items-start gap-4">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || generationCount >= 3}
                className="group relative w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-2xl shadow-2xl shadow-indigo-600/40 transition-all active:scale-[0.98] overflow-hidden"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {isGenerating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  )}
                  <span className="text-lg">
                    {generationCount >= 3 ? 'Limit Reached' : 'Generate My Banner'}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
              
              <div className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  {3 - generationCount} Generations Remaining
                </span>
              </div>
              
              {error && (
                <p className="text-red-400 text-xs font-medium bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20 w-full">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Aesthetic */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Aesthetic Suggestions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setData(prev => ({ ...prev, style: style.id }))}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    data.style === style.id 
                      ? 'bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500' 
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-bold text-xs">{style.name}</div>
                  <div className="text-[10px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{style.description}</div>
                </button>
              ))}
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
