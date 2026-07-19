import { Entity } from './Entity';
import { Email } from '../value-objects/Email';

interface UserProps {
  email: Email;
  name?: string;
  avatarUrl?: string;
  notificationsEnabled?: boolean;
}

export class User extends Entity<UserProps> {
  private constructor(props: UserProps, id?: string) {
    super(props, id);
  }

  public static create(
    props: { email: string; name?: string; avatarUrl?: string; notificationsEnabled?: boolean },
    id?: string,
  ): User {
    const emailVO = new Email(props.email);
    return new User(
      {
        email: emailVO,
        name: props.name,
        avatarUrl: props.avatarUrl,
        notificationsEnabled: props.notificationsEnabled ?? true,
      },
      id,
    );
  }

  get email(): string {
    return this.props.email.getValue();
  }

  get name(): string | undefined {
    return this.props.name;
  }

  get avatarUrl(): string | undefined {
    return this.props.avatarUrl;
  }

  get notificationsEnabled(): boolean | undefined {
    return this.props.notificationsEnabled;
  }
}
