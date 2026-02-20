import { X, Flag, CheckCircle, Wallet, Shield, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastType } from '../ui/Toast';
import { API_BASE_URL } from '../../config';

interface SidebarRightProps {
  node: any | null;
  onClose: () => void;
  showToast: (msg: string, type: ToastType) => void;
}

export function SidebarRight({ node, onClose, showToast }: SidebarRightProps) {
  const handleAction = async (action: 'false_positive' | 'escalated') => {
    if (!node) return;
    try {
      const res = await fetch(`${API_BASE_URL}/flag-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: node.id,
          status: action,
          notes: action === 'false_positive' ? 'User marked as false positive' : 'User escalated to Tier 2',
        }),
      });
      if (res.ok) {
        showToast(action === 'false_positive' ? `Account ${node.id} cleared.` : `Account ${node.id} escalated to INTEL.`, 'success');
        onClose();
      } else throw new Error();
    } catch {
      showToast('Network error: Could not update status.', 'error');
    }
  };

  const totalFlow = (node?.inflow || 0) + (node?.outflow || 0);
  const inPct = totalFlow > 0 ? ((node?.inflow || 0) / totalFlow) * 100 : 50;
  const outPct = totalFlow > 0 ? ((node?.outflow || 0) / totalFlow) * 100 : 50;
  const isCritical = node?.suspicion_score > 80;
  const isWarning = node?.suspicion_score > 50 && node?.suspicion_score <= 80;
  
  const themeColor = isCritical ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--accent)';
  const themeDim = isCritical ? 'var(--danger-dim)' : isWarning ? 'var(--warning-dim)' : 'var(--accent-dim)';

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ x: 380, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 380, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: '380px', display: 'flex',
            flexDirection: 'column', background: 'var(--bg-panel)', borderLeft: `2px solid ${themeColor}`, zIndex: 30,
          }}
        >
          <div style={{ height: '3px', background: `linear-gradient(90deg, ${themeColor}, transparent)` }} />
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid var(--border-base)', background: 'var(--bg-base)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div className="font-label" style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '4px' }}>Target Entity</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', background: themeDim, border: `1px solid ${themeColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={14} style={{ color: themeColor }} />
                </div>
                <div className="font-mono" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>{node.id}</div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ width: '30px', height: '30px', background: 'var(--bg-card)', border: '1px solid var(--border-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.1s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
            >
              <X size={16} />
            </button>
          </div>

          <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-base)', padding: '16px', marginBottom: '16px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                <div className="font-label" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Risk Score</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                  <span className={`font-mono ${isCritical ? 'glow-danger' : 'glow-accent'}`} style={{ fontSize: '36px', fontWeight: 700, lineHeight: 1, color: themeColor }}>{node.suspicion_score}</span>
                  <span className="font-mono" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/100</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '2px', height: '6px' }}>
                {Array.from({ length: 20 }).map((_, i) => {
                  const filled = (i + 1) * 5 <= node.suspicion_score;
                  return <div key={i} style={{ flex: 1, height: '100%', background: filled ? themeColor : 'var(--border-base)', opacity: filled ? 1 : 0.4 }} />;
                })}
              </div>
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                <span className={`badge ${isCritical ? 'badge-critical' : isWarning ? 'badge-high' : 'badge-ok'}`}>
                  {isCritical ? 'CRITICAL THREAT' : isWarning ? 'HIGH RISK' : 'NEUTRAL'}
                </span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-base)', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                <Wallet size={12} style={{ color: 'var(--text-muted)' }} />
                <span className="font-label" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Cash Flow Analysis</span>
              </div>
              <div style={{ display: 'flex', height: '32px', border: '1px solid var(--border-base)', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ width: `${inPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--success-dim), rgba(0,168,107,0.2))', borderRight: '2px solid var(--success)', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                  <span className="font-mono" style={{ fontSize: '9px', color: 'var(--success)', fontWeight: 700 }}>{inPct > 15 ? 'IN' : ''}</span>
                </div>
                <div style={{ width: `${outPct}%`, height: '100%', background: 'linear-gradient(90deg, rgba(220,38,38,0.15), var(--danger-dim))', borderLeft: '2px solid var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 8px' }}>
                  <span className="font-mono" style={{ fontSize: '9px', color: 'var(--danger)', fontWeight: 700 }}>{outPct > 15 ? 'OUT' : ''}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                {[ { label: 'Inflow', value: node.inflow, color: 'var(--success)', icon: <ChevronUp size={11} /> }, { label: 'Outflow', value: node.outflow, color: 'var(--danger)', icon: <ChevronDown size={11} /> } ].map(item => (
                  <div key={item.label} style={{ padding: '10px', background: 'var(--bg-base)', border: `1px solid ${item.color}`, borderTopWidth: '3px' }}>
                    <div className="font-label" style={{ fontSize: '8px', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ color: item.color }}>{item.icon}</span> {item.label}</div>
                    <div className="font-mono" style={{ fontSize: '13px', fontWeight: 700, color: item.color }}>${item.value?.toLocaleString() || '0'}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--bg-base)', border: '1px solid var(--border-base)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-label" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Net Position</span>
                <span className="font-mono" style={{ fontSize: '13px', fontWeight: 700, color: (node.inflow - node.outflow) >= 0 ? 'var(--text-primary)' : 'var(--danger)' }}>
                  ${Math.abs(node.inflow - node.outflow)?.toLocaleString() || '0'}
                  {(node.inflow - node.outflow) < 0 && <span style={{ fontSize: '9px', marginLeft: '3px', opacity: 0.7 }}>deficit</span>}
                </span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-base)', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <Flag size={12} style={{ color: 'var(--text-muted)' }} />
                <span className="font-label" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Behavioral Flags</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {node.patterns?.length > 0 ? node.patterns.map((p: string) => (
                  <span key={p} className="badge badge-critical border-white/10">{p.replace(/_/g, ' ')}</span>
                )) : <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>No heuristics triggered.</span>}
              </div>
            </div>
          </div>

          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-base)', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => handleAction('false_positive')} style={{ width: '100%', padding: '11px', background: 'var(--bg-card)', border: '1px solid var(--success)', color: 'var(--success)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', fontSize: '11px', fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', transition: 'all 0.1s ease' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--success-dim)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'}>
              <CheckCircle size={13} /> Clear as Safe
            </button>
            <button onClick={() => handleAction('escalated')} style={{ width: '100%', padding: '11px', background: 'var(--danger)', border: '1px solid var(--danger)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', fontSize: '11px', fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', transition: 'all 0.1s ease' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.8'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
              <ExternalLink size={13} /> Escalate to INTEL
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}