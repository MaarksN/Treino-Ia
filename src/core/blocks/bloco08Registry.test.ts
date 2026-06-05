import { describeBlockRegistry } from './blockRegistryTestFactory';
import {
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
  bloco08Items,
  summarizeBloco08,
} from './bloco08Registry';

describeBlockRegistry('Bloco 08 — Periodização Científica Avançada', {
  items: bloco08Items,
  summarize: summarizeBloco08,
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
});
