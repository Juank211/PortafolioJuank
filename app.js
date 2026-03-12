/**
 * Antigravity Framework Engine v2
 * Config: gravity: 0, friction: 0.12, elasticity: 0.85
 */
class AntigravityEngine {
    constructor(config) {
        this.gravity = config.gravity || 0;
        this.friction = config.friction || 0.12;
        this.elasticity = config.elasticity || 0.85;

        // Mouse Tracking state
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;

        // Entities systems
        this.entities = [];
        this.badges = [];
        this.shockwaves = [];

        // Canvas overlay for shockwaves
        this.canvas = document.getElementById('shockwave-canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

        this.init();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        window.addEventListener('mousemove', (e) => {
            // Normalized coordinates (-1 to 1) for parallax
            this.targetMouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
            this.targetMouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

            // Interaction con los badges
            this.updateBadgePhysics(e);
        });

        this.setupBadges();
        this.animate();
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }

    registerEntity(element, modifier = 1) {
        this.entities.push({
            el: element,
            mod: modifier
        });
    }

    setupBadges() {
        // Find all skill badges
        const badgeEls = document.querySelectorAll('.physics-badge');
        badgeEls.forEach(el => {
            this.badges.push({
                el: el,
                x: 0,
                y: 0,
                vx: 0,
                vy: 0
            });
        });
    }

    updateBadgePhysics(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const interactionRadius = 120;

        this.badges.forEach(badge => {
            const rect = badge.el.getBoundingClientRect();
            // Using the center of the badge
            const badgeCenterX = rect.left + rect.width / 2;
            const badgeCenterY = rect.top + rect.height / 2;

            const dx = badgeCenterX - mouseX;
            const dy = badgeCenterY - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < interactionRadius) {
                // Determine repulsion force
                const force = (interactionRadius - dist) / interactionRadius;
                const angle = Math.atan2(dy, dx);

                // Add velocity to the badge away from the mouse
                badge.vx += Math.cos(angle) * force * 10;
                badge.vy += Math.sin(angle) * force * 10;
            }
        });
    }

    createShockwave(x, y) {
        this.shockwaves.push({
            x: x,
            y: y,
            radius: 0,
            opacity: 1,
            maxRadius: 350,
            speed: 15
        });
    }

    animate() {
        // 1. Friction Smoothing for Parallax
        this.mouseX += (this.targetMouseX - this.mouseX) * this.friction;
        this.mouseY += (this.targetMouseY - this.mouseY) * this.friction;

        // 2. Parallax apply over Section Entities
        this.entities.forEach(entity => {
            const offsetX = -(this.mouseX * 15 * entity.mod);
            const offsetY = -(this.mouseY * 15 * entity.mod) + this.gravity;

            const rotateX = this.mouseY * 3 * entity.mod;
            const rotateY = -(this.mouseX * 3 * entity.mod);

            entity.el.style.transform = `
                perspective(1200px) 
                translate3d(${offsetX}px, ${offsetY}px, 0)
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg)
            `;
        });

        // 3. Elastic Physics on Badges
        this.badges.forEach(badge => {
            // Elastic factor bringing the badge back to origin (0, 0 local state)
            badge.vx += (0 - badge.x) * (1 - this.elasticity) * 0.5;
            badge.vy += (0 - badge.y) * (1 - this.elasticity) * 0.5;

            // Apply dampening / friction specific to the badges
            badge.vx *= 0.85;
            badge.vy *= 0.85;

            // Update local coordinates
            badge.x += badge.vx;
            badge.y += badge.vy;

            badge.el.style.transform = `translate(${badge.x}px, ${badge.y}px)`;
        });

        // 4. Render Shockwaves over Canvas
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            for (let i = this.shockwaves.length - 1; i >= 0; i--) {
                const sw = this.shockwaves[i];
                sw.radius += sw.speed;
                sw.opacity -= 0.03;

                if (sw.opacity <= 0) {
                    this.shockwaves.splice(i, 1);
                    continue;
                }

                this.ctx.beginPath();
                this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
                this.ctx.strokeStyle = `rgba(56, 189, 248, ${sw.opacity})`; // Blue Tech color
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Iniciar Motor Antigravity con los parámetros del Master Prompt
    const agEngine = new AntigravityEngine({
        gravity: 0,
        friction: 0.1,
        elasticity: 0.9
    });

    // 2. Registrar Entidades "Secciones" para el Paralaje
    const panels = document.querySelectorAll('.antigravity-entity');
    panels.forEach((panel, index) => {
        const depthModifier = 1 + (index * 0.1);
        agEngine.registerEntity(panel, depthModifier);
    });

    // 3. Efectos Críticos en Botón de CTA
    const downloadBtn = document.getElementById('download-cv-btn');
    if (downloadBtn) {

        // Físicas de "Atracción Visual" (Magnet effect)
        downloadBtn.addEventListener('mousemove', (e) => {
            const rect = downloadBtn.getBoundingClientRect();
            // Calcular la distancia desde el centro del botón al mouse
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Atraer el botón hacia el mouse levemente
            downloadBtn.style.transform = `scale(1.05) translate(${x * 0.2}px, ${y * 0.2}px)`;
        });

        downloadBtn.addEventListener('mouseleave', () => {
            // Retorno al reposo
            downloadBtn.style.transform = `scale(1) translate(0px, 0px)`;
        });

        // Onda de choque en el Canvas principal (Event Listener Click)
        downloadBtn.addEventListener('click', (e) => {
            console.log('Antigravity Engine: Disparando onda de choque para descarga CV.');
            agEngine.createShockwave(e.clientX, e.clientY);
        });
    }

    // 4. Mejoras en Formulario de Contacto (Feedback Visual)
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function () {
            const btn = this.querySelector('.submit-btn');
            const btnText = btn.querySelector('span');
            const btnIcon = btn.querySelector('i');

            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.7';
            if (btnText) btnText.innerText = 'Enviando...';
            if (btnIcon) btnIcon.className = 'fa-solid fa-circle-notch fa-spin';

            // Note: Formspree will handle the redirect, so we don't need to preventDefault
        });
    }

