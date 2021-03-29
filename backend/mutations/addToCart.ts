import { KeystoneContext } from '@keystone-next/types';
import { CartItemCreateInput } from '../.keystone/schema-types';
import { Session } from '../types';

export default async function addToCart(
  root: any,
  { productId }: { productId: string },
  context: KeystoneContext
): Promise<CartItemCreateInput> {
  // query current user and see if logged in
  const sesh = context.session as Session;
  if (!sesh.itemId) {
    throw new Error('You must be logged in to do this');
  }
  // query current users cart
  const allCartItems = await context.lists.CartItem.findMany({
    where: { user: { id: sesh.itemId }, product: { id: productId } },
    resolveFields: 'id,quantity',
  });
  // is current item in cart already?
  const [existingCartItem] = allCartItems;
  if (existingCartItem) {
    console.log(`Already ${existingCartItem.quantity} in cart, increment by 1`);
    // if yes +1
    return context.lists.CartItem.updateOne({
      id: existingCartItem.id,
      data: { quantity: existingCartItem.quantity + 1 },
    });
  }
  // if not create new item
  return context.lists.CartItem.createOne({
    data: {
      product: { connect: { id: productId } },
      user: { connect: { id: sesh.itemId } },
    },
  });
}
