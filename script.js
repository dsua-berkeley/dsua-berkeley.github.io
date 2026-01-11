const canvas = document.getElementById('interactive-background');
const ctx = canvas.getContext('2d');

let particlesArray;

// SETTINGS
const spacing = 250;
const jitterFactor = 0.5;

// COLORS
const colorLight = '#E0ECF8';
const colorDark  = '#164776';

// MOUSE INTERACTION
let mouse = {
    x: null,
    y: null,
    radius: 200
}

window.addEventListener('mousemove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

// TRACKING THE BLUE SECTION
let sectionTop = 0;
let sectionBottom = 0;

function updateSectionBounds() {
    const aboutSection = document.querySelector('.about');
    if (aboutSection) {
        const rect = aboutSection.getBoundingClientRect();
        sectionTop = rect.top;
        sectionBottom = rect.bottom;
    }
}
updateSectionBounds();
window.addEventListener('scroll', updateSectionBounds);

// HIGH DPI SCALING
function setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);
    init();
}

// PARTICLE CLASS
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.size = 4;
        this.density = (Math.random() * 10) + 5;
    }

    update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx*dx + dy*dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius) {
            this.x -= directionX;
            this.y -= directionY;
        } else {
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx / 20;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy / 20;
            }
        }
    }

    draw(color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fill();
    }
}

function init() {
    particlesArray = [];
    
    // Create Grid
    for (let y = 0; y < window.innerHeight + spacing; y += spacing) {
        for (let x = 0; x < window.innerWidth + spacing; x += spacing) {
            
            let drawX = x;
            let drawY = y;
            
            if (Math.floor(y / spacing) % 2 === 1) {
                drawX += spacing / 2;
            }

            let randomOffsetX = (Math.random() - 0.5) * spacing * jitterFactor;
            let randomOffsetY = (Math.random() - 0.5) * spacing * jitterFactor;

            particlesArray.push(new Particle(drawX + randomOffsetX, drawY + randomOffsetY));
        }
    }
}

function drawNetwork(color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < particlesArray.length; i++) {
        const p = particlesArray[i];
        p.draw(color);

        for (let j = i; j < particlesArray.length; j++) {
            const p2 = particlesArray[j];
            
            if (Math.abs(p.x - p2.x) > spacing * 1.5 ||
                Math.abs(p.y - p2.y) > spacing * 1.5) {
                continue;
            }

            let distance = ((p.x - p2.x) * (p.x - p2.x)) + ((p.y - p2.y) * (p.y - p2.y));
            let connectDistance = spacing * 1.4; 
            
            if (distance < (connectDistance * connectDistance)) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    // Clear the entire screen
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    // Update Physics positions
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }

    // Draw GRAY Layer (Everywhere)
    drawNetwork(colorLight);

    // ERASE the Gray layer from the Blue Section specifically
    // This punches a "hole" in the gray graph so nothing is underneath the blue graph
    ctx.clearRect(0, sectionTop, window.innerWidth, sectionBottom - sectionTop);

    // Draw DARK BLUE Layer
    ctx.save(); 
    ctx.beginPath();
    ctx.rect(0, sectionTop, window.innerWidth, sectionBottom - sectionTop);
    ctx.clip(); 
    drawNetwork(colorDark);
    ctx.restore(); 
}

window.addEventListener('resize', function() {
    setupCanvas();
});

setupCanvas();
animate();