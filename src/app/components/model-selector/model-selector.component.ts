// components/model-selector/model-selector.component.ts
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-model-selector',
  template: `
    <div class="mb-6">
      <label for="model" class="block text-sm font-medium text-gray-700 mb-2"
        >Select Model</label
      >
      <div class="relative">
        <select
          (change)="onModelChange($event)"
          id="model"
          class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md appearance-none bg-white"
        >
          <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
          <option value="llama-3.1-70b-versatile">LLaMA2 70B</option>
          <option value="llama-3.1-8b-instant">LLaMA2 8B</option>
          <option value="gemma2-9b-it">Gemma2-9B</option>
          <option value="gemma2-7b-it">Gemma2-7B</option>
        </select>
        <div
          class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
        >
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
              fill-rule="evenodd"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  `,
})
export class ModelSelectorComponent {
  @Output() modelSelected = new EventEmitter<string>();

  onModelChange(event: Event) {
    const model = (event.target as HTMLSelectElement).value;
    this.modelSelected.emit(model);
  }
}
