import { NextRequest, NextResponse } from 'next/server';
import { getTransactionById } from '@/lib/db';
import { getMeshLinkToken } from '@/lib/meshApi';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get the transaction ID from the URL query parameters
    const { searchParams } = new URL(request.url);
    const transactionIdParam = searchParams.get('id');

    if (!transactionIdParam) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Since ID is a string (varchar), we don't need to parse it to a number
    const transactionId = transactionIdParam;
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID must be a valid string' },
        { status: 400 }
      );
    }

    // Fetch transaction data from the database
    const transactionData = await getTransactionById(transactionId);

    if (!transactionData) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Fetch link token from Mesh Connect API using transaction data
    const meshData = await getMeshLinkToken(transactionData);

    if (transactionData.status !== 'Pending') {
        return NextResponse.json(
          { error: 'Transaction ID is invalid' },
          { status: 400 }
        );
      }

    // Return combined data to the frontend
    const responseData: ApiResponse = {
      transaction: transactionData,
      meshLinkData: meshData
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('API route error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to process request', message: errorMessage },
      { status: 500 }
    );
  }
}