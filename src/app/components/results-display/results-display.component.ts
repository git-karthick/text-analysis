// components/results-display/results-display.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-results-display',
  template: `
    <div *ngIf="results" class="mt-8">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h2>
      <div class="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
        <pre class="text-sm text-gray-700 whitespace-pre-wrap">{{
          results
        }}</pre>
      </div>
    </div>
  `,
})
export class ResultsDisplayComponent {
  @Input() results: string = '';
}
