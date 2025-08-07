function generateTiles() {
    const container = document.getElementById('tileContainer');
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Responsive tile sizes
    let tileSize, gap;
    if (window.innerWidth < 480) {
        tileSize = 40;
        gap = 2;
    } else if (window.innerWidth < 768) {
        tileSize = 50;
        gap = 3;
    } else if (window.innerWidth < 1200) {
        tileSize = 65;
        gap = 4;
    } else {
        tileSize = 75;
        gap = 5;
    }
    
    // Calculate how many tiles fit perfectly
    const tilesPerRow = Math.floor((viewportWidth + gap) / (tileSize + gap));
    const tilesPerColumn = Math.floor((viewportHeight + gap) / (tileSize + gap));
    
    // Calculate the actual tile size to fill the space evenly
    const actualTileWidth = (viewportWidth - (gap * (tilesPerRow - 1))) / tilesPerRow;
    const actualTileHeight = (viewportHeight - (gap * (tilesPerColumn - 1))) / tilesPerColumn;
    
    // Set the grid template with exact dimensions
    container.style.gridTemplateColumns = `repeat(${tilesPerRow}, ${actualTileWidth}px)`;
    container.style.gridTemplateRows = `repeat(${tilesPerColumn}, ${actualTileHeight}px)`;
    
    const totalTiles = tilesPerRow * tilesPerColumn;
    
    container.innerHTML = '';
    
    for (let i = 0; i < totalTiles; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.index = i;
        
        const row = Math.floor(i / tilesPerRow);
        const col = i % tilesPerRow;
        
        // Add edge and corner classes
        if (row === 0 && col === 0) tile.classList.add('corner-tl');
        else if (row === 0 && col === tilesPerRow - 1) tile.classList.add('corner-tr');
        else if (row === tilesPerColumn - 1 && col === 0) tile.classList.add('corner-bl');
        else if (row === tilesPerColumn - 1 && col === tilesPerRow - 1) tile.classList.add('corner-br');
        else if (row === 0 || row === tilesPerColumn - 1 || col === 0 || col === tilesPerRow - 1) {
            tile.classList.add('edge');
        }
        
        container.appendChild(tile);
    }
}

// Cursor tracking
const cursorLight = document.querySelector('.cursor-light');
const cursorDot = document.querySelector('.cursor-dot');
const backgroundOverlay = document.querySelector('.background-overlay');
let mouseX = 0;
let mouseY = 0;
let lightX = 0;
let lightY = 0;
let isInteracting = false;
let fadeTimeout;

function updateCursor() {
    // Increased delay for smoother, more delayed following effect
    const followSpeed = window.innerWidth < 768 ? 0.05 : 0.06;
    lightX += (mouseX - lightX) * followSpeed;
    lightY += (mouseY - lightY) * followSpeed;

    cursorLight.style.left = lightX + 'px';
    cursorLight.style.top = lightY + 'px';

    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';

    // Update background overlay
    backgroundOverlay.style.setProperty('--mouse-x', (mouseX / window.innerWidth * 100) + '%');
    backgroundOverlay.style.setProperty('--mouse-y', (mouseY / window.innerHeight * 100) + '%');

    requestAnimationFrame(updateCursor);
}

function fadeOutLighting() {
    cursorLight.classList.add('fade-out');
    cursorDot.classList.add('fade-out');
    backgroundOverlay.classList.add('fade-out');
}

function fadeInLighting() {
    cursorLight.classList.remove('fade-out');
    cursorDot.classList.remove('fade-out');
    backgroundOverlay.classList.remove('fade-out');
}

function checkCenterProximity() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const distanceFromCenter = Math.sqrt(
        Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
    );
    const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2)) * 0.3;

    return distanceFromCenter < maxDistance;
}

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Clear any existing fade timeout
    clearTimeout(fadeTimeout);

    // Check if mouse is near any tiles or center
    const tiles = document.querySelectorAll('.tile');
    let nearTile = false;
    
    // Responsive interaction radius
    const interactionRadius = window.innerWidth < 768 ? 80 : 140;

    tiles.forEach(tile => {
        const rect = tile.getBoundingClientRect();
        const tileCenterX = rect.left + rect.width / 2;
        const tileCenterY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
            Math.pow(mouseX - tileCenterX, 2) + Math.pow(mouseY - tileCenterY, 2)
        );

        if (distance < interactionRadius) {
            tile.classList.add('glow');
            nearTile = true;

            // Create floating particles occasionally (less frequent on mobile)
            const particleChance = window.innerWidth < 768 ? 0.02 : 0.04;
            if (Math.random() < particleChance) {
                createParticle(tileCenterX, tileCenterY);
            }
        } else {
            tile.classList.remove('glow');
        }
    });

    // Check if near center or interacting with tiles
    const nearCenter = checkCenterProximity();
    isInteracting = nearTile || nearCenter;

    if (isInteracting) {
        fadeInLighting();
    } else {
        // Increased timeout for longer delay
        fadeTimeout = setTimeout(() => {
            if (!isInteracting) {
                fadeOutLighting();
            }
        }, 1500);
    }
});

// Handle mouse leaving the window
document.addEventListener('mouseleave', () => {
    clearTimeout(fadeTimeout);
    fadeOutLighting();
    isInteracting = false;
});

// Handle mouse entering the window
document.addEventListener('mouseenter', () => {
    clearTimeout(fadeTimeout);
    fadeInLighting();
});

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    document.body.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 3000);
}

// Tile interaction effects
document.addEventListener('click', (e) => {
    const tile = e.target.closest('.tile');
    if (tile) {
        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(100, 150, 255, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.width = '100px';
        ripple.style.height = '100px';
        ripple.style.marginLeft = '-50px';
        ripple.style.marginTop = '-50px';
        ripple.style.pointerEvents = 'none';

        tile.style.position = 'relative';
        tile.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
});

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
document.head.appendChild(style);

// Handle window resize with debouncing for better performance
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        generateTiles();
    }, 150);
});

// Initialize
generateTiles();
updateCursor();

// Add some ambient animations with responsive timing
const ambientInterval = window.innerWidth < 768 ? 7000 : 5000;
setInterval(() => {
    const randomTile = document.querySelector(`.tile:nth-child(${Math.floor(Math.random() * document.querySelectorAll('.tile').length) + 1})`);
    if (randomTile && !randomTile.classList.contains('glow')) {
        randomTile.style.animation = 'pulse 2s ease-in-out';
        setTimeout(() => {
            randomTile.style.animation = '';
        }, 2000);
    }
}, ambientInterval);

// Add pulse animation with dimmer glow
const pulseStyle = document.createElement('style');
pulseStyle.textContent = `
            @keyframes pulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.8;
                    box-shadow: 0 0 12px rgba(100, 150, 255, 0.15);
                }
            }
        `;
document.head.appendChild(pulseStyle);