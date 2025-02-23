interface MeshyResponse {
  result: string;
  status?: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';
  progress?: number;
  model_urls?: {
    glb: string;
    obj: string;
  };
  error?: string;
}

type ProgressCallback = (progress: number) => void;

export class MeshyClient {
  private apiKey: string;
  private baseUrl = 'https://api.meshy.ai/openapi/v2';
  private proxyUrl = 'https://proxy-production-ea8e.up.railway.app/proxy';
  private progressCallback?: ProgressCallback;

  constructor(apiKey: string) {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      throw new Error('Valid Meshy API key is required');
    }
    this.apiKey = apiKey;
  }

  onProgress(callback: ProgressCallback) {
    this.progressCallback = callback;
  }

  private async proxyRequest(path: string, method: string, headers?: Record<string, string>, body?: object) {
    // Encode the path for safety
    const encodedPath = encodeURIComponent(path);
    const response = await fetch(`${this.proxyUrl}/${encodedPath}`, {
      method,
      headers: {
        'X-API-KEY': import.meta.env.VITE_PROXY_API_KEY,
        ...headers
      },
      ...(body && { body: JSON.stringify(body) })
    });

    if (!response.ok) {
      let errorMessage = 'Proxy request failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || `Proxy Error: ${response.status} - ${response.statusText}`;
      } catch {
        errorMessage = `Proxy Error: ${response.status} - ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async generateModel(prompt: string): Promise<{ glbUrl: string; objUrl: string }> {
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      throw new Error('Valid prompt is required');
    }

    try {
      // Generate preview model through proxy
      const previewData: MeshyResponse = await this.proxyRequest(
        `${this.baseUrl}/text-to-3d`,
        'POST',
        {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        {
          mode: 'preview',
          prompt: prompt,
          negative_prompt: 'low quality, low resolution, low poly, ugly',
          art_style: 'realistic',
          should_remesh: true,
        }
      );

      const previewTaskId = previewData.result;

      // Poll preview status directly
      let previewTask: MeshyResponse | null = null;
      let attempts = 0;
      const maxAttempts = 30; // 2.5 minutes maximum waiting time

      while (attempts < maxAttempts) {
        const statusResponse = await fetch(`${this.baseUrl}/text-to-3d/${previewTaskId}`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        });

        if (!statusResponse.ok) {
          throw new Error('Failed to check preview status');
        }

        previewTask = await statusResponse.json();
        
        // Update progress
        if (this.progressCallback && previewTask?.progress !== undefined) {
          this.progressCallback(previewTask.progress);
        }

        if (previewTask?.status === 'SUCCEEDED' && previewTask.model_urls?.glb && previewTask.model_urls?.obj) {
          // Encode the URLs and prepend the proxy path
          const glbUrl = `${this.proxyUrl}/${encodeURIComponent(previewTask.model_urls.glb)}`;
          const objUrl = `${this.proxyUrl}/${encodeURIComponent(previewTask.model_urls.obj)}`;
          return { glbUrl, objUrl };
        } else if (previewTask?.status === 'FAILED') {
          throw new Error(previewTask.error || 'Preview generation failed');
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      throw new Error('Preview generation timed out');
    } catch (error) {
      console.error('Meshy API error:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }
}