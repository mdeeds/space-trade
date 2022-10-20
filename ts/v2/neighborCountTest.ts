import * as THREE from "three";

import { NeighborCount } from "./neighborCount";

const nc = new NeighborCount();

for (let i = -10; i <= 10; ++i) {
  for (let j = -10; j <= 10; ++j) {
    for (let k = -10; k <= 10; ++k) {
      const pos = new THREE.Vector3(i, j, k);
      nc.set(pos, `${[i, j, k]}`);
    }
  }
}

let total = 0;
for (const e of nc.allElements()) {
  ++total;
}
console.log(`Total: ${total} == ${21 * 21 * 21}`);

let surface = 0;
for (const e of nc.externalElements()) {
  ++surface;
}
console.log(`Surface: ${surface} == ${8 + 21 * 19 * 6}`);

