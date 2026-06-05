import { describeBlockRegistry } from './blockRegistryTestFactory';
import {
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
  bloco05Items,
  summarizeBloco05,
} from './bloco05Registry';

describeBlockRegistry('Bloco 05 — Retenção Hábito Social Operação', {
  items: bloco05Items,
  summarize: summarizeBloco05,
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
});
