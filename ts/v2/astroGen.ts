import * as THREE from "three";
import { Vector3 } from "three";
import { randInt } from "three/src/math/MathUtils";
import { AstroTools } from "./astroTools";
import { Construction } from "./construction";
import { Grid } from "./grid";
import { IsoTransform } from "./isoTransform";

class rarity {
  // pattern repeats every n meters
  // phase from 0 to 2 Pi
  // 1-100 where 1 is scarce and 100 is common.
  // offset is added to the sine before magnitude is appled.  1 = 0 to 2x magnitude.  more means there is always a chance.  less means sometimes there is no chance of occurance.
  public constructor(
    public modelName: string,
    public period,
    public phase,
    public magnitude,
    public offset) {

  }

  private trans(n: number) {
    let retvalue = this.magnitude * (Math.sin(2 * Math.PI * (1 / this.period) * n + this.phase) + this.offset);
    return retvalue;
  }

  concentration(x: number, y: number, z: number) {
    return Math.cbrt(this.trans(x) * this.trans(y) * this.trans(z));
  }
}

// 'clay', 'ice', 
// 'metal-common', 'metal-rare','salt-common', 'salt-rare', 'silicate-rock',
// 'silicon-crystalized', ]

export class AstroGen {
  rarities: rarity[] = [];
  constructor(private construction: Construction) {
    this.rarities.push(new rarity("clay", 100, Math.PI / 2, 100, 1.1));
    this.rarities.push(new rarity("ice", 100, -Math.PI / 2, 100, 0.9));
    this.rarities.push(new rarity("metal-common", 500, 0, 10, 0.8));
    this.rarities.push(new rarity("metal-rare", 5000, Math.PI / 2, 1, 0));
    this.rarities.push(new rarity("salt-common", 50, 0, 50, 0.5));
    this.rarities.push(new rarity("salt-rare", 50, 0, 50, -0.5));
    this.rarities.push(new rarity("silicate-rock", 100, -Math.PI / 2, 100, 0.5));
    this.rarities.push(new rarity("silicon-crystalized", 1, -Math.PI, 1, -0.5));
  }

  // private buildCone() {
  //   for (let x = -20; x < 20; x++) {
  //     for (let y = -20; y < 20; y++) {
  //       for (let z = 0; z < 20; z++) {
  //         if (Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) < z / 2) {
  //           const baseItem = Assets.items[0];
  //           const position = new THREE.Vector3(x, y, -z * 2 - 10);
  //           const quaternion = new THREE.Quaternion();
  //           this.construction.addCube(
  //             new InWorldItem(baseItem, position, quaternion));
  //         }
  //       }
  //     }
  //   }
  // }

  private buildDisk(r: number,
    xOffset: number, yOffset: number, zOffset: number) {
    for (let x = -r; x < r; x++) {
      for (let z = -r; z < r; z++) {
        if (Math.sqrt(Math.pow(x, 2) + Math.pow(z, 2)) < r) {
          this.construction.addCube('cube',
            new IsoTransform(
              new THREE.Vector3(x + xOffset, yOffset, z + zOffset),
              Grid.randomRotation()));
        }
      }
    }
  }

  buildSpacePort(xOffset: number, yOffset: number, zOffset: number, height: number) {
    let r = 1;
    for (let y = 0; y < height; y++) {
      if (y % 3 == 0) {
        r = Math.pow(Math.random(), 2) * 10 + 1;
      }
      this.buildDisk(r, xOffset, y + yOffset, zOffset);
    }
  }

  // private changeColor(mesh: THREE.Mesh) {
  //   Debug.assert(mesh.type === "Mesh");
  //   const material = new THREE.MeshStandardMaterial();
  //   Object.assign(material, mesh.material);
  //   let r = material.color.r;
  //   let g = material.color.g;
  //   let b = material.color.b;
  //   r += (Math.random() - 0.5) * .1;
  //   g += (Math.random() - 0.5) * .1;
  //   b += (Math.random() - 0.5) * .1;
  //   material.color = new THREE.Color(r, g, b);
  //   material.needsUpdate = true;
  //   mesh.material = material;
  // }

