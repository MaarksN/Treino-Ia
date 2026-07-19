import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { CreateUserRequestDTO, UserDTO } from '../dto/UserDTO';
import { DomainError } from '../../domain/exceptions/DomainError';

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(request: CreateUserRequestDTO): Promise<UserDTO> {
    const existingUser = await this.userRepository.findByEmail(request.email);

    if (existingUser) {
      throw new DomainError(
        'USER_ALREADY_EXISTS',
        `User with email ${request.email} already exists`,
      );
    }

    const user = User.create({
      email: request.email,
      name: request.name,
      avatarUrl: request.avatarUrl,
    });

    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      notificationsEnabled: user.notificationsEnabled,
    };
  }
}
