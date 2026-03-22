import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';

import { Cart, User } from 'src/entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  async afterInsert(event: InsertEvent<User>) {
    const user = event.entity;

    if (!user) return;

    const cartRepo = event.manager.getRepository(Cart);
    const existingCart = await cartRepo.findOne({ where: { user: { id: user.id } } });

    if (existingCart) return;

    const cart = cartRepo.create({ user, items: [] });

    await cartRepo.save(cart);
  }
}
