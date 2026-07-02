import React from 'react';

const PILLARS = [
  {
    id: 'verified',
    icon: <svg 
  xmlns="http://www.w3.org/2000/svg" 
  width="32" 
  height="32" 
  viewBox="0 0 24 24" 
  fill="none" 
  stroke="#FBBF24" 
  strokeWidth="2" 
  strokeLinecap="round" 
  strokeLinejoin="round"
>
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  <path d="m9 12 2 2 4-4" />
</svg>,
    title: 'Verified Users',
    body: 'Every buyer and seller is KYC-verified — Aadhaar, PAN and phone confirmed before they can bid.',
  },
  {
    id: 'escrow',
    icon: <svg 
  xmlns="http://www.w3.org/2000/svg" 
  width="32" 
  height="32" 
  viewBox="0 0 24 24" 
  fill="none" 
  stroke="#FBBF24" 
  strokeWidth="2" 
  strokeLinecap="round" 
  strokeLinejoin="round"
>
  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  <path d="M12 15v2" />
</svg>,
    title: 'Secure 10% Escrow',
    body: 'The winning bid is held in escrow and only released after both parties confirm a successful handoff.',
  },
  {
    id: 'handoff',
    icon: <svg 
  xmlns="http://www.w3.org/2000/svg" 
  width="32" 
  height="32" 
  viewBox="0 0 24 24" 
  fill="none" 
  stroke="#FBBF24" 
  strokeWidth="2" 
  strokeLinecap="round" 
  strokeLinejoin="round"
>
  {/* Left Hand / Arm */}
  <path d="M14.5 14.5l-3.5-3.5a2.5 2.5 0 0 0-3.5 0l-3 3a2.5 2.5 0 0 0 0 3.5l1.5 1.5a2.5 2.5 0 0 0 3.5 0l2.5-2.5" />
  
  {/* Right Hand / Arm */}
  <path d="M9.5 9.5l3.5 3.5a2.5 2.5 0 0 0 3.5 0l3-3a2.5 2.5 0 0 0 0-3.5l-1.5-1.5a2.5 2.5 0 0 0-3.5 0l-2.5 2.5" />
  
  {/* Overlapping Fingers */}
  <path d="M12 12l-1.5 1.5" />
  <path d="M14 10l-1.5 1.5" />
</svg>,
    title: 'Offline Handoff Safety',
    body: 'We provide structured handoff guidelines and verified agent contacts so every exchange is safe.',
  },
];

export default function TrustBar() {
  return (
    <section
      className="py-12"
      style={{ background: 'var(--color-brand-primary)' }}
    >
      <div className="max-w-screen-xl mx-auto px-4 lg:px-8">

        <div className="mb-8 text-center">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[var(--color-brand-accent)] mb-1 m-0">
            Why Trust Us
          </p>
          <h2 className="text-white text-xl font-bold m-0">
            Built on trust, backed by technology
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {PILLARS.map(p => (
            <div
              key={p.id}
              id={`trust-${p.id}`}
              className="flex flex-col gap-3 p-6 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span className="text-3xl">{p.icon}</span>
              <h3 className="text-white text-base font-bold m-0">{p.title}</h3>
              <p className="text-[0.82rem] m-0 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {p.body}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
