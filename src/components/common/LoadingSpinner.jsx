import React from 'react';
import { motion } from 'framer-motion';

export function LoadingSpinner({ size = 28, text = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '32px' }}>
      <motion.div
        style={{
          width: size,
          height: size,
          border: '3px solid var(--border-strong)',
          borderTopColor: 'var(--accent-primary)',
          borderRightColor: 'var(--accent-secondary)',
          borderRadius: '50%',
        }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
      />
      {text && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>{text}</span>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-panel" style={{ padding: '24px', height: '220px', display: 'flex', flexDirection: 'column', gap: '16px', animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
      <div style={{ width: '40%', height: '20px', backgroundColor: 'var(--border-strong)', borderRadius: '6px' }} />
      <div style={{ width: '90%', height: '14px', backgroundColor: 'var(--border-subtle)', borderRadius: '4px', marginTop: '8px' }} />
      <div style={{ width: '75%', height: '14px', backgroundColor: 'var(--border-subtle)', borderRadius: '4px' }} />
      <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
        <div style={{ width: '60px', height: '24px', backgroundColor: 'var(--border-strong)', borderRadius: '999px' }} />
        <div style={{ width: '60px', height: '24px', backgroundColor: 'var(--border-strong)', borderRadius: '999px' }} />
      </div>
    </div>
  );
}
