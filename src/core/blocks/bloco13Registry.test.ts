import { describeBlockRegistry } from './blockRegistryTestFactory';
import {
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
  bloco13Items,
  summarizeBloco13,
} from './bloco13Registry';

describeBlockRegistry('Bloco 13 — Nutrição Macros IA', {
  items: bloco13Items,
  summarize: summarizeBloco13,
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
});
