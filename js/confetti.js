/* Lightweight Confetti Engine */
const Confetti = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,

    init() {
        if (this.canvas) return;

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'confetti-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '99999'; // On top of everything
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    launch(duration = 5000) {
        // Safety: Prevent stacking intervals or animations
        if (this.interval) clearInterval(this.interval);
        if (this.animationId) cancelAnimationFrame(this.animationId);

        this.init();
        const colors = ['#0078D4', '#00bcf2', '#9e25d2', '#ffffff', '#ffd700'];

        // Initial burst
        this.addParticles(200, colors);

        this.animate();

        // Continuous firing for infinite mode
        this.interval = setInterval(() => {
            this.addParticles(10, colors);
        }, 100);

        // Stop only if specific duration
        if (duration > 0) {
            setTimeout(() => {
                this.stop();
            }, duration);
        }
    },

    addParticles(count, colors) {
        for (let i = 0; i < count; i++) {
            // 50% from left corner, 50% from right corner
            const isLeft = Math.random() > 0.5;
            const startX = isLeft ? 50 : this.canvas.width - 50;
            const startY = this.canvas.height - 50;

            // Velocity: Upwards and inwards
            const angle = isLeft ? -0.25 * Math.PI : -0.75 * Math.PI; // -45deg or -135deg (facing center)
            const spread = (Math.random() - 0.5) * 1.5; // Random spread
            const velocity = Math.random() * 15 + 10;

            this.particles.push({
                x: startX,
                y: startY,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                // Physics
                vx: Math.cos(angle + spread) * velocity,
                vy: Math.sin(angle + spread) * velocity,
                gravity: 0.5,
                drag: 0.96,
                // Visuals
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 10 - 5,
                shape: Math.random() > 0.6 ? 'star' : (Math.random() > 0.5 ? 'circle' : 'rect'),
                shimmer: Math.random() > 0.8
            });
        }
    },

    animate() {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Filter out dead particles
        this.particles = this.particles.filter(p => p.y < this.canvas.height + 100);

        this.particles.forEach(p => {
            // Physics Update
            p.vx *= p.drag;
            p.vy *= p.drag;
            p.vy += p.gravity;

            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);

            if (p.shimmer) {
                this.ctx.globalAlpha = 0.5 + Math.random() * 0.5;
            } else {
                this.ctx.globalAlpha = 1;
            }

            this.ctx.fillStyle = p.color;

            if (p.shape === 'star') {
                this.drawStar(this.ctx, 0, 0, 5, p.size, p.size / 2);
            } else if (p.shape === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            }

            this.ctx.restore();
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    },

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    },

    stop() {
        if (this.interval) clearInterval(this.interval);
        cancelAnimationFrame(this.animationId);
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.canvas) {
            this.canvas.remove();
            this.canvas = null;
        }
    }
};
