import { describeBlockRegistry } from './blockRegistryTestFactory';
import {
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
  bloco04Items,
  summarizeBloco04,
} from './bloco04Registry';

describeBlockRegistry('Bloco 04 — Nutrição Composição Analytics', {
  items: bloco04Items,
  summarize: summarizeBloco04,
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
});
