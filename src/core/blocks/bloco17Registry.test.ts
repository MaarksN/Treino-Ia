import { describeBlockRegistry } from './blockRegistryTestFactory';
import {
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
  bloco17Items,
  summarizeBloco17,
} from './bloco17Registry';

describeBlockRegistry('Bloco 17 — Segurança Auth LGPD', {
  items: bloco17Items,
  summarize: summarizeBloco17,
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
});
