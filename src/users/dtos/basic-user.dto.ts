import { Expose, Transform } from 'class-transformer';

type TransformContext = {
  context?: {
    currentUserId?: number;
  };
};

export class BasicUserDTO {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  @Transform(({ obj, options }) => {
    const currentUserId = (options as TransformContext | undefined)?.context
      ?.currentUserId;
    if (!currentUserId) return false;

    return obj.id === currentUserId;
  })
  isMe: boolean;
}
