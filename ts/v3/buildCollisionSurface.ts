export class BuildCollisionSurface {
  // createTriangleMesh(map: Vector3Map<THREE.Object3D>): btTriangleMesh {
  //   const triangleMesh = new Ammo.btTriangleMesh();

  //   // Add triangles for each point in the map
  //   for (const [position, value] of map.entries()) {
  //     addCubeTriangles(triangleMesh, position);
  //   }

  //   return triangleMesh;
  // }
  // addCubeTriangles(triangleMesh: btTriangleMesh, position: THREE.Vector3) {
  //   // Helper function to add triangles for a single cube at the given position

  //   // Calculate the coordinates of the cube vertices
  //   const x = position.x;
  //   const y = position.y;
  //   const z = position.z;
  //   const radius = 0.5;
  //   const top = y + radius;
  //   const bottom = y - radius;
  //   const left = x - radius;
  //   const right = x + radius;
  //   const front = z + radius;
  //   const back = z - radius;

  //   // Check if the neighbors of this cube are present in the map
  //   const hasTop = map.has(new THREE.Vector3(x, top + 1, z));
  //   const hasBottom = map.has(new THREE.Vector3(x, bottom - 1, z));
  //   const hasLeft = map.has(new THREE.Vector3(left - 1, y, z));
  //   const hasRight = map.has(new THREE.Vector3(right + 1, y, z));
  //   const hasFront = map.has(new THREE.Vector3(x, y, front + 1));
  //   const hasBack = map.has(new THREE.Vector3(x, y, back - 1));

  //   // Add triangles for the cube faces that don't have neighbors
  //   if (!hasTop) {
  //     triangleMesh.addTriangle(
  //       new Ammo.btVector3(left, top, front),
  //       new Ammo.btVector3(left, top, back),
  //       new Ammo.btVector3(right, top, back),
  //       true
  //     );
  //     triangleMesh.addTriangle(
  //       new Ammo.btVector3(left, top, front),
  //       new Ammo.btVector3(right, top, back),
  //       new Ammo.btVector3(right, top, front),
  //       true
  //     );
  //   }
  //   function addCubeTriangles(triangleMesh: btTriangleMesh, position: THREE.Vector3) {
  //     // Helper function to add triangles for a single cube at the given position

  //     // Calculate the coordinates of the cube vertices
  //     const x = position.x;
  //     const y = position.y;
  //     const z = position.z;
  //     const radius = 0.5;
  //     const top = y + radius;
  //     const bottom = y - radius;
  //     const left = x - radius;
  //     const right = x + radius;
  //     const front = z + radius;
  //     const back = z - radius;

  //     // Check if the neighbors of this cube are present in the map
  //     const hasTop = map.has(new THREE.Vector3(x, top + 1, z));
  //     const hasBottom = map.has(new THREE.Vector3(x, bottom - 1, z));
  //     const hasLeft = map.has(new THREE.Vector3(left - 1, y, z));
  //     const hasRight = map.has(new THREE.Vector3(right + 1, y, z));
  //     const hasFront = map.has(new THREE.Vector3(x, y, front + 1));
  //     const hasBack = map.has(new THREE.Vector3(x, y, back - 1));

  //     // Add triangles for the cube faces that don't have neighbors
  //     if (!hasTop) {
  //       triangleMesh.addTriangle(
  //         new Ammo.btVector3(left, top, front),
  //         new Ammo.btVector3(left, top, back),
  //         new Ammo.btVector3(right, top, back),
  //         true
  //       );
  //       triangleMesh.addTriangle(
  //         new Ammo.btVector3(left, top, front),
  //         new Ammo.btVector3(right, top, back),
  //         new Ammo.btVector3(right, top, front),
  //         true
  //       );
  //     }
  //     if (!hasBottom) {
  //       triangleMesh.addTriangle(
  //         new Ammo.btVector3(left, bottom, front),
  //         new Ammo.btVector3(right, bottom, back),
  //         new Ammo.btVector3(left, bottom, back),
  //         true
  //       );
  //       triangleMesh
  //       if (!hasBottom) {
  //         triangleMesh.addTriangle(
  //           new Ammo.btVector3(right, bottom, front),
  //           new Ammo.btVector3(left, bottom, back),
  //           new Ammo.btVector3(left, bottom, front),
  //           true
  //         );
  //         triangleMesh.addTriangle(
  //           new Ammo.btVector3(right, bottom, front),
  //           new Ammo.btVector3(right, bottom, back),
  //           new Ammo.btVector3(left, bottom, back),
  //           true
  //         );
  //       }
  //       if (!hasLeft) {
  //         triangleMesh.addTriangle(
  //           new Ammo.btVector3(left, top, front),
  //           new Ammo.btVector3(left, bottom, back),
  //           new Ammo.btVector3(left, top, back),
  //           true
  //         );
  //         triangleMesh.addTriangle(
  //           new Ammo.btVector3(left, bottom, front),
  //           new Ammo.btVector3(left, top, front),
  //           new Ammo.btVector3(left, bottom, back),
  //           true
  //         );
  //       }
  //       if (!hasRight) {
  //         triangleMesh.addTriangle(
  //           new Ammo.btVector3(right, top, back),
  //           new Ammo.btVector3(right, bottom, back),
  //           new Ammo.btVector3(right, top, front),
  //           true
  //         );
  //         triangleMesh.addTriangle(
  //           new Ammo.btVector3(right, bottom, front),
  //           new Ammo.btVector3(right, bottom, back),
  //           new Ammo.btVector3(right, top, front),
  //           true
  //         );
  //       }
  //       if (!hasFront) {
  //         triangleMesh.addTriangle(
  //           new Ammo.btVector3(left, top, front),
  //           new Ammo.btVector3(right, bottom, front),
  //           new Ammo.btVector3(right, top, front),
  //           true
  //         );
  //         triangleMesh.addTriangle(
  //           new Ammo.btVector3(left, top, front),
  //           new Ammo.btVector3(left, bottom, front),
  //           new Ammo.btVector3(right, bottom, front),
  //           true
  //         );
  //       }
  //       if (!hasBack) {
  //         triangleMesh.addTriangle(
  //           new Ammo.btVector3(left, top, back),
  //           new Ammo.btVector3(right, top, back),
  //           new Ammo.btVector3(right, bottom, back),
  //           true
  //         );
  //         triangleMesh.addTriangle(
  //           new Ammo.btVector3(left, top, back),
  //           new Ammo.btVector3(right, bottom, back),
  //           new Ammo.btVector3(left, bottom, back),
  //           true
  //         );
  //       }
  //     }

  //     export function vector3MapToTriangleMesh(
  //       map: Vector3Map<THREE.Object3D>,
  //       margin: number
  //     ): Ammo.btTriangleMesh {
  //       const triangleMesh = new Ammo.btTriangleMesh();
  //       for (const [pos, _] of map.entries()) {
  //         addCubeTriangles(triangleMesh, pos, margin);
  //       }
  //       return triangleMesh;
  //     }
  //   }

}