  private itemFromLocation(x: number, y: number, z: number): string {
    let hat: string[] = [];  // the hat we will draw a random name from
    for (let r of this.rarities) {
      const chance = r.concentration(x, y, z);
      for (let i = 0; i < chance; i++) {
        hat.push(r.modelName);
      }
    }
    let index = Math.floor(Math.random() * hat.length);
    return hat[index];
  }

  private addAt(x: number, y: number, z: number, items = ['iron-chondrite', 'carbon-chondrite']) {
    const quaternion = Grid.randomRotation();
    let item = items[randInt(0, items.length - 1)]
    this.construction.addCube(
      item,
      new IsoTransform(
        new THREE.Vector3(x, y, z),
        quaternion));
  }

  buildOriginMarker(size: number) {
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        const quaternion = Grid.randomRotation();
        this.construction.addCube(
          'cube',
          new IsoTransform(
            new THREE.Vector3(x, 0, z),
            quaternion));
      }
    }
  }

  buildPlatform(xDim: number, yDim: number, zDim: number,
    xOffset: number, yOffset: number, zOffset: number) {
    for (let x = -xDim; x < xDim; x++) {
      for (let y = -yDim; y < 0; y++) {
        for (let z = -zDim; z < zDim; z++) {
          let xProb = (xDim - Math.abs(x)) / xDim;
          let yProb = (yDim - Math.abs(y)) / yDim;
          let zProb = (zDim - Math.abs(z)) / zDim;

          if (xProb * yProb * zProb > (Math.random() / 10) + 0.5) {
            this.addAt(x + xOffset, y + yOffset, z + zOffset);
          }
        }
      }
    }
  }

  buildAsteroid(r: number,
    xOffset: number, yOffset: number, zOffset: number) {
    switch (randInt(0, 1)) {
      case 0:
        this.buildRandomWalkAsteroid(r, xOffset, yOffset, zOffset);
        break;
      case 1:
        this.bulidBallAsteroid(r, xOffset, yOffset, zOffset);
        break;
    }
  }

  buildRandomWalkAsteroid(r: number,
    xOffset: number, yOffset: number, zOffset: number) {

    let items = [];
    switch (randInt(0, 2)) {
      case 0:
        items = ['iron-chondrite', 'carbon-chondrite', 'iron'];
        break;
      case 1:
        items = ['carbon-chondrite', 'iron', 'fuel'];
        break;
      case 2:
        items = ['lithium-silicate', 'borosilicate', 'silicon'];
        break;
    }

    let at = new AstroTools();
    at.density = 0.9
    r = 2
    for (let i = 0; i < r; r++) {
      at.randomWalk(new Vector3(xOffset, yOffset, zOffset), 10, items[0]);
    }
    at.density = 0.5
    for (let i = 0; i < r; r++) {
      at.dialate(items[1])
      at.dialate(items[2])
    }
    at.addToConstruction(this.construction);

  }

  bulidBallAsteroid(r: number,
    xOffset: number, yOffset: number, zOffset: number) {
    let items = [];
    switch (randInt(0, 2)) {
      case 0:
        items = ['iron-chondrite', 'carbon-chondrite'];
        break;
      case 1:
        items = ['iron', 'fuel'];
        break;
      case 2:
        items = ['lithium-silicate', 'borosilicate'];
        break;
    }
    for (let x = -r; x < r; x++) {
      for (let y = -r; y < r; y++) {
        for (let z = -r; z < r; z++) {
          if (Math.sqrt(x * x + y * y + z * z) < r + Math.random() - 0.5) {
            this.addAt(x + xOffset, y + yOffset, z + zOffset);
          }
        }
      }
    }
  }

  buildDiamond(r: number,
    xOffset: number, yOffset: number, zOffset: number) {
    for (let x = -r; x < r; x++) {
      for (let y = -r; y < r; y++) {
        for (let z = -r; z < r; z++) {
          if ((Math.abs(x) + Math.abs(y) + Math.abs(z)) < r + Math.random() - 0.5) {
            this.addAt(x + xOffset, y + yOffset, z + zOffset);
          }
        }
      }
    }
  }

  buildCuboid(r: number,
    xOffset: number, yOffset: number, zOffset: number) {
    for (let x = -r; x < r; x++) {
      for (let y = -r; y < r; y++) {
        for (let z = -r; z < r; z++) {
          if (Math.min(Math.abs(x), Math.abs(y), Math.abs(z)) < r + Math.random() - 0.5) {
            this.addAt(x + xOffset, y + yOffset, z + zOffset);
          }
        }
      }
    }
  }

  getRandomInt(min, max) {
    return Math.floor(Math.pow(Math.random(), 2) * (max - min)) + min;
  }

  // buildRandomItems(n: number, r: number) {
  //   const item = Assets.items[this.getRandomInt(0, Assets.items.length)];
  //   Debug.log(`Congrationations!  You have been awarded ${n.toFixed(0)} ${item.name}(s) for loging in today.`);
  //   Debug.log(`Hunt for them ${r.toFixed(0)} meters from your current location.  Enjoy!`);
  //   const maxTries = n * 10;
  //   for (let i = 0; i < maxTries; i++) {
  //     if (n < 1) {
  //       break;
  //     }
  //     const x = this.getRandomInt(-r, r);
  //     const y = this.getRandomInt(-r, r);
  //     const z = this.getRandomInt(-r, r);
  //     const pos = new THREE.Vector3(x, y, z)
  //     const inWorldItem = new InWorldItem(
  //       item,
  //       pos,
  //       new THREE.Quaternion());
  //     if (!this.construction.cubeAt(pos)) {
  //       this.construction.addCube(inWorldItem);
  //       n--;
  //     }
  //   }
  // }

  // buildAllItems() {
  //   let x = -Math.round(Assets.items.length / 2);
  //   for (const item of Assets.items) {
  //     const iwo = new InWorldItem(item, new THREE.Vector3(x, 0, -5),
  //       new THREE.Quaternion());
  //     this.construction.addCube(iwo);
  //     ++x;
  //   }
  // }

  // removeFar(dirty: InWorldItem[], r: number) {
  //   let clean = [];
  //   for (const item of dirty) {
  //     if (Math.abs(item.position.x) + Math.abs(item.position.y) + Math.abs(item.position.z) < r) {
  //       clean.push(item);
  //     }
  //   }
  //   return clean;
  // }

  // layer(input: InWorldItem[], layerNumber): InWorldItem[] {
  //   let output = [];
  //   for (let block of input) {
  //     let b = block.clone();
  //     if (b.position.y == layerNumber) {
  //       b.position.y = 0;
  //       output.push(b);
  //     }
  //   }
  //   return output;
  // }

  // mashUp(input: InWorldItem[]) {
  //   let mashed = [];
  //   let minY = input[0].position.y;
  //   let maxY = input[0].position.y;
  //   for (let block of input) {
  //     minY = Math.min(minY, block.position.y);
  //     maxY = Math.max(maxY, block.position.y);
  //   }
  //   let mashY = minY;
  //   for (let y = minY; y <= maxY;) {
  //     if (Math.random() < 0.8) {
  //       y++;
  //     }
  //     if (Math.random() < 0.2) {
  //       y++;
  //     }
  //     let slice = this.layer(input, y);
  //     for (let block of slice) {
  //       let b = block.clone();
  //       b.position.y = mashY;
  //       mashed.push(b);
  //     }
  //     mashY++;
  //   }
  //   return mashed
  // }

}