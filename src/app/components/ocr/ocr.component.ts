import { Component } from '@angular/core';
import { FlorenceService } from '../../services/florence.service';

@Component({
  selector: 'app-ocr',
  template: `
    <div
      class="max-w-2xl mx-auto mt-10 p-8 bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl shadow-2xl"
    >
      <h2 class="text-3xl font-bold mb-6 text-indigo-800">
        Extract Text from Image
      </h2>
      <input
        type="file"
        (change)="onFileSelected($event)"
        accept="image/*"
        class="mb-6 block w-full text-sm text-gray-500
               file:mr-4 file:py-2 file:px-4
               file:rounded-full file:border-0
               file:text-sm file:font-semibold
               file:bg-indigo-500 file:text-white
               hover:file:bg-indigo-600 transition-colors duration-200"
      />
      <div *ngIf="isLoading" class="mb-6 text-indigo-600">
        <p class="font-semibold">Processing image...</p>
        <p *ngIf="compressionMessage" class="text-sm text-indigo-400 mt-2">
          {{ compressionMessage }}
        </p>
        <div class="mt-4 h-2 w-full bg-indigo-200 rounded-full overflow-hidden">
          <div class="h-full bg-indigo-600 animate-pulse"></div>
        </div>
      </div>
      <div *ngIf="extractedText" class="mt-6">
        <h3 class="text-2xl font-semibold mb-4 text-indigo-800">
          Extracted Text:
        </h3>
        <div class="bg-white p-6 rounded-lg shadow-inner">
          <p class="text-gray-800 whitespace-pre-wrap font-mono">
            {{ extractedText }}
          </p>
        </div>
        <button
          (click)="copyToClipboard()"
          class="mt-4 px-4 py-2 font-semibold rounded-lg shadow transition-colors duration-200"
          [ngClass]="{
            'bg-indigo-500 text-white hover:bg-indigo-600': !isCopied,
            'bg-green-500 text-white': isCopied
          }"
        >
          {{ isCopied ? 'Copied!' : 'Copy to Clipboard' }}
        </button>
      </div>
      <div
        *ngIf="error"
        class="mt-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded"
      >
        <p class="font-bold">Error</p>
        <p>{{ error }}</p>
      </div>
    </div>
  `,
})
export class OcrComponent {
  extractedText: string = '';
  isLoading: boolean = false;
  error: string = '';
  compressionMessage: string = '';
  isCopied: boolean = false;

  constructor(private visionService: FlorenceService) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isLoading = true;
      this.error = '';
      this.extractedText = '';
      this.compressionMessage = 'Compressing image...';
      this.isCopied = false;

      this.visionService.extractText(file).subscribe({
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

  copyToClipboard() {
    if (this.extractedText) {
      navigator.clipboard.writeText(this.extractedText).then(
        () => {
          this.isCopied = true;
          setTimeout(() => {
            this.isCopied = false;
          }, 2000);
        },
        (err) => {
          console.error('Could not copy text: ', err);
        }
      );
    }
  }
}
