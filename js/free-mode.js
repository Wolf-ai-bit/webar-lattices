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

    /**
     * Aktiviert Camera-Relative Free Mode
     * 1. Misst aktuelle Distanz zur Kamera
     * 2. Bewegt Modell-Container zur Kamera (in gespeicherter Distanz)
     */
    enterFreeMode: function () {
        if (this.isInFreeMode) return;

        console.log('[FreeMode] Aktiviere Camera-Relative Free Mode für:', this.data.structureType);

        // Finde den models-Container (Eltern-Element des Modells)
        let modelsContainer = this.el.parentElement;

        // Gehe eine Ebene höher falls nötig
        if (!modelsContainer.id.includes('models')) {
            modelsContainer = modelsContainer.parentElement;
        }

        console.log('[FreeMode] Models Container:', modelsContainer.id);

        // SCHRITT 1: Messe aktuelle Distanz zur Kamera
        const camera = document.querySelector('[camera]');
        if (!camera) {
            console.error('[FreeMode] Kamera nicht gefunden!');
            return;
        }

        const cameraPos = new THREE.Vector3();
        camera.object3D.getWorldPosition(cameraPos);

        const modelPos = new THREE.Vector3();
        modelsContainer.object3D.getWorldPosition(modelPos);

        // Berechne Distanz
        this.savedDistance = cameraPos.distanceTo(modelPos);

        // Begrenze Distanz (min 20cm, max 2m)
        this.savedDistance = Math.max(0.2, Math.min(2.0, this.savedDistance));

        console.log('[FreeMode] Gemessene Distanz zur Kamera:', this.savedDistance, 'm');

        // Speichere Original-Parent
        this.originalParent = modelsContainer.parentElement;
        this.originalPosition = {
            x: modelsContainer.getAttribute('position').x,
            y: modelsContainer.getAttribute('position').y,
            z: modelsContainer.getAttribute('position').z
        };

        // SCHRITT 2: Bewege models-Container zur Kamera
        // Position vor der Kamera (negative Z-Achse in A-Frame)
        modelsContainer.setAttribute('position', {
            x: 0,
            y: 0,
            z: -this.savedDistance
        });

        // Mache Container zu Child der Kamera
        camera.appendChild(modelsContainer);

        this.isInFreeMode = true;
        this.movedContainer = modelsContainer;

        // WICHTIG: Stelle SOFORT sicher, dass Modelle sichtbar sind
        this.forceVisibility();

        // Starte Visibility-Enforcement Watcher (kämpft gegen MindAR's Auto-Hide)
        this.startVisibilityEnforcement();

        // Aktiviere Touch-Gesten
        this.enableTouchGestures();

        console.log('[FreeMode] Camera-Relative Mode aktiviert');
        console.log('[FreeMode] Position vor Kamera:', `0, 0, -${this.savedDistance}`);
    },

    /**
     * Erzwingt Sichtbarkeit der Modelle SOFORT
     */
    forceVisibility: function () {
        if (!this.movedContainer) return;

        // Finde alle Modelle im Container
        const allModels = this.movedContainer.querySelectorAll('a-gltf-model');

        allModels.forEach(model => {
            const visible = model.getAttribute('visible');
            if (visible === 'true' || visible === true) {
                // Setze explizit auf sichtbar
                model.setAttribute('visible', 'true');
                model.object3D.visible = true;

                console.log('[FreeMode] Force Visibility für:', model.id, '✓');
            }
        });
    },

    /**
     * Startet Visibility-Enforcement Watcher
     * Kämpft gegen MindAR's Auto-Hide bei Target Lost
     */
    startVisibilityEnforcement: function () {
        // Stoppe vorherigen Watcher falls vorhanden
        this.stopVisibilityEnforcement();

        // Starte neuen Watcher (alle 100ms - sehr aggressiv!)
        this.visibilityEnforcementInterval = setInterval(() => {
            if (this.isInFreeMode && this.movedContainer) {
                // Setze Container-Sichtbarkeit
                this.movedContainer.setAttribute('visible', 'true');
                if (this.movedContainer.object3D) {
                    this.movedContainer.object3D.visible = true;
                }

                // Finde alle Modelle und setze Sichtbarkeit
                const allModels = this.movedContainer.querySelectorAll('a-gltf-model');
                allModels.forEach(model => {
                    const visible = model.getAttribute('visible');
                    if (visible === 'true' || visible === true) {
                        // Setze BEIDE Properties
                        model.setAttribute('visible', 'true');
                        if (model.object3D) model.object3D.visible = true;
                    }
                });
            }
        }, 100); // Alle 100ms prüfen

        console.log('[FreeMode] Visibility-Enforcement Watcher gestartet');
    },

    /**
     * Stoppt Visibility-Enforcement Watcher
     */
    stopVisibilityEnforcement: function () {
        if (this.visibilityEnforcementInterval) {
            clearInterval(this.visibilityEnforcementInterval);
            this.visibilityEnforcementInterval = null;
            console.log('[FreeMode] Visibility-Enforcement Watcher gestoppt');
        }
    },

    /**
     * Deaktiviert Free Mode - Modell wird zurück zum Marker bewegt
     */
    exitFreeMode: function () {
        if (!this.isInFreeMode) return;

        console.log('[FreeMode] Deaktiviere Free Mode für:', this.data.structureType);

        // Stoppe Visibility-Enforcement
        this.stopVisibilityEnforcement();

        // Deaktiviere Touch-Gesten
        this.disableTouchGestures();

        // Bewege models-Container zurück zum Original-Parent (Target)
        if (this.originalParent && this.movedContainer) {
            // Setze Original-Position zurück
            this.movedContainer.setAttribute('position', this.originalPosition);

            // Bewege zurück zu Original-Parent
            this.originalParent.appendChild(this.movedContainer);
        }

        this.movedContainer = null;
        this.isInFreeMode = false;

        // Rotations-State zurücksetzen
        this.currentRotationX = 0;
        this.currentRotationY = 0;
        this.currentScale = 1.0;

        console.log('[FreeMode] Free Mode deaktiviert');
    },

    /**
     * Aktiviert Touch-Gesten für Rotation und Zoom
     */
    enableTouchGestures: function () {
        const canvas = document.querySelector('a-scene').canvas;
        canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
        canvas.addEventListener('touchend', this.onTouchEnd, { passive: false });

        console.log('[FreeMode] Touch-Gesten aktiviert (Drehen + Pinch-Zoom)');
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
