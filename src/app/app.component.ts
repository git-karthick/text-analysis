import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4 sm:py-12 sm:px-6 lg:px-8"
    >
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-8 sm:mb-12">
          <h1
            class="text-3xl font-extrabold text-gray-900 sm:text-4xl md:text-5xl"
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

        <div class="bg-white shadow-xl rounded-lg overflow-hidden">
          <div class="p-4 sm:p-6 md:p-8">
            <app-model-selector
              (modelSelected)="onModelSelected($event)"
              class="mb-6 sm:mb-8"
            ></app-model-selector>

            <div class="space-y-6 sm:space-y-8">
              <ng-container *ngIf="selectedModel">
                <div class="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                    Chat Assistant
                  </h2>
                  <app-chat [selectedModel]="selectedModel"></app-chat>
                </div>

                <div class="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                    Image Generator
                  </h2>
                  <app-image-generator
                    [selectedModel]="selectedModel"
                  ></app-image-generator>
                </div>
              </ng-container>

              <div class="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
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
