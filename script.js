/**
 * Hilfsfunktion zum Laden von JSON-Daten
 */
async function fetchJSON(file) {
    try {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        return await response.json();
    } catch (e) {
        console.error(`Fehler beim Laden von ${file}:`, e);
        return null;
    }
}

/**
 * Lädt die Band-Daten aus JSON und rendert sie
 */
async function loadBand() {
    const paragraphs = await fetchJSON('band.json');
    const container = document.getElementById('content-beschreibung');
    if (paragraphs && container) {
        container.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
        
        // Erstellt den Button-Verweis zur Termine-Sektion
        const gigLink = document.createElement('a');
        gigLink.href = '#gigs';
        gigLink.className = 'btn btn-small';
        gigLink.textContent = 'Zu den Terminen';
        gigLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = 'gigs'; // Nutzt jetzt das scroll-padding-top aus CSS
        });
        
        container.appendChild(gigLink);
        container.classList.add('component-fade-in');
    }
}

/**
 * Lädt Termine aus JSON und baut die Tabelle dynamisch
 */
async function loadGigs() {
    const gigs = await fetchJSON('termine.json');
    const container = document.getElementById('content-termine');
    if (!gigs || !container) return;

    const today = new Date().setHours(0, 0, 0, 0);

    // Sortierung: Absteigend nach Datum (neueste zuerst)
    gigs.sort((a, b) => new Date(b.date) - new Date(a.date));

    let html = `<div class="table-responsive"><table class="gig-table">
        <thead><tr><th>Datum</th><th>Ort</th><th>Event</th></tr></thead><tbody>`;

    gigs.forEach(gig => {
        const gigDate = new Date(gig.date);
        const isPast = gigDate < today ? 'class="past-gig"' : '';
        const formattedDate = gigDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
        html += `<tr ${isPast}><td>${formattedDate}</td><td>${gig.city}</td><td>${gig.location} ${gig.time ? `(${gig.time})` : ''}</td></tr>`;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

/**
 * Lädt Videos aus JSON und baut das Grid dynamisch
 */
async function loadVideos() {
    const videos = await fetchJSON('videos.json');
    const container = document.getElementById('content-video');
    if (!videos || !container) return;

    let html = '<div class="media-grid">';
    videos.forEach(video => {
        const embedUrl = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`;
        // YouTube Thumbnail-URL (hqdefault ist ein guter Kompromiss aus Qualität und Speed)
        const thumbUrl = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
        
        html += `
            <div class="media-item">
                <div class="video-container" title="Klicken zum Abspielen" 
                     onclick="this.innerHTML = '<iframe src=\\'${embedUrl}\\' title=\\'${video.title}\\' frameborder=\\'0\\' allow=\\'autoplay; fullscreen\\' allowfullscreen></iframe>'">
                    <div class="video-placeholder">
                        <span>${video.title}</span>
                    </div>
                </div>
            </div>`;
    });
    html += '</div>';
    container.innerHTML = html;
    container.classList.add('component-fade-in');
}

/**
 * Lädt Audio-Tracks aus JSON und baut das Grid dynamisch
 */
async function loadAudio() {
    const tracks = await fetchJSON('audio.json');
    const container = document.getElementById('content-audio');
    if (!tracks || !container) return;

    let html = '<div class="audio-grid">';
    tracks.forEach(track => {
        html += `
            <div class="audio-item">
                <iframe width="100%" height="166" scrolling="no" frameborder="no" title="Audio Track: ${track.title}" allow="autoplay" loading="lazy" src="https://w.soundcloud.com/player/?url=${track.soundcloudPath}&color=%23c5a059&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"></iframe>
            </div>`;
    });
    html += '</div>';
    container.innerHTML = html;
    container.classList.add('component-fade-in');
}

/**
 * Lädt Galerie-Bilder aus JSON
 */
async function loadGalerie() {
    const images = await fetchJSON('galerie.json');
    const container = document.getElementById('content-galerie');
    if (!container) return;

    if (images && images.length > 0) {
        container.innerHTML = `<div class="gallery-grid">
            ${images.map(img => `
                <div class="gallery-item" onclick="window.openImageModal('${img.src}')">
                    <img src="${img.src}" 
                         alt="${img.alt || 'Galeriebild'}" 
                         loading="lazy" 
                         onload="this.classList.add('loaded')"
                         onerror="this.style.display='none'">
                </div>`).join('')}
        </div>`;
        
        // Sofort prüfen, ob Bilder bereits aus dem Cache geladen wurden
        container.querySelectorAll('img').forEach(img => {
            if (img.complete) img.classList.add('loaded');
        });

        container.classList.add('component-fade-in');
    } else {
        console.warn('Galerie konnte nicht geladen werden oder ist leer. Platzhalter bleiben stehen.');
        // Wir lassen die Platzhalter aus dem HTML stehen, statt sie durch Text zu ersetzen.
    }
}

/**
 * Lädt Presseberichte aus JSON und baut die Karten dynamisch
 */
async function loadPresse() {
    const entries = await fetchJSON('presse.json');
    const container = document.getElementById('content-presse');
    if (!entries || !container) return;

    let html = '<div class="press-grid">';
    entries.forEach(entry => {
        const link = entry.link ? entry.link.trim() : "";
        const hasLink = link !== "";

        if (hasLink) {
            const isImage = /\.(jpg|jpeg|png|webp)$/i.test(link);
            const linkAttr = isImage 
                ? `onclick="window.openImageModal('${link}'); return false;"` 
                : `target="_blank" rel="noopener noreferrer"`;

            html += `
                <div class="press-card has-link">
                    <a href="${link}" ${linkAttr} style="display: block;">
                        <p class="quote">"${entry.quote}"</p>
                        <cite>${entry.cite}</cite>
                    </a>
                </div>`;
        } else {
            html += `
                <div class="press-card">
                    <p class="quote">"${entry.quote}"</p>
                    <cite>${entry.cite}</cite>
                </div>`;
        }
    });
    html += '</div>';
    container.innerHTML = html;
    container.classList.add('component-fade-in');
}

/**
 * Global verfügbare Funktion zum Öffnen des Bild-Modals
 */
function openImageModal(src) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    if (modal && modalImg) {
        modalImg.src = src;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Scrollen unterbinden
    }
}
window.openImageModal = openImageModal;

/**
 * Initialisiert Scroll-Animationen und die aktive Navigation
 */
function initScrollAnimations() {
    const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
    
    // Observer für Reveal-Elemente: Stoppt die Beobachtung nach der ersten Aktivierung (spart Performance)
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });

    // Separater Observer für Sektionen zur Steuerung der Nav-Links und Pfeile
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    document.querySelectorAll('section').forEach(section => sectionObserver.observe(section));
}

/**
 * Steuert das Erscheinungsbild des Headers beim Scrollen (gedrosselt via rAF)
 */
function initHeaderScroll() {
    const header = document.querySelector('header');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 80) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

document.addEventListener("DOMContentLoaded", () => {
    // Animationen und Header-Logik sofort starten, damit die Seite sichtbar wird
    initScrollAnimations();
    initHeaderScroll();

    // Modal Logik für Schließen
    const modal = document.getElementById('imageModal');
    const closeModal = () => {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = ''; // Scrollen wieder erlauben
            const modalImg = document.getElementById('modalImg');
            if (modalImg) modalImg.src = '';
    };

    modal?.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('close-modal')) {
            closeModal();
        }
    });

    // ESC-Taste zum Schließen
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('active')) closeModal();
    });

    // Warte, bis alle Inhalte geladen sind, bevor Animationen/Logik starten
    Promise.all([
        loadBand(),
        loadGigs(),
        loadVideos(),
        loadAudio(),
        loadPresse(),
        loadGalerie()
    ]);

    // Dynamisches Jahr im Footer
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Mobile Menu Toggle
    const nav = document.querySelector('nav');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    menuToggle?.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('active');
        nav.classList.toggle('menu-open', isOpen);
    });

    // Keyboard Support für Menu Toggle
    menuToggle?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            menuToggle.click();
        }
    });

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            nav.classList.remove('menu-open');
        });
    });

    // Scroll-Indicator Klick-Logik
    document.querySelectorAll('.scroll-indicator').forEach(indicator => {
        indicator.addEventListener('click', () => {
            const targetId = indicator.getAttribute('data-target');
            if (targetId) {
                document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Musik-Player Logik
    const music = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicToggle');
    
    if (music && musicBtn) {
        musicBtn.addEventListener('click', () => {
            if (music.paused) {
                music.play();
                musicBtn.innerHTML = '<span>⏸</span> Playing Moonboots';
                musicBtn.classList.add('playing');
            } else {
                music.pause();
                musicBtn.innerHTML = '<span>♫</span> Take me to the moon';
                musicBtn.classList.remove('playing');
            }
        });
    }
});
