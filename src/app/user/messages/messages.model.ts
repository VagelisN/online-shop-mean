export interface Message {
  _id: string;
  title: string;
  content: string;
  from: string;
  fromId: string;
  to: string;
  toId: string;
  isRead: boolean;
  rating: string;
}
