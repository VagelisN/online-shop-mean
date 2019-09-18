import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private http: HttpClient) { }

  getMessages(userId: string) {
    if (userId) {
      return this.http.get<{messages: any}>(
        'http://localhost:3000/messages/' + userId
      );
    }

  }
}
