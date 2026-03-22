import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, QueryFailedError, Repository } from 'typeorm';

import { BostaService } from 'src/bosta';
import { Address, User } from 'src/entity';

import { CreateAddressDTO, UpdateAddressDTO } from './dtos';
import { BostaLocation } from './types';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address) private addressesRepo: Repository<Address>,
    private readonly bostaService: BostaService,
  ) {}

  async getAddresses(userId: number) {
    return this.addressesRepo.find({
      where: { user: { id: userId } },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
      relations: { user: false },
    });
  }

  async addAddress(userId: number, { cityId, districtId, ...createDTO }: CreateAddressDTO) {
    return this.addressesRepo.manager.transaction(async (manager) => {
      const addressRepo = manager.getRepository(Address);
      const userRepo = manager.getRepository(User);

      const user = await userRepo.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      const locationData = await this.getAddressLocationData(cityId, districtId);

      const address = addressRepo.create({
        ...createDTO,
        ...locationData,
        isDefault: false,
        user,
      });

      const createdAddress = await addressRepo.save(address);

      await this.trySetAddressAsDefault(manager, createdAddress.id, userId);

      const finalAddress = await addressRepo.findOne({
        where: { id: createdAddress.id, user: { id: userId } },
      });

      if (!finalAddress) throw new NotFoundException('Address not found');

      return finalAddress;
    });
  }

  async updateAddress(id: number, userId: number, updateDTO: UpdateAddressDTO) {
    return this.addressesRepo.manager.transaction(async (manager) => {
      const addressRepo = manager.getRepository(Address);
      const address = await addressRepo.findOne({
        where: { id, user: { id: userId } },
      });

      if (!address) throw new NotFoundException('Address not found');

      if (updateDTO.cityId && !updateDTO.districtId)
        throw new BadRequestException('districtId is required when cityId changes');

      if (updateDTO.districtId && !updateDTO.cityId) {
        const districtInCurrentCity = await this.bostaService.getDistrict(updateDTO.districtId, address.cityId);

        if (!districtInCurrentCity)
          throw new BadRequestException(
            'districtId is not available for the current city; provide cityId with districtId if changing city',
          );
      }

      if (updateDTO.cityId || updateDTO.districtId) {
        const cityId = updateDTO.cityId || address.cityId;
        const districtId = updateDTO.districtId || address.districtId;

        const locationData = await this.getAddressLocationData(cityId, districtId);

        Object.assign(updateDTO, locationData);
      }

      Object.assign(address, updateDTO);

      const updatedAddress = await addressRepo.save(address);
      await this.ensureDefaultAddress(userId, addressRepo);

      return updatedAddress;
    });
  }

  async setDefaultAddress(id: number, userId: number) {
    await this.addressesRepo.manager.transaction(async (manager) => {
      const addressRepo = manager.getRepository(Address);
      const address = await addressRepo.findOne({
        where: { id, user: { id: userId } },
      });

      if (!address) throw new NotFoundException('Address not found');

      await this.clearDefaultAddress(manager, userId);
      await this.trySetAddressAsDefault(manager, id, userId);
    });

    const updatedAddress = await this.addressesRepo.findOne({
      where: { id, user: { id: userId } },
    });

    if (!updatedAddress) throw new NotFoundException('Address not found');

    return updatedAddress;
  }

  async removeAddress(id: number, userId: number) {
    const address = await this.addressesRepo.findOne({
      where: { id, user: { id: userId } },
    });

    if (!address) throw new NotFoundException('Address not found');

    await this.addressesRepo.manager.transaction(async (manager) => {
      await manager.remove(Address, address);

      if (!address.isDefault) return;

      const addressRepo = manager.getRepository(Address);
      const nextDefault = await addressRepo.findOne({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
      });

      if (!nextDefault) return;

      nextDefault.isDefault = true;
      await addressRepo.save(nextDefault);
    });

    return { deleted: true };
  }

  private async ensureDefaultAddress(userId: number, addressRepo: Repository<Address>) {
    const defaultAddress = await addressRepo.findOne({
      where: { user: { id: userId }, isDefault: true },
    });

    if (defaultAddress) return;

    const fallbackAddress = await addressRepo.findOne({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    if (!fallbackAddress) return;

    fallbackAddress.isDefault = true;
    await addressRepo.save(fallbackAddress);
  }

  private async getAddressLocationData(cityId: string, districtId: string): Promise<BostaLocation> {
    const city = await this.bostaService.getCity(cityId);
    const district = await this.bostaService.getDistrict(districtId, cityId);

    if (!city) throw new BadRequestException('Invalid city data: cityId not found');

    if (!district) throw new BadRequestException('Invalid district data: districtId not found for selected city');

    return {
      cityId: city._id,
      cityName: city.name,
      districtId: district.districtId,
      districtName: district.districtName,
    };
  }

  private async clearDefaultAddress(manager: EntityManager, userId: number) {
    await manager
      .createQueryBuilder()
      .update(Address)
      .set({ isDefault: false })
      .where('userId = :userId', { userId })
      .execute();
  }

  private async trySetAddressAsDefault(manager: EntityManager, addressId: number, userId: number) {
    await manager
      .createQueryBuilder()
      .update(Address)
      .set({ isDefault: true })
      .where('id = :addressId AND userId = :userId', { addressId, userId })
      .execute()
      .catch((error: unknown) => {
        if (this.isUniqueConstraintError(error)) return;

        throw error;
      });
  }

  private isUniqueConstraintError(error: unknown) {
    if (!(error instanceof QueryFailedError)) return false;

    const driverError = error.driverError as { code?: string; message?: string } | undefined;

    return (
      driverError?.code === '23505' ||
      driverError?.code === 'SQLITE_CONSTRAINT' ||
      !!driverError?.message?.toLowerCase().includes('unique')
    );
  }
}
