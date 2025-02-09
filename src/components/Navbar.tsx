import React from 'react';
import { Link } from 'react-router-dom';
import { Printer as Printer3d } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Printer3d className="h-8 w-8 text-blue-500" />
            <span className="font-bold text-xl">AI Print Lab</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Create
            </Link>
            <a
              href="#"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Gallery
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}