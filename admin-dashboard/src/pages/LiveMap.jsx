import React from 'react';

const LiveMap = () => {
  return (
    <div className="h-full p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Live Emergency Map</h1>
        <p className="text-gray-600 mt-2">Real-time tracking of all emergency requests and providers</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 h-[calc(100vh-180px)]">
        <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-6xl mb-4">🗺️</p>
            <p className="text-xl font-semibold text-gray-700">Interactive Map</p>
            <p className="text-gray-500 mt-2">
              Integrate with React-Leaflet or Google Maps
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
