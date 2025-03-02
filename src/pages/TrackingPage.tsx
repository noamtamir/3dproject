import React from 'react';
import { useParams } from 'react-router-dom';

const TrackingPage: React.FC = () => {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();

  // Mock data for tracking information
  const trackingData = {
    trackingNumber: trackingNumber,
    status: 'In Transit',
    estimatedDelivery: 'March 15, 2024',
    location: 'Distribution Center, City Name',
    updates: [
      { date: 'March 1, 2024', message: 'Package shipped from origin.' },
      { date: 'March 3, 2024', message: 'Arrived at distribution center.' },
      { date: 'March 5, 2024', message: 'Out for delivery.' },
      { date: 'March 10, 2024', message: 'Package delivered.' },
    ],
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Tracking Information</h1>
        <p className="text-gray-400 mb-2">Tracking Number: {trackingData.trackingNumber}</p>
        <p className="text-gray-400 mb-2">Status: {trackingData.status}</p>
        <p className="text-gray-400 mb-2">Estimated Delivery: {trackingData.estimatedDelivery}</p>
        <p className="text-gray-400 mb-4">Current Location: {trackingData.location}</p>

        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 text-left">
          <h2 className="text-lg font-bold mb-4">Tracking Updates</h2>
          <ul className="space-y-2">
            {trackingData.updates.map((update, index) => (
              <li key={index} className="flex justify-between">
                <span className="text-gray-400">{update.date}</span>
                <span>{update.message}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage; 