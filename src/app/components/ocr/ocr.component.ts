import { Component } from '@angular/core';
import { Phi35VisionService } from '../../services/phi35-vision.service';

@Component({
  selector: 'app-ocr',
  template: `
    <div class="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-2xl">
      <h2 class="text-3xl font-bold mb-6 text-indigo-800 text-center">
        Extract Text from Image
      </h2>
      <div class="mb-6">
        <label for="inputText" class="block text-sm font-medium text-gray-700">
          Enter Text (Optional)
        </label>
        <input
          id="inputText"
          type="text"
          [(ngModel)]="inputText"
          class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter text here (optional)"
        />
      </div>
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700"
          >Upload Image</label
        >
        <input
          type="file"
          (change)="onFileSelected($event)"
          accept="image/*"
          class="mt-1 block w-full text-sm text-gray-500
               file:mr-4 file:py-2 file:px-4
               file:rounded-full file:border-0
               file:text-sm file:font-semibold
               file:bg-indigo-500 file:text-white
               hover:file:bg-indigo-600 transition-colors duration-200"
        />
      </div>
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
        <div class="bg-gray-50 p-6 rounded-lg shadow-inner">
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
  styles: [
    `
      input[type='file']::file-selector-button {
        border: none;
        padding: 0.5rem 1rem;
        margin-right: 0.5rem;
        background-color: #6366f1;
        color: white;
        border-radius: 9999px;
        cursor: pointer;
        transition: background-color 0.2s ease-in-out;
      }

      input[type='file']::file-selector-button:hover {
        background-color: #4f46e5;
      }
    `,
  ],
})
export class OcrComponent {
  extractedText: string = '';
  isLoading: boolean = false;
  error: string = '';
  compressionMessage: string = '';
  isCopied: boolean = false;
  inputText: string = ''; // Added input text property

  constructor(private visionService: Phi35VisionService) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isLoading = true;
      this.error = '';
      this.extractedText = '';
      this.compressionMessage = 'Processing image...';
      this.isCopied = false;

      // Convert the selected file to a Blob URL
      const imageUrl = URL.createObjectURL(file);

      // Call the Phi35VisionService with the input text
      this.visionService.predict(imageUrl, this.inputText).then(
        (result) => {
          this.extractedText = result;
          this.isLoading = false;
          this.compressionMessage = '';
        },
        (err) => {
          console.error('Error extracting text:', err);
          this.error =
            'An error occurred while processing the image. Please try a smaller image or one with clearer text.';
          this.isLoading = false;
          this.compressionMessage = '';
        }
      );
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
