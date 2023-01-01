class CursorEvent extends Event {
  constructor(type: string,
    readonly position: THREE.Vector3,
    readonly quaternion: THREE.Quaternion) {
    super(type);
  }
}

class InputAdapter {
  private grabListeners: ((CursorEvent) => void)[] = [];
  private pointer = new THREE.Vector2();
  private raycaster = new THREE.Raycaster();

  constructor(private canvas: HTMLCanvasElement,
    private camera: THREE.PerspectiveCamera) {
    this.canvas.addEventListener('mousemove', (ev) => {
      this.setPointer(ev);
    });
    this.canvas.addEventListener('mousedown', (ev) => {
      this.setPointer(ev);
      this.raiseGrabEvent(new CursorEvent('grab',
        this.get3Position(), this.getCameraQuaternion()));
    });
  }

  private setPointer(ev: MouseEvent) {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    this.pointer.x = (ev.clientX / this.canvas.width) * 2 - 1;
    this.pointer.y = - (ev.clientY / this.canvas.height) * 2 + 1;
  }

  // Uses the camera to find a point in 3-space under the cursor
  // position.  This point is 10 units from the camera.
  private get3Position(): THREE.Vector3 {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const result = new THREE.Vector3();
    result.copy(this.raycaster.ray.direction);
    result.multiplyScalar(10);
    result.add(this.raycaster.ray.origin);
    return result;
  }

  private getCameraQuaternion(): THREE.Quaternion {
    const result = new THREE.Quaternion();
    this.camera.getWorldQuaternion(result);
    return result;
  }

  public addEventListener(event: 'grab', listener: () => void): void {
    if (event === 'grab') {
      this.grabListeners.push(listener);
    }
  }

  private raiseGrabEvent(ce: CursorEvent): void {
    for (const listener of this.grabListeners) {
      listener(ce);
    }
  }
}