document.addEventListener('DOMContentLoaded', () => {
    const musicControl = document.getElementById('musicControl');
    const bgMusic = document.getElementById('bgMusic');
    let isPlaying = false;

    // Music Control
    musicControl.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            musicControl.classList.remove('playing');
        } else {
            bgMusic.play().catch(e => {
                console.log("Audio play failed:", e);
                alert("Please interact with the page first to play audio!");
            });
            musicControl.classList.add('playing');
        }
        isPlaying = !isPlaying;
    });

    // Auto-trigger confetti on load
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // since particles fall down, start a bit higher than random
        confetti(Object.assign({}, defaults, { 
            particleCount, 
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
        }));
        confetti(Object.assign({}, defaults, { 
            particleCount, 
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
        }));
    }, 250);
});

// Button confetti effect
function confettiEffect() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
    
    // Also try to play music if not playing (user interaction allows audio)
    const bgMusic = document.getElementById('bgMusic');
    const musicControl = document.getElementById('musicControl');
    if (bgMusic.paused) {
        bgMusic.play().then(() => {
            musicControl.classList.add('playing');
        }).catch(e => console.log("Audio play failed:", e));
    }
}