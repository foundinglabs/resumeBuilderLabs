import React from 'react';
import { Link } from 'wouter';
import { Mail, Phone, MapPin, Github, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Founding Labs</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering professionals with cutting-edge resume building tools and ATS optimization technology.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/builder" className="text-slate-400 hover:text-white transition-colors">
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link href="/ats-analysis" className="text-slate-400 hover:text-white transition-colors">
                  ATS Checker
                </Link>
              </li>
            </ul>
          </div>

          {/* Love Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">💗 with foundinglabs</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Built with passion and dedication to help you succeed in your career journey.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-slate-400">
              © 2025 Founding Labs. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 