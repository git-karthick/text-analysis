// services/groq.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GroqService {
  private apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

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
          content: `Analyze the following content and provide insights: ${content}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 1000,
    };

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      map((response) => response.choices[0].message.content),
      catchError((error) => {
        console.error('Error occurred:', error);
        return throwError('Failed to analyze content. Please try again later.');
      })
    );
  }
}
