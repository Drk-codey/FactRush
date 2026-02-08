const GENLAYER_CONFIG = {
  // GenLayer Studio typically runs on localhost:8545 or custom port
  rpcUrl: import.meta.env.VITE_GENLAYER_RPC_URL || 'http://localhost:8545',
  
  // Your deployed contract address (from GenLayer Studio)
  contractAddress: import.meta.env.VITE_GENLAYER_CONTRACT_ADDRESS || '',
  
  // Your account/wallet address in GenLayer Studio
  accountAddress: import.meta.env.VITE_GENLAYER_ACCOUNT_ADDRESS || '',
  
  // Number of validators in your dev setup
  validatorCount: parseInt(import.meta.env.VITE_GENLAYER_VALIDATORS || '3'),
};

// ============================================
// GENLAYER CLIENT CLASS
// ============================================

class GenLayerClient {
  constructor(config) {
    this.config = config;
    this.contractAddress = config.contractAddress;
    this.accountAddress = config.accountAddress;
    this.isConnected = false;
  }

  /**
   * Initialize connection to GenLayer
   */
  async connect() {
    try {
      console.log('🔌 Connecting to GenLayer...', this.config.rpcUrl);
      
      // Test connection
      const response = await fetch(this.config.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      });

      if (!response.ok) {
        throw new Error(`Connection failed: ${response.status}`);
      }

      this.isConnected = true;
      console.log('✅ Connected to GenLayer');
      return true;
    } catch (error) {
      console.error('❌ GenLayer connection error:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Submit a claim to the GenLayer contract
   */
  async submitClaim(claim) {
    if (!this.isConnected) {
      await this.connect();
    }

    if (!this.contractAddress) {
      throw new Error('Contract address not configured. Deploy contract in GenLayer Studio first.');
    }

    try {
      console.log('📤 Submitting claim to contract:', claim.id);

      // Call the contract's submit_claim method
      const response = await this._callContract('submit_claim', [
        claim.id,
        claim.content,
        claim.source_url || ''
      ]);

      console.log('✅ Claim submitted to contract:', response);
      return response;
    } catch (error) {
      console.error('❌ Submit claim error:', error);
      throw error;
    }
  }

  /**
   * Verify a claim using GenLayer's Optimistic Democracy
   */
  async verifyClaim(claimId, callback) {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      console.log('🔍 Starting verification for claim:', claimId);
      
      // Phase 1: Initialize
      callback({
        type: 'INIT',
        message: 'Connecting to GenLayer Intelligent Contract...',
        validators: this._getValidatorInfo()
      });

      await this._delay(500);

      // Phase 2: Call verify_claim on contract
      callback({
        type: 'VALIDATOR_START',
        message: 'Triggering consensus mechanism...'
      });

      const verificationResult = await this._callContract('verify_claim', [claimId]);

      // Phase 3: Process results from contract
      if (verificationResult.status === 'PENDING') {
        // Poll for consensus
        await this._pollForConsensus(claimId, callback);
      } else {
        // Already completed
        this._emitConsensusResult(verificationResult, callback);
      }

    } catch (error) {
      console.error('❌ Verification error:', error);
      callback({
        type: 'ERROR',
        message: error.message
      });
      throw error;
    }
  }

  /**
   * Poll for consensus result (GenLayer may take time for multi-validator consensus)
   */
  async _pollForConsensus(claimId, callback, attempts = 0) {
    const maxAttempts = 30; // 30 seconds max
    
    if (attempts >= maxAttempts) {
      throw new Error('Consensus timeout');
    }

    await this._delay(1000);

    try {
      const result = await this._callContract('get_claim', [claimId]);
      
      // Emit progress
      const progress = Math.min(95, (attempts / maxAttempts) * 100);
      callback({
        type: 'PROGRESS',
        progress,
        message: `Validators deliberating... (${attempts}s)`
      });

      if (result.status !== 'PENDING') {
        this._emitConsensusResult(result, callback);
        return result;
      }

      // Continue polling
      return await this._pollForConsensus(claimId, callback, attempts + 1);
    } catch (error) {
      console.error('Poll error:', error);
      return await this._pollForConsensus(claimId, callback, attempts + 1);
    }
  }

  /**
   * Emit consensus result to callback
   */
  _emitConsensusResult(result, callback) {
    // Map contract status to game status
    const verdict = result.status.toUpperCase(); // VERIFIED, FALSE, UNCERTAIN
    
    callback({
      type: 'CONSENSUS_REACHED',
      message: `Consensus reached: ${verdict}`,
      result: {
        status: verdict,
        confidence: result.votes ? this._calculateConfidence(result.votes) : 85,
        reasoning: result.reasoning || 'Consensus analysis complete.',
        sources: result.sources || []
      }
    });
  }

  /**
   * Calculate confidence from vote distribution
   */
  _calculateConfidence(votes) {
    const total = Object.values(votes).reduce((sum, v) => sum + v, 0);
    const max = Math.max(...Object.values(votes));
    return Math.round((max / total) * 100);
  }

  /**
   * Submit a dispute
   */
  async submitDispute(claimId, reasoning) {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      console.log('⚖️ Submitting dispute for claim:', claimId);

      const response = await this._callContract('dispute_claim', [
        claimId,
        reasoning
      ]);

      console.log('✅ Dispute submitted:', response);
      return response;
    } catch (error) {
      console.error('❌ Dispute error:', error);
      throw error;
    }
  }

