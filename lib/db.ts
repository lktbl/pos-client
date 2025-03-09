import { Transaction, TransactionStatus } from '@/types';
import sql from 'mssql';

// SQL Server configuration
const sqlConfig: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER || '',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true // change to false for production
  }
};

// Connect to the database
async function getConnection(): Promise<sql.ConnectionPool> {
  try {
    return await sql.connect(sqlConfig);
  } catch (err) {
    console.error('SQL Connection Error:', err);
    throw new Error('Failed to connect to the database');
  }
}

// Function to get transaction by ID
export async function getTransactionById(id: string): Promise<Transaction | null> {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.VarChar(36), id) // VARCHAR(36) for UUID/GUID format
      .query(`
        SELECT [id]
              ,[amount]
              ,[timestamp]
              ,[status]
              ,[created_at]
              ,[updated_at]
        FROM [dbo].[transactions]
        WHERE [id] = @id
      `);
    
    return result.recordset[0] || null;
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch transaction data');
  }
}

export async function updateTransactionStatus(id: string, status: TransactionStatus): Promise<Transaction | null> {
    try {
      // Get the current datetime for the updated_at timestamp
      const currentDateTime = new Date().toISOString();
      
      const pool = await getConnection();
      const result = await pool.request()
        .input('id', sql.VarChar(36), id)
        .input('status', sql.VarChar(20), status)
        .input('updated_at', sql.DateTime2(7), currentDateTime)
        .query(`
          UPDATE [dbo].[transactions]
          SET 
            [status] = @status,
            [updated_at] = @updated_at
          OUTPUT 
            INSERTED.[id],
            INSERTED.[amount],
            INSERTED.[timestamp],
            INSERTED.[status],
            INSERTED.[created_at],
            INSERTED.[updated_at]
          WHERE [id] = @id
        `);
      
      // If no rows were affected, the transaction wasn't found
      if (result.rowsAffected[0] === 0) {
        return null;
      }
      
      // Return the updated transaction
      return result.recordset[0];
    } catch (error) {
      console.error('Database error updating transaction:', error);
      throw new Error('Failed to update transaction status');
    }
  }