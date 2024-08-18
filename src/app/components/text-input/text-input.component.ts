// components/text-input/text-input.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GroqService } from '../../services/groq.service';

@Component({
  selector: 'app-text-input',
  template: `
    <form [formGroup]="inputForm" (ngSubmit)="onSubmit()" class="space-y-6">
      <div>
        <label
          for="inputText"
          class="block text-sm font-medium text-gray-700 mb-2"
          >Input Text</label
        >
        <textarea
          formControlName="inputText"
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
          type="submit"
          [disabled]="loading || inputForm.invalid"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {{ loading ? 'Analyzing...' : 'Analyze' }}
        </button>
      </div>
    </form>
  `,
})
export class TextInputComponent {
  @Input() selectedModel: string = 'mixtral-8x7b-32768';
  @Output() analysisComplete = new EventEmitter<string>();

  inputForm: FormGroup;
  loading: boolean = false;
  charCount: number = 0;
  maxChars: number = 1000; // Adjust this value as needed

  constructor(private fb: FormBuilder, private groqService: GroqService) {
    this.inputForm = this.fb.group({
      inputText: [''],
    });
  }

  updateCharCount() {
    this.charCount = this.inputForm.get('inputText')?.value.length || 0;
  }

  onSubmit() {
    if (
      this.inputForm.valid &&
      !this.loading &&
      this.charCount > 0 &&
      this.charCount <= this.maxChars
    ) {
      this.loading = true;
      const { inputText } = this.inputForm.value;
      this.groqService.analyzeContent(inputText, this.selectedModel).subscribe(
        (result) => {
          this.analysisComplete.emit(result);
          this.loading = false;
        },
        (error) => {
          console.error('Error during analysis:', error);
          this.analysisComplete.emit('An error occurred during analysis.');
          this.loading = false;
        }
      );
    }
  }
}
