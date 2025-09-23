import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Conversation, ConversationMember } from '../../interfaces/conversation.interface';
import { BookBuddyUser } from '../../interfaces/user.interface';
import { UserService } from '../../services/user/user.service';
import { Subscription } from 'rxjs';
import { MatInputModule, MatInput } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MessageService } from '../../services/messages/message.service';
import { AddMessageDTO, MessageDTO } from '../../interfaces/message.interface';
import { CommonModule } from '@angular/common';
import { ImageService } from '../../services/images/image.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-bar',
  imports: [
    MatIconModule,
    CommonModule],
  templateUrl: './message-bar.component.html',
  styleUrl: './message-bar.component.scss'
})
export class MessageBarComponent implements OnInit, OnDestroy, AfterViewInit{
  public userImageService!: ImageService;
  constructor(private userService: UserService, private messageService: MessageService, private imageService: ImageService, private changeDetector: ChangeDetectorRef){
    this.userImageService = imageService;
  }
  @Input() conversation!: Conversation;
  @Input() userInfo!: BookBuddyUser;
  // public userInfo!: BookBuddyUser;
  @Output() close = new EventEmitter<boolean>();
  
  public isOpen: boolean = true;
  public placeholder: string = 'Aa';
  public conversationName: string = '';
  public messageTextId = '';
  public conversationMates: Array<ConversationMember> = [];
  public conversationUsers: Array<BookBuddyUser> = [];
  public subscriptions: Array<Subscription> = [];
  @ViewChild('scrollContainer', { static: false }) private scrollContainer!: ElementRef;
  public ngOnInit(): void {
    // this.scrollToBottom();
    this.conversationMates = this.conversation.members; 
    this.conversationMates = this.conversationMates.filter(member => {
      return member.userId != this.userInfo.id;
    });
    this.conversationName = `${this.conversationMates.map(name => name.userName)}`;
    this.messageTextId = this.conversationName.split(' ').join('')
    
    this.conversation.members.forEach(member => {
      this.subscriptions.push(this.userService.getUserById(member.userId).subscribe(user => {
        this.conversationUsers.push(user);
      }));
    });

  } 

  public handleConversationUpdate(message: MessageDTO): void {
      this.conversation.messages.push(message);
      this.scrollToBottom();
  }
  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  public ngAfterViewInit(): void{
    console.log(`scrollContainer: ${this.scrollContainer}`)
    this.scrollToBottom();
    this.subscriptions.push(this.messageService.listenForMessages(this.conversation.id).subscribe(message => {
      console.log('a new message has arrived via behaviorsubject: ', message)
      if(!message) return;
      // sometimes behaviorsubject keeps firing the same message so block duplicates:
      const messageAlreadyAdded: boolean = this.conversation.messages.some(msg => msg.id === message.id);
      if(message.sentAt && !messageAlreadyAdded){
        this.handleConversationUpdate(message);
      }
    }));
  }


  public toggleBar(isOpen: boolean): void {
    if(!isOpen){
      this.isOpen = true;
    }else{
      this.isOpen = false;
    }
  }

  public buddyAvatarUrl(message: MessageDTO){
    return this.conversationUsers.find(user => user.id === message.senderId)?.avatarUrl;
  }

  public buddyName(message: MessageDTO){
    return this.conversationUsers.find(user => user.id === message.senderId)?.userName;
  }

  public closeConversation(){
    console.log('closing conversation');
    this.close.emit(true);
  }

  public handleKeydown(event: any){
    const keyboardEvent = event as KeyboardEvent;
    const target = event.target as HTMLDivElement;
    const textContent = target.textContent || '';
    const innerHTML = target.innerHTML;

    if(keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey){
      keyboardEvent.preventDefault();
      this.sendMessage(target);
    }
    if (!textContent.trim() || innerHTML === '<br>' || innerHTML === '<div><br></div>') {
      target.innerHTML = '';
    }  
  }

  public sendMessage(target: HTMLDivElement){
    const message = document.querySelector(`#${this.messageTextId}`)?.innerHTML;
    console.log('new message just typed: ',message)
    target.innerHTML = '';
    const addMessageDTO: AddMessageDTO = {
      senderId: this.userInfo.id,
      conversationId: this.conversation.id,
      content: message as string
    }
    this.subscriptions.push(this.messageService.addMessage(addMessageDTO).subscribe({
      next: message => {
        console.log('message successfully sent - ', message)
      },
      error: err => console.log('error sending message: ', err)
    }));
  }

  public displayUserMessageInfo(messages: Array<MessageDTO>, message: MessageDTO): boolean{
    let displayInfo: boolean = false;
    const messageIndex: number = messages.indexOf(message);
    if(message.senderId !== this.userInfo.id) displayInfo = true;
    if(messages[messageIndex - 1] && messages[messageIndex - 1].senderId === message.senderId) displayInfo = false;
    return displayInfo;
  }

  public messageTime(message: MessageDTO): string {
    const now: any = new Date();
    const sentDate: any = new Date(this.parseUtcSqlDateTime(message.sentAt.toString()));
    const diffMs = sentDate - now;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHr = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHr / 24);

    // Intl.RelativeTimeFormat for human-friendly output
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    // Show "Just now" / "5 minutes ago" / "2 hours ago" / "Yesterday"
    if (Math.abs(diffSec) < 60) return "Just now";
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
    if (Math.abs(diffHr) < 24) return rtf.format(diffHr, "hour");
    if (Math.abs(diffDay) < 7) return rtf.format(diffDay, "day");

    // Otherwise, show absolute local time
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return new Intl.DateTimeFormat("en-US", {
      timeZone: userTimeZone,
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(sentDate);
  }

private parseUtcSqlDateTime(sqlDateTime: string) {
  // Strip off fractional seconds for safety
  const clean = sqlDateTime.split('.')[0]; // "2025-08-29 21:33:48"

  // Convert to ISO 8601 format with Z (UTC)
  const iso = clean.replace(' ', 'T') + 'Z';

  return new Date(iso);
}

  private scrollToBottom(): void {
    if(this.scrollContainer){
      try {
        setTimeout(() => {
          this.scrollContainer.nativeElement.scrollTop =
          this.scrollContainer.nativeElement.scrollHeight;
        }, 250);
      } catch (err) {
        console.error('Scroll failed:', err);
      }
    }
  }

  public onEnterPressed(value: string) {
    console.log('Enter pressed with value:', value);
  }
}