  /**
   * Resolve a dispute (triggers expanded consensus)
   */
  async resolveDispute(disputeId, callback) {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      callback({
        type: 'EXPAND',
        message: 'Dispute triggered: Expanding validator set...'
      });

      await this._delay(1000);

      const resolution = await this._callContract('resolve_dispute', [disputeId]);

      callback({
        type: 'FINAL_JUDGMENT',
        result: resolution,
        message: `Final judgment: ${resolution.status}`
      });

      return resolution;
    } catch (error) {
      console.error('❌ Dispute resolution error:', error);
      throw error;
    }
  }

  /**
   * Generic contract call method
   */
  async _callContract(method, params = []) {
    try {
      const response = await fetch(this.config.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'gl_call', // GenLayer's RPC method
          params: [{
            to: this.contractAddress,
            from: this.accountAddress,
            data: this._encodeCall(method, params)
          }],
          id: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`RPC call failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Contract call failed');
      }

      return this._decodeResult(data.result);
    } catch (error) {
      console.error(`Contract call error (${method}):`, error);
      throw error;
    }
  }

  /**
   * Encode contract method call
   * This is simplified - actual encoding depends on GenLayer's ABI
   */
  _encodeCall(method, params) {
    // GenLayer uses Python contracts, so encoding might be different
    // Consult GenLayer docs for exact encoding
    return JSON.stringify({
      method: method,
      args: params
    });
  }

  /**
   * Decode contract result
   */
  _decodeResult(result) {
    try {
      return typeof result === 'string' ? JSON.parse(result) : result;
    } catch {
      return result;
    }
  }

  /**
   * Get validator information for display
   */
  _getValidatorInfo() {
    const validatorNames = [
      'Claude Sonnet',
      'GPT-4o',
      'Llama 3',
      'Gemini Pro',
      'Mistral Large'
    ];

    return Array.from({ length: this.config.validatorCount }, (_, i) => ({
      id: `v${i + 1}`,
      name: validatorNames[i] || `Validator ${i + 1}`,
      bias: ['Strict', 'Nuanced', 'Fast'][i % 3]
    }));
  }

  /**
   * Utility: Delay
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if GenLayer is in dev mode
   */
  isDevMode() {
    return this.config.rpcUrl.includes('localhost') || 
           this.config.rpcUrl.includes('127.0.0.1');
  }
}
