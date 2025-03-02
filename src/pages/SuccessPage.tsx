import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Truck } from 'lucide-react';

const SuccessPage: React.FC = () => {
  const location = useLocation();
  const { orderId, trackingNumber, estimatedDelivery, color, material, shippingCountry, totalCost } = location.state || {};

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
                <span className="font-mono">{orderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tracking Number</span>
                <span className="font-mono">{trackingNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Estimated Delivery</span>
                <span>{estimatedDelivery} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Color</span>
                <span>{color}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Material</span>
                <span>{material}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Shipping to</span>
                <span>{shippingCountry}</span>
              </div>
              <div className="pt-4 border-t border-gray-800">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{totalCost?.toFixed(2)} EUR</span>
                </div>
              </div>
            </div>
          </div>

          {/* Track Order Button */}
          <Link
            to={`/track/${trackingNumber}`} // Assuming you have a tracking page set up
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg m-3"
          >
            Track Your Order
          </Link>

          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg m-3"
          >
            Create Another
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;