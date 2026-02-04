/* Neon Drawing Canvas */
const DrawingEngine = {
    canvas: null,
    ctx: null,
    paths: [], // Array of { points: [{x, y}], createdAt: timestamp }
    isDrawing: false,
    animationId: null,

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'drawing-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.pointerEvents = 'none'; // IMPORTANT: Let clicks pass through!
        this.canvas.style.zIndex = '99998'; // Below overlay, above content
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        // Bind Events
        // We attach to window to catch drags anywhere
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousedown', (e) => this.startStroke(e));
        window.addEventListener('mousemove', (e) => this.addPoint(e));
        window.addEventListener('mouseup', () => this.endStroke());

        // Start Loop
        this.animate();
    },

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    startStroke(e) {
        // Only left click
        if (e.button !== 0) return;

        this.isDrawing = true;
        this.paths.push({
            points: [{ x: e.clientX, y: e.clientY }],
            createdAt: Date.now(),
            color: `hsl(${Math.random() * 60 + 180}, 100%, 70%)` // Random blues/cyans
        });
    },

    addPoint(e) {
        if (!this.isDrawing) return;
        const currentPath = this.paths[this.paths.length - 1];
        if (currentPath) {
            currentPath.points.push({ x: e.clientX, y: e.clientY });
        }
    },

    endStroke() {
        this.isDrawing = false;
    },

    animate() {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const now = Date.now();
        const MAX_AGE = 10000; // 10 seconds

        // Filter out old paths
        this.paths = this.paths.filter(p => now - p.createdAt < MAX_AGE);

        // Draw paths
        this.paths.forEach(path => {
            const age = now - path.createdAt;
            const life = 1 - (age / MAX_AGE); // 1 to 0

            if (path.points.length < 2) return;

            this.ctx.beginPath();
            this.ctx.moveTo(path.points[0].x, path.points[0].y);

            for (let i = 1; i < path.points.length; i++) {
                // simple curve smoothing could be added here
                this.ctx.lineTo(path.points[i].x, path.points[i].y);
            }

            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.lineWidth = 4;
            this.ctx.strokeStyle = path.color;
            this.ctx.globalAlpha = life; // Fade out
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = path.color;

            this.ctx.stroke();

            this.ctx.globalAlpha = 1;
            this.ctx.shadowBlur = 0;
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DrawingEngine.init());
} else {
    DrawingEngine.init();
}
