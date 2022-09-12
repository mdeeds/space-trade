import * as THREE from "three";
import { Grid } from "./grid";


function setWorldToPlayerQ(player: THREE.Quaternion, q: THREE.Quaternion, target: THREE.Quaternion) {
  // We need to "subtract" the playerGroup quaternion from q.
  // q - pgq = q + (-pgq)
  target.copy(player);
  target.invert();
  target.premultiply(q)
}

const target = new THREE.Quaternion();

function check(player: THREE.Quaternion, hand: THREE.Quaternion, expect: THREE.Quaternion) {
  setWorldToPlayerQ(player, hand, target);
  console.log(`zero: ${expect.angleTo(target)}`);
}

// Player facing forward
// Hand facing forward
// worldtoplayer = forward
check(Grid.U0, Grid.U0, Grid.U0);

// Player facing right
// Hand facing right
// worldtoplayer = forward
check(Grid.U1, Grid.U1, Grid.U0);

// Player facing right
// Hand facing forward
// worldtoplayer = left
check(Grid.U1, Grid.U0, Grid.U3);

// Player facing forward
// Hand facing right
// worldtoplayer = right
check(Grid.U0, Grid.U1, Grid.U1);

