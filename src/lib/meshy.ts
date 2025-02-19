interface MeshyResponse {
  result: string;
  status?: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';
  progress?: number;
  model_urls?: {
    glb: string;
  };
  error?: string;
}

type ProgressCallback = (progress: number) => void;

export class MeshyClient {
  private apiKey: string;
  private baseUrl = 'https://api.meshy.ai/openapi/v2';
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

  async generateModel(prompt: string): Promise<string> {
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      throw new Error('Valid prompt is required');
    }

    try {
      // Generate preview model
      const previewResponse = await fetch(`${this.baseUrl}/text-to-3d`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          mode: 'preview',
          prompt: prompt,
          negative_prompt: 'low quality, low resolution, low poly, ugly',
          art_style: 'realistic',
          should_remesh: true,
        }),
      });

      if (!previewResponse.ok) {
        let errorMessage = 'API request failed';
        try {
          const errorData = await previewResponse.json();
          errorMessage = errorData.message || `API Error: ${previewResponse.status} - ${previewResponse.statusText}`;
        } catch {
          errorMessage = `API Error: ${previewResponse.status} - ${previewResponse.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const previewData: MeshyResponse = await previewResponse.json();
      const previewTaskId = previewData.result;

      // Poll preview status
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
        if (this.progressCallback && previewTask.progress !== undefined) {
          this.progressCallback(previewTask.progress);
        }

        if (previewTask.status === 'SUCCEEDED' && previewTask.model_urls?.glb) {
          return previewTask.model_urls.glb;
        } else if (previewTask.status === 'FAILED') {
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