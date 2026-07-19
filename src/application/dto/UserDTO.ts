export interface UserDTO {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  notificationsEnabled?: boolean;
}

export interface CreateUserRequestDTO {
  email: string;
  name?: string;
  avatarUrl?: string;
}
