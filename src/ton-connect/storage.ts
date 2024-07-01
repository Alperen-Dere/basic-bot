import { IStorage } from '@tonconnect/sdk';
import { createClient } from 'redis';

const client = createClient({ url: process.env.REDIS_URL });

client.on('error', err => console.log('Redis Client Error', err));

export async function initRedisClient(): Promise<void> {
    await client.connect();
}

// New interface that extends IStorage
export interface ITonConnectStorage extends IStorage {
    incrementWalletConnectionCount(): Promise<number>;
    getWalletConnectionCount(): Promise<number | null>;
}

export class TonConnectStorage implements IStorage {
    constructor(private readonly chatId: number) {}

    private getKey(key: string): string {
        return this.chatId.toString() + key;
    }

    async removeItem(key: string): Promise<void> {
        await client.del(this.getKey(key));
    }

    async setItem(key: string, value: string): Promise<void> {
        await client.set(this.getKey(key), value);
    }

    async getItem(key: string): Promise<string | null> {
        return (await client.get(this.getKey(key))) || null;
    }

   
    async incrementWalletConnectionCount(): Promise<number> {
        return await client.incr('wallet_connection_count');
    }

    async getWalletConnectionCount(): Promise<number | null> {
        const count = await client.get('wallet_connection_count');
        return count ? parseInt(count) : null;
    }

    async decrementWalletConnectionCount(): Promise<number> {
        return await client.decr('wallet_connection_count');
    }
}
