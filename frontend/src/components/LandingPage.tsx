import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { ArrowDown, Shield, Database, Activity, FileText, Upload, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface LandingPageProps {
  onAnalysisComplete: (data: any) => void;
}

export function LandingPage({ onAnalysisComplete }: LandingPageProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;
    const W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(W, H);
    mountRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    camera.position.z = 120;

    // Inside LandingPage.tsx
    
    // ... 
    const N = 300;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

      const rand = Math.random();
      // MADE THESE COLORS BRIGHTER (Values pushed up to 1.0)
      if (rand > 0.95) { colors[i*3]=1.0; colors[i*3+1]=0.2; colors[i*3+2]=0.2; } // Bright Red
      else if (rand > 0.8) { colors[i*3]=1.0; colors[i*3+1]=0.8; colors[i*3+2]=0.1; } // Bright Yellow/Amber
      else { colors[i*3]=0.1; colors[i*3+1]=1.0; colors[i*3+2]=0.6; } // Bright Emerald
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Increased opacity to 1.0 and size to 2.2 to make stars glow brighter
    const material = new THREE.PointsMaterial({ size: 2.2, vertexColors: true, transparent: true, opacity: 1.0 });
    // ...

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const lineMat = new THREE.LineBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.2 });
    const lineGeo = new THREE.BufferGeometry();
    const linePos = [];
    for(let i=0; i<N; i++) {
      for(let j=i+1; j<N; j++) {
        const dist = Math.sqrt(Math.pow(positions[i*3]-positions[j*3], 2) + Math.pow(positions[i*3+1]-positions[j*3+1], 2) + Math.pow(positions[i*3+2]-positions[j*3+2], 2));
        if(dist < 20) { linePos.push(positions[i*3], positions[i*3+1], positions[i*3+2]); linePos.push(positions[j*3], positions[j*3+1], positions[j*3+2]); }
      }
    }
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    const animate = () => {
      requestAnimationFrame(animate);
      points.rotation.y += 0.0005; lines.rotation.y += 0.0005;
      points.rotation.x += 0.0002; lines.rotation.x += 0.0002;
      renderer.render(scene, camera);
    };
    animate();
    return () => { mountRef.current?.removeChild(renderer.domElement); };
  }, []);

  const scrollToUpload = () => { uploadRef.current?.scrollIntoView({ behavior: 'smooth' }); };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true); setError(null);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch(`${API_BASE_URL}/analyze`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Analysis failed');
      const result = await res.json();
      onAnalysisComplete(result);
    } catch (err: any) {
      setError(err.message || 'System error detected during ingestion.');
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-[#080808] min-h-screen text-white overflow-y-auto font-sans relative">
      <div ref={mountRef} className="fixed inset-0 z-0 pointer-events-none opacity-60" />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-transparent via-[#080808]/80 to-[#080808] pointer-events-none" />

      <div className="relative z-10">
        <nav className="flex justify-between items-center p-8 border-b border-white/5 bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-[#00A86B]" />
            <span className="font-bold text-lg tracking-widest uppercase">Mule<span className="text-[#00A86B]">Defense</span></span>
          </div>
          <div className="flex items-center gap-2 border border-white/10 px-3 py-1 rounded-full bg-white/5">
            <div className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse" />
            <span className="text-xs font-mono text-gray-400">FIU Engine Online</span>
          </div>
        </nav>

        <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 text-white">
              Financial Crime Detection <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A86B] to-[#047857]">at Graph Scale</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-10 leading-relaxed">
              Institutional-grade forensic intelligence. Ingest transaction datasets, map illicit money muling networks, and automatically generate FinCEN SAR reports.
            </p>
            <button onClick={scrollToUpload} className="px-8 py-4 bg-[#00A86B] hover:bg-[#047857] text-black font-bold uppercase tracking-widest text-sm transition-all flex items-center gap-3 mx-auto shadow-[0_0_30px_rgba(0,168,107,0.3)]">
              Initialize Scan <ArrowDown size={16} />
            </button>
          </motion.div>

          {/* Changed <100ms to <30 sec */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-y border-white/5 py-8 w-full max-w-5xl bg-black/40 backdrop-blur-sm">
            {[ { val: '<30 sec', label: 'Processing Latency' }, { val: '3-Tier', label: 'Risk Scoring' }, { val: 'Auto', label: 'SAR Generation' }, { val: 'O(V+E)', label: 'Graph Complexity' } ].map((s, i) => (
              <div key={i} className="text-center border-r border-white/5 last:border-0">
                <div className="text-2xl font-mono text-white mb-1">{s.val}</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto py-24 px-4">
          <h2 className="text-center text-2xl font-bold uppercase tracking-widest mb-16 text-gray-300">Intelligence Pipeline</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[ { icon: <Database/>, title: 'Data Ingestion', desc: 'Securely parse high-volume transaction CSV logs.' }, { icon: <Activity/>, title: 'Heuristic Graphing', desc: 'Map hidden multi-hop relationships and layered fund flows.' }, { icon: <FileText/>, title: 'Automated SAR', desc: 'Compile evidence into FinCEN-ready Suspicious Activity Reports.' } ].map((step, i) => (
              <div key={i} className="glass-panel p-8 border border-white/10 hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 rounded border border-[#00A86B]/30 bg-[#00A86B]/10 flex items-center justify-center text-[#00A86B] mb-6">{step.icon}</div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div ref={uploadRef} className="max-w-3xl mx-auto py-32 px-4">
          <div className="glass-panel p-10 relative overflow-hidden border border-white/10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00A86B] to-transparent opacity-50" />
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Upload Ledger</h2>
              <p className="text-gray-400 text-sm">Target formats: .csv containing [source, target, amount, timestamp]</p>
            </div>
            <label className={`block cursor-pointer transition-all border-2 border-dashed p-16 text-center ${file ? 'border-[#00A86B]/50 bg-[#00A86B]/5' : dragOver ? 'border-white/40 bg-white/5' : 'border-white/10 bg-black/50 hover:border-white/20'}`} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f && f.name.endsWith('.csv')) setFile(f); }}>
              <input type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
              {file ? (
                <div className="flex flex-col items-center">
                  <FileText size={48} className="text-[#00A86B] mb-4" />
                  <span className="text-lg font-mono font-bold">{file.name}</span>
                  <span className="text-sm text-gray-500 mt-2">{(file.size / 1024).toFixed(1)} KB Ready for Scan</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <Upload size={48} className="mb-4 opacity-50" />
                  <span className="text-lg font-bold">Drag & Drop Dataset</span>
                  <span className="text-sm mt-2">or click to browse local files</span>
                </div>
              )}
            </label>
            {error && <div className="mt-6 p-4 border border-[#DC2626]/30 bg-[#DC2626]/10 flex items-center gap-3 text-[#DC2626]"><AlertTriangle size={18} /><span className="font-mono text-sm">{error}</span></div>}
            <button onClick={handleAnalyze} disabled={!file || loading} className={`w-full mt-8 py-4 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all ${!file || loading ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10' : 'bg-[#00A86B] text-black hover:bg-[#047857]'}`}>
              {loading ? <span className="animate-pulse">Synthesizing Network Data...</span> : 'Execute Analysis'}
            </button>
          </div>
        </div>

        <footer className="border-t border-white/5 py-8 text-center text-xs font-mono text-gray-600">
          <p>MULEDEFENSE FIU ENGINE v2.0 // Hackathon Prototype // Confidential</p>
        </footer>
      </div>
    </div>
  );
}
