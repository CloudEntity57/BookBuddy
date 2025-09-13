import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Conversation, ConversationMember, CreateConversationDto } from '../../interfaces/conversation.interface';
import { AddMessageDTO, MessageDTO } from '../../interfaces/message.interface';
import { BookBuddyUser } from '../../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private http: HttpClient) { }

  private streams = new Map<string, BehaviorSubject<any>>();

  /** Get an existing stream or create a new one if it doesn't exist */
  public getStream(conversationId: string): BehaviorSubject<any> {
    if (!this.streams.has(conversationId)) {
      this.streams.set(conversationId, new BehaviorSubject<any>(null));
    }
    return this.streams.get(conversationId)!;
  }

  /** Push a new message into a specific conversation stream */
  public updateMessage(conversationId: string, message: any) {
    const stream = this.getStream(conversationId);
    stream.next(message);
  }

  /** Subscribe to updates for a specific conversation */
  public listenForMessages(conversationId: string): Observable<any> {
    return this.getStream(conversationId).asObservable();
  }

  public conversationToStage = new BehaviorSubject<Conversation | null>(null);

  public checkExistingConversation(userId1: string, userId2: string): Observable<Conversation> {
    return this.http.get(`${environment.apiUrl}/conversation/between/${userId1}/${userId2}`) as Observable<Conversation>;
  }

  public createConversation(conversationDto: any): Observable<Conversation> {
    return this.http.post(`${environment.apiUrl}/conversation`, conversationDto) as Observable<Conversation>;
  }

  public addConversationMember(conversationMember: ConversationMember): Observable<ConversationMember>{
    console.log('adding conversation member')
    return this.http.post(`${environment.apiUrl}/conversationmember`, conversationMember) as Observable<ConversationMember>;
  }

  public addMessage(messageDTO: AddMessageDTO): Observable<MessageDTO>{
    return this.http.post(`${environment.apiUrl}/message`, messageDTO) as Observable<MessageDTO>;
  }

    public createNewConversation(user1: BookBuddyUser, user2: BookBuddyUser ): void{
      const newConversation: CreateConversationDto = {
        name: `Message between ${user1.userName} and ${user2.userName}`,
        isGroup: false,
      };
  
      this.createConversation(newConversation).pipe(
        switchMap((conv) => {
          // if(conv && conv.id){
            const addFirst = this.addUserToConversation(user1, conv.id);
            const addSecond = this.addUserToConversation(user2, conv.id);
            return forkJoin([addFirst, addSecond, of(conv)]);
          // }
        })
      ).subscribe({
        next: ([firstResp, secondResp, conv]) => {
          console.log(`Created new conversation ${conv} with 2 participants:`, firstResp, secondResp);
          // Navigate to chat
          this.conversationToStage.next(conv);
          // this.progressBarService.stopProgressBar();
        },
        error: (error) => {
          console.log(error);
          // this.progressBarService.stopProgressBar();
        }
      });
    }

  public addUserToConversation(user: BookBuddyUser, conversationId: string): Observable<ConversationMember>{
    const newMember: ConversationMember = {
      userName: user.userName,
      userId: user.id,
      conversationId
    }
    return this.addConversationMember(newMember);
  }
  
}
