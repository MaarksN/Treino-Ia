import { describeBlockRegistry } from './blockRegistryTestFactory';
import {
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
  bloco10Items,
  summarizeBloco10,
} from './bloco10Registry';

describeBlockRegistry('Bloco 10 — Gamificação Profunda Retenção', {
  items: bloco10Items,
  summarize: summarizeBloco10,
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
});
