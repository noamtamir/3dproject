import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, RotateCcw, AlertCircle, Loader2, Link, CreditCard, Calculator } from 'lucide-react';
import ModelViewer from '../components/ModelViewer';
import { MeshyClient } from '../lib/meshy';
import CraftcloudClient from '../lib/craftcloud';
import { Quote, Shipping } from '../lib/craftcloud-types';

const COLORS = ['Gray', 'White', 'Black', 'Blue', 'Red'];
const MATERIALS = ['Resin', 'PLA', 'Aluminum'];

interface Option {
  quote: Quote;
  shipping: Shipping;
  totalCost: number;
  totalTime: number;
}

interface Country {
  code: string;
  name: string;
}

export default function PromptPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelUrls, setModelUrls] = useState<{ glbUrl: string; objUrl: string } | null>(null);
  const [meshyClient, setMeshyClient] = useState<MeshyClient | null>(null);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [manualUrl, setManualUrl] = useState('');
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const [hasQuote, setHasQuote] = useState(false);
  const [cheapestOption, setCheapestOption] = useState<Option | null>(null);
  const [fastestOption, setFastestOption] = useState<Option | null>(null);
  const [selectedOption, setSelectedOption] = useState<'cheapest' | 'fastest' | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const navigate = useNavigate();

  // Checkout state
  const [selectedColor, setSelectedColor] = useState('Gray');
  const [selectedMaterial, setSelectedMaterial] = useState('Resin');
  const [shippingInfo, setShippingInfo] = useState({
    country: '',
    name: '',
    address: '',
    city: '',
    zip: ''
  });

  // Add new state for scale
  const [scale, setScale] = useState(1);

  // Add state to track if manual input is active
  const [isManualScaleInput, setIsManualScaleInput] = useState(false);

  // Add new state for currency
  const [selectedCurrency, setSelectedCurrency] = useState<'EUR' | 'USD'>('EUR');

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
    if (modelUrls && configRef.current) {
      configRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [modelUrls]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const craftcloudClient = new CraftcloudClient();
        const countryList = await craftcloudClient.getCountries();
        setCountries(countryList);
      } catch (err) {
        console.error('Failed to fetch countries:', err);
        setError('Failed to fetch countries. Please try again later.');
      }
    };

    fetchCountries();
  }, []);

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
      
      const urls = await meshyClient.generateModel(prompt);
      setModelUrls(urls);
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
      setModelUrls({ glbUrl: manualUrl.trim(), objUrl: manualUrl.trim() });
      setHasQuote(false);
    }
  };

  const handleLoadLocalModel = () => {
    setModelUrls({ glbUrl: '/model.glb', objUrl: '/model.obj' });
    setHasQuote(false);
  };

  const handleGetQuote = async () => {
    if (!selectedColor || !selectedMaterial || !shippingInfo.country) {
      return;
    }

    setIsGettingQuote(true);
    setError(null);

    try {
      const craftcloudClient = new CraftcloudClient();
      const selectedCountry = countries.find(country => country.name === shippingInfo.country);
      
      if (!selectedCountry) {
        throw new Error('Selected country not found');
      }

      const { cheapestOption, fastestOption } = await craftcloudClient.getQuote({
        modelUrl: modelUrls!.objUrl,
        countryCode: selectedCountry.code,
        scale: scale,
        currency: selectedCurrency
      });

      setCheapestOption(cheapestOption);
      setFastestOption(fastestOption);
      setHasQuote(true);

    } catch (err) {
      console.error('Quote error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get quote');
    } finally {
      setIsGettingQuote(false);
    }
  };

  const isConfigurationComplete = selectedColor && selectedMaterial && shippingInfo.country;
  const canProceedToPayment = isConfigurationComplete && hasQuote && selectedOption;

  const handlePayment = async () => {
    try {
      const craftcloudClient = new CraftcloudClient();
      const selectedQuoteOption = selectedOption === 'cheapest' ? cheapestOption : fastestOption;

      if (!selectedQuoteOption) {
        throw new Error('No quote option selected');
      }

      const cartUrl = await craftcloudClient.createCartAndOffer(
        selectedQuoteOption,
        selectedCurrency
      );

      // Open in new tab
      window.open(cartUrl, '_blank');
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Failed to proceed to payment');
    }
  };

  // Add handler for manual scale input
  const handleManualScaleInput = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0.01 && num <= 100) {
      setScale(num);
    }
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
          {modelUrls && (
            <div className="flex gap-6">
              <div className="flex-1 aspect-square bg-gray-900 rounded-lg border border-gray-800 relative">
                <ModelViewer modelUrl={modelUrls.glbUrl} scale={scale} />
                
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
                      setModelUrls(null);
                      setHasQuote(false);
                    }}
                    className="p-2 bg-gray-800 rounded-full hover:bg-gray-700"
                    disabled={!modelUrls || isGenerating}
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
                      <div className="space-y-2">
                        <input
                          type="range"
                          min={-2}
                          max={2}
                          step="0.01"
                          value={Math.log10(scale)}
                          onChange={(e) => setScale(Math.pow(10, parseFloat(e.target.value)))}
                          className="w-full accent-blue-500 bg-gray-700"
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>×0.01</span>
                          {isManualScaleInput ? (
                            <input
                              type="number"
                              value={scale}
                              onChange={(e) => handleManualScaleInput(e.target.value)}
                              onBlur={() => setIsManualScaleInput(false)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setIsManualScaleInput(false);
                                }
                              }}
                              className="w-16 px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-center"
                              min="0.01"
                              max="100"
                              step="0.01"
                              autoFocus
                            />
                          ) : (
                            <button
                              onClick={() => setIsManualScaleInput(true)}
                              className="hover:text-gray-300"
                            >
                              ×{scale.toFixed(2)}
                            </button>
                          )}
                          <span>×100</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Color</label>
                      <div className="grid grid-cols-5 gap-2">
                        {COLORS.map((color) => {
                          const isDisabled = color !== 'Gray';
                          const bgColor = {
                            Gray: 'bg-gray-500',
                            White: 'bg-white',
                            Black: 'bg-black',
                            Blue: 'bg-blue-500',
                            Red: 'bg-red-500'
                          }[color];
                          const textColor = color === 'White' ? 'text-gray-900' : 'text-white';

                          return (
                            <button
                              key={color}
                              onClick={() => setSelectedColor(color)}
                              className={`relative p-1.5 rounded-lg border text-sm ${textColor} ${
                                selectedColor === color
                                  ? 'border-blue-500 ring-2 ring-blue-500/50'
                                  : isDisabled 
                                    ? 'border-gray-700 opacity-50 cursor-not-allowed'
                                    : 'border-gray-700 hover:border-gray-600'
                              } group ${bgColor}`}
                              disabled={isDisabled}
                            >
                              {color}
                              {isDisabled && (
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded 
                                  invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity">
                                  Not supported yet
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Material</label>
                      <div className="grid grid-cols-3 gap-2">
                        {MATERIALS.map((material) => {
                          const isDisabled = material !== 'Resin';
                          return (
                            <button
                              key={material}
                              onClick={() => setSelectedMaterial(material)}
                              className={`relative p-1.5 rounded-lg border text-sm ${
                                selectedMaterial === material
                                  ? 'border-blue-500 bg-blue-500/10'
                                  : isDisabled 
                                    ? 'border-gray-700 opacity-50 cursor-not-allowed'
                                    : 'border-gray-700 hover:border-gray-600'
                              } group`}
                              disabled={isDisabled}
                            >
                              {material}
                              {isDisabled && (
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-xs rounded 
                                  invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity">
                                  Not supported yet
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Initial Shipping Info (Country) */}
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                  <h2 className="text-lg font-bold mb-4">Shipping & Currency</h2>
                  <div className="space-y-4">
                    {/* Country Selection */}
                    <select
                      value={shippingInfo.country}
                      onChange={(e) => {
                        setShippingInfo({ ...shippingInfo, country: e.target.value });
                        setHasQuote(false);
                      }}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm"
                    >
                      <option value="">Select a country</option>
                      {countries.map(country => (
                        <option key={country.code} value={country.name}>{country.name}</option>
                      ))}
                    </select>

                    {/* Currency Selection */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedCurrency('EUR');
                          setHasQuote(false);
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${
                          selectedCurrency === 'EUR'
                            ? 'bg-blue-500/20 border border-blue-500'
                            : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        EUR (€)
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCurrency('USD');
                          setHasQuote(false);
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${
                          selectedCurrency === 'USD'
                            ? 'bg-blue-500/20 border border-blue-500'
                            : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        USD ($)
                      </button>
                    </div>

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

                {/* Printing & Shipping Options (shown after getting quote) */}
                {hasQuote && (
                  <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 animate-fade-in">
                    <h2 className="text-lg font-bold mb-4">Printing & Shipping Options</h2>
                    <div className="space-y-4">
                      {/* Cheapest Option */}
                      <button
                        onClick={() => setSelectedOption('cheapest')}
                        className={`w-full p-4 rounded-lg border text-left transition-colors ${
                          selectedOption === 'cheapest'
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold">Cheapest Option</span>
                          <span className="text-sm bg-green-500/20 text-green-400 px-2 py-1 rounded">
                            Best Value
                          </span>
                        </div>
                        {cheapestOption && (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Total Cost</span>
                              <span>{cheapestOption.totalCost.toFixed(2)} {selectedCurrency}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Delivery Time</span>
                              <span>{cheapestOption.totalTime} days</span>
                            </div>
                          </div>
                        )}
                      </button>

                      {/* Fastest Option */}
                      <button
                        onClick={() => setSelectedOption('fastest')}
                        className={`w-full p-4 rounded-lg border text-left transition-colors ${
                          selectedOption === 'fastest'
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold">Fastest Option</span>
                          <span className="text-sm bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                            Express
                          </span>
                        </div>
                        {fastestOption && (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Total Cost</span>
                              <span>{fastestOption.totalCost.toFixed(2)} {selectedCurrency}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Delivery Time</span>
                              <span>{fastestOption.totalTime} days</span>
                            </div>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Order Summary (shown after getting quote) */}
                {hasQuote && (
                  <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 animate-fade-in">
                    <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                    <div className="space-y-2 text-sm">
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
                      {selectedOption && (
                        <div className="pt-2 border-t border-gray-700">
                          <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>
                              {(selectedOption === 'cheapest' ? cheapestOption?.totalCost : fastestOption?.totalCost)?.toFixed(2)} {selectedCurrency}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-400 mt-1">
                            <span>Estimated Delivery</span>
                            <span>
                              {(selectedOption === 'cheapest' ? cheapestOption?.totalTime : fastestOption?.totalTime)} days
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Payment Button */}
                      <button
                        onClick={handlePayment}
                        disabled={!canProceedToPayment}
                        className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Proceed to Payment</span>
                      </button>
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