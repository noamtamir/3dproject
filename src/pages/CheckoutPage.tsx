import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Truck, CreditCard } from 'lucide-react';

const COLORS = ['White', 'Black', 'Gray', 'Blue', 'Red'];
const SIZES = ['Small (10cm)', 'Medium (20cm)', 'Large (30cm)'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    city: '',
    country: '',
    zip: ''
  });

  const handlePayment = async () => {
    // TODO: Integrate with Stripe
    navigate('/success');
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600' : 'bg-gray-700'}`}>
              1
            </div>
            <div className={`w-24 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-700'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600' : 'bg-gray-700'}`}>
              2
            </div>
            <div className={`w-24 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-700'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600' : 'bg-gray-700'}`}>
              3
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Choose Size & Color</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Size</label>
                <div className="grid grid-cols-3 gap-4">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`p-4 rounded-lg border ${
                        selectedSize === size
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="grid grid-cols-5 gap-4">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`p-4 rounded-lg border ${
                        selectedColor === color
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!selectedSize || !selectedColor}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Shipping Information</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={shippingInfo.name}
                onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg"
              />
              <input
                type="text"
                placeholder="Address"
                value={shippingInfo.address}
                onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  value={shippingInfo.city}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="ZIP Code"
                  value={shippingInfo.zip}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg"
                />
              </div>
              <input
                type="text"
                placeholder="Country"
                value={shippingInfo.country}
                onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg"
              />
            </div>
            <button
              onClick={() => setStep(3)}
              disabled={!Object.values(shippingInfo).every(Boolean)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Get Quote
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Order Summary</h2>
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Size</span>
                  <span>{selectedSize}</span>
                </div>
                <div className="flex justify-between">
                  <span>Color</span>
                  <span>{selectedColor}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Express (2-3 days)</span>
                </div>
                <div className="pt-4 border-t border-gray-800">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>$149.99</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handlePayment}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-5 h-5" />
              <span>Proceed to Payment</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}