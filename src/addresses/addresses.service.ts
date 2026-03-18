import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Address, User } from 'src/entity';

import { CreateAddressDTO, UpdateAddressDTO } from './dtos';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address) private addressesRepo: Repository<Address>,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async getAddresses(userId: number) {
    return this.addressesRepo.find({
      where: { user: { id: userId } },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
      relations: { user: false },
    });
  }

  async addAddress(userId: number, createDTO: CreateAddressDTO) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const addressesCount = await this.addressesRepo.count({
      where: { user: { id: userId } },
    });

    const address = this.addressesRepo.create({
      ...createDTO,
      isDefault: addressesCount === 0,
      user,
    });

    return this.addressesRepo.save(address);
  }

  async updateAddress(id: number, userId: number, updateDTO: UpdateAddressDTO) {
    return this.addressesRepo.manager.transaction(async (manager) => {
      const addressRepo = manager.getRepository(Address);
      const address = await addressRepo.findOne({
        where: { id, user: { id: userId } },
      });

      if (!address) throw new NotFoundException('Address not found');

      Object.assign(address, updateDTO);

      const updatedAddress = await addressRepo.save(address);
      await this.ensureDefaultAddress(userId, addressRepo);

      return updatedAddress;
    });
  }

  async setDefaultAddress(id: number, userId: number) {
    const address = await this.addressesRepo.findOne({
      where: { id: id, user: { id: userId } },
    });

    if (!address) throw new NotFoundException('Address not found');

    await this.addressesRepo.manager.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .update(Address)
        .set({ isDefault: false })
        .where('userId = :userId', { userId })
        .execute();

      await manager
        .createQueryBuilder()
        .update(Address)
        .set({ isDefault: true })
        .where('id = :id AND userId = :userId', { id, userId })
        .execute();
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

  private async ensureDefaultAddress(
    userId: number,
    addressRepo: Repository<Address>,
  ) {
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
}
