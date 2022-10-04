interface Proof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol: string;
  curve: string;
}

export interface Groth16Proof {
  proof: Proof;
  publicSignals: string[];
}
