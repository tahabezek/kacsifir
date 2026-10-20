import { gql } from './buffer.mjs';
const T = `name kind ofType { name kind ofType { name kind ofType { name } } }`;
const show = async n => {
  const d = await gql(`{ __type(name:"${n}") { name kind inputFields { name type { ${T} } } fields { name type { ${T} } } enumValues { name } } }`);
  const t = d.__type; if (!t) return console.log(n, 'YOK');
  const fmt = ty => ty ? (ty.name || (ty.kind === 'NON_NULL' ? fmt(ty.ofType) + '!' : '[' + fmt(ty.ofType) + ']')) : '?';
  console.log('\n# ' + n + ' (' + t.kind + ')');
  for (const f of (t.inputFields || t.fields || [])) console.log('  ' + f.name + ': ' + fmt(f.type));
  if (t.enumValues) console.log('  enum: ' + t.enumValues.map(e => e.name).join(', '));
};
for (const n of process.argv.slice(2)) await show(n);
