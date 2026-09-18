import { test } from 'node:test';
import assert from 'node:assert/strict';
import { programs } from '../lib/program-catalog.ts';
import { isVerifiedProgram } from '../lib/program-verification.ts';
import { campusPhoto } from '../lib/university-visuals.ts';

test('only sourced catalogue IDs are marked verified', () => {
  assert.equal(programs.length, 22);
  assert.ok(programs.every(program => isVerifiedProgram(program.id)));
  assert.equal(isVerifiedProgram('unreviewed-expansion'), false);
  assert.equal(isVerifiedProgram(), false);
});

test('campus photos are assigned to the depicted university only', () => {
  assert.equal(campusPhoto('University of Oxford'), '/universities/oxford.jpg');
  assert.equal(campusPhoto('University of Cambridge'), undefined);
});
