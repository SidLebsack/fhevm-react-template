/**
 * FHEVM Client - Core client for interacting with FHEVM
 */

import { BrowserProvider, JsonRpcProvider } from 'ethers';
import type { FhevmClient, FhevmConfig, NetworkConfig, SupportedNetwork, InitOptions } from './types';

/**
 * Network configurations
 */
const NETWORKS: Record<SupportedNetwork, NetworkConfig> = {
  sepolia: {
    name: 'sepolia',
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY',
    chainId: 11155111,
    gatewayUrl: 'https://gateway.zama.ai',
    aclAddress: '0x...'
  },
  localhost: {
    name: 'localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    chainId: 31337,
    gatewayUrl: undefined,
    aclAddress: undefined
  },
  'zama-devnet': {
    name: 'zama-devnet',
    rpcUrl: 'https://devnet.zama.ai',
    chainId: 8009,
    gatewayUrl: 'https://gateway.zama.ai',
    aclAddress: '0x...'
  }
};

/**
 * Create FHEVM client instance
 *
 * @example
 * ```typescript
 * const client = await createFhevmClient({
 *   provider: window.ethereum,
 *   network: 'sepolia',
 *   contractAddress: '0x...'
 * });
 * ```
 */
export async function createFhevmClient(
  config: FhevmConfig,
  options?: InitOptions
): Promise<FhevmClient> {
  // Get network configuration
  const networkConfig = NETWORKS[config.network];
  if (!networkConfig) {
    throw new Error(`Unsupported network: ${config.network}`);
  }

  // Create provider
  let provider: BrowserProvider | JsonRpcProvider;
  if (config.provider.request) {
    // Browser provider (MetaMask, etc.)
    provider = new BrowserProvider(config.provider);
  } else {
    // JSON-RPC provider
    provider = new JsonRpcProvider(networkConfig.rpcUrl);
  }

  // Get signer if available
  const signer = config.signer || (await provider.getSigner());

  // Initialize FHE instance (lazy load fhevmjs)
  let fheInstance: any = null;
  try {
    const { initFhevm, createInstance } = await import('fhevmjs');

    // Initialize FHEVM
    await initFhevm();

    // Create instance with ACL address
    const aclAddress = options?.aclAddress || config.contractAddress || networkConfig.aclAddress;
    if (!aclAddress) {
      throw new Error('ACL contract address is required');
    }

    fheInstance = await createInstance({
      chainId: networkConfig.chainId,
      publicKey: aclAddress,
      gatewayUrl: config.gatewayUrl || networkConfig.gatewayUrl
    });

    if (options?.debug) {
      console.log('[FHEVM SDK] Client initialized', {
        network: config.network,
        chainId: networkConfig.chainId,
        aclAddress
      });
    }
  } catch (error) {
    console.error('[FHEVM SDK] Failed to initialize FHE instance:', error);
    throw new Error(`Failed to initialize FHEVM: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    config,
    provider,
    signer,
    fheInstance,
    network: networkConfig,
    isInitialized: true
  };
}

/**
 * Get network configuration
 */
export function getNetworkConfig(network: SupportedNetwork): NetworkConfig {
  const config = NETWORKS[network];
  if (!config) {
    throw new Error(`Unsupported network: ${network}`);
  }
  return config;
}

/**
 * Check if client is initialized
 */
export function isClientInitialized(client: FhevmClient): boolean {
  return client.isInitialized && client.fheInstance !== null;
}

/**
 * Get signer from client
 */
export async function getSigner(client: FhevmClient) {
  if (client.signer) {
    return client.signer;
  }
  return await client.provider.getSigner();
}

/**
 * Get user address from client
 */
export async function getUserAddress(client: FhevmClient): Promise<string> {
  const signer = await getSigner(client);
  return await signer.getAddress();
}

/**
 * Switch network
 */
export async function switchNetwork(
  client: FhevmClient,
  network: SupportedNetwork
): Promise<FhevmClient> {
  return createFhevmClient({
    ...client.config,
    network
  });
}
