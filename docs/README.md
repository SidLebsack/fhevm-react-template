# 📖 FHEVM Universal SDK - Complete Documentation

Welcome to the comprehensive documentation for the **FHEVM Universal SDK**.

## 📚 Documentation Index

### Getting Started
- **[Quick Start Guide](#quick-start-guide)** - Get up and running in 5 minutes
- **[Installation](#installation)** - Complete installation instructions
- **[Core Concepts](#core-concepts)** - Understanding FHEVM and the SDK

### API Reference
- **[API.md](./API.md)** - Complete API documentation
- **[Core SDK Functions](./API.md#core-functions)** - createFhevmClient, encrypt, decrypt
- **[React Hooks](./API.md#react-hooks)** - useEncrypt, useDecrypt, useContractCall
- **[Type Definitions](./API.md#types)** - TypeScript types and interfaces

### Examples & Guides
- **[EXAMPLES.md](./EXAMPLES.md)** - Code examples for all use cases
- **[Next.js Integration](./EXAMPLES.md#nextjs)** - Building with Next.js
- **[React Integration](./EXAMPLES.md#react)** - Building with React
- **[Node.js Scripts](./EXAMPLES.md#nodejs)** - Backend integration

### Migration & Advanced
- **[MIGRATION.md](./MIGRATION.md)** - Migrating from fhevm-react-template
- **[Advanced Usage](./ADVANCED.md)** - Advanced patterns and optimization
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions

---

## 🚀 Quick Start Guide

### 1. Installation

```bash
npm install @fhevm/sdk ethers
```

### 2. Core SDK Usage (Framework Agnostic)

```typescript
import { createFhevmClient, encryptInput, userDecrypt } from '@fhevm/sdk';

// Initialize client
const client = await createFhevmClient({
  provider: window.ethereum,
  network: 'sepolia',
  contractAddress: '0x...'
});

// Encrypt a value
const encrypted = await encryptInput(client, 42);

// Send to contract
const contract = new Contract(address, abi, signer);
await contract.recordData(encrypted.data, encrypted.inputProof);

// Decrypt value (with EIP-712 signature)
const result = await userDecrypt(client, encryptedHandle, contractAddress);
console.log('Decrypted value:', result.value);
```

### 3. React Integration

```tsx
import { FhevmProvider, useEncrypt, useDecrypt } from '@fhevm/sdk/react';

function App() {
  return (
    <FhevmProvider
      config={{
        provider: window.ethereum,
        network: 'sepolia',
        contractAddress: '0x...'
      }}
    >
      <YourApp />
    </FhevmProvider>
  );
}

function YourComponent() {
  const { encrypt, isEncrypting } = useEncrypt();
  const { decrypt, isDecrypting } = useDecrypt();

  const handleEncrypt = async () => {
    const encrypted = await encrypt(500);
    // Use encrypted.data in contract call
  };

  return (
    <button onClick={handleEncrypt} disabled={isEncrypting}>
      Encrypt Value
    </button>
  );
}
```

---

## 🎯 Core Concepts

### What is FHEVM?

**Fully Homomorphic Encryption for the EVM (FHEVM)** allows smart contracts to perform computations on encrypted data without ever decrypting it. This enables:

- 🔐 **Private data on public blockchain** - Store encrypted data on-chain
- 🧮 **Computation on encrypted data** - Perform calculations without decryption
- 🔑 **Selective disclosure** - Only authorized parties can decrypt results
- ⛓️ **Blockchain transparency** - All operations remain verifiable

### SDK Architecture

The FHEVM Universal SDK is built in layers:

```
┌──────────────────────────────────────┐
│ Your Application                      │
│ (React, Vue, Next.js, Node.js)       │
└──────────────────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│ Framework Adapters                    │
│ (React Hooks, Vue Composables)       │
└──────────────────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│ Core SDK (Framework Agnostic)        │
│ • Client Management                   │
│ • Encryption/Decryption              │
│ • Contract Interaction               │
└──────────────────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│ Underlying Libraries                  │
│ • fhevmjs (Zama)                     │
│ • ethers.js v6                       │
│ • EIP-712 signatures                 │
└──────────────────────────────────────┘
```

### Key Features

1. **Framework Agnostic** - Core SDK works everywhere
2. **Wagmi-like API** - Familiar hooks pattern for web3 developers
3. **Type Safe** - Full TypeScript support
4. **Developer Friendly** - Less than 10 lines to get started
5. **Production Ready** - Error handling, loading states, batch operations

---

## 📖 Detailed Documentation

### Core SDK

**[API.md](./API.md)** contains the complete API reference:
- `createFhevmClient()` - Client initialization
- `encryptInput()` - Encrypt values
- `encryptUint8/16/32/64()` - Type-specific encryption
- `encryptBool()` - Boolean encryption
- `userDecrypt()` - EIP-712 decryption
- `publicDecrypt()` - Public decryption
- `batchDecrypt()` - Batch operations

### React Hooks

**React-specific documentation:**
- `FhevmProvider` - Context provider
- `useFhevmClient()` - Access client
- `useEncrypt()` - Encryption hook
- `useDecrypt()` - Decryption hook
- `useContractCall()` - Contract interaction

### Code Examples

**[EXAMPLES.md](./EXAMPLES.md)** includes:
- Next.js integration examples
- React component examples
- Node.js backend scripts
- Vue composables (coming soon)
- Real-world use cases

### Migration Guide

**[MIGRATION.md](./MIGRATION.md)** helps you:
- Migrate from fhevm-react-template
- Upgrade from older versions
- Adopt best practices

---

## 🔗 External Resources

### Official Documentation
- **Zama fhEVM**: https://docs.zama.ai/fhevm
- **fhevmjs**: https://github.com/zama-ai/fhevmjs
- **Ethers.js v6**: https://docs.ethers.org/v6/

### Community
- **Zama Discord**: https://discord.com/invite/zama
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas

---

## 🆘 Getting Help

### Common Questions

**Q: How do I initialize the client?**
See [Quick Start Guide](#quick-start-guide)

**Q: How do I encrypt different types?**
See [API.md - Encryption](./API.md#encryption)

**Q: How do I use with Next.js?**
See [EXAMPLES.md - Next.js](./EXAMPLES.md#nextjs)

**Q: How do I handle errors?**
See [Troubleshooting](./TROUBLESHOOTING.md)

### Still Need Help?

1. Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Browse [Examples](./EXAMPLES.md)
3. Search [GitHub Issues](https://github.com/SidLebsack/fhevm-react-template/issues)
4. Ask in [Zama Discord](https://discord.com/invite/zama)

---

## 🤝 Contributing

Contributions are welcome! See the main [README](../README.md) for contribution guidelines.

---

## 📄 License

MIT License - See [LICENSE](../LICENSE) for details.

---

**🔗 Quick Navigation:** [Main README](../README.md) • [API Reference](./API.md) • [Examples](./EXAMPLES.md) • [Migration Guide](./MIGRATION.md)
