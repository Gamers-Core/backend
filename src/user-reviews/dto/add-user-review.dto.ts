import { IsInt, IsUrl, Min } from 'class-validator';

export class AddUserReviewDTO {
  @IsInt()
  @Min(1)
  imageId: number;

  @IsUrl()
  facebookURL: string;
}
