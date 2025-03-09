import { Metadata } from 'next';
import TransactionDisplay from '@/components/TransactionDisplay';

export const metadata: Metadata = {
  title: 'Transaction Viewer with Mesh Connect',
  description: 'View transaction details and connect with Mesh',
};

interface HomeProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function Home({ searchParams }: HomeProps): React.ReactElement {
  const transactionId = typeof searchParams.id === 'string' ? searchParams.id : '';
  
  return (
    <main className="min-h-screen">
      <TransactionDisplay transactionId={transactionId} />
    </main>
  );
}