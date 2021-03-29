import { KeystoneContext } from '@keystone-next/types';
import {
  CartItemCreateInput,
  OrderCreateInput,
} from '../.keystone/schema-types';
import stripeConfig from '../lib/stripe';

const graphql = String.raw;
interface Arguments {
  token: string;
}

export default async function checkout(
  root: any,
  { token }: Arguments,
  context: KeystoneContext
): Promise<OrderCreateInput> {
  // make sure they are signed in
  const userId = context.session.itemId;
  if (!userId) {
    throw new Error('Sorry, you must be signed in to create an order.');
  }
  // query the current user
  const user = await context.lists.User.findOne({
    where: { id: userId },
    resolveFields: graphql`
      id
      name
      email
      cart {
        id
        quantity
        product {
          name
          price
          description
          id
          photo {
            id
            image {
              id
              publicUrlTransformed
            }
          }
        }
      }
    `,
  });
  console.dir(user, { depth: null }); // don't truncate any logged objects
  // calc total price for order
  const cartItems = user.cart.filter((item) => item.product); // if product has been deleted it will be null
  const amount = cartItems.reduce(function (
    tally: number,
    item: CartItemCreateInput
  ) {
    return tally + item.quantity * item.product.price;
  },
  0);
  // create charge with stripe library
  const charge = await stripeConfig.paymentIntents
    .create({
      amount,
      currency: 'USD',
      confirm: true,
      payment_method: token,
    })
    .catch((err) => {
      console.log(err);
      throw new Error(err.message);
    });
  console.log(charge);
  // convert CartItems to OrderItems
  const orderItems = cartItems.map((item) => ({
    name: item.product.name,
    description: item.product.description,
    price: item.product.price,
    quantity: item.quantity,
    photo: { connect: { id: item.product.photo.id } },
  }));
  // create order and return it
  const order = await context.lists.Order.createOne({
    data: {
      total: charge.amount,
      charge: charge.id,
      items: { create: orderItems },
      user: { connect: { id: userId } },
    },
  });
  // clean up old cart items
  const cartItemIds = user.cart.map((item) => item.id);
  await context.lists.CartItem.deleteMany({
    ids: cartItemIds,
  });
  return order;
}
