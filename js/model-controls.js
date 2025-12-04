/**
 * A-Frame Component: model-controls
 *
 * Ermöglicht Maus- und Touch-Steuerung für 3D-Modelle:
 * - Linke Maustaste / Touch: Rotation
 * - Mausrad / Pinch: Zoom
 */

AFRAME.registerComponent('model-controls', {
    schema: {
        enabled: { type: 'boolean', default: true },
        rotationSpeed: { type: 'number', default: 0.5 },
        zoomSpeed: { type: 'number', default: 0.002 },
        minScale: { type: 'number', default: 0.1 },
        maxScale: { type: 'number', default: 5.0 }
    },

    init: function () {
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.currentRotation = { x: 0, y: 0 };
        this.currentScale = 0.25; // Start mit 0.25 (25% Größe)

        // Event Handlers binden
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onWheel = this.onWheel.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);

        // Canvas-Element
        this.canvas = document.querySelector('a-scene').canvas;

        // Event Listeners registrieren
        this.canvas.addEventListener('mousedown', this.onMouseDown, false);
        this.canvas.addEventListener('mousemove', this.onMouseMove, false);
        this.canvas.addEventListener('mouseup', this.onMouseUp, false);
        this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
        this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
        this.canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
        this.canvas.addEventListener('touchend', this.onTouchEnd, false);

        // Window Event Listeners für besseres Drag-Handling
        window.addEventListener('mousemove', this.onMouseMove, false);
        window.addEventListener('mouseup', this.onMouseUp, false);

        console.log('[ModelControls] Initialisiert für:', this.el.id);
    },

    remove: function () {
        // Event Listeners entfernen
        if (this.canvas) {
            this.canvas.removeEventListener('mousedown', this.onMouseDown);
            this.canvas.removeEventListener('mousemove', this.onMouseMove);
            this.canvas.removeEventListener('mouseup', this.onMouseUp);
            this.canvas.removeEventListener('wheel', this.onWheel);
            this.canvas.removeEventListener('touchstart', this.onTouchStart);
            this.canvas.removeEventListener('touchmove', this.onTouchMove);
            this.canvas.removeEventListener('touchend', this.onTouchEnd);
        }

        // Window Event Listeners entfernen
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
    },

    // ========================================================================
    // MAUS-EVENTS
    // ========================================================================

    onMouseDown: function (event) {
        if (!this.data.enabled) return;

        this.isDragging = true;
        this.previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    },

    onMouseMove: function (event) {
        if (!this.data.enabled || !this.isDragging) return;

        const deltaX = event.clientX - this.previousMousePosition.x;
        const deltaY = event.clientY - this.previousMousePosition.y;

        // Rotation aktualisieren
        this.currentRotation.y += deltaX * this.data.rotationSpeed;
        this.currentRotation.x += deltaY * this.data.rotationSpeed;

        // Rotation anwenden
        this.el.setAttribute('rotation', {
            x: this.currentRotation.x,
            y: this.currentRotation.y,
            z: 0
        });

        this.previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    },

    onMouseUp: function () {
        this.isDragging = false;
    },

    onWheel: function (event) {
        if (!this.data.enabled) return;

        event.preventDefault();

        // Zoom berechnen
        const delta = event.deltaY * this.data.zoomSpeed;
        this.currentScale -= delta;

        // Zoom limitieren
        this.currentScale = Math.max(
            this.data.minScale,
            Math.min(this.data.maxScale, this.currentScale)
        );

        // Zoom anwenden
        this.el.setAttribute('scale', {
            x: this.currentScale,
            y: this.currentScale,
            z: this.currentScale
        });
    },

    // ========================================================================
    // TOUCH-EVENTS
    // ========================================================================

    onTouchStart: function (event) {
        if (!this.data.enabled) return;

        if (event.touches.length === 1) {
            // Single Touch: Rotation
            this.isDragging = true;
            this.previousMousePosition = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        } else if (event.touches.length === 2) {
            // Multi-Touch: Zoom (Pinch)
            this.initialPinchDistance = this.getPinchDistance(event.touches);
            this.initialScale = this.currentScale;
        }
    },

    onTouchMove: function (event) {
        if (!this.data.enabled) return;

        event.preventDefault();

        if (event.touches.length === 1 && this.isDragging) {
            // Single Touch: Rotation
            const deltaX = event.touches[0].clientX - this.previousMousePosition.x;
            const deltaY = event.touches[0].clientY - this.previousMousePosition.y;

            this.currentRotation.y += deltaX * this.data.rotationSpeed;
            this.currentRotation.x += deltaY * this.data.rotationSpeed;

            this.el.setAttribute('rotation', {
                x: this.currentRotation.x,
                y: this.currentRotation.y,
                z: 0
            });

            this.previousMousePosition = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        } else if (event.touches.length === 2) {
            // Pinch Zoom
            const currentDistance = this.getPinchDistance(event.touches);
            const scaleFactor = currentDistance / this.initialPinchDistance;

            this.currentScale = this.initialScale * scaleFactor;
            this.currentScale = Math.max(
                this.data.minScale,
                Math.min(this.data.maxScale, this.currentScale)
            );

            this.el.setAttribute('scale', {
                x: this.currentScale,
                y: this.currentScale,
                z: this.currentScale
            });
        }
    },

    onTouchEnd: function () {
        this.isDragging = false;
        this.initialPinchDistance = null;
    },

    // ========================================================================
    // HILFSFUNKTIONEN
    // ========================================================================

    getPinchDistance: function (touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
});

console.log('[ModelControls] A-Frame Component registriert');
