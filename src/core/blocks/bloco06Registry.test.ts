import { describeBlockRegistry } from './blockRegistryTestFactory';
import {
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
  bloco06Items,
  summarizeBloco06,
} from './bloco06Registry';

describeBlockRegistry('Bloco 06 — Inteligência Corporal', {
  items: bloco06Items,
  summarize: summarizeBloco06,
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
});
