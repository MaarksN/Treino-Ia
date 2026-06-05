import { describeBlockRegistry } from './blockRegistryTestFactory';
import {
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
  bloco07Items,
  summarizeBloco07,
} from './bloco07Registry';

describeBlockRegistry('Bloco 07 — Comunidade Social Real', {
  items: bloco07Items,
  summarize: summarizeBloco07,
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
});
