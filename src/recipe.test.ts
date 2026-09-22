import { deepStrictEqual, equal, ok } from 'node:assert/strict';
import { test } from 'node:test';
import {
  addPiece,movePiece,removePiece,
  decode,
  encode,
  presets,
  shopping,
  toggle,
  verdict,
  type Recipe,
} from './recipe';

test('toggle keeps exactly one spread selected and can clear it', () => {
  const empty: Recipe = { spread: null, toppings: [] };
  const withSalad = toggle(empty, 'salad');
  deepStrictEqual(withSalad, { spread: 'salad', toppings: [] });
  deepStrictEqual(toggle(withSalad, 'butter'), { spread: 'butter', toppings: [] });
  deepStrictEqual(toggle(withSalad, 'salad'), empty);
});

test('toggle adds and removes toppings without changing the spread', () => {
  const recipe: Recipe = { spread: 'salad', toppings: [] };
  const withHam = toggle(recipe, 'ham');
  deepStrictEqual(withHam, { spread: 'salad', toppings: ['ham'] });
  deepStrictEqual(toggle(withHam, 'egg'), { spread: 'salad', toppings: ['ham', 'egg'] });
  deepStrictEqual(toggle(withHam, 'ham'), recipe);
});

test('shopping rounds ingredient quantities up and bounds sandwich count to 1–24', () => {
  const recipe: Recipe = { spread: 'salad', toppings: ['egg', 'pepper'] };
  deepStrictEqual(shopping(recipe, 2), [
    { name: 'Veka', quantity: 2, unit: 'plátků' },
    { name: 'Bramborový salát', quantity: 70, unit: 'g' },
    { name: 'Vejce', quantity: 1, unit: 'ks' },
    { name: 'Červená paprika', quantity: 1, unit: 'ks' },
  ]);
  equal(shopping(recipe, 0)[0].quantity, 1);
  equal(shopping(recipe, 100)[0].quantity, 24);
  equal(shopping(recipe, 1.4)[0].quantity, 1);
  equal(shopping(recipe, 1.6)[0].quantity, 2);
});

test('encode and decode round-trip every preset', () => {
  for (const recipe of Object.values(presets)) {
    deepStrictEqual(decode(encode(recipe)), recipe);
  }
});

test('decode rejects malformed hashes, unknown IDs and invalid groups', () => {
  const encoded = (value: unknown) => `#${encodeURIComponent(JSON.stringify(value))}`;
  equal(decode('#not-json'), null);

  equal(decode(encoded({ spread: 'unknown', toppings: [] })), null);
  equal(decode(encoded({ spread: 'ham', toppings: [] })), null);
  equal(decode(encoded({ spread: null, toppings: ['salad'] })), null);
  equal(decode(encoded({ spread: null, toppings: ['unknown'] })), null);
  equal(decode(encoded({ spread: null })), null);

  equal(decode('#'), null);
});

test('verdict covers empty, pineapple, tall, dry, classic, minimal, fresh, and default branches', () => {
  equal(verdict({ spread: null, toppings: [] }).badge, 'Čisté plátno');
  equal(verdict({ spread: 'salad', toppings: ['pineapple'] }).badge, 'Odvážné sousto');
  equal(verdict({ spread: 'salad', toppings: ['ham', 'salami', 'egg', 'cheese', 'pickle', 'pepper', 'tomato'] }).badge, 'Vysoká gastronomie');
  equal(verdict({ spread: null, toppings: ['ham'] }).badge, 'Suchý humor');
  equal(verdict({ spread: 'salad', toppings: ['ham', 'egg', 'pickle'] }).badge, 'Schváleno oslavou');
  equal(verdict({ spread: 'salad', toppings: [] }).badge, 'Méně je někdy víc');
  equal(verdict({ spread: 'salad', toppings: ['cheese'] }).badge, 'Svěží sestava');
  ok(verdict({ spread: 'salad', toppings: ['ham'] }).title);
});

test('repeat pieces retain independent positions through sharing and removal',()=>{
 let r:Recipe={spread:null,toppings:[]};
 for(let i=0;i<30;i++)r=addPiece(r,'egg');
 equal(r.toppings.length,30);
 r=movePiece(r,4,123,321);
 deepStrictEqual(r.positions?.[4],[123,321]);
 deepStrictEqual(decode(encode(r)),r);
 const removed=removePiece(r,3);
 deepStrictEqual(removed.positions?.[3],[123,321]);
 equal(removed.toppings.length,29);
 deepStrictEqual(movePiece(r,0,-10,900).positions?.[0],[65,355]);
 equal(decode(encode({...r,positions:[[0,0]]})),null);
});
