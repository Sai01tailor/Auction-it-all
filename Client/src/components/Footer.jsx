import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-dark text-white mt-16">
      <div className="container-main py-12">
        {/* Top Section with 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-gold-light font-bold text-2xl mb-4">BidKar</h3>
            <p className="text-body-md text-white/70">
              Premium auction platform for buying and selling items online.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-body-lg font-bold mb-4 text-white">Quick Links</h4>
            <div className="space-y-2">
              <div><Link to="/" className="text-white/70 hover:text-gold-light transition-colors font-body-md">
                Home
              </Link></div>
              <div><Link to="/browse" className="text-white/70 hover:text-gold-light transition-colors font-body-md">
                Browse Auctions
              </Link></div>
              <div><Link to="/my-bids" className="text-white/70 hover:text-gold-light transition-colors font-body-md">
                My Bids
              </Link></div>
              <div><Link to="/create-listing" className="text-white/70 hover:text-gold-light transition-colors font-body-md">
                Create Listing
              </Link></div>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-body-lg font-bold mb-4 text-white">Support</h4>
            <div className="space-y-2">
              <div><a href="#" className="text-white/70 hover:text-gold-light transition-colors font-body-md">
                Help Center
              </a></div>
              <div><a href="#" className="text-white/70 hover:text-gold-light transition-colors font-body-md">
                Contact Us
              </a></div>
              <div><a href="#" className="text-white/70 hover:text-gold-light transition-colors font-body-md">
                FAQs
              </a></div>
              <div><a href="#" className="text-white/70 hover:text-gold-light transition-colors font-body-md">
                Terms & Conditions
              </a></div>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-body-lg font-bold mb-4 text-white">Legal</h4>
            <div className="space-y-2">
              <div><a href="#" className="text-white/70 hover:text-gold-light transition-colors font-body-md">
                Privacy Policy
              </a></div>
              <div><a href="#" className="text-white/70 hover:text-gold-light transition-colors font-body-md">
                Cookie Policy
              </a></div>
              <div><a href="#" className="text-white/70 hover:text-gold-light transition-colors font-body-md">
                Disclaimer
              </a></div>
              <div><a href="#" className="text-white/70 hover:text-gold-light transition-colors font-body-md">
                Refund Policy
              </a></div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8">
          {/* Social Links */}
          <div className="flex justify-center gap-6 mb-6">
            <a href="#" className="text-white/70 hover:text-gold-light transition-colors">
              <span className="material-symbols-outlined">facebook</span>
            </a>
            <a href="#" className="text-white/70 hover:text-gold-light transition-colors">
              <span className="material-symbols-outlined">mail</span>
            </a>
            <a href="#" className="text-white/70 hover:text-gold-light transition-colors">
              <span className="material-symbols-outlined">language</span>
            </a>
            <a href="#" className="text-white/70 hover:text-gold-light transition-colors">
              <span className="material-symbols-outlined">call</span>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-body-md text-white/60">
              © {currentYear} BidKar. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
