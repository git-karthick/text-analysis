import { Component, Input, AfterViewInit } from '@angular/core';
import 'prismjs';
import 'prismjs/themes/prism.css';
declare const Prism: any;

@Component({
  selector: 'app-results-display',
  template: `
    <div *ngIf="results" class="mt-8">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h2>
      <div class="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
        <pre
          class="text-sm text-gray-700 whitespace-pre-wrap"
        ><code class="language-javascript">{{ results }}</code></pre>
      </div>
    </div>
  `,
})
export class ResultsDisplayComponent implements AfterViewInit {
  @Input() results: string = '';

  ngAfterViewInit() {
    Prism.highlightAll();
  }
}
