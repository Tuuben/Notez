import { AppUser } from './user';

export interface Note {
  id: number;
  content?: string;
  location?: number;
  selected?: AppUser;
}
