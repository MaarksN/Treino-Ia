import { describeBlockRegistry } from './blockRegistryTestFactory';
import {
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
  bloco12Items,
  summarizeBloco12,
} from './bloco12Registry';

describeBlockRegistry('Bloco 12 — PWA Mobile UX', {
  items: bloco12Items,
  summarize: summarizeBloco12,
  assertAuthenticatedUser,
  assertServerSourceOfTruth,
});
