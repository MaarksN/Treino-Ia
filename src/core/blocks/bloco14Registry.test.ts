import { describeBlockRegistry } from './blockRegistryTestFactory';
import {
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
  bloco14Items,
  summarizeBloco14,
} from './bloco14Registry';

describeBlockRegistry('Bloco 14 — Sono Recuperação', {
  items: bloco14Items,
  summarize: summarizeBloco14,
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
});
