import { Transaction } from '@/types';
import {FrontApi, LinkTokenModelApiResult} from '@meshconnect/node-api'


export async function getMeshLinkToken(transactionData: Transaction): Promise<LinkTokenModelApiResult> {
  try {
    const clientId = process.env.MESH_CLIENT_ID || '';
    const apiKey = process.env.MESH_API_KEY || ''
    const apiUrl = process.env.MESH_API_URL || ''
    console.log(clientId, apiKey, apiUrl)
    
    const api = new FrontApi({
        baseURL: apiUrl,
        headers: {
          'X-Client-Id': clientId,
          'X-Client-Secret': apiKey
        }
      })

    const response = await api.managedAccountAuthentication.v1LinktokenCreate({
        userId: transactionData.id,
        transferOptions: {
            amountInFiat: transactionData.amount,
            toAddresses: [
              {
                symbol: 'USDC', 
                address: '0x9Bf6207f8A3f4278E0C989527015deFe10e5D7c6', 
                networkId: '7436e9d0-ba42-4d2b-b4c0-8e4e606b2c12' 
              },
              {
                symbol: 'MATIC', 
                address: '0x9Bf6207f8A3f4278E0C989527015deFe10e5D7c6', 
                networkId: '7436e9d0-ba42-4d2b-b4c0-8e4e606b2c12' 
              },
            ]
          }
    })

    if (response.status !== 200) {
      throw new Error(`Mesh API responded with status: ${response.status}`);
    }

    return response.data
  } catch (error) {
    console.error('Mesh Connect API error:', error);
    throw new Error('Failed to fetch link token from Mesh Connect');
  }
}