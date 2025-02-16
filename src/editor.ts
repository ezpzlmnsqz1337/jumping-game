import * as BABYLON from '@babylonjs/core';

export interface EditorSettings { }

export class Editor {
  protected gizmoManager: BABYLON.GizmoManager;
  protected selectedMesh: BABYLON.Nullable<BABYLON.Mesh> = null;
  protected position: BABYLON.Nullable<BABYLON.Vector3> = null;
  protected scale: BABYLON.Nullable<BABYLON.Vector3> = null;
  protected rotation: BABYLON.Nullable<BABYLON.Vector3> = null;

  constructor(scene: BABYLON.Scene, gizmoManager: BABYLON.GizmoManager, settings: EditorSettings) {
    this.gizmoManager = gizmoManager;
    this.gizmoManager.clearGizmoOnEmptyPointerEvent = true;


    this.gizmoManager.positionGizmoEnabled = true;
    this.gizmoManager.rotationGizmoEnabled = true;
    this.gizmoManager.scaleGizmoEnabled = true;

    this.gizmoManager.onAttachedToMeshObservable.add(newMesh => {
      this.selectedMesh = newMesh as BABYLON.Mesh;
    });

    [
      this.gizmoManager.gizmos.positionGizmo,
      this.gizmoManager.gizmos.rotationGizmo
    ].forEach(g => {
      g?.onDragStartObservable.add(() => {
        if (!this.selectedMesh || !this.selectedMesh.physicsBody) return;
        this.selectedMesh.physicsBody.disablePreStep = true;
      });
      g?.onDragEndObservable.add(() => {
        if (!this.selectedMesh || !this.selectedMesh.physicsBody) return;
        this.selectedMesh.physicsBody.disablePreStep = false;
      });
    }),

      this.gizmoManager.gizmos.scaleGizmo?.onDragStartObservable.add(() => {
        if (!this.selectedMesh || !this.selectedMesh.physicsBody) return;
        this.scale = this.selectedMesh.scaling.clone();
        this.selectedMesh.physicsBody.disablePreStep = true;
        this.gizmoManager.gizmos.scaleGizmo
      });
    this.gizmoManager.gizmos.scaleGizmo?.onDragEndObservable.add(() => {
      if (!this.selectedMesh || !this.selectedMesh.physicsBody) return;
      // if not change has been made to the scale, return
      if (this.scale && this.selectedMesh.scaling.equals(this.scale)) return;

      if (!this.selectedMesh.physicsBody.shape) return;

      this.selectedMesh.metadata.entity?.updatePhysicsBody();
      this.selectedMesh.bakeCurrentTransformIntoVertices();
      this.selectedMesh.physicsBody.disablePreStep = false;
    });
  }
}