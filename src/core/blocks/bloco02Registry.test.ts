import { describeBlockRegistry } from './blockRegistryTestFactory';
import {
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
  bloco02Items,
  summarizeBloco02,
} from './bloco02Registry';

describeBlockRegistry('Bloco 02 — Treino e Execução', {
  items: bloco02Items,
  summarize: summarizeBloco02,
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
});
