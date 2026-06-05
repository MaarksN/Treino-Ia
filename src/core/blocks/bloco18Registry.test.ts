import { describeBlockRegistry } from './blockRegistryTestFactory';
import {
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
  bloco18Items,
  summarizeBloco18,
} from './bloco18Registry';

describeBlockRegistry('Bloco 18 — Conteúdo Educacional Biblioteca', {
  items: bloco18Items,
  summarize: summarizeBloco18,
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
});
