import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, RotateCcw, Printer, AlertCircle, Loader2, Link } from 'lucide-react';
import ModelViewer from '../components/ModelViewer';
import { MeshyClient } from '../lib/meshy';

export default function PromptPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [meshyClient, setMeshyClient] = useState<MeshyClient | null>(null);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [manualUrl, setManualUrl] = useState('');
  const navigate = useNavigate();

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

  const handleGenerate = async () => {
    if (!meshyClient) {
      setError('3D generation service is not properly initialized');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setGenerationProgress(0);
      
      // Subscribe to progress updates
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

  const handlePrint = () => {
    if (modelUrl) {
      sessionStorage.setItem('printModelUrl', modelUrl);
      navigate('/checkout');
    }
  };

  const handleManualUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUrl.trim()) {
      setModelUrl(manualUrl.trim());
    }
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-8">
          {/* Manual URL Input */}
          <div className="w-full max-w-3xl">
            <form onSubmit={handleManualUrlSubmit} className="flex space-x-2">
              <input
                type="url"
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
            </form>
          </div>

          <div className="w-full max-w-3xl">
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

          <div className="w-full aspect-square max-w-2xl bg-gray-900 rounded-lg border border-gray-800 relative">
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
            
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <button
                onClick={() => setModelUrl(null)}
                className="p-2 bg-gray-800 rounded-full hover:bg-gray-700"
                disabled={!modelUrl || isGenerating}
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={handlePrint}
                disabled={!modelUrl || isGenerating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-5 h-5" />
                <span>Get Quote</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}