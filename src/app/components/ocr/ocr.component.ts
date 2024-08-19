import { Component } from '@angular/core';
import { VisionService } from '../../services/vision.service';

@Component({
  selector: 'app-ocr',
  template: `
    <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 class="text-2xl font-bold mb-4">Extract Text from Image</h2>
      <input
        type="file"
        (change)="onFileSelected($event)"
        accept="image/*"
        class="mb-4 block w-full text-sm text-gray-500
               file:mr-4 file:py-2 file:px-4
               file:rounded-full file:border-0
               file:text-sm file:font-semibold
               file:bg-blue-50 file:text-blue-700
               hover:file:bg-blue-100"
      />
      <div *ngIf="isLoading" class="mb-4 text-blue-600">
        <p>Processing image...</p>
        <p *ngIf="compressionMessage" class="text-sm text-gray-600">
          {{ compressionMessage }}
        </p>
      </div>
      <div *ngIf="extractedText" class="mt-4">
        <h3 class="text-xl font-semibold mb-2">Extracted Text:</h3>
        <p class="bg-gray-100 p-4 rounded">{{ extractedText }}</p>
      </div>
      <div *ngIf="error" class="mt-4 text-red-600">{{ error }}</div>
    </div>
  `,
})
export class OcrComponent {
  extractedText: string = '';
  isLoading: boolean = false;
  error: string = '';
  compressionMessage: string = '';

  constructor(private visionService: VisionService) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isLoading = true;
      this.error = '';
      this.extractedText = '';
      this.compressionMessage = 'Compressing image...';

      this.visionService.extractAndValidateText(file).subscribe({
        next: (text) => {
          this.extractedText = text;
          this.isLoading = false;
          this.compressionMessage = '';
        },
        error: (err) => {
          console.error('Error extracting text:', err);
          this.error =
            'An error occurred while processing the image. Please try a smaller image or one with clearer text.';
          this.isLoading = false;
          this.compressionMessage = '';
        },
      });
    }
  }
}
