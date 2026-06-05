import { describeBlockRegistry } from './blockRegistryTestFactory';
import {
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
  bloco09Items,
  summarizeBloco09,
} from './bloco09Registry';

describeBlockRegistry('Bloco 09 — Monetização Premium Paywall Inteligente', {
  items: bloco09Items,
  summarize: summarizeBloco09,
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
});
