import { describeBlockRegistry } from './blockRegistryTestFactory';
import {
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
  bloco03Items,
  summarizeBloco03,
} from './bloco03Registry';

describeBlockRegistry('Bloco 03 — Recovery Saúde Nutrição Inicial', {
  items: bloco03Items,
  summarize: summarizeBloco03,
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
});
