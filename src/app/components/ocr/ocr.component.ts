import { Component } from '@angular/core';
import { Phi35VisionService } from '../../services/phi35-vision.service';
import { FlorenceService } from '../../services/florence.service';

@Component({
  selector: 'app-ocr',
  templateUrl: './ocr.component.html',
  styleUrls: ['./ocr.component.scss'],
})
export class OcrComponent {
  extractedText: string = '';
  isLoading: boolean = false;
  error: string = '';
  compressionMessage: string = '';
  isCopied: boolean = false;
  inputText: string = '';
  selectedModel: string = 'Phi35'; // Default model selection
  models: string[] = ['Phi35', 'Florence']; // Available models
  imageUrl: string | null = null; // Store the image URL

  constructor(
    private phi35Service: Phi35VisionService,
    private florenceService: FlorenceService
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isLoading = true;
      this.error = '';
      this.extractedText = '';
      this.compressionMessage = 'Processing image...';
      this.isCopied = false;

      // Set the image URL to display the selected image
      this.imageUrl = URL.createObjectURL(file);

      if (this.selectedModel === 'Phi35') {
        this.phi35Service.predict(this.imageUrl, this.inputText).then(
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
      } else if (this.selectedModel === 'Florence') {
        this.florenceService.extractText(file).subscribe(
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
