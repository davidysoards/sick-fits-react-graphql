import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import Head from 'next/head';
import DisplayError from '../../components/ErrorMessage';
import OrderStyles from '../../components/styles/OrderStyles';
import formatMoney from '../../lib/formatMoney';

const SINGLE_ORDER_QUERY = gql`
  query SINGLE_ORDER_QUERY($id: ID!) {
    Order(where: { id: $id }) {
      id
      total
      items {
        description
        id
        price
        quantity
        photo {
          image {
            publicUrlTransformed
          }
        }
      }
      user {
        id
        name
      }
      charge
    }
  }
`;

export default function SingleOrder({ query }) {
  const { data, loading, error } = useQuery(SINGLE_ORDER_QUERY, {
    variables: {
      id: query.id,
    },
  });
  if (loading) return <p>Loading...</p>;
  if (error) return <DisplayError error={error} />;
  const { Order } = data;
  return (
    <OrderStyles>
      <Head>
        <title>Sick Fits | {Order.id}</title>
      </Head>
      <p>
        <span>Order ID: </span>
        <span>{Order.id}</span>
      </p>
      <p>
        <span>Charge: </span>
        <span>{Order.charge}</span>
      </p>
      <p>
        <span>Order Total: </span>
        <span>{formatMoney(Order.total)}</span>
      </p>
      <p>
        <span>Item Count: </span>
        <span>{Order.items.length}</span>
      </p>
      <div className="items">
        {Order.items.map((item) => (
          <div className="order-item" key={item.id}>
            <img src={item.photo.image.publicUrlTransformed} alt={item.title} />
            <div className="item-details">
              <h2>{item.name}</h2>
              <p>{item.quantity}</p>
              <p>Each: {formatMoney(item.price)}</p>
              <p>Sub Total: {formatMoney(item.price * item.quantity)}</p>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </OrderStyles>
  );
}
