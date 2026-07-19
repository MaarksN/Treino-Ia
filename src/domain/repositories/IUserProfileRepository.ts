import { UserProfile } from '../entities/UserProfile';

export interface IUserProfileRepository {
  findById(id: string): Promise<UserProfile | null>;
  findByUserId(userId: string): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
  update(profile: UserProfile): Promise<void>;
  delete(id: string): Promise<void>;
}
