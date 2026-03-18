import { Expose } from 'class-transformer';

export class DistrictDTO {
  @Expose()
  districtId: string;
  @Expose()
  districtName: string;
  @Expose()
  districtOtherName: string;
}
