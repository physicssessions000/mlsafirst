/* Neon Drawing Canvas - OPTIMIZED */
const DrawingEngine = {
    canvas: null,
    ctx: null,
    paths: [], // Array of { points: [{x, y}], createdAt: timestamp }
    isDrawing: false,
    animationId: null,
    lastPointTime: 0,
    isRunning: false,

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'drawing-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.transform = 'translate3d(0,0,0)'; // Hardware accel
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.pointerEvents = 'none'; // IMPORTANT: Let clicks pass through!
        this.canvas.style.zIndex = '99998'; // Below overlay, above content
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d', { alpha: true }); // optimize context
        this.resize();

        // Bind Events
        // We attach to window to catch drags anywhere
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousedown', (e) => this.startStroke(e));
        window.addEventListener('mousemove', (e) => this.addPoint(e));
        window.addEventListener('mouseup', () => this.endStroke());
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

        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    },

    addPoint(e) {
        if (!this.isDrawing) return;

        const currentPath = this.paths[this.paths.length - 1];
        if (!currentPath || currentPath.points.length === 0) return;

        const lastPoint = currentPath.points[currentPath.points.length - 1];
        const dx = e.clientX - lastPoint.x;
        const dy = e.clientY - lastPoint.y;

        // Throttling: Check distance (5px threshold)
        if (dx * dx + dy * dy < 25) return;

        currentPath.points.push({ x: e.clientX, y: e.clientY });
        this.lastPointTime = Date.now();
    },

    endStroke() {
        this.isDrawing = false;
    },

    animate() {
        if (!this.ctx || !this.isRunning) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const now = Date.now();
        const MAX_AGE = 5000; // Reduced to 5s for performance

        // Filter: Keep only active paths
        // Optimization: traversing backwards helps with splicing if we were splicing, 
        // but creating a new array is often cleaner. Let's stick to filter but check bounds first.
        let activePathsCount = 0;

        // Use a new array only if we need to remove items to reduce GC thrashing? 
        // Actually, simple filter is fine for < 100 paths.
        this.paths = this.paths.filter(p => now - p.createdAt < MAX_AGE);

        if (this.paths.length === 0 && !this.isDrawing) {
            this.isRunning = false;
            return; // Stop loop
        }

        // Draw paths
        for (const path of this.paths) {
            const age = now - path.createdAt;
            const life = 1 - (age / MAX_AGE); // 1 to 0

            if (path.points.length < 2) continue;

            this.ctx.beginPath();
            this.ctx.moveTo(path.points[0].x, path.points[0].y);

            // Optimization: Don't draw every single point if they are too close?
            // For now, raw points are fine due to throttling in addPoint.
            for (let i = 1; i < path.points.length; i++) {
                this.ctx.lineTo(path.points[i].x, path.points[i].y);
            }

            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            // Optimization: shadowBlur is very expensive. Replaced with simpler line.
            this.ctx.globalAlpha = life;

            // Draw "Glow" (just a wider semi-transparent line underneath)
            this.ctx.lineWidth = 10;
            this.ctx.strokeStyle = path.color.replace(')', ', 0.2)').replace('hsl', 'hsla');
            this.ctx.stroke();

            // Draw Core
            this.ctx.lineWidth = 3;
            this.ctx.strokeStyle = path.color;
            this.ctx.stroke();

            this.ctx.globalAlpha = 1;
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DrawingEngine.init());
} else {
    DrawingEngine.init();
}
