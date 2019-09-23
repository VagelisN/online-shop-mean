import { Component, OnInit } from '@angular/core';
import { Message } from './messages.model';
import { MessageService } from './message.service';
import { AuthenticationService } from 'src/app/authentication/authentication.service';
import { map } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
import {  Subscription } from 'rxjs';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {

  defaultElevation = 2;
  raisedElevation = 8;

  inbox: Message[] = [
    {
      _id: '12343dfdf234',
      title: "a",
    content: "kerdis",
    from: 'chrom',
    fromId: '5d7cd68787919120ff20a62d',
    to: "samus",
    toId: '5d7d08ff73f0be4094648f21',
    isRead: true,
    rating:null
  }
  ];
  sent: Message[] = [];
  username = '';
  userId = '';
  messageOpen = false;
  openMessage: Message;
  openReply = false;
  whichFolder = 'inbox';
  constructor(private messageService: MessageService, private authenticationService: AuthenticationService) { }

  ngOnInit() {
    this.username = this.authenticationService.getUsername();
    this.userId = this.authenticationService.getLoggedUserId();
    this.messageService.getMessages(this.username)
      .pipe(
        map(res => {
          return {inbox: res.messages.map(
            message => {
              return {
                _id: message._id,
                title: message.title,
                content: message.content,
                from: message.from,
                fromId: message.fromId,
                to: message.to,
                toId: message.toId,
                isRead: message.isRead,
                rating: message.rating
              };
            })
          };
        })
      )
      .subscribe(transformedInbox => {
         this.inbox = transformedInbox.inbox;
      });
    this.messageService.getSentMessages(this.username)
    .pipe(
      map(res => {
        return {sent: res.messages.map(
          message => {
            return {
              _id: message._id,
              title: message.title,
              content: message.content,
              from: message.from,
              fromId: message.fromId,
              to: message.to,
              toId: message.toId,
              isRead: message.isRead,
              rating: null
            };
          })
        };
      })
    )
    .subscribe(transformedSent => {
          this.sent = transformedSent.sent;
    });
  }

  messageOpened(message: Message) {
    this.openMessage = message;
    this.messageOpen = true;
    console.log(message);
    if (message.isRead === false) {
      console.log('perasa');
      this.messageService.messageRead(message);
      message.isRead = true;
    }
  }

  onReply(form: NgForm) {
    const reply: Message = {
      _id: null,
      title: form.value.title,
      content: form.value.content,
      to: this.openMessage.from,
      toId: this.openMessage.fromId,
      from: this.openMessage.to,
      fromId: this.openMessage.toId,
      isRead: false,
      rating: null
    };
    this.messageService.sendMessage(reply);
    this.messageOpen = false;
    this.openReply = false;
  }

  onDeleteMessage(messageId: string) {
    this.messageService.deleteMessage(messageId, this.username);
    if ( this.whichFolder === 'inbox') {
      const elementPos = this.inbox.map((x) => x._id).indexOf(messageId);
      this.inbox.splice(elementPos, 1);
    } else {
      const elementPos = this.sent.map((x) => x._id).indexOf(messageId);
      this.sent.splice(elementPos, 1);
    }
    this.messageOpen = false;
  }

  onClickedInbox() {
    this.openReply = false;
    this.messageOpen = false;
    this.whichFolder = 'inbox';
  }

  onClickedSent() {
    this.openReply = false;
    this.messageOpen = false;
    this.whichFolder = 'sent';
  }

  onBack(from: string) {
    if (from === 'reply') {
      this.openReply = false;
    }
  }

}
