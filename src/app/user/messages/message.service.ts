import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Message } from './messages.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private unreadCountSub = new Subject<number>();
  unreadCount = 0;

  constructor(private http: HttpClient) { }

  getUnreadCountSub() {
    return this.unreadCountSub;
  }

  getMessages(username: string) {
    if (username) {
      return this.http.get<{messages: any}>(
        'http://localhost:3000/messages/inbox/' + username
      );
    }
  }

  getSentMessages(username: string) {
    if (username) {
      return this.http.get<{messages: any}>(
        'http://localhost:3000/messages/sent/' + username
      );
    }
  }

  sendMessage(message: Message) {
    this.http.post('http://localhost:3000/messages/send', message)
      .subscribe(res => {
        console.log('makaronia');
      });
  }

  messageRead(message: Message) {
    this.http.patch('http://localhost:3000/messages/read/' + message._id, message)
      .subscribe( res => {
        this.getUnreadCount(message.to);
      });
  }

  getUnreadCount(username: string) {
    this.http.get<{message: string, count: number}>('http://localhost:3000/messages/count/' + username)
    .subscribe( res => {
      this.unreadCount = res.count;
      this.unreadCountSub.next(this.unreadCount);
    });
  }

  deleteMessage(messageId: string, username: string) {
    this.http.patch('http://localhost:3000/messages', {messageId, username})
      .subscribe( res => {
        console.log(res);
      });
  }
}
