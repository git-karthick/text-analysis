import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '@gradio/client';

@Injectable({
  providedIn: 'root',
})
export class Phi35VisionService {
  private readonly apiUrl =
    'https://huggingface.co/spaces/maxiw/Phi-3.5-vision';

  constructor(private http: HttpClient) {}

  async predict(
    imageUrl: string,
    textInput: string,
    modelId: string = 'microsoft/Phi-3.5-vision-instruct'
  ): Promise<any> {
    // Fetch the image as a Blob
    const response = await fetch(imageUrl);
    const imageBlob = await response.blob();

    // Connect to the Gradio client
    const client = await Client.connect('MaziyarPanahi/Phi-3.5-Vision');

    // Prepare the payload
    const payload = {
      image: imageBlob,
      text_input: textInput,
      model_id: modelId,
    };

    // Make the prediction request
    const result = await client.predict('/run_example', payload);

    return result.data;
  }
}
