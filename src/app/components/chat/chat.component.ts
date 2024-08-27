import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { GroqService } from '../../services/groq.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Message {
  text: string | SafeHtml;
  sender: 'user' | 'assistant';
  isCode?: boolean;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @Input() selectedModel: string = 'mixtral-8x7b-32768';
  messages: Message[] = [];
  loading: boolean = false;
  conversationContext: string = '';
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  constructor(
    private groqService: GroqService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.addMessage({
      text: "Hello! I'm an AI assistant. How can I help you today?",
      sender: 'assistant',
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop =
        this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  handleUserInput(event: Event) {
    event.preventDefault();
    const inputElement = (event.target as HTMLElement).querySelector(
      '#inputText'
    ) as HTMLTextAreaElement;

    if (inputElement) {
      const userInput = inputElement.value.trim();
      if (userInput) {
        this.addMessage({ text: userInput, sender: 'user' });
        this.getAIResponse(userInput);
        inputElement.value = '';
      }
    }
  }

  addMessage(message: Message) {
    this.messages.push(message);
    this.updateConversationContext();
  }

  updateConversationContext() {
    const contextLength = 5;
    this.conversationContext = this.messages
      .slice(-contextLength)
      .map(
        (m) =>
          `${m.sender}: ${typeof m.text === 'string' ? m.text : 'HTML content'}`
      )
      .join('\n');
  }

  getAIResponse(userInput: string) {
    this.loading = true;
    const prompt = `${this.conversationContext}\nHuman: ${userInput}\nAssistant:`;

    this.groqService.analyzeContent(prompt, this.selectedModel).subscribe(
      (result) => {
        const isCode = result.includes('```') || result.includes('<code>');
        const sanitizedText = this.sanitizer.bypassSecurityTrustHtml(
          this.formatResponse(result)
        );

        this.addMessage({ text: sanitizedText, sender: 'assistant', isCode });
        this.loading = false;
      },
      (error) => {
        console.error('Error during analysis:', error);
        this.addMessage({
          text: 'I apologize, but I encountered an error while processing your request. Could you please try again?',
          sender: 'assistant',
        });
        this.loading = false;
      }
    );
  }

  formatResponse(response: string): string {
    return response
      .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
      .replace(/\n/g, '<br/>');
  }

  startNewChat() {
    this.messages = [];
    this.conversationContext = '';
    this.addMessage({
      text: "Hello! I'm an AI assistant. How can I help you today?",
      sender: 'assistant',
    });
  }
}
