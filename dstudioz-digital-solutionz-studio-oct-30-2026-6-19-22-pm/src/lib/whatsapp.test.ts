import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanPhoneNumber,
  buildWhatsAppServiceUrl,
  buildWhatsAppPackageUrl,
  buildWhatsAppMultiServiceUrl,
} from './whatsapp';
import { INITIAL_DEPARTMENTS, INITIAL_PACKAGES } from '../data/initialData';

test('cleanPhoneNumber strips non-digits correctly', () => {
  assert.equal(cleanPhoneNumber('+216 50 000 000'), '21650000000');
  assert.equal(cleanPhoneNumber('(+1) 514-555-0199'), '15145550199');
});

test('buildWhatsAppServiceUrl generates properly encoded URL with service and market', () => {
  const service = INITIAL_DEPARTMENTS[0].services[1]; // Brand Identity
  const url = buildWhatsAppServiceUrl('+216 50 000 000', service, 'tn');
  assert.ok(url);
  assert.ok(url.startsWith('https://wa.me/21650000000?text='));
  assert.ok(url.includes('Brand%20Identity'));
  assert.ok(url.includes('Tunisia'));
});

test('buildWhatsAppPackageUrl formats package inquiry correctly', () => {
  const pkg = INITIAL_PACKAGES[0]; // Brand Foundation
  const url = buildWhatsAppPackageUrl('+21650000000', pkg, 'eu');
  assert.ok(url);
  assert.ok(url.includes('Brand%20Foundation'));
  assert.ok(url.includes('Europe'));
});

test('buildWhatsAppMultiServiceUrl concatenates service titles cleanly', () => {
  const services = [INITIAL_DEPARTMENTS[0].services[0], INITIAL_DEPARTMENTS[0].services[1]];
  const url = buildWhatsAppMultiServiceUrl('+21650000000', services, 'ca');
  assert.ok(url);
  assert.ok(url.includes('Brand%20Positioning%2C%20Brand%20Identity'));
  assert.ok(url.includes('Canada'));
});
