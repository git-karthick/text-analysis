import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TextInputComponent } from './components/text-input/text-input.component';
import { ResultsDisplayComponent } from './components/results-display/results-display.component';
import { ModelSelectorComponent } from './components/model-selector/model-selector.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageGeneratorComponent } from './components/image-generator/image-generator.component';
import { OcrComponent } from './components/ocr/ocr.component';
import { ChatComponent } from './components/chat/chat.component';

@NgModule({
  declarations: [
    AppComponent,
    TextInputComponent,
    ResultsDisplayComponent,
    ModelSelectorComponent,
    ImageGeneratorComponent,
    OcrComponent,
    ChatComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
