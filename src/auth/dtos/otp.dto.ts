import { Expose } from 'class-transformer';

export class OTPDTO {
  @Expose()
  sessionId: string;
}
