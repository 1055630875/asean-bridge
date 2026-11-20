import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  COUNTRIES,
  DOMAINS,
  DOMAIN_ROWS,
  FACTS,
  SOURCES,
  UNAVAILABLE_COUNTRIES,
} from "../lib/data";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "../../server/seed.json");

mkdirSync(dirname(out), { recursive: true });

const facts = Object.fromEntries(
  Object.entries(FACTS).filter(
    ([key]) => !UNAVAILABLE_COUNTRIES.has(key.split(":")[0]),
  ),
);

const seed = {
  generatedAt: new Date().toISOString(),
  countries: COUNTRIES,
  domains: DOMAINS,
  rows: DOMAIN_ROWS,
  facts,
  sources: SOURCES,
};

writeFileSync(out, `${JSON.stringify(seed, null, 2)}\n`, "utf8");
console.log(
  `seed written: ${out} (${COUNTRIES.length} countries, ${Object.keys(facts).length} facts, ${SOURCES.length} sources)`,
);
