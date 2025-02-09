import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Truck, Package } from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Order Successful!</h1>
          <p className="text-gray-400">
            Thank you for your order. We'll start printing your creation right away!
          </p>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 text-left">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Order ID</span>
                <span className="font-mono">#ORD-2024-1234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tracking Number</span>
                <span className="font-mono">TRK-9876543210</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Estimated Delivery</span>
                <span>March 15, 2024</span>
              </div>
              <div className="pt-4 border-t border-gray-800">
                <div className="flex items-center space-x-2 text-blue-500">
                  <Truck className="w-5 h-5" />
                  <a href="#" className="hover:underline">Track Your Order</a>
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Create Another
          </Link>
        </div>
      </div>
    </div>
  );
}