import { Expose } from 'class-transformer';

export class CityDTO {
  @Expose()
  _id: string;
  @Expose()
  name: string;
  @Expose()
  nameAr: string;
  @Expose()
  code: string;
}
