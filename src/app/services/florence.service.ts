import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Client } from '@gradio/client';

@Injectable({
  providedIn: 'root',
})
export class FlorenceService implements OnDestroy {
  private client: Client | null = null;

  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    this.client = await Client.connect('gokaygokay/Florence-2');
  }

  extractText(imageFile: File): Observable<string> {
    return new Observable((observer) => {
      if (!this.client) {
        observer.error('Client not initialized');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const imageBlob = new Blob([new Uint8Array(e.target.result)], {
          type: imageFile.type,
        });

        try {
          const result = await this.client!.predict('/process_image', {
            image: imageBlob,
            task_prompt: 'OCR',
            text_input: '',
            model_id: 'microsoft/Florence-2-large-ft',
          });

          // Cast result.data to the expected type: array with a JSON string
          const data = result.data as unknown as [string, null];
          //console.log('Raw API Response:', data[0]);

          // Replace single quotes with double quotes for JSON parsing
          const cleanedJsonString = data[0].replace(/'/g, '"');
          const jsonResponse = JSON.parse(cleanedJsonString);

          // Extract the text from the parsed JSON object
          const extractedText = jsonResponse['<OCR>'];

          //console.log('Extracted Text:', extractedText);
          observer.next(extractedText);
          observer.complete();
        } catch (error) {
          console.error('Error during image processing:', error);
          observer.error(error);
        }
      };
      reader.onerror = (error) => observer.error(error);
      reader.readAsArrayBuffer(imageFile);
    });
  }

  ngOnDestroy() {
    // Cleanup if necessary
  }
}
