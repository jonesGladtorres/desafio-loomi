import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfilePictureDto {
  @ApiProperty({
    description: 'URL da foto de perfil do usuário',
    example: 'https://example.com/profile/user123.jpg',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl({}, { message: 'profilePicture must be a valid URL' })
  profilePicture: string;
}
