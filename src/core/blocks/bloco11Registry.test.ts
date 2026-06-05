import { describeBlockRegistry } from './blockRegistryTestFactory';
import {
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
  bloco11Items,
  summarizeBloco11,
} from './bloco11Registry';

describeBlockRegistry('Bloco 11 — Monetização Planos Premium', {
  items: bloco11Items,
  summarize: summarizeBloco11,
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
});
