import { describeBlockRegistry } from './blockRegistryTestFactory';
import {
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
  bloco01Items,
  summarizeBloco01,
} from './bloco01Registry';

describeBlockRegistry('Bloco 01 — IA e Personalização', {
  items: bloco01Items,
  summarize: summarizeBloco01,
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
});
