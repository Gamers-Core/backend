import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { BostaService } from 'src/bosta';
import { Address, User } from 'src/entity';
import { withOptionalManager, BadRequestException, NotFoundException } from 'src/common';

import { CreateAddressDTO, UpdateAddressDTO } from './dtos';
import { BostaLocation } from './types';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private addressesRepo: Repository<Address>,
    @Inject(forwardRef(() => BostaService))
    private readonly bostaService: BostaService,
  ) {}

  getAddresses(userId: number, manager?: EntityManager) {
    return withOptionalManager(manager, this.addressesRepo.manager, (manager) => {
      const addressRepo = manager.getRepository(Address);

      return addressRepo.find({
        where: { user: { id: userId } },
        order: { isDefault: 'DESC', createdAt: 'DESC' },
        relations: { user: false },
      });
    });
  }

  async getAddress(id: number, userId: number, manager?: EntityManager) {
    return withOptionalManager(manager, this.addressesRepo.manager, async (manager) => {
      const addressRepo = manager.getRepository(Address);

      const address = await addressRepo.findOne({
        where: { id, user: { id: userId } },
        relations: { user: false },
      });

      if (!address) throw new NotFoundException('address.notFound');

      return address;
    });
  }

  async addAddress(userId: number, { cityId, districtId, ...createDTO }: CreateAddressDTO) {
    return this.addressesRepo.manager.transaction(async (manager) => {
      const addressRepo = manager.getRepository(Address);
      const userRepo = manager.getRepository(User);

      const user = await userRepo.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('user.notFound');

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

      if (!finalAddress) throw new NotFoundException('address.notFound');

      return finalAddress;
    });
  }

  async updateAddress(id: number, userId: number, updateDTO: UpdateAddressDTO) {
    return this.addressesRepo.manager.transaction(async (manager) => {
      const addressRepo = manager.getRepository(Address);
      const address = await addressRepo.findOne({
        where: { id, user: { id: userId } },
      });

      if (!address) throw new NotFoundException('address.notFound');

      if (updateDTO.cityId && !updateDTO.districtId)
        throw new BadRequestException('address.districtRequiredOnCityChange');

      if (updateDTO.districtId && !updateDTO.cityId) {
        const districtInCurrentCity = await this.bostaService.getDistrict(updateDTO.districtId, address.cityId);

        if (!districtInCurrentCity) throw new BadRequestException('address.districtNotAvailableForCity');
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

      if (!address) throw new NotFoundException('address.notFound');

      await this.clearDefaultAddress(manager, userId);
      await this.trySetAddressAsDefault(manager, id, userId);
    });

    const updatedAddress = await this.addressesRepo.findOne({
      where: { id, user: { id: userId } },
    });

    if (!updatedAddress) throw new NotFoundException('address.notFound');

    return updatedAddress;
  }

  async removeAddress(id: number, userId: number) {
    const address = await this.addressesRepo.findOne({
      where: { id, user: { id: userId } },
    });

    if (!address) throw new NotFoundException('address.notFound');

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

    if (!city) throw new BadRequestException('address.cityInvalid');

    if (!district) throw new BadRequestException('address.districtInvalid');

    return {
      cityId: city._id,
      cityName: city.nameAr,
      districtId: district.districtId,
      districtName: district.districtOtherName,
    };
  }

  private async clearDefaultAddress(manager: EntityManager, userId: number) {
    return withOptionalManager(manager, this.addressesRepo.manager, async (manager) => {
      await manager
        .createQueryBuilder()
        .update(Address)
        .set({ isDefault: false })
        .where('user_id = :userId', { userId })
        .execute();
    });
  }

  private async trySetAddressAsDefault(manager: EntityManager, addressId: number, userId: number) {
    return withOptionalManager(manager, this.addressesRepo.manager, async (manager) => {
      await manager
        .createQueryBuilder()
        .update(Address)
        .set({ isDefault: false })
        .where('user_id = :userId', { userId })
        .execute();

      await manager
        .createQueryBuilder()
        .update(Address)
        .set({ isDefault: true })
        .where('id = :addressId AND user_id = :userId', { addressId, userId })
        .execute();
    });
  }
}
