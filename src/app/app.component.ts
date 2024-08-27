import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12">
          <h1
            class="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
          >
            AI Content <span class="text-indigo-600">Assistant</span>
          </h1>
          <p
            class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
          >
            Harness the power of AI to generate content, analyze text, and
            process images.
          </p>
        </div>

        <div class="bg-white shadow-2xl rounded-lg overflow-hidden">
          <div class="p-6 sm:p-10">
            <app-model-selector
              (modelSelected)="onModelSelected($event)"
              class="mb-8"
            ></app-model-selector>

            <div class="space-y-10">
              <ng-container *ngIf="selectedModel">
                <div class="bg-gray-50 rounded-lg p-6">
                  <h2 class="text-2xl font-bold text-gray-900 mb-4">
                    Chat Assistant
                  </h2>
                  <app-chat [selectedModel]="selectedModel"></app-chat>
                </div>

                <div class="bg-gray-50 rounded-lg p-6">
                  <h2 class="text-2xl font-bold text-gray-900 mb-4">
                    Image Generator
                  </h2>
                  <app-image-generator
                    [selectedModel]="selectedModel"
                  ></app-image-generator>
                </div>
              </ng-container>

              <div class="bg-gray-50 rounded-lg p-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">
                  OCR (Optical Character Recognition)
                </h2>
                <app-ocr></app-ocr>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Add any custom styles here */
    `,
  ],
})
export class AppComponent {
  selectedModel: string = 'mixtral-8x7b-32768';

  onModelSelected(model: string) {
    this.selectedModel = model;
  }
}
