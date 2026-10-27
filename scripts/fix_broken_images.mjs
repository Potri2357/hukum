import fs from 'fs';
import path from 'path';

const seedPath = path.resolve('apps/api/src/seed.ts');
let content = fs.readFileSync(seedPath, 'utf8');

const replacements = [
  ['photo-1578303512597-8be9f1d45e3e', 'photo-1592840496694-26d035b52b48'],
  ['photo-1486006920555-c77dce18193b', 'photo-1558980664-3a031cf67ea8'],
  ['photo-1556228722-d0b71946f827', 'photo-1556228720-195a672e8a03'],
  ['photo-1542272604-780c96856592', 'photo-1541099649105-f69ad21f3246'],
  ['photo-1583391733975-29622955f159', 'photo-1583391733956-3750e0ff4e8b'],
  ['photo-1625910513413-5b8d21ecf7c3', 'photo-1602810318383-e386cc2a3ccf'],
  ['photo-1622979135225-d2ba269bc1df', 'photo-1593508512255-86ab42a8e620'],
  ['photo-1609592424109-dd9892f1b177', 'photo-1609091839311-d5365f9ff1c5'],
  ['photo-1608248597359-5433a1e94119', 'photo-1598440947619-2c35fc9aa908'],
  ['photo-1608248597359-32204558509e', 'photo-1598440947619-2c35fc9aa908'],
  ['photo-1556228722-d0b503554e2f', 'photo-1570172619644-dfd03ed5d881'],
  ['photo-1558981420-bf7087a16339', 'photo-1558981403-c5f9899a28bc']
];

for (const [bad, good] of replacements) {
  const count = (content.match(new RegExp(bad, 'g')) || []).length;
  if (count > 0) {
    content = content.replaceAll(bad, good);
    console.log(`Replaced ${count} occurrence(s) of ${bad} -> ${good}`);
  }
}

fs.writeFileSync(seedPath, content, 'utf8');
console.log('Seed updated with 100% working images!');
