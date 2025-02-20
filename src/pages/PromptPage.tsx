import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, RotateCcw, AlertCircle, Loader2, Link, CreditCard, Calculator } from 'lucide-react';
import ModelViewer from '../components/ModelViewer';
import { MeshyClient } from '../lib/meshy';

const COLORS = ['Gray', 'White', 'Black', 'Blue', 'Red'];
const SIZES = ['Small (10cm)', 'Medium (20cm)', 'Large (30cm)'];
const MATERIALS = ['Resin', 'PLA', 'Aluminum'];
const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia'];

export default function PromptPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [meshyClient, setMeshyClient] = useState<MeshyClient | null>(null);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [manualUrl, setManualUrl] = useState('');
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const [hasQuote, setHasQuote] = useState(false);
  const navigate = useNavigate();

  // Checkout state
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('Gray');
  const [selectedMaterial, setSelectedMaterial] = useState('Resin');
  const [shippingInfo, setShippingInfo] = useState({
    country: '',
    name: '',
    address: '',
    city: '',
    zip: ''
  });

  const configRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_MESHY_API_KEY;
    if (!apiKey) {
      setError('Meshy API key is not configured. Please check your .env file.');
      return;
    }

    try {
      const client = new MeshyClient(apiKey);
      setMeshyClient(client);
    } catch (err) {
      console.error('Failed to initialize Meshy client:', err);
      setError('Failed to initialize 3D generation service. Please check your configuration.');
    }
  }, []);

  useEffect(() => {
    if (modelUrl && configRef.current) {
      configRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [modelUrl]);

  const handleGenerate = async () => {
    if (!meshyClient) {
      setError('3D generation service is not properly initialized');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setGenerationProgress(0);
      setHasQuote(false);
      
      meshyClient.onProgress((progress) => {
        setGenerationProgress(progress);
      });
      
      const url = await meshyClient.generateModel(prompt);
      setModelUrl(url);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate model');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleManualUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUrl.trim()) {
      setModelUrl(manualUrl.trim());
      setHasQuote(false);
    }
  };

  const handleLoadLocalModel = () => {
    setModelUrl('/model.glb');
    setHasQuote(false);
  };

  const handleGetQuote = async () => {
    if (!selectedSize || !selectedColor || !selectedMaterial || !shippingInfo.country) {
      return;
    }

    setIsGettingQuote(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsGettingQuote(false);
    setHasQuote(true);
  };

  const isConfigurationComplete = selectedSize && selectedColor && selectedMaterial && shippingInfo.country;
  const isShippingComplete = Object.entries(shippingInfo).every(([key, value]) => key === 'country' || hasQuote ? value : true);
  const canProceedToPayment = isConfigurationComplete && isShippingComplete && hasQuote;

  const handlePayment = async () => {
    navigate('/success');
  };

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-8">
          {/* Manual URL Input */}
          <div className="w-full max-w-3xl mx-auto">
            <form onSubmit={handleManualUrlSubmit} className="flex space-x-2">
              <input
                type="text"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="Enter GLB URL for testing..."
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center space-x-2"
              >
                <Link className="w-4 h-4" />
                <span>Load URL</span>
              </button>
              <button
                onClick={handleLoadLocalModel}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center space-x-2"
              >
                <span>Load Local Model</span>
              </button>
            </form>
          </div>

          <div className="w-full max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to create... (e.g., 'A detailed chess piece queen')"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isGenerating}
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt || !meshyClient}
                className="absolute right-2 top-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded-md flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>
            {error && (
              <div className="mt-2 text-red-400 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Model Viewer and Configuration */}
          {modelUrl && (
            <div className="flex gap-6">
              <div className="flex-1 aspect-square bg-gray-900 rounded-lg border border-gray-800 relative">
                <ModelViewer modelUrl={modelUrl || undefined} />
                
                {/* Loading Overlay */}
                {isGenerating && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center space-y-4">
                      <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                      <div className="text-lg font-medium">Generating your model...</div>
                      {generationProgress > 0 && (
                        <div className="w-64">
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all duration-300 ease-out"
                              style={{ width: `${generationProgress}%` }}
                            />
                          </div>
                          <div className="text-sm text-gray-400 text-center mt-2">
                            {Math.round(generationProgress)}% complete
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="absolute bottom-4 right-4">
                  <button
                    onClick={() => {
                      setModelUrl(null);
                      setHasQuote(false);
                    }}
                    className="p-2 bg-gray-800 rounded-full hover:bg-gray-700"
                    disabled={!modelUrl || isGenerating}
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Configuration Panel */}
              <div ref={configRef} className="w-80 space-y-6 animate-fade-in">
                {/* Model Configuration */}
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                  <h2 className="text-lg font-bold mb-4">Model Configuration</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Size</label>
                      <div className="grid grid-cols-1 gap-2">
                        {SIZES.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`p-2 rounded-lg border text-sm ${
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
                      <div className="grid grid-cols-2 gap-2">
                        {COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`p-2 rounded-lg border text-sm ${
                              selectedColor === color
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-gray-700 hover:border-gray-600'
                            }`}
                            disabled={color !== 'Gray'}
                            title={color !== 'Gray' ? 'Not available yet' : ''}
                            style={color !== 'Gray' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Material</label>
                      <div className="grid grid-cols-1 gap-2">
                        {MATERIALS.map((material) => (
                          <button
                            key={material}
                            onClick={() => setSelectedMaterial(material)}
                            className={`p-2 rounded-lg border text-sm ${
                              selectedMaterial === material
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-gray-700 hover:border-gray-600'
                            }`}
                            disabled={material !== 'Resin'}
                            title={material !== 'Resin' ? 'Not available yet' : ''}
                            style={material !== 'Resin' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                          >
                            {material}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Initial Shipping Info (Country) */}
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                  <h2 className="text-lg font-bold mb-4">Shipping Country</h2>
                  <div className="space-y-4">
                    <select
                      value={shippingInfo.country}
                      onChange={(e) => {
                        setShippingInfo({ ...shippingInfo, country: e.target.value });
                        setHasQuote(false);
                      }}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm"
                    >
                      <option value="">Select a country</option>
                      {COUNTRIES.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>

                    <button
                      onClick={handleGetQuote}
                      disabled={!isConfigurationComplete || isGettingQuote}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isGettingQuote ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Calculating...</span>
                        </>
                      ) : (
                        <>
                          <Calculator className="w-4 h-4" />
                          <span>Get Quote</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Order Summary (shown after getting quote) */}
                {hasQuote && (
                  <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 animate-fade-in">
                    <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Size</span>
                        <span>{selectedSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Color</span>
                        <span>{selectedColor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Material</span>
                        <span>{selectedMaterial}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Shipping to</span>
                        <span>{shippingInfo.country}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-700">
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>$149.99</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Full Shipping Information (shown after quote) */}
                {hasQuote && (
                  <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 animate-fade-in">
                    <h2 className="text-lg font-bold mb-4">Shipping Details</h2>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={shippingInfo.name}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Address"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="City"
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          value={shippingInfo.zip}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm"
                        />
                      </div>

                      <button
                        onClick={handlePayment}
                        disabled={!canProceedToPayment}
                        className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Proceed to Payment</span>
                      </button>

                      {!canProceedToPayment && (
                        <p className="mt-2 text-xs text-gray-400 text-center">
                          Please complete all shipping details to proceed
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}