// components/image-generator/image-generator.component.ts
// image-generator.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GroqService } from '../../services/groq.service';

@Component({
  selector: 'app-image-generator',
  template: `
    <form [formGroup]="imageForm" class="space-y-6">
      <div>
        <label for="prompt" class="block text-sm font-medium text-gray-700 mb-2"
          >Image Prompt</label
        >
        <textarea
          formControlName="prompt"
          id="inputText"
          rows="5"
          class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
          placeholder="Enter your text here..."
          (input)="updateCharCount()"
        ></textarea>
        <p class="mt-2 text-sm text-gray-500">
          {{ charCount }} / {{ maxChars }} characters
        </p>
      </div>
      <div>
        <button
          type="button"
          (click)="onGenerateClick()"
          [disabled]="loading || imageForm.invalid"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {{ loading ? 'Generating...' : 'Generate Image' }}
        </button>
      </div>
    </form>
    <div *ngIf="imageUrl" class="mt-4">
      <img
        [src]="imageUrl"
        alt="Generated Image"
        class="max-w-full h-auto rounded-lg shadow-md"
      />
    </div>
    <div *ngIf="errorMessage" class="mt-4 text-red-600">
      {{ errorMessage }}
    </div>
  `,
})
export class ImageGeneratorComponent implements OnInit {
  @Input() selectedModel: string = 'black-forest-labs/FLUX.1-schnell';
  imageForm: FormGroup;
  loading: boolean = false;
  imageUrl: string | null = null;
  errorMessage: string | null = null;
  charCount: number = 0;
  maxChars: number = 1000; // Adjust this value as needed
  constructor(private fb: FormBuilder, private groqService: GroqService) {
    this.imageForm = this.fb.group({
      prompt: ['', Validators.required],
    });
  }

  ngOnInit() {
    console.log(
      'ImageGeneratorComponent initialized with model:',
      this.selectedModel
    );
  }

  onGenerateClick() {
    if (this.imageForm.valid && !this.loading) {
      this.loading = true;
      this.errorMessage = null;
      const { prompt } = this.imageForm.value;
      console.log('Attempting to generate image with prompt:', prompt);

      this.groqService
        .generateImageWithDeferredRequest(prompt, this.selectedModel)
        .subscribe(
          (blob: Blob) => {
            this.imageUrl = URL.createObjectURL(blob);
            this.loading = false;
            console.log('Image generated successfully');
          },
          (error) => {
            console.error('Error generating image:', error);
            this.errorMessage = error.message;
            this.loading = false;
          }
        );
    }
  }
  updateCharCount() {
    this.charCount = this.imageForm.get('inputText')?.value.length || 0;
  }
}
