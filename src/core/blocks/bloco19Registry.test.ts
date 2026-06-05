import { describeBlockRegistry } from './blockRegistryTestFactory';
import {
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
  bloco19Items,
  summarizeBloco19,
} from './bloco19Registry';

describeBlockRegistry('Bloco 19 — Personalização Avançada IA', {
  items: bloco19Items,
  summarize: summarizeBloco19,
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
});
