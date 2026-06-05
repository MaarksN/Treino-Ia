import { describeBlockRegistry } from './blockRegistryTestFactory';
import {
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
  bloco20Items,
  summarizeBloco20,
} from './bloco20Registry';

describeBlockRegistry('Bloco 20 — DevOps Deploy Escalabilidade', {
  items: bloco20Items,
  summarize: summarizeBloco20,
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
});
