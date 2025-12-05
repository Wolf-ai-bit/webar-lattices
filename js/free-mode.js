/**
 * Free Mode Component für WebAR Kristallstrukturen
 *
 * Ermöglicht persistente Modelle die nach Marker-Scan bleiben
 * und per Touch-Gesten rotiert werden können.
 */

// ============================================================================
// FREE MODE A-FRAME COMPONENT
// ============================================================================

AFRAME.registerComponent('free-mode', {
    schema: {
        enabled: { type: 'boolean', default: false },
        structureType: { type: 'string', default: '' }
    },

    init: function () {
        this.originalParent = null;
        this.freeContainer = null;
        this.isInFreeMode = false;

        // Touch-Gesten Variablen
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.currentRotationY = 0;
        this.currentRotationX = 0;

        // Touch Event Listener
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
    },

    update: function (oldData) {
        if (this.data.enabled && !oldData.enabled) {
            this.enterFreeMode();
        } else if (!this.data.enabled && oldData.enabled) {
            this.exitFreeMode();
        }
    },

    /**
     * Aktiviert Free Mode - Modell wird vom Marker gelöst
     */
    enterFreeMode: function () {
        if (this.isInFreeMode) return;

        console.log('[FreeMode] Aktiviere Free Mode für:', this.data.structureType);

        // Speichere aktuelle Welt-Position
        const worldPosition = new THREE.Vector3();
        this.el.object3D.getWorldPosition(worldPosition);

        const worldQuaternion = new THREE.Quaternion();
        this.el.object3D.getWorldQuaternion(worldQuaternion);

        const worldScale = new THREE.Vector3();
        this.el.object3D.getWorldScale(worldScale);

        // Erstelle Container für freies Modell (nicht an Marker gebunden)
        this.freeContainer = document.createElement('a-entity');
        this.freeContainer.setAttribute('id', `free-${this.data.structureType}`);
        this.freeContainer.object3D.position.copy(worldPosition);
        this.freeContainer.object3D.quaternion.copy(worldQuaternion);
        this.freeContainer.object3D.scale.copy(worldScale);

        // Bewege Modell in Free Container
        this.originalParent = this.el.parentElement;
        this.freeContainer.appendChild(this.el);

        // Füge Free Container zur Scene hinzu (nicht zum Target!)
        const scene = document.querySelector('a-scene');
        scene.appendChild(this.freeContainer);

        this.isInFreeMode = true;

        // Aktiviere Touch-Gesten
        this.enableTouchGestures();

        console.log('[FreeMode] Free Mode aktiviert, Position:', worldPosition);
    },

    /**
     * Deaktiviert Free Mode - Modell wird zurück zum Marker bewegt
     */
    exitFreeMode: function () {
        if (!this.isInFreeMode) return;

        console.log('[FreeMode] Deaktiviere Free Mode für:', this.data.structureType);

        // Deaktiviere Touch-Gesten
        this.disableTouchGestures();

        // Bewege Modell zurück zum Original-Parent
        if (this.originalParent) {
            this.originalParent.appendChild(this.el);
        }

        // Entferne Free Container
        if (this.freeContainer && this.freeContainer.parentNode) {
            this.freeContainer.parentNode.removeChild(this.freeContainer);
        }

        this.freeContainer = null;
        this.isInFreeMode = false;

        // Rotations-State zurücksetzen
        this.currentRotationX = 0;
        this.currentRotationY = 0;

        console.log('[FreeMode] Free Mode deaktiviert');
    },

    /**
     * Aktiviert Touch-Gesten für Rotation
     */
    enableTouchGestures: function () {
        const canvas = document.querySelector('a-scene').canvas;
        canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
        canvas.addEventListener('touchend', this.onTouchEnd, { passive: false });

        console.log('[FreeMode] Touch-Gesten aktiviert');
    },

    /**
     * Deaktiviert Touch-Gesten
     */
    disableTouchGestures: function () {
        const canvas = document.querySelector('a-scene').canvas;
        canvas.removeEventListener('touchstart', this.onTouchStart);
        canvas.removeEventListener('touchmove', this.onTouchMove);
        canvas.removeEventListener('touchend', this.onTouchEnd);

        console.log('[FreeMode] Touch-Gesten deaktiviert');
    },

    /**
     * Touch Start Handler
     */
    onTouchStart: function (event) {
        if (!this.isInFreeMode) return;
        if (event.touches.length !== 1) return; // Nur Single-Touch

        event.preventDefault();

        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;

        console.log('[FreeMode] Touch Start:', this.touchStartX, this.touchStartY);
    },

    /**
     * Touch Move Handler - Rotiert das Modell
     */
    onTouchMove: function (event) {
        if (!this.isInFreeMode) return;
        if (event.touches.length !== 1) return;

        event.preventDefault();

        const deltaX = event.touches[0].clientX - this.touchStartX;
        const deltaY = event.touches[0].clientY - this.touchStartY;

        // Rotation berechnen (Sensitivität: 0.5 Grad pro Pixel)
        const rotationSensitivity = 0.5;
        this.currentRotationY += deltaX * rotationSensitivity;
        this.currentRotationX -= deltaY * rotationSensitivity;

        // Rotation auf Container anwenden
        if (this.freeContainer) {
            this.freeContainer.object3D.rotation.set(
                THREE.MathUtils.degToRad(this.currentRotationX),
                THREE.MathUtils.degToRad(this.currentRotationY),
                0
            );
        }

        // Update Start-Position für nächsten Frame
        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;
    },

    /**
     * Touch End Handler
     */
    onTouchEnd: function (event) {
        if (!this.isInFreeMode) return;

        console.log('[FreeMode] Touch End, finale Rotation:',
            this.currentRotationX, this.currentRotationY);
    },

    /**
     * Component Remove - Cleanup
     */
    remove: function () {
        this.disableTouchGestures();

        if (this.freeContainer && this.freeContainer.parentNode) {
            this.freeContainer.parentNode.removeChild(this.freeContainer);
        }
    }
});

console.log('[FreeMode] Free Mode Component registriert');
