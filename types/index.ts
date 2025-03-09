import { LinkTokenModelApiResult } from "@meshconnect/node-api";

export interface Transaction {
    id: string;
    amount: number;
    timestamp: string;
    status: TransactionStatus;
    created_at: string;
    updated_at: string;
  }
  
  export interface MeshLinkResponse {
    link_token: string;
    expiration: string;
    request_id: string;
  }
  
  export interface ApiResponse {
    transaction: Transaction;
    meshLinkData: LinkTokenModelApiResult;
  }

  export type TransactionStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded'