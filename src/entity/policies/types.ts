import { policyTypes } from './const';
import { Policy } from './policies.entity';

export type PolicyType = (typeof policyTypes)[number];
export type Policies = Record<PolicyType, Policy>;
