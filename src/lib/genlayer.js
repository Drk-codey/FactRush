/**
 * GenLayer SDK Simulator
 * 
 * Since we cannot connect to a live GenLayer verification node in this local environment,
 * this simulator mimics the behavior of:
 * 1. Connecting to the Intelligent Contract (FactChecker.py)
 * 2. Triggering 'Optimistic Democracy' (simulating multiple validators)
 * 3. Handling the Consensus logic (Weighted voting)
 */

export class GenLayerSimulator {
  constructor() {
    this.validators = [
      { id: 'v1', name: 'Claude Sonnet (Validator)', bias: 'Strict' },
      { id: 'v2', name: 'GPT-4o (Validator)', bias: 'Nuanced' },
      { id: 'v3', name: 'Llama 3 (Validator)', bias: 'Speed' },
      { id: 'v4', name: 'Gemini Pro (Validator)', bias: 'Context' },
      { id: 'v5', name: 'Mistral Large (Validator)', bias: 'Technical' }
    ];
  }

  /**
   * Simulates the 'verify_claim' transaction on the Intelligent Contract
   * Returns a stream of events representing the consensus process.
   */
  async verifyClaim(claim, callback) {
    const numValidators = 3; // Initial quorum
    const activeValidators = this.validators.slice(0, numValidators); // Randomly select 3 in real life

    // Step 1: Initialize
    callback({ type: 'INIT', message: 'Initializing FactChecker Contract...', validators: activeValidators });
    await this._delay(400);

    // Step 2: Validators reading web/context (Simulated)
    const votes = [];

    for (const validator of activeValidators) {
      callback({ type: 'VALIDATOR_START', validatorId: validator.id, message: `${validator.name} is analyzing...` });
      const delay = 200 + Math.random() * 300; // MUCH FASTER
      await this._delay(delay);

      // Logic: Determine Verdict based on randomness guided by "truth" (simulated)
      // In a real app, we'd actually call an LLM API here per validator if we wanted to be fancy,
      // but for this game demo we generate a plausible outcome.
      const verdict = this._generateSimulatedVote(claim);
      votes.push({ ...verdict, validator });

      callback({ type: 'VOTE_CAST', validatorId: validator.id, vote: verdict, message: `${validator.name} voted ${verdict.status}` });
    }

    // Step 3: Consensus Calculation
    await this._delay(200);
    const finalVerdict = this._calculateConsensus(votes);

    callback({
      type: 'CONSENSUS_REACHED',
      result: finalVerdict,
      breakdown: votes,
      message: `Consensus Reached: ${finalVerdict.status} (${finalVerdict.confidence}% Agreement)`
    });

    return finalVerdict;
  }

  /**
   * EXPANDED CONSENSUS (Optimistic Democracy)
   * Triggered during Disputes. Adds more validators.
   */
  async expandConsensus(claim, originalVotes, callback) {
    const newValidators = this.validators.slice(3, 5); // Add remaining 2
    const allVotes = [...originalVotes];

    callback({ type: 'EXPAND', message: 'Dispute Triggered: Expanding Consensus to 5 Validators...' });
    await this._delay(1000);

    for (const validator of newValidators) {
      callback({ type: 'VALIDATOR_START', validatorId: validator.id, message: `${validator.name} (Appeals Court) analyzing...` });
      await this._delay(1500);

      // Often disputes might flip the result if it was close
      const verdict = this._generateSimulatedVote(claim, true); // true = isDispute
      allVotes.push({ ...verdict, validator });

      callback({ type: 'VOTE_CAST', validatorId: validator.id, vote: verdict, message: `${validator.name} cast tie-breaking vote.` });
    }

    const finalVerdict = this._calculateConsensus(allVotes);

    callback({
      type: 'FINAL_JUDGMENT',
      result: finalVerdict,
      breakdown: allVotes,
      message: `Final Judgment: ${finalVerdict.status}`
    });

    return finalVerdict;
  }

  _calculateConsensus(votes) {
    const counts = { VERIFIED: 0, FALSE: 0, UNCERTAIN: 0 };
    let reasonings = [];

    votes.forEach(v => {
      counts[v.status]++;
      reasonings.push(v.reasoning);
    });

    const total = votes.length;
    const winner = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    const confidence = Math.round((counts[winner] / total) * 100);

    return {
      status: winner,
      confidence: confidence,
      reasoning: reasonings[0], // Simplified: take first reasoning
      sources: votes[0].sources
    };
  }

  _generateSimulatedVote(claim, isDispute = false) {
    // Logic to make it feel real: Long text = more likely uncertain? Short = Verified/False?
    // This is pure simulation magic.
    const rand = Math.random();

    let status = 'VERIFIED';
    if (rand < 0.3) status = 'FALSE';
    else if (rand < 0.45) status = 'UNCERTAIN';

    if (isDispute && status === 'UNCERTAIN') status = 'VERIFIED'; // Tilt towards resolution in disputes

    return {
      status,
      reasoning: this._getReasoning(status, claim.content),
      sources: ['wikipedia.org', 'reuters.com']
    };
  }

  _getReasoning(status, content) {
    const snippet = content.substring(0, 15) + "...";
    switch (status) {
      case 'VERIFIED': return `Multiple primary sources confirm "${snippet}" is accurate. Dates and figures align with records.`;
      case 'FALSE': return `Consensus indicates "${snippet}" is factually incorrect based on 2024 reports.`;
      case 'UNCERTAIN': return `Context is missing for "${snippet}". Conflicting reports found in initial scan.`;
      default: return "Analysis pending.";
    }
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const genLayer = new GenLayerSimulator();
