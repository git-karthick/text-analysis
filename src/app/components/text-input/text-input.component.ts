import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GroqService } from '../../services/groq.service';

@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
})
export class TextInputComponent {
  @Input() selectedModel: string = 'mixtral-8x7b-32768';
  @Output() analysisComplete = new EventEmitter<string>();

  inputForm: FormGroup;
  loading: boolean = false;
  charCount: number = 0;
  maxChars: number = 3000; // Adjust this value as needed

  constructor(private fb: FormBuilder, private groqService: GroqService) {
    this.inputForm = this.fb.group({
      inputText: [''],
    });
  }

  updateCharCount() {
    this.charCount = this.inputForm.get('inputText')?.value.length || 0;
  }

  clearText() {
    this.inputForm.get('inputText')?.setValue('');
    this.charCount = 0;
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
