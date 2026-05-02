import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { BadRequestException, NotFoundException } from 'src/common/exceptions';
import { withOptionalManager } from 'src/common/with-optional-manager';

import { BostaService } from './bosta/bosta.service';
import { CreateAddressDTO } from './dtos/admin/create-address.dto';
import { UpdateAddressDTO } from './dtos/admin/update-address.dto';
import { Address } from './entities/address.entity';
import { BostaLocation } from './types';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private addressesRepo: Repository<Address>,
    private readonly bostaService: BostaService,
  ) {}

  getAddresses(userId: number) {
    return this.addressesRepo.find({
      where: { user: { id: userId } },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async addAddress(userId: number, { cityId, districtId, ...createDTO }: CreateAddressDTO) {
    return this.addressesRepo.manager.transaction(async (manager) => {
      const addressRepo = manager.getRepository(Address);

      const locationData = await this.getAddressLocationData(cityId, districtId);

      const address = addressRepo.create({ ...createDTO, ...locationData, user: { id: userId }, isDefault: false });
      const createdAddress = await addressRepo.save(address);

      await this.setDefault(createdAddress.id, userId, manager);

      return this.getAddressOrFail(createdAddress.id, userId, manager);
    });
  }

  updateAddress(id: number, userId: number, dto: UpdateAddressDTO) {
    return this.addressesRepo.manager.transaction(async (manager) => {
      const addressRepo = manager.getRepository(Address);

      const address = await this.getAddressOrFail(id, userId, manager);

      if (dto.cityId || dto.districtId) {
        const locationData = await this.resolveLocationUpdate(dto, address);
        Object.assign(dto, locationData);
      }

      Object.assign(address, dto);
      const updated = await addressRepo.save(address);

      await this.ensureDefault(userId, manager);

      return updated;
    });
  }
  async setDefault(id: number, userId: number, manager?: EntityManager) {
    return withOptionalManager(manager, this.addressesRepo.manager, async (manager) => {
      const repo = manager.getRepository(Address);

      const exists = await repo.existsBy({ id, user: { id: userId } });
      if (!exists) throw NotFoundException('address.notFound');

      await repo
        .createQueryBuilder()
        .update(Address)
        .set({ isDefault: () => `id = ${id}` })
        .where('user_id = :userId', { userId })
        .execute();

      return { success: true };
    });
  }

  async removeAddress(id: number, userId: number) {
    await this.addressesRepo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Address);

      const address = await this.getAddressOrFail(id, userId, manager);

      await repo.delete(address.id);
      if (!address.isDefault) return;

      const nextDefault = await repo.findOne({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
      });
      if (!nextDefault) return;

      nextDefault.isDefault = true;
      await repo.save(nextDefault);
    });

    return { deleted: true };
  }

  async getAddressOrFail(id: number, userId: number, manager?: EntityManager) {
    return withOptionalManager(manager, this.addressesRepo.manager, async (manager) => {
      const addressRepo = manager.getRepository(Address);

      const address = await addressRepo.findOne({
        where: { id, user: { id: userId } },
      });

      if (!address) throw NotFoundException('address.notFound');

      return address;
    });
  }

  private async ensureDefault(userId: number, manager?: EntityManager) {
    await withOptionalManager(manager, this.addressesRepo.manager, async (manager) => {
      const repo = manager.getRepository(Address);

      const hasDefault = await repo.existsBy({ user: { id: userId }, isDefault: true });
      if (hasDefault) return;

      const fallback = await repo.findOne({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
      });
      if (!fallback) return;

      await repo.update(fallback.id, { isDefault: true });
    });

    return { success: true };
  }

  private async resolveLocationUpdate(dto: UpdateAddressDTO, current: Address): Promise<BostaLocation> {
    if (dto.cityId && !dto.districtId) throw BadRequestException('address.districtRequiredOnCityChange');

    if (dto.districtId && !dto.cityId) {
      const district = await this.bostaService.getDistrict(dto.districtId, current.cityId);
      if (!district) throw BadRequestException('address.districtNotAvailableForCity');
    }

    return this.getAddressLocationData(dto.cityId ?? current.cityId, dto.districtId ?? current.districtId);
  }

  private async getAddressLocationData(cityId: string, districtId: string): Promise<BostaLocation> {
    const [city, district] = await Promise.all([
      this.bostaService.getCity(cityId),
      this.bostaService.getDistrict(districtId, cityId),
    ]);

    if (!city) throw BadRequestException('address.cityInvalid');
    if (!district) throw BadRequestException('address.districtInvalid');

    return {
      cityId: city._id,
      cityName: city.nameAr,
      cityDropOff: city.name,
      districtId: district.districtId,
      districtName: district.districtOtherName,
    };
  }
}
