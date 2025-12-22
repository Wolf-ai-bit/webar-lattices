/**
 * Free Mode Component für WebAR Kristallstrukturen
 *
 * CAMERA-RELATIVE TRACKING:
 * - Beim Marker-Scan: Distanz zur Kamera wird gemessen
 * - Modell wird SOFORT zur Kamera verschoben
 * - Touch-Gesten: Drehen und Zoomen (Pinch)
 */

// ============================================================================
// FREE MODE A-FRAME COMPONENT (Camera-Relative)
// ============================================================================

AFRAME.registerComponent('free-mode', {
    schema: {
        enabled: { type: 'boolean', default: false },
        structureType: { type: 'string', default: '' }
    },

    init: function () {
        this.originalParent = null;
        this.originalPosition = { x: 0, y: 0, z: 0 };
        this.isInFreeMode = false;
        this.savedDistance = 0.5; // Standard-Distanz: 50cm vor Kamera

        // Touch-Gesten Variablen
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.currentRotationY = 0;
        this.currentRotationX = 0;
        this.currentScale = 1.0;

        // Pinch-Zoom Variablen
        this.initialPinchDistance = null;
        this.initialScale = 1.0;

        // Visibility-Enforcement Watcher
        this.visibilityEnforcementInterval = null;

        // Touch Event Listener
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);

        console.log('[FreeMode] Component initialisiert für:', this.el.id);
    },

    update: function (oldData) {
        if (this.data.enabled && !oldData.enabled) {
            this.enterFreeMode();
        } else if (!this.data.enabled && oldData.enabled) {
            this.exitFreeMode();
        }
    },

    enterFreeMode: function () {
        if (this.isInFreeMode) return;

        let modelsContainer = this.el.parentElement;
        if (!modelsContainer.id.includes('models')) {
            modelsContainer = modelsContainer.parentElement;
        }

        const camera = document.querySelector('[camera]');
        if (!camera) return;

        // Distanz zur Kamera messen
        const cameraPos = new THREE.Vector3();
        camera.object3D.getWorldPosition(cameraPos);
        const modelPos = new THREE.Vector3();
        modelsContainer.object3D.getWorldPosition(modelPos);

        this.savedDistance = cameraPos.distanceTo(modelPos);
        this.savedDistance = Math.max(0.2, Math.min(2.0, this.savedDistance));

        // Original-Zustand speichern
        this.originalParent = modelsContainer.parentElement;
        this.originalPosition = {
            x: modelsContainer.getAttribute('position').x,
            y: modelsContainer.getAttribute('position').y,
            z: modelsContainer.getAttribute('position').z
        };

        // Container zur Kamera bewegen
        modelsContainer.object3D.position.set(0, 0, -this.savedDistance);
        camera.appendChild(modelsContainer);

        this.isInFreeMode = true;
        this.movedContainer = modelsContainer;

        this.forceVisibility();
        this.startVisibilityEnforcement();
        this.enableTouchGestures();
    },

    forceVisibility: function () {
        if (!this.movedContainer) return;

        const models = this.movedContainer.querySelectorAll('a-gltf-model');
        models.forEach(model => {
            if (model.getAttribute('visible') === 'true') {
                model.object3D.visible = true;
            }
        });
    },

    /**
     * Hält das Modell sichtbar und an der Kamera
     */
    startVisibilityEnforcement: function () {
        this.stopVisibilityEnforcement();

        const update = () => {
            if (!this.isInFreeMode || !this.movedContainer) return;

            const camera = document.querySelector('[camera]');
            if (!camera) return;

            // Container muss bei der Kamera bleiben
            if (this.movedContainer.parentElement !== camera) {
                camera.appendChild(this.movedContainer);
            }

            // Position vor der Kamera halten
            this.movedContainer.object3D.position.set(0, 0, -this.savedDistance);
            this.movedContainer.object3D.updateMatrix();

            // Container sichtbar machen
            this.movedContainer.object3D.visible = true;

            // Sichtbare Modelle finden und anzeigen
            const models = this.movedContainer.querySelectorAll('a-gltf-model');
            models.forEach(model => {
                if (model.getAttribute('visible') === 'true') {
                    model.object3D.visible = true;
                }
            });

            this.visibilityEnforcementInterval = requestAnimationFrame(update);
        };

        this.visibilityEnforcementInterval = requestAnimationFrame(update);
    },

    stopVisibilityEnforcement: function () {
        if (this.visibilityEnforcementInterval) {
            cancelAnimationFrame(this.visibilityEnforcementInterval);
            this.visibilityEnforcementInterval = null;
        }
    },

    exitFreeMode: function () {
        if (!this.isInFreeMode) return;

        this.stopVisibilityEnforcement();
        this.disableTouchGestures();

        if (this.originalParent && this.movedContainer) {
            this.movedContainer.setAttribute('position', this.originalPosition);
            this.originalParent.appendChild(this.movedContainer);
        }

        this.movedContainer = null;
        this.isInFreeMode = false;
        this.currentRotationX = 0;
        this.currentRotationY = 0;
        this.currentScale = 1.0;
    },

    enableTouchGestures: function () {
        const canvas = document.querySelector('a-scene').canvas;
        canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
        canvas.addEventListener('touchend', this.onTouchEnd, { passive: false });
    },

    disableTouchGestures: function () {
        const canvas = document.querySelector('a-scene').canvas;
        canvas.removeEventListener('touchstart', this.onTouchStart);
        canvas.removeEventListener('touchmove', this.onTouchMove);
        canvas.removeEventListener('touchend', this.onTouchEnd);
    },

    /**
     * Touch Start Handler
     */
    onTouchStart: function (event) {
        if (!this.isInFreeMode) return;

        event.preventDefault();

        if (event.touches.length === 1) {
            // Single Touch: Rotation
            this.touchStartX = event.touches[0].clientX;
            this.touchStartY = event.touches[0].clientY;

            console.log('[FreeMode] Single Touch Start (Rotation)');
        } else if (event.touches.length === 2) {
            // Zwei Finger: Pinch-Zoom
            this.initialPinchDistance = this.getPinchDistance(event.touches);
            this.initialScale = this.currentScale;

            console.log('[FreeMode] Pinch Start (Zoom):', this.initialPinchDistance);
        }
    },

    /**
     * Touch Move Handler - Rotiert oder zoomt das Modell
     */
    onTouchMove: function (event) {
        if (!this.isInFreeMode) return;

        event.preventDefault();

        if (event.touches.length === 1) {
            // ROTATION (Single Touch)
            const deltaX = event.touches[0].clientX - this.touchStartX;
            const deltaY = event.touches[0].clientY - this.touchStartY;

            // Rotation berechnen (Sensitivität: 0.5 Grad pro Pixel)
            const rotationSensitivity = 0.5;
            this.currentRotationY += deltaX * rotationSensitivity;
            this.currentRotationX -= deltaY * rotationSensitivity;

            // Rotation auf Container anwenden
            if (this.movedContainer) {
                this.movedContainer.object3D.rotation.set(
                    THREE.MathUtils.degToRad(this.currentRotationX),
                    THREE.MathUtils.degToRad(this.currentRotationY),
                    0
                );
            }

            // Update Start-Position für nächsten Frame
            this.touchStartX = event.touches[0].clientX;
            this.touchStartY = event.touches[0].clientY;

        } else if (event.touches.length === 2) {
            // ZOOM (Pinch mit zwei Fingern)
            const currentDistance = this.getPinchDistance(event.touches);
            const scaleFactor = currentDistance / this.initialPinchDistance;

            this.currentScale = this.initialScale * scaleFactor;

            // Begrenze Zoom (0.5x bis 3x)
            this.currentScale = Math.max(0.5, Math.min(3.0, this.currentScale));

            // Scale auf Container anwenden
            if (this.movedContainer) {
                this.movedContainer.object3D.scale.set(
                    this.currentScale,
                    this.currentScale,
                    this.currentScale
                );
            }
        }
    },

    /**
     * Touch End Handler
     */
    onTouchEnd: function (event) {
        if (!this.isInFreeMode) return;

        if (event.touches.length === 0) {
            console.log('[FreeMode] Touch End');
            console.log('[FreeMode] Finale Rotation:', this.currentRotationX, this.currentRotationY);
            console.log('[FreeMode] Finaler Zoom:', this.currentScale);
        }

        // Reset Pinch-State wenn weniger als 2 Finger
        if (event.touches.length < 2) {
            this.initialPinchDistance = null;
        }
    },

    /**
     * Berechnet Distanz zwischen zwei Touch-Punkten (Pinch)
     */
    getPinchDistance: function (touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Component Remove - Cleanup
     */
    remove: function () {
        // Stoppe Visibility-Enforcement
        this.stopVisibilityEnforcement();

        // Deaktiviere Touch-Gesten
        this.disableTouchGestures();

        // Stelle sicher, dass Container zurück zum Original ist
        if (this.isInFreeMode) {
            this.exitFreeMode();
        }
    }
});

console.log('[FreeMode] Camera-Relative Free Mode Component registriert');
