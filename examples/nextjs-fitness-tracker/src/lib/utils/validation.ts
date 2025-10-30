/**
 * Validation utilities for FHE operations
 */

/**
 * Validate contract address format
 */
export function validateContractAddress(address: string): {
  valid: boolean;
  error?: string;
} {
  if (!address) {
    return { valid: false, error: 'Contract address is required' };
  }

  if (!address.startsWith('0x')) {
    return { valid: false, error: 'Contract address must start with 0x' };
  }

  if (address.length !== 42) {
    return { valid: false, error: 'Contract address must be 42 characters long' };
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return { valid: false, error: 'Contract address contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Validate network name
 */
export function validateNetwork(network: string): {
  valid: boolean;
  error?: string;
} {
  const supportedNetworks = ['sepolia', 'localhost', 'zama-devnet'];

  if (!supportedNetworks.includes(network.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported network. Supported: ${supportedNetworks.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Validate encrypted data format
 */
export function validateEncryptedData(data: string): {
  valid: boolean;
  error?: string;
} {
  if (!data) {
    return { valid: false, error: 'Encrypted data is required' };
  }

  if (!data.startsWith('0x')) {
    return { valid: false, error: 'Encrypted data must start with 0x' };
  }

  if (data.length < 10) {
    return { valid: false, error: 'Encrypted data is too short' };
  }

  return { valid: true };
}

/**
 * Validate function name for contract calls
 */
export function validateFunctionName(functionName: string): {
  valid: boolean;
  error?: string;
} {
  if (!functionName) {
    return { valid: false, error: 'Function name is required' };
  }

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(functionName)) {
    return {
      valid: false,
      error: 'Function name contains invalid characters'
    };
  }

  return { valid: true };
}

/**
 * Validate array of arguments
 */
export function validateArgs(args: any[]): {
  valid: boolean;
  error?: string;
} {
  if (!Array.isArray(args)) {
    return { valid: false, error: 'Arguments must be an array' };
  }

  return { valid: true };
}

/**
 * Comprehensive validation for contract call parameters
 */
export interface ContractCallParams {
  contractAddress: string;
  functionName: string;
  args?: any[];
  network?: string;
}

export function validateContractCall(params: ContractCallParams): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const addressValidation = validateContractAddress(params.contractAddress);
  if (!addressValidation.valid) {
    errors.push(addressValidation.error!);
  }

  const functionValidation = validateFunctionName(params.functionName);
  if (!functionValidation.valid) {
    errors.push(functionValidation.error!);
  }

  if (params.args) {
    const argsValidation = validateArgs(params.args);
    if (!argsValidation.valid) {
      errors.push(argsValidation.error!);
    }
  }

  if (params.network) {
    const networkValidation = validateNetwork(params.network);
    if (!networkValidation.valid) {
      errors.push(networkValidation.error!);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
