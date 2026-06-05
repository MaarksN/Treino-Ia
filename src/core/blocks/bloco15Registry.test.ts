import { describeBlockRegistry } from './blockRegistryTestFactory';
import {
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
  bloco15Items,
  summarizeBloco15,
} from './bloco15Registry';

describeBlockRegistry('Bloco 15 — Wearables Integrações Externas', {
  items: bloco15Items,
  summarize: summarizeBloco15,
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
});
