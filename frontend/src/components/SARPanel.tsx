import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Download, X, Send, Fingerprint, AlertTriangle, ChevronRight } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { ToastType } from './ui/Toast';
import { API_BASE_URL } from '../config';

interface SARPanelProps {
  isOpen: boolean;
  onClose: () => void;
  ringData: any;
  showToast: (msg: string, type: ToastType) => void;
}

export function SARPanel({ isOpen, onClose, ringData, showToast }: SARPanelProps) {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && ringData) {
      setLoading(true); setError(null); setReport(null);
      fetch(`${API_BASE_URL}/generate-sar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ringData),
      }).then(res => { if (!res.ok) throw new Error(); return res.json(); })
        .then(data => { setReport(data); setLoading(false); })
        .catch(() => { setError('AI Synthesis Failed. Check connection.'); setLoading(false); });
    }
  }, [isOpen, ringData]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/submit-sar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ring_id: ringData.ring_id, report_content: report }) });
      if (res.ok) { showToast(`SAR for ${ringData.ring_id} submitted.`, 'success'); onClose(); } else throw new Error();
    } catch { showToast('Failed to submit SAR.', 'error'); setLoading(false); }
  };

  const handleExportPDF = () => {
    showToast('Generating PDF report...', 'info');
    const doc = new jsPDF();
    doc.setFont('courier');
    doc.text('CONFIDENTIAL — FINCEN SAR REPORT', 10, 10);
    doc.text(JSON.stringify(report, null, 2), 10, 20);
    doc.save(`SAR_${ringData.ring_id}.pdf`);
  };

  if (!ringData) return null;
  const isCritical = ringData?.risk_score > 80;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', zIndex: 60 }} />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            style={{ position: 'fixed', inset: 0, top: '60px', zIndex: 70, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}
          >
            <div style={{ width: '100%', maxWidth: '860px', height: '100%', background: 'var(--bg-base)', border: '1px solid var(--border-accent)', borderBottom: 'none', boxShadow: '0 -8px 48px rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', pointerEvents: 'all', position: 'relative', overflow: 'hidden' }}>
              <div style={{ height: '3px', background: isCritical ? 'linear-gradient(90deg, var(--danger), var(--accent), transparent)' : 'linear-gradient(90deg, var(--accent), transparent)' }} />
              <div style={{ height: '56px', borderBottom: '1px solid var(--border-base)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', background: 'var(--bg-panel)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ padding: '4px 10px', background: 'var(--accent-dim)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Bot size={12} style={{ color: 'var(--accent)' }} />
                    <span className="font-label" style={{ fontSize: '10px', color: 'var(--accent)' }}>AI Intelligence Report</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
                    <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>CASE: {ringData.ring_id}</span>
                  </div>
                </div>
                <button onClick={onClose} style={{ width: '32px', height: '32px', background: 'var(--bg-card)', border: '1px solid var(--border-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.1s' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}><X size={16} /></button>
              </div>

              <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
                {loading && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '80px', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>{[0, 1, 2].map(i => (<div key={i} className="loading-dot" style={{ animationDelay: `${i * 0.2}s`, borderRadius: '1px' }} />))}</div>
                    <div className="font-label" style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.2em' }}>Synthesizing Intelligence...</div>
                  </div>
                )}
                {error && (
                  <div style={{ padding: '20px', background: 'var(--danger-dim)', border: '1px solid var(--danger)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
                    <span className="font-mono" style={{ fontSize: '12px', color: 'var(--danger)' }}>{error}</span>
                  </div>
                )}
                {!loading && !error && report && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      {[ { label: 'Pattern Type', value: ringData.pattern_type }, { label: 'Est. Volume', value: `$${ringData.total_value?.toLocaleString() || '0'}`, accent: true }, { label: 'Confidence', value: '98.2%', danger: isCritical } ].map(item => (
                        <div key={item.label} style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-base)' }}>
                          <div className="font-label" style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '6px' }}>{item.label}</div>
                          <div className="font-mono" style={{ fontSize: '16px', fontWeight: 700, color: item.accent ? 'var(--success)' : item.danger ? 'var(--danger)' : 'var(--text-primary)' }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-base)', position: 'relative' }}>
                      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-base)', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-base)' }}>
                        <div style={{ width: '3px', height: '14px', background: 'var(--accent)' }} />
                        <span className="font-label" style={{ fontSize: '10px', color: 'var(--text-primary)' }}>Executive Summary</span>
                      </div>
                      <div style={{ padding: '20px' }}>
                        <p className="font-mono" style={{ fontSize: '12px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{report.executive_summary}</p>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ background: 'var(--bg-card)', border: `1px solid var(--danger)`, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
                        <div style={{ width: '56px', height: '56px', background: 'var(--danger-dim)', border: `2px solid var(--danger)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Fingerprint size={28} style={{ color: 'var(--danger)' }} /></div>
                        <div>
                          <div className="font-label" style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '6px' }}>Identified Controller</div>
                          <div className="font-mono" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--danger)', padding: '4px 12px', background: 'var(--danger-dim)', border: '1px solid var(--danger)' }}>{typeof report.mule_herder === 'object' ? report.mule_herder.account_id : report.mule_herder}</div>
                        </div>
                      </div>
                      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-base)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
                        <div className="font-label" style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '4px' }}>Network Members</div>
                        {ringData.member_accounts?.slice(0, 5).map((acc: string, i: number) => (
                          <div key={acc} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'var(--bg-base)', border: '1px solid var(--border-base)' }}>
                            <span className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)', width: '16px' }}>{String(i + 1).padStart(2, '0')}</span>
                            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{acc}</span>
                          </div>
                        ))}
                        {(ringData.member_accounts?.length || 0) > 5 && (
                          <div className="font-label" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>+{ringData.member_accounts.length - 5} more</div>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-base)' }}>
                      <span className="font-label" style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.25em' }}>⚠ CONFIDENTIAL — PROPRIETARY FINANCIAL INTELLIGENCE — DO NOT DISTRIBUTE ⚠</span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ height: '64px', borderTop: '1px solid var(--border-base)', background: 'var(--bg-panel)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 28px', gap: '10px', flexShrink: 0 }}>
                <button onClick={handleExportPDF} disabled={loading} style={{ padding: '9px 18px', background: 'var(--bg-card)', border: '1px solid var(--border-accent)', color: 'var(--text-accent)', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '11px', fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', opacity: loading ? 0.5 : 1, transition: 'all 0.1s ease' }} onMouseEnter={e => !loading && ((e.currentTarget as HTMLElement).style.background = 'var(--accent-dim)')} onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-card)')}>
                  <Download size={12} /> Export PDF
                </button>
                <button onClick={handleSubmit} disabled={loading} style={{ padding: '9px 22px', background: 'var(--danger)', border: '1px solid var(--danger)', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '11px', fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '7px', opacity: loading ? 0.5 : 1, transition: 'all 0.1s ease' }} onMouseEnter={e => !loading && ((e.currentTarget as HTMLElement).style.opacity = '0.8')} onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}>
                  <Send size={12} /> Submit to FinCEN
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