    // --- SUPABASE COMMENTS MODULE (V2: Vertical & Email/Pass) ---

    const SUPABASE_URL = 'https://ldgermoplpayaaplrfrm.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_E91EbmOPkbZzViZyIz6OTA_0tzteUBW';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    let currentPage = 0;
    const commentsList = document.getElementById('comments-list-vertical');
    const loadMoreBtn = document.getElementById('load-more-comments');
    const authModal = document.getElementById('auth-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const openAuthTrigger = document.getElementById('open-auth-trigger');
    const closeAuthBtn = document.getElementById('close-modal');

    // UI Element Switchers
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-target');
            document.querySelectorAll('.auth-view').forEach(v => v.classList.remove('active'));
            document.getElementById(target).classList.add('active');
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // Password Toggle Logic (Hold to See)
    const setupPasswordToggle = () => {
        const toggles = document.querySelectorAll('.password-toggle');
        toggles.forEach(toggle => {
            const inputId = toggle.getAttribute('data-input');
            const input = document.getElementById(inputId);
            const icon = toggle.querySelector('i');

            const show = () => {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            };
            const hide = () => {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            };

            toggle.addEventListener('mousedown', show);
            toggle.addEventListener('mouseup', hide);
            toggle.addEventListener('mouseleave', hide);
            toggle.addEventListener('touchstart', (e) => { e.preventDefault(); show(); });
            toggle.addEventListener('touchend', (e) => { e.preventDefault(); hide(); });
        });
    };
    setupPasswordToggle();

    // UI State Management
    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        const placeholder = document.getElementById('auth-check-placeholder');
        const form = document.getElementById('logged-comment-form');
        const displayName = document.getElementById('user-display-name');

        if (user) {
            placeholder.style.display = 'none';
            form.style.display = 'block';
            displayName.innerText = `Como: ${user.user_metadata?.full_name || user.email}`;
            return user;
        } else {
            placeholder.style.display = 'block';
            form.style.display = 'none';
            return null;
        }
    }

    // Auth Actions
    document.getElementById('do-signup').addEventListener('click', async () => {
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-password-confirm').value;

        if (!name || !email || !password) return alert('Completa todos los campos');
        if (password !== confirm) return alert('Las contraseñas no coinciden');

        const btn = document.getElementById('do-signup');
        btn.innerText = 'Registrando...';

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name },
                emailRedirectTo: 'https://juank211.github.io/PotafolioPersonal/'
            }
        });

        if (error) alert(error.message);
        else alert('¡Registro solicitado! Revisa tu email para confirmar tu cuenta.');
        
        btn.innerText = 'Registrarse';
    });

    document.getElementById('do-login').addEventListener('click', async () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) return alert('Ingresa credenciales');

        const btn = document.getElementById('do-login');
        btn.innerText = 'Entrando...';

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) alert(error.message);
        else location.reload();

        btn.innerText = 'Entrar';
    });

    document.getElementById('logout-link').addEventListener('click', async () => {
        await supabase.auth.signOut();
        location.reload();
    });

    // Post Comment Action (Top Position)
    document.getElementById('submit-main-comment').addEventListener('click', async () => {
        const content = document.getElementById('main-comment-textarea').value;
        if (!content) return;

        const btn = document.getElementById('submit-main-comment');
        btn.disabled = true;
        btn.innerText = '...';

        const { error } = await supabase.from('comments').insert({ content });

        if (error) alert(error.message);
        else {
            document.getElementById('main-comment-textarea').value = '';
            location.reload(); // Reload to show at top
        }
        btn.disabled = false;
        btn.innerText = 'Publicar';
    });

    // Load Comments (Vertical List)
    async function loadComments(page = 0) {
        const { data, error } = await supabase
            .from('comments')
            .select(`
                *,
                profiles (full_name)
            `)
            .order('created_at', { ascending: false })
            .range(page * 5, (page * 5) + 4);

        if (error) return console.error(error);

        if (data.length < 5) loadMoreBtn.style.display = 'none';

        data.forEach(comment => {
            const div = document.createElement('div');
            div.className = 'vertical-comment';
            
            const name = comment.profiles?.full_name || 'Usuario';
            const date = new Date(comment.created_at).toLocaleString();

            div.innerHTML = `
                <div class="comment-header">
                    <strong style="color: var(--accent-color)">${name}</strong>
                    <small style="margin-left: 10px; color: var(--text-muted); font-size: 0.75rem">${date}</small>
                </div>
                <div class="comment-content" style="margin-top: 8px; color: #e2e8f0; line-height: 1.5">
                    ${comment.content}
                </div>
            `;
            commentsList.appendChild(div);
        });
    }

    // Modal Control
    const openModal = () => {
        authModal.classList.add('active');
        modalOverlay.classList.add('active');
    };
    const closeModal = () => {
        authModal.classList.remove('active');
        modalOverlay.classList.remove('active');
    };

    openAuthTrigger?.addEventListener('click', openModal);
    closeAuthBtn?.addEventListener('click', closeModal);
    modalOverlay?.addEventListener('click', closeModal);

    loadMoreBtn?.addEventListener('click', () => {
        currentPage++;
        loadComments(currentPage);
    });

    // Init
    checkUser();
    loadComments(0);
});
