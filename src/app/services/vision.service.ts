import { Injectable, OnDestroy } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import * as Tesseract from 'tesseract.js';
import { GroqService } from './groq.service';

@Injectable({
  providedIn: 'root',
})
export class VisionService implements OnDestroy {
  private worker: Tesseract.Worker | null = null;

  constructor(private groqService: GroqService) {
    this.initializeWorker();
  }

  private async initializeWorker() {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker();
      await this.worker.load(); // Ensure the worker is fully loaded before using
    }
  }

  extractAndValidateText(imageFile: File): Observable<string> {
    return this.getImageDataUrl(imageFile).pipe(
      switchMap((dataUrl) =>
        from(this.recognizeText(dataUrl)).pipe(
          switchMap((extractedText) =>
            this.groqService
              .analyzeContent(extractedText, 'llama-3.1-70b-versatile')
              .pipe(
                map((validatedText) =>
                  this.chooseBestText(extractedText, validatedText)
                ),
                catchError((error) => {
                  console.error('Text validation failed:', error);
                  return of(extractedText); // Fallback to extracted text if validation fails
                })
              )
          ),
          catchError((error) => {
            console.error('Text extraction failed:', error);
            return of(''); // Fallback if extraction fails
          })
        )
      )
    );
  }

  private async recognizeText(dataUrl: string): Promise<string> {
    if (!this.worker) {
      await this.initializeWorker();
    }
    const result = await this.worker!.recognize(dataUrl);
    return result.data.text;
  }

  private getImageDataUrl(file: File): Observable<string> {
    return new Observable((observer) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        observer.next(e.target.result);
        observer.complete();
      };
      reader.onerror = (error) => observer.error(error);
      reader.readAsDataURL(file);
    });
  }

  private chooseBestText(originalText: string, validatedText: string): string {
    // Implement logic to compare and choose the best text
    // This could be based on length, confidence score, or custom rules
    return validatedText.length > originalText.length
      ? validatedText
      : originalText;
  }

  ngOnDestroy() {
    if (this.worker) {
      this.worker.terminate();
    }
  }
}
