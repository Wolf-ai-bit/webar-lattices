/**
 * A-Frame Component: GLTF Multi-Mesh Renderer
 *
 * Problem: A-Frame's standard <a-gltf-model> zeigt nur das erste Mesh.
 * Lösung: Dieses Component macht ALLE Meshes in einem GLB sichtbar.
 *
 * Verwendung:
 *   <a-gltf-model src="#model" gltf-multi-mesh></a-gltf-model>
 */

AFRAME.registerComponent('gltf-multi-mesh', {
    init: function () {
        console.log('[gltf-multi-mesh] Component initialized for:', this.el.id);

        // Warte auf Model-Load
        this.el.addEventListener('model-loaded', this.onModelLoaded.bind(this));
    },

    onModelLoaded: function () {
        console.log('[gltf-multi-mesh] Model loaded, processing meshes...');

        const model = this.el.getObject3D('mesh');

        if (!model) {
            console.error('[gltf-multi-mesh] No mesh object found!');
            return;
        }

        let meshCount = 0;
        let visibleMeshes = 0;

        // Traverse durch ALLE Children und mache sie sichtbar
        model.traverse((node) => {
            if (node.isMesh) {
                meshCount++;

                // Stelle sicher, dass Mesh sichtbar ist
                node.visible = true;

                // Stelle sicher, dass Material vorhanden ist
                if (node.material) {
                    node.material.needsUpdate = true;

                    // Debug: Material-Properties
                    if (node.material.transparent) {
                        console.log(`[gltf-multi-mesh] Mesh ${node.name} is transparent`);
                    }
                }

                // Füge Mesh zur Render-Liste hinzu
                node.frustumCulled = false; // Verhindere vorzeitiges Culling
                node.matrixAutoUpdate = true;

                visibleMeshes++;

                console.log(`[gltf-multi-mesh] Mesh ${meshCount}: ${node.name}`, {
                    position: node.position,
                    visible: node.visible,
                    vertices: node.geometry?.attributes?.position?.count || 0
                });
            }
        });

        console.log(`[gltf-multi-mesh] Processing complete: ${visibleMeshes}/${meshCount} meshes made visible`);

        // Force update der Scene
        if (this.el.sceneEl && this.el.sceneEl.renderer) {
            this.el.sceneEl.renderer.resetState();
        }
    },

    remove: function () {
        // Cleanup
        this.el.removeEventListener('model-loaded', this.onModelLoaded);
    }
});

console.log('[gltf-multi-mesh] Component registered');
