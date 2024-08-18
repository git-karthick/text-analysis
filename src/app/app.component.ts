import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div
        class="max-w-3xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden"
      >
        <div class="px-4 py-5 sm:p-6">
          <h1 class="text-3xl font-extrabold text-gray-900 text-center mb-8">
            AI Content Generator
          </h1>
          <app-model-selector
            (modelSelected)="onModelSelected($event)"
          ></app-model-selector>
          <app-text-input
            [selectedModel]="selectedModel"
            (analysisComplete)="onAnalysisComplete($event)"
          ></app-text-input>
          <app-results-display
            [results]="analysisResults"
          ></app-results-display>
          <app-image-generator
            [selectedModel]="selectedModel"
          ></app-image-generator>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
    `,
  ],
})
export class AppComponent {
  selectedModel: string = 'mixtral-8x7b-32768';
  analysisResults: string = '';

  onModelSelected(model: string) {
    this.selectedModel = model;
  }

  onAnalysisComplete(results: string) {
    this.analysisResults = results;
  }
}
