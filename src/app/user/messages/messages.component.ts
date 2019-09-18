import { Component, OnInit } from '@angular/core';
import { Message } from './messages.model';
import { MessageService } from './message.service';
import { AuthenticationService } from 'src/app/authentication/authentication.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {

  inbox: Message[] = [{title: "akoma", content: "me aito", _id: "asdasd"},
   {title: "akoma", content: "me aito", _id: "asdasd"},
   {title: "akoma", content: "me aito", _id: "asdasd"}
];
  sent: Message[] = [];
  userId = '';
  constructor(private messageService: MessageService, private authenticationService: AuthenticationService) { }

  ngOnInit() {
    this.userId = this.authenticationService.getLoggedUserId();
    this.messageService.getMessages(this.userId)
      .pipe(
        map(res => {
          return {inbox: res.messages.map(
            message => {
              return {
                title: message.title,
                content: message.content,
                _id: message._id
              };
            })
          };
        })
      )
      .subscribe(transformedInbox => {
        console.log(transformedInbox, "asdasd");
      });
  }

}
