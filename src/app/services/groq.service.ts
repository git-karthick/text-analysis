import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timer, throwError } from 'rxjs';
import {
  catchError,
  map,
  switchMap,
  takeWhile,
  finalize,
  tap,
} from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GroqService {
  private groqApiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private huggingFaceApiUrl = 'https://api-inference.huggingface.co/models/';

  constructor(private http: HttpClient) {}

  analyzeContent(content: string, model: string): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${environment.groqApiKey}`,
    });

    const body = {
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that analyzes text content.',
        },
        {
          role: 'user',
          content: content,
        },
      ],
      temperature: 0.5,
      max_tokens: 1000,
    };

    return this.http.post<any>(this.groqApiUrl, body, { headers }).pipe(
      map((response) => response.choices[0].message.content),
      catchError((error) => {
        console.error('Error occurred:', error);
        throw new Error('Failed to analyze content. Please try again later.');
      })
    );
  }

  private checkModelStatus(model: string): Observable<boolean> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${environment.huggingFaceApiKey}`,
    });

    return this.http
      .get<any>(`${this.huggingFaceApiUrl}${model}`, { headers })
      .pipe(
        map((response) => {
          if (response.error && response.error.includes('currently loading')) {
            console.log(
              `Model ${model} is still loading, estimated time: ${response.estimated_time} seconds`
            );
            return false;
          }
          return true;
        }),
        catchError((error) => {
          console.error('Error checking model status:', error);
          return throwError(() => new Error('Failed to check model status.'));
        })
      );
  }

  waitForModelToLoad(
    model: string,
    interval: number = 10000
  ): Observable<boolean> {
    return timer(0, interval).pipe(
      switchMap(() => this.checkModelStatus(model)),
      takeWhile((isReady) => !isReady, true),
      tap((isReady) => {
        if (isReady) {
          console.log(`Model ${model} is ready for use.`);
        }
      }),
      catchError((error) => {
        console.error('Error occurred during model loading:', error);
        return throwError(
          () => new Error('Failed to load model. Please try again later.')
        );
      })
    );
  }

  generateImageWithDeferredRequest(
    prompt: string,
    model: string
  ): Observable<Blob> {
    return this.waitForModelToLoad(model).pipe(
      switchMap((isReady) => {
        if (isReady) {
          return this.generateImage(prompt, model);
        } else {
          throw new Error('Model is not ready yet. Please try again later.');
        }
      })
    );
  }

  private generateImage(prompt: string, model: string): Observable<Blob> {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${environment.huggingFaceApiKey}`,
    };

    const body = { inputs: prompt };

    return new Observable<Blob>((observer) => {
      fetch(`${this.huggingFaceApiUrl}${model}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.blob();
        })
        .then((blob) => {
          observer.next(blob);
          observer.complete();
        })
        .catch((error) => {
          console.error('Error occurred during image generation:', error);
          observer.error(
            new Error('Failed to generate image. Please try again later.')
          );
        });
    });
  }
}
