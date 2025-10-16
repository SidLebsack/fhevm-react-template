# 🚀 Advanced Usage

Advanced patterns, optimization strategies, and production deployment considerations for the FHEVM Universal SDK.

---

## Table of Contents

- [Custom Network Configuration](#custom-network-configuration)
- [Advanced Encryption Patterns](#advanced-encryption-patterns)
- [Batch Operations Optimization](#batch-operations-optimization)
- [Custom Gateway Configuration](#custom-gateway-configuration)
- [Performance Tuning](#performance-tuning)
- [Production Deployment](#production-deployment)
- [Security Best Practices](#security-best-practices)
- [Testing Strategies](#testing-strategies)
- [Monitoring and Analytics](#monitoring-and-analytics)

---

## Custom Network Configuration

### Adding Custom Networks

The SDK supports custom network configurations beyond the built-in networks (Sepolia, localhost, Zama DevNet).

**Define custom network:**

```typescript
import { createFhevmClient } from '@fhevm/sdk';
import type { FhevmConfig } from '@fhevm/sdk';

// Custom network configuration
const customNetworkConfig: FhevmConfig = {
  provider: window.ethereum,
  network: 'sepolia', // Base network
  contractAddress: '0x...',
  gatewayUrl: 'https://custom-gateway.example.com',
  signer: customSigner,
};

const client = await createFhevmClient(customNetworkConfig, {
  aclAddress: '0x...', // Custom ACL contract
  cache: true,
  debug: true,
});
```

### Multi-Network Support

**Switch between networks dynamically:**

```typescript
import { useState, useEffect } from 'react';
import { createFhevmClient } from '@fhevm/sdk';
import type { SupportedNetwork } from '@fhevm/sdk';

function useMultiNetwork() {
  const [network, setNetwork] = useState<SupportedNetwork>('sepolia');
  const [client, setClient] = useState(null);

  useEffect(() => {
    const initClient = async () => {
      const newClient = await createFhevmClient({
        provider: window.ethereum,
        network,
        contractAddress: process.env[`CONTRACT_${network.toUpperCase()}`],
      });
      setClient(newClient);
    };

    initClient();
  }, [network]);

  return { client, network, setNetwork };
}

// Usage
function App() {
  const { client, network, setNetwork } = useMultiNetwork();

  return (
    <div>
      <select value={network} onChange={(e) => setNetwork(e.target.value)}>
        <option value="sepolia">Sepolia</option>
        <option value="localhost">Localhost</option>
        <option value="zama-devnet">Zama DevNet</option>
      </select>
    </div>
  );
}
```

### Custom RPC Providers

**Use dedicated RPC endpoints:**

```typescript
import { JsonRpcProvider } from 'ethers';

// Infura
const infuraProvider = new JsonRpcProvider(
  `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
);

// Alchemy
const alchemyProvider = new JsonRpcProvider(
  `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
);

// Quicknode
const quicknodeProvider = new JsonRpcProvider(
  `https://example.sepolia.quiknode.pro/${process.env.QUICKNODE_KEY}/`
);

const client = await createFhevmClient({
  provider: infuraProvider,
  network: 'sepolia',
  contractAddress: '0x...',
});
```

---

## Advanced Encryption Patterns

### Dynamic Type Selection

**Auto-select optimal encryption type:**

```typescript
import { encryptInput } from '@fhevm/sdk';

function getOptimalType(value: number): 'euint8' | 'euint16' | 'euint32' | 'euint64' {
  if (value <= 255) return 'euint8';
  if (value <= 65535) return 'euint16';
  if (value <= 4294967295) return 'euint32';
  return 'euint64';
}

async function smartEncrypt(client, value: number) {
  const type = getOptimalType(value);
  console.log(`Encrypting ${value} as ${type}`);

  return await encryptInput(client, value);
}
```

### Parallel Encryption

**Encrypt multiple values concurrently:**

```typescript
import { encryptInput } from '@fhevm/sdk';

async function parallelEncrypt(client, values: number[]) {
  const promises = values.map(value =>
    encryptInput(client, value, { generateProof: true })
  );

  const results = await Promise.all(promises);
  return results;
}

// Usage
const [enc1, enc2, enc3] = await parallelEncrypt(client, [100, 200, 300]);
```

### Conditional Encryption

**Encrypt based on conditions:**

```typescript
interface DataToEncrypt {
  value: number;
  shouldEncrypt: boolean;
  type?: 'euint8' | 'euint16' | 'euint32';
}

async function conditionalEncrypt(
  client,
  data: DataToEncrypt[]
) {
  const results = await Promise.all(
    data.map(async ({ value, shouldEncrypt, type }) => {
      if (!shouldEncrypt) {
        return { data: value.toString(), encrypted: false };
      }

      const encrypted = type
        ? await (type === 'euint8'
            ? encryptUint8(client, value)
            : type === 'euint16'
            ? encryptUint16(client, value)
            : encryptUint32(client, value))
        : await encryptInput(client, value);

      return { ...encrypted, encrypted: true };
    })
  );

  return results;
}
```

---

## Batch Operations Optimization

### Efficient Batch Encryption

**Optimize batch operations with chunking:**

```typescript
import { batchEncrypt } from '@fhevm/sdk';

async function chunkedBatchEncrypt(
  client,
  values: Array<{ value: number; type?: string }>,
  chunkSize = 10
) {
  const chunks = [];
  for (let i = 0; i < values.length; i += chunkSize) {
    chunks.push(values.slice(i, i + chunkSize));
  }

  const results = [];
  for (const chunk of chunks) {
    const encrypted = await batchEncrypt(client, chunk);
    results.push(...encrypted);

    // Optional: Add delay between chunks to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

// Usage
const data = Array.from({ length: 100 }, (_, i) => ({
  value: i * 10,
  type: 'euint16'
}));

const encrypted = await chunkedBatchEncrypt(client, data, 20);
```

### Batch Decryption with Retry

**Handle batch decryption failures gracefully:**

```typescript
import { batchDecrypt, retry } from '@fhevm/sdk';

async function robustBatchDecrypt(
  client,
  handles: string[],
  contractAddress: string,
  userAddress: string
) {
  return await retry(
    async () => {
      const results = await batchDecrypt(client, {
        contractAddress,
        handles,
        userAddress,
      });

      // Verify all successful
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        console.warn(`${failed.length} decryptions failed, retrying...`);
        throw new Error('Some decryptions failed');
      }

      return results;
    },
    5, // max retries
    2000 // base delay
  );
}
```

### Lazy Batch Loading

**Load and decrypt data in batches on-demand:**

```typescript
import { useState, useEffect } from 'react';
import { batchDecrypt } from '@fhevm/sdk';

function useLazyBatchDecrypt(
  client,
  handles: string[],
  contractAddress: string,
  batchSize = 10
) {
  const [decrypted, setDecrypted] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(0);

  const loadNextBatch = async () => {
    if (loading || currentBatch * batchSize >= handles.length) return;

    setLoading(true);

    const start = currentBatch * batchSize;
    const end = Math.min(start + batchSize, handles.length);
    const batchHandles = handles.slice(start, end);

    try {
      const results = await batchDecrypt(client, {
        contractAddress,
        handles: batchHandles,
        userAddress: client.signer.address,
      });

      setDecrypted(prev => [...prev, ...results]);
      setCurrentBatch(prev => prev + 1);
    } catch (error) {
      console.error('Batch decryption failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return { decrypted, loading, loadNextBatch, hasMore: currentBatch * batchSize < handles.length };
}

// Usage in component
function DataList({ handles }) {
  const { client } = useFhevmClient();
  const { decrypted, loading, loadNextBatch, hasMore } = useLazyBatchDecrypt(
    client,
    handles,
    contractAddress
  );

  return (
    <div>
      {decrypted.map((item, i) => (
        <div key={i}>{item.value}</div>
      ))}
      {hasMore && (
        <button onClick={loadNextBatch} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

---

## Custom Gateway Configuration

### Fallback Gateway Strategy

**Implement gateway failover:**

```typescript
async function createClientWithFallback(config: FhevmConfig) {
  const gateways = [
    'https://gateway1.example.com',
    'https://gateway2.example.com',
    'https://gateway3.example.com',
  ];

  for (const gateway of gateways) {
    try {
      const client = await createFhevmClient({
        ...config,
        gatewayUrl: gateway,
      }, {
        debug: true,
      });

      // Test gateway
      await client.fheInstance.createEncryptedInput(
        config.contractAddress,
        client.signer.address
      );

      console.log(`✅ Connected to gateway: ${gateway}`);
      return client;
    } catch (error) {
      console.warn(`❌ Gateway ${gateway} failed, trying next...`);
    }
  }

  throw new Error('All gateways failed');
}
```

### Custom Gateway Health Check

**Monitor gateway health:**

```typescript
async function checkGatewayHealth(gatewayUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${gatewayUrl}/health`, {
      method: 'GET',
      timeout: 5000,
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

// Use healthiest gateway
async function selectBestGateway(gateways: string[]) {
  const healthChecks = await Promise.all(
    gateways.map(async (url) => ({
      url,
      healthy: await checkGatewayHealth(url),
    }))
  );

  const healthy = healthChecks.filter(g => g.healthy);

  if (healthy.length === 0) {
    throw new Error('No healthy gateways available');
  }

  return healthy[0].url;
}
```

---

## Performance Tuning

### Client Caching

**Cache client instances:**

```typescript
class FhevmClientCache {
  private static instance: FhevmClient | null = null;
  private static config: string | null = null;

  static async getClient(config: FhevmConfig): Promise<FhevmClient> {
    const configHash = JSON.stringify(config);

    if (this.instance && this.config === configHash) {
      return this.instance;
    }

    this.instance = await createFhevmClient(config, { cache: true });
    this.config = configHash;

    return this.instance;
  }

  static clearCache() {
    this.instance = null;
    this.config = null;
  }
}

// Usage
const client = await FhevmClientCache.getClient(config);
```

### Memoization

**Memoize encryption results:**

```typescript
import { useMemo } from 'react';

function useEncryptedValue(client, value: number) {
  return useMemo(() => {
    if (!client) return null;
    return encryptInput(client, value);
  }, [client, value]);
}

// Usage
const encryptedCalories = useEncryptedValue(client, 500);
```

### Debounced Encryption

**Debounce encryption for user inputs:**

```typescript
import { useState, useEffect } from 'react';
import { useEncrypt } from '@fhevm/sdk/react';

function useDebouncedEncrypt(value: number, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const { encrypt, isEncrypting } = useEncrypt();
  const [encrypted, setEncrypted] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  useEffect(() => {
    if (debouncedValue) {
      encrypt(debouncedValue).then(setEncrypted);
    }
  }, [debouncedValue, encrypt]);

  return { encrypted, isEncrypting };
}

// Usage
function InputComponent() {
  const [calories, setCalories] = useState(0);
  const { encrypted, isEncrypting } = useDebouncedEncrypt(calories);

  return (
    <input
      type="number"
      value={calories}
      onChange={(e) => setCalories(Number(e.target.value))}
    />
  );
}
```

---

## Production Deployment

### Environment Configuration

**Proper environment setup:**

```bash
# .env.production
NEXT_PUBLIC_CONTRACT_ADDRESS=0x6Bbf52494089ce94859414D82d03f7c8a4cF1844
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_GATEWAY_URL=https://gateway.zama.ai
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_ENABLE_DEBUG=false
```

**Configuration validation:**

```typescript
function validateConfig() {
  const required = [
    'NEXT_PUBLIC_CONTRACT_ADDRESS',
    'NEXT_PUBLIC_NETWORK',
  ];

  const missing = required.filter(
    key => !process.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

validateConfig();
```

### Error Boundaries

**Graceful error handling:**

```tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class FhevmErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FHEVM Error:', error, errorInfo);

    // Log to error tracking service
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<FhevmErrorBoundary>
  <FhevmProvider config={...}>
    <App />
  </FhevmProvider>
</FhevmErrorBoundary>
```

### Production Monitoring

**Track SDK performance:**

```typescript
class FhevmMonitor {
  private static metrics: Map<string, number[]> = new Map();

  static trackOperation(name: string, duration: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name)!.push(duration);

    // Send to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'fhevm_operation', {
        operation: name,
        duration,
      });
    }
  }

  static getAverageDuration(name: string): number {
    const durations = this.metrics.get(name) || [];
    if (durations.length === 0) return 0;

    return durations.reduce((a, b) => a + b, 0) / durations.length;
  }
}

// Wrapper for tracked encryption
async function trackedEncrypt(client, value: number) {
  const start = performance.now();

  try {
    const result = await encryptInput(client, value);
    const duration = performance.now() - start;

    FhevmMonitor.trackOperation('encrypt', duration);

    return result;
  } catch (error) {
    FhevmMonitor.trackOperation('encrypt_error', 1);
    throw error;
  }
}
```

---

## Security Best Practices

### Input Validation

**Validate before encryption:**

```typescript
function validateInput(value: number, type: string): void {
  const ranges = {
    euint8: [0, 255],
    euint16: [0, 65535],
    euint32: [0, 4294967295],
    euint64: [0, Number.MAX_SAFE_INTEGER],
  };

  const [min, max] = ranges[type] || [0, Number.MAX_SAFE_INTEGER];

  if (value < min || value > max) {
    throw new Error(`Value ${value} out of range for ${type} [${min}, ${max}]`);
  }

  if (!Number.isInteger(value)) {
    throw new Error('Value must be an integer');
  }
}

async function safeEncrypt(client, value: number, type: string) {
  validateInput(value, type);
  return await encryptInput(client, value);
}
```

### Rate Limiting

**Implement client-side rate limiting:**

```typescript
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private running = 0;
  private maxConcurrent = 3;
  private minDelay = 1000;
  private lastRun = 0;

  async run<T>(fn: () => Promise<T>): Promise<T> {
    while (this.running >= this.maxConcurrent) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const now = Date.now();
    const timeSinceLastRun = now - this.lastRun;

    if (timeSinceLastRun < this.minDelay) {
      await new Promise(resolve =>
        setTimeout(resolve, this.minDelay - timeSinceLastRun)
      );
    }

    this.running++;
    this.lastRun = Date.now();

    try {
      return await fn();
    } finally {
      this.running--;
    }
  }
}

const limiter = new RateLimiter();

// Usage
const encrypted = await limiter.run(() =>
  encryptInput(client, value)
);
```

### Secure Storage

**Never store sensitive data:**

```typescript
// ❌ WRONG - Don't store decrypted values
localStorage.setItem('decryptedValue', result.value.toString());

// ✅ CORRECT - Store encrypted handles only
localStorage.setItem('encryptedHandle', handle);

// ✅ CORRECT - Decrypt on-demand
const handle = localStorage.getItem('encryptedHandle');
const result = await userDecrypt(client, handle, contractAddress);
```

---

## Testing Strategies

### Mock Client for Testing

```typescript
// __mocks__/@fhevm/sdk.ts
export const createFhevmClient = jest.fn().mockResolvedValue({
  config: {},
  provider: {},
  signer: {},
  fheInstance: {
    encrypt: jest.fn().mockResolvedValue({
      data: '0xencrypted',
      handles: [],
    }),
  },
  network: { chainId: 11155111 },
  isInitialized: true,
});

export const encryptInput = jest.fn().mockResolvedValue({
  data: '0xencrypted',
  type: 'euint8',
});

export const userDecrypt = jest.fn().mockResolvedValue({
  value: 42,
  success: true,
  type: 'euint8',
});
```

### Integration Testing

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { FhevmProvider } from '@fhevm/sdk/react';
import MyComponent from './MyComponent';

test('encrypts and submits value', async () => {
  render(
    <FhevmProvider config={testConfig}>
      <MyComponent />
    </FhevmProvider>
  );

  const input = screen.getByPlaceholderText('Enter calories');
  fireEvent.change(input, { target: { value: '500' } });

  const button = screen.getByText('Submit');
  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });
});
```

---

**🔗 Navigation:** [Main Docs](./README.md) • [API Reference](./API.md) • [Examples](./EXAMPLES.md) • [Troubleshooting](./TROUBLESHOOTING.md)
