import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Message } from './messages.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private http: HttpClient) { }

  getMessages(username: string) {
    if (username) {
      return this.http.get<{messages: any}>(
        'http://localhost:3000/messages/' + username
      );
    }
  }

  sendMessage(message: Message) {
    this.http.post('http://localhost:3000/messages/send', message)
      .subscribe(res => {
        console.log(res);
      });
  }
}
