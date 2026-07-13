import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function BidKarLogo() {
  return (
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', textDecoration: 'none', flexShrink: 0 }}>
      {/* <div style={{
        width: '34px', height: '34px',
        borderRadius: '9px',
        background: 'linear-gradient(135deg, #fece4488, #e5b630)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(254,206,68,0.4)',
      }}>
        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#002366', lineHeight: 1 }}>B</span>
      </div>
      <span style={{
        fontSize: '1.35rem',
        fontWeight: 800,
        color: 'var(--color-brand-primary)',
        letterSpacing: '-0.04em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}>
        BidKar<span style={{ color: '#fece4488' }}>.in</span> */}
      {/* </span> */}
      <img src='src/assets/LongLogo.png' alt="logo" style={{ width: '100px', height: 'auto', filter: 'drop-shadow(1px 0px 0px #fece4488) drop-shadow(-1px 0px 0px #fece4488) drop-shadow(0px 1px 0px #fece4488) drop-shadow(0px -1px 0px #fece4488)' }} />
    </Link>
  );
}
/* ── animation helpers ── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: 'easeOut' },
  }),
}

const linkHover = {
  rest: { x: 0, color: '#9ca3af' },
  hover: { x: 5, color: '#fece44' },
}

/* ── sub-components ── */
const FooterLinkGroup = ({ title, links, colIndex }) => (
  <motion.div
    custom={colIndex}
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
  >
    <h3 style={{
      color: '#ffffff',
      fontSize: '0.8125rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: '1rem',
      position: 'relative',
      paddingBottom: '0.625rem',
    }}>
      {title}
      <span style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '28px',
        height: '2px',
        background: '#fece4488',
        borderRadius: '2px',
      }} />
    </h3>
    {links.map(({ label, to }) => (
      <motion.div key={label} initial="rest" whileHover="hover" animate="rest">
        <motion.div variants={linkHover} style={{ display: 'inline-block' }}>
          <Link
            to={to}
            style={{
              fontSize: '0.9rem',
              fontWeight: 400,
              textDecoration: 'none',
              transition: 'none',
              color: 'inherit',
            }}
          >
            {label}
          </Link>
        </motion.div>
      </motion.div>
    ))}
  </motion.div>
)

/* ── main component ── */
const Footer = () => {
  const year = new Date().getFullYear()

  const marketplace = [
    { label: 'Live Auction', to: '/auctions' },
    { label: 'Ending Soon', to: '/auctions?sort=ending' },
    { label: 'Category Sitemap', to: '/sitemap' },
    { label: 'Featured Sellers', to: '/auctions' },
  ]
  const helpTrust = [
    { label: 'How it Works?', to: '/how-it-works' },
    { label: 'Safety Handoff Guide', to: '/how-it-works' },
    { label: 'Dispute Center', to: '/disputes' },
    { label: 'FAQs', to: '/how-it-works' },
  ]
  const contact = [
    { label: 'Support Email', to: '/contact/email' },
    { label: 'Emergency HelpLine', to: '/contact/helpline' },
    { label: 'Grievance Officer', to: '/contact/grievance' },
    { label: 'Office Address', to: '/contact/address' },
  ]

  const legalLinks = [
    { label: 'Terms of Service', to: '/legal/terms' },
    { label: 'Privacy Policy', to: '/legal/privacy' },
    { label: 'IT Act Compliance', to: '/legal/it-act' },
    { label: 'TDS / Tax Info', to: '/legal/tax-info' },
  ]

  return (
    <footer style={{
      background: 'linear-gradient(160deg, #001a52 0%, #002366 60%, #001840 100%)',
      color: '#9ca3af',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>

      {/* ── top accent line ── */}
      <div style={{
        height: '3px',
        background: 'linear-gradient(90deg, #fece4488 0%, #e5b630 50%, #fece4488 100%)',
      }} />

      {/* ── main grid ── */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '3.5rem 1.5rem 2.5rem',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '2.5rem',
        }}>

          {/* brand column */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            style={{ gridColumn: 'span 1' }}
          >
            {/* <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #fece4488, #e5b630)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#002366' }}>B</span>
              </div>
              <span style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.03em',
              }}>
                BidKar<span style={{ color: '#fece4488' }}>.in</span>
              </span>
            </div> */}
            <BidKarLogo />

            <p style={{
              fontSize: '0.875rem',
              lineHeight: 1.7,
              color: '#6b7280',
              marginBottom: '1.25rem',
            }}>
              India's trusted live-auction marketplace — bid confidently, win brilliantly.
            </p>

            {/* social icons (SVG inline) */}
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              {[
                { label: 'Twitter/X', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
                { label: 'Instagram', path: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5a1 1 0 1 0-1-1 1 1 0 0 0 1 1zM20.07 4.93A10 10 0 0 0 4 15a10 10 0 1 0 16.07-10.07z' },
                { label: 'LinkedIn', path: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4z' },
              ].map(({ label, path }) => (
                <motion.a
                  key={label}
                  href="#"
                  aria-label={label}
                  whileHover={{ scale: 1.15, backgroundColor: '#fece4488' }}
                  transition={{ duration: 0.2 }}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                    textDecoration: 'none',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={path} />
                  </svg>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* link columns */}
          <FooterLinkGroup title="Market Place" links={marketplace} colIndex={1} />
          <FooterLinkGroup title="Help &amp; Trust" links={helpTrust} colIndex={2} />
          <FooterLinkGroup title="Contact" links={contact} colIndex={3} />
        </div>

        {/* ── divider ── */}
        <div style={{
          height: '1px',
          background: 'rgba(255,255,255,0.08)',
          margin: '2.5rem 0 1.75rem',
        }} />

        {/* ── payment + bottom bar ── */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>
          {/* payment badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35, duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}
          >
            <span style={{ fontSize: '0.75rem', color: '#6b7280', marginRight: '0.25rem' }}>
              Accepted:
            </span>
            {['UPI', 'Net Banking', 'Visa', 'Mastercard', 'Wallet'].map((method) => (
              <span
                key={method}
                style={{
                  padding: '0.25rem 0.625rem',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#d1d5db',
                }}
              >
                {method}
              </span>
            ))}
          </motion.div>

          {/* legal links */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 1.25rem', alignItems: 'center' }}
          >
            {legalLinks.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                style={{
                  fontSize: '0.78rem',
                  color: '#6b7280',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  fontWeight: 400,
                }}
                onMouseEnter={e => (e.target.style.color = '#fece4488')}
                onMouseLeave={e => (e.target.style.color = '#6b7280')}
              >
                {label}
              </Link>
            ))}
          </motion.div>
        </div>

        {/* ── copyright ── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            marginBottom: 0,
            fontSize: '0.8rem',
            color: '#4b5563',
          }}
        >
          © {year}{' '}
          <span style={{ color: '#fece4488', fontWeight: 600 }}>BidKar.in</span>
          . All rights reserved. Regulated under applicable Indian e-commerce &amp; IT laws.
        </motion.p>
      </div>
    </footer>
  )
}

export default Footer