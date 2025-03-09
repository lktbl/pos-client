import { Metadata } from 'next';
import TransactionDisplay from '@/components/TransactionDisplay';

export const metadata: Metadata = {
  title: 'Pay with crypto - powered by Mesh',
  description: 'Pay with crypto - powered by Mesh',
};

// Define the proper types with Promise wrappers
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Params = Promise<{}>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function Home(props: {
  params: Params;
  searchParams: SearchParams;
}): Promise<React.ReactElement> {
  // Await the promises to get the actual values
  const searchParams = await props.searchParams;
  
  // Extract the ID from searchParams
  const transactionId = typeof searchParams.id === 'string' ? searchParams.id : '';
  
  return (
    <main className="min-h-screen">
      <TransactionDisplay transactionId={transactionId} />
    </main>
  );
}