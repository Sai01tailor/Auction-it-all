import React from 'react';

const PILLARS = [
  {
    id: 'verified',
    icon: '🛡️',
    title: 'Verified Users',
    body: 'Every buyer and seller is KYC-verified — Aadhaar, PAN and phone confirmed before they can bid.',
  },
  {
    id: 'escrow',
    icon: '🔒',
    title: 'Secure 10% Escrow',
    body: 'The winning bid is held in escrow and only released after both parties confirm a successful handoff.',
  },
  {
    id: 'handoff',
    icon: '🤝',
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
