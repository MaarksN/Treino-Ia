import { describeBlockRegistry } from './blockRegistryTestFactory';
import {
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
  bloco16Items,
  summarizeBloco16,
} from './bloco16Registry';

describeBlockRegistry('Bloco 16 — Acessibilidade i18n Inclusão', {
  items: bloco16Items,
  summarize: summarizeBloco16,
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
});
