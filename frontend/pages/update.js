import UpdateProduct from '../components/UpdateProduct';

export default function update({ query }) {
  console.log(query);
  return (
    <>
      <UpdateProduct id={query.id} />
    </>
  );
}
