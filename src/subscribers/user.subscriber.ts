import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';

import { Cart } from 'src/cart/entities/cart.entity';
import { User } from 'src/users/entities/user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  async afterInsert(event: InsertEvent<User>) {
    const user = event.entity;

    if (!user) return;

    const cartRepo = event.manager.getRepository(Cart);

    const cart = cartRepo.create({ user: { id: user.id }, items: [] });

    await cartRepo.save(cart);
  }
}
