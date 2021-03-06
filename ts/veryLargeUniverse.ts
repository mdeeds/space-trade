import * as THREE from "three";

import { S } from "./settings";
import { Tick, Ticker } from "./tick";
import { StarSystem } from "./starSystem";
import { PointCloud, PointCloud1 } from "./pointCloud";
import { ModelCloud } from "./modelCloud";

// A collection of StarSystems.  We only instantiate the StarSystem object
// when the world origin is close to it.
export class VeryLargeUniverse extends THREE.Object3D implements Ticker {
  private starCloud: PointCloud;
  constructor(private grips: THREE.Object3D[],
    private camera: THREE.Camera,
    private xr: THREE.WebXRManager,
    private keysDown: Set<string>) {
    super();

    this.starCloud = new PointCloud1(
      0, S.float('sr'), S.float('sr') / 10, S.float('ns'),
      new THREE.Color('#ffa'), /*pointRadius=*/1e4,
      /*visibleDistance=*/S.float('sr'));
    const modelCloud = new ModelCloud((pos: THREE.Vector3) => {
      return new StarSystem(this.camera);
    }, this.starCloud, /*showRadius=*/S.float('sp'), camera);

    this.add(modelCloud);
    this.position.set(0, 0, -1e6);
  }

  private direction = new THREE.Vector3();
  private cameraNormalMatrix = new THREE.Matrix3();
  private getDirectionFromGrips(
    leftButtons: number[], rightButtons: number[]): THREE.Vector3 {
    this.direction.set(0, 0, 0);
    // this.camera.updateMatrixWorld();
    this.cameraNormalMatrix.getNormalMatrix(this.camera.matrixWorld);
    if (this.keysDown.has('KeyS')) {
      this.camera.getWorldDirection(this.p1);
      this.direction.sub(this.p1);
    }
    if (this.keysDown.has('KeyW')) {
      this.camera.getWorldDirection(this.p1);
      this.direction.add(this.p1);
    }
    if (this.keysDown.has('KeyA')) {
      this.p1.set(-1, 0, 0);
      this.p1.applyMatrix3(this.cameraNormalMatrix);
      this.direction.add(this.p1);
    }
    if (this.keysDown.has('KeyD')) {
      this.p1.set(1, 0, 0);
      this.p1.applyMatrix3(this.cameraNormalMatrix);
      this.direction.add(this.p1);
    }
    if (this.keysDown.has('ArrowUp')) {
      this.p1.set(0, 1, 0);
      this.p1.applyMatrix3(this.cameraNormalMatrix);
      this.direction.add(this.p1);
    }
    if (this.keysDown.has('ArrowDown')) {
      this.p1.set(0, -1, 0);
      this.p1.applyMatrix3(this.cameraNormalMatrix);
      this.direction.add(this.p1);
    }

    const leftAxes = this.getAxesFromGrip(0);
    const rightAxes = this.getAxesFromGrip(1);
    if (leftAxes && rightAxes) {
      this.p1.set(0, 0, 0);
      if (leftAxes[2] || leftAxes[3]) {
        this.p1.x = leftAxes[2];
        this.p1.z = leftAxes[3];
      }
      if (rightAxes[3]) {
        this.p1.y = rightAxes[3];
      }
      this.direction.add(this.p1);
    }

    // if (leftButtons[0]) {
    //   this.p1.set(0, -1, 0);
    //   this.p1.applyMatrix3(this.grips[0].normalMatrix);
    //   this.grips[0].getWorldDirection(this.p1);
    //   this.direction.add(this.p1);
    // }
    // if (rightButtons[0]) {
    //   this.p1.set(0, -1, 0);
    //   this.p1.applyMatrix3(this.grips[1].normalMatrix);
    //   this.direction.add(this.p1);
    // }
    // if (leftButtons[1]) {
    //   this.p1.set(0, 1, 0);
    //   this.p1.applyMatrix3(this.grips[0].normalMatrix);
    //   this.direction.sub(this.p1);
    // }
    // if (rightButtons[1]) {
    //   this.p1.set(0, 1, 0);
    //   this.p1.applyMatrix3(this.grips[1].normalMatrix);
    //   this.direction.sub(this.p1);
    // }
    return this.direction;
  }

  private session: THREE.XRSession;
  private getButtonsFromGrip(index: number): number[] {
    let source: THREE.XRInputSource = null;
    if (!this.session) {
      this.session = this.xr.getSession();
    }
    if (this.session) {
      if (this.session.inputSources) {
        source = this.session.inputSources[index];
      }
      return source.gamepad.buttons.map((b) => b.value);
    } else {
      return [];
    }
  }

  private getAxesFromGrip(index: number): Float32Array {
    let source: THREE.XRInputSource = null;
    if (!this.session) {
      this.session = this.xr.getSession();
    }
    if (this.session) {
      if (this.session.inputSources) {
        return this.session.inputSources[index].gamepad.axes.slice(0);
      }
    } else {
      return null;
    }
  }

  private p1 = new THREE.Vector3();
  zoomAroundWorldOrigin(zoomFactor: number) {
    this.p1.copy(this.camera.position); // World Origin
    this.p1.sub(this.position);
    this.p1.multiplyScalar(1 / this.scale.x);
    this.scale.multiplyScalar(zoomFactor);
    this.p1.multiplyScalar(this.scale.x);
    this.p1.add(this.position);
    this.p1.sub(this.camera.position);
    this.position.sub(this.p1);  // Now we should be centered again.
  }

  private velocity = new THREE.Vector3();
  tick(t: Tick) {
    const leftButtons = this.getButtonsFromGrip(0);
    const rightButtons = this.getButtonsFromGrip(1);

    if (leftButtons[4] === 1 || rightButtons[4] === 1  // A or X
      || this.keysDown.has('Equal')) {
      this.zoomAroundWorldOrigin(Math.pow(2, t.deltaS));
    }
    if (leftButtons[5] === 1 || rightButtons[5] === 1  // B or Y
      || this.keysDown.has('Minus')) {
      this.zoomAroundWorldOrigin(Math.pow(0.5, t.deltaS));
    }
    this.direction = this.getDirectionFromGrips(leftButtons, rightButtons);
    this.direction.multiplyScalar(S.float('sa') * t.deltaS);
    this.velocity.add(this.direction);
    if (this.velocity.lengthSq() > 0) {
      this.p1.copy(this.velocity);
      this.p1.multiplyScalar(t.deltaS);
      this.position.sub(this.p1);
      if (Math.random() < 0.05) {
        console.log(`Velocity: ${this.velocity.length().toFixed(2)}`);
      }
    }

    if (this.keysDown.has('ArrowLeft')) {
      this.camera.rotateY(2 * t.deltaS);
    }
    if (this.keysDown.has('ArrowRight')) {
      this.camera.rotateY(-2 * t.deltaS);
    }
  }
}