import { memo } from 'react';
import { DollarSign, Bot, ChevronRight } from 'lucide-react';

interface ThreatCardProps {
  ring: any;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onGenerateSAR: (ring: any) => void;
}

export const ThreatCard = memo(({ ring, isSelected, onSelect, onGenerateSAR }: ThreatCardProps) => {
  const isCritical = ring.risk_score > 80;
  const isHigh = ring.risk_score > 50 && ring.risk_score <= 80;
  
  const riskLabel = isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : 'MEDIUM';
  const riskColor = isCritical ? 'var(--danger)' : isHigh ? 'var(--warning)' : 'var(--accent)';
  
  // Light tint for the box background based on risk
  const bgTint = isCritical ? 'rgba(220, 38, 38, 0.08)' : isHigh ? 'rgba(245, 158, 11, 0.08)' : 'rgba(0, 168, 107, 0.08)';
  // const aiButtonBg = isCritical ? 'var(--danger-dim)' : isHigh ? 'var(--warning-dim)' : 'var(--accent-dim)';

  return (
    <div style={{ marginBottom: '10px', position: 'relative', cursor: 'pointer' }}>
      <div
        onClick={() => onSelect(ring.ring_id)}
        style={{
          position: 'relative', zIndex: 1,
          background: isSelected ? 'var(--bg-card-hover)' : bgTint, // Uses the tint
          border: `1px solid ${isSelected ? riskColor : 'var(--border-base)'}`,
          padding: '14px', transition: 'all 0.15s ease', backdropFilter: 'blur(4px)',
        }}
        onMouseEnter={e => !isSelected && ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)')}
        onMouseLeave={e => !isSelected && ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border-base)')}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isCritical && <div className="alert-pulse" style={{ width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%', flexShrink: 0 }} />}
            <span className="font-mono" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>{ring.ring_id}</span>
          </div>
          <span className={`badge ${isCritical ? 'badge-critical' : isHigh ? 'badge-high' : 'badge-ok'}`}>{riskLabel}</span>
        </div>

        <div className="font-label" style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Pattern: <span style={{ color: 'var(--text-secondary)' }}>{ring.pattern_type}</span>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span className="font-label" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Risk Score</span>
            <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700, color: riskColor }}>{ring.risk_score}</span>
          </div>
          <div className="risk-bar-track">
            <div className="risk-bar-fill" style={{ width: `${ring.risk_score}%`, background: riskColor, color: riskColor }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <div style={{ flex: 1, padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-base)' }}>
            <div className="font-label" style={{ fontSize: '8px', color: 'var(--text-muted)', marginBottom: '2px' }}>Volume</div>
            <div className="font-mono" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <DollarSign size={10} />
              {ring.total_value?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
            </div>
          </div>
          <div style={{ flex: 1, padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-base)' }}>
            <div className="font-label" style={{ fontSize: '8px', color: 'var(--text-muted)', marginBottom: '2px' }}>Members</div>
            <div className="font-mono" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{ring.member_accounts?.length || 0}</div>
          </div>
        </div>

        {/* SWAPPED & HIGHLIGHTED ACTIONS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-base)', paddingTop: '10px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ChevronRight size={12} style={{ color: isSelected ? riskColor : 'var(--text-muted)', transition: 'color 0.2s' }} />
            <span className="font-label" style={{ fontSize: '9px', color: isSelected ? riskColor : 'var(--text-muted)' }}>{isSelected ? 'FOCUSED' : 'SELECT'}</span>
          </div>

          {/* UPDATED AI ANALYSIS BUTTON - BRIGHTER PURPLE */}
          <button
            onClick={e => { e.stopPropagation(); onGenerateSAR(ring); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', 
              padding: '6px 14px',
              background: '#3A1F5D', /* Brighter, saturated deep purple */
              border: '1px solid #563387', /* Lighter purple border */
              borderRadius: '6px', 
              color: '#E9D5FF', /* Very bright lilac text */
              boxShadow: '0 0 12px rgba(86, 51, 135, 0.25)', /* Subtle purple glow */
              cursor: 'pointer', fontSize: '11px', 
              fontFamily: 'Inter, sans-serif', fontWeight: 800, 
              letterSpacing: '0.08em', textTransform: 'uppercase', 
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#4C297A'; /* Even brighter on hover */
              (e.currentTarget as HTMLElement).style.borderColor = '#6A42A3';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(106, 66, 163, 0.4)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = '#3A1F5D';
              (e.currentTarget as HTMLElement).style.borderColor = '#563387';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(86, 51, 135, 0.25)';
            }}
          >
            <Bot size={14} strokeWidth={2.5} /> AI ANALYSIS
          </button>
          
        </div>
      </div>
    </div>
  );
}, (prev, next) => (prev.isSelected === next.isSelected && prev.ring.ring_id === next.ring.ring_id && prev.ring.risk_score === next.ring.risk_score));