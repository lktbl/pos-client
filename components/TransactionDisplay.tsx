'use client';

import React, { useState, useEffect } from 'react';
import { ApiResponse, TransactionStatus } from '@/types';
import { Link } from '@meshconnect/web-link-sdk';

interface TransactionDisplayProps {
  transactionId: string;
}

export default function TransactionDisplay({ transactionId }: TransactionDisplayProps): React.ReactElement {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [linkConnection, setLinkConnection] = useState<Link | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [transferDone, setTransferDone] = useState<boolean>(false);

  const updateTransactionStatus = async (status: TransactionStatus) => {
    try {
      
      const response = await fetch('/api/transaction/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: transactionId,
          status: status
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Transaction updated:', result);
      return result.transaction;
    } catch (err) {
      console.error('Failed to update transaction:', err);
      throw err;
    } 
  };

  // Set isMounted to true once component mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Dynamically import the SDK only on the client side
  useEffect(() => {
    if (isMounted) {
      // Dynamically import the SDK
      import('@meshconnect/web-link-sdk')
        .then(({ createLink }) => {
          // Create link once SDK is loaded
          const link = createLink({
            onIntegrationConnected: authData => {
              console.info('[FRONT CONNECTED]', authData);
            },
            onExit: (error) => {
              if (error) {
                console.error(`[FRONT ERROR] ${error}`);
                
              }
            },
            onTransferFinished: transferData => {
              console.info('[FRONT TRANSFER FINISHED]', transferData);
              if (transferData.status === 'success'){
                updateTransactionStatus('Completed')
                    .then(updatedTransaction => {
                    console.log('Updated after completion:', updatedTransaction);
                    setTransferDone(true)
                    })
                    .catch(err => {
                    console.error('Failed to update status after completion:', err);
                    });
                }
            },
            onEvent: ev => {
              console.info('[FRONT Event]', ev);
            }
          });
          
          setLinkConnection(link);
        })
        .catch(err => {
          console.error('Failed to load Mesh Connect SDK:', err);
          setError('Failed to load integration SDK');
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  useEffect(() => {
    async function fetchData() {
      try {
        if (!transactionId) {
          setError('No transaction ID provided');
          return;
        }

        const response = await fetch(`/api/transaction?id=${transactionId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(result);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    }

    if (isMounted) {
      fetchData();
    }
  }, [transactionId, isMounted]);

  // Open link when both linkConnection and data are available
  useEffect(() => {
    if (linkConnection && data?.meshLinkData?.content?.linkToken) {
      linkConnection.openLink(data.meshLinkData.content.linkToken);
    }
  }, [linkConnection, data]);

  // Don't render anything meaningful during SSR
  if (!isMounted) {
    return renderSpinner();
  }

  // Show error if something went wrong
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-center">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (transferDone) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-green-500 text-center">
          <p>Transaction executed succesfully, you can close this window</p>
        </div>
      </div>
    );
  }

  // Show spinner while loading or waiting for Mesh popup
  return renderSpinner();

  // Helper function to render the spinner
  function renderSpinner() {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-200">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
        </div>
      </div>
    );
  }
}