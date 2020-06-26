import { AppUser } from './user';

export interface Note {
  id: string;
  content?: string;
  location?: number;
  selected?: AppUser;
}
