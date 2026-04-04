(() => {
    "use strict";

    /* =========================================================
       HELPERS
       ========================================================= */
    const utils = {
        clamp(value, min, max) {
            return Math.min(Math.max(value, min), max);
        },

        lerp(start, end, amount) {
            return start + (end - start) * amount;
        }
    };

    /* =========================================================
       HERO LAPTOP JOURNEY
       
       Sequence (scroll progress 0→1):
         0.00–0.05  — intro: laptop sits closed, welcome text visible
         0.05–0.30  — lid opens (rotateX from -112° → 0°), screen powers on
         0.15–0.30  — welcome text fades out
         0.30–0.85  — whole laptop zooms forward (scale up) toward viewer,
                      device remains fully visible, ENTIRE machine comes closer
         0.85–1.00  — final merge: device fades, shell content takes over
       ========================================================= */
    function initHeroSection() {
        const hero = document.querySelector(".hero-laptop");
        const scene = document.getElementById("heroLaptopScene");
        const welcome = document.getElementById("heroLaptopWelcome");
        const deviceWrap = document.getElementById("heroLaptopDeviceWrap");
        const device = document.getElementById("heroLaptopDevice");
        const lid = document.getElementById("heroLaptopLid");
        const screen = document.getElementById("heroLaptopScreen");
        const indicator = document.getElementById("heroLaptopScrollIndicator");
        const pageShell = document.getElementById("laptopPageShell");
        const workSection = document.getElementById("work");
        const heroBg = hero ? hero.querySelector(".hero-laptop__bg") : null;

        const base = device ? device.querySelector(".hero-laptop__base") : null;
        const shadow = device ? device.querySelector(".hero-laptop__shadow") : null;

        if (!hero || !scene || !deviceWrap || !device || !lid || !screen || !pageShell || !heroBg || !workSection) return;

        const root = document.documentElement;
        const body = document.body;

        /* ---------------------------------------------------------
           BACKGROUND SYSTEM
           closed hero bg = wider / softer / more "outside the laptop"
           inside laptop bg = darker / deeper / more distinct / used
           for opened hero + rest of page
        --------------------------------------------------------- */
        const CLOSED_BG = `
            radial-gradient(circle at 18% 20%, rgba(255, 255, 255, 0.10), transparent 22%),
            radial-gradient(circle at 78% 24%, rgba(210, 210, 210, 0.08), transparent 18%),
            radial-gradient(circle at 24% 70%, rgba(170, 170, 170, 0.06), transparent 18%),
            radial-gradient(circle at 82% 78%, rgba(235, 235, 235, 0.05), transparent 16%),
            linear-gradient(180deg, #020202 0%, #070707 30%, #0d0d0d 65%, #141414 100%)
        `;

                const INSIDE_BG = `
            radial-gradient(circle at 18% 20%, rgba(86, 117, 255, 0.18), transparent 18%),
            radial-gradient(circle at 78% 24%, rgba(158, 231, 255, 0.10), transparent 16%),
            radial-gradient(circle at 24% 66%, rgba(62, 92, 210, 0.12), transparent 16%),
            radial-gradient(circle at 82% 78%, rgba(90, 170, 255, 0.10), transparent 14%),
            linear-gradient(180deg, #030814 0%, #040a16 24%, #050d1a 56%, #030711 100%)
        `;

        // Rest of page always uses the "inside laptop" world.
        body.style.background = INSIDE_BG;
        body.style.backgroundAttachment = "fixed";
        pageShell.style.background = INSIDE_BG;

        // Build two stacked bg layers inside the hero so we can crossfade.
        heroBg.style.background = "none";
        heroBg.style.overflow = "hidden";

        const closedLayer = document.createElement("div");
        closedLayer.style.position = "absolute";
        closedLayer.style.inset = "0";
        closedLayer.style.pointerEvents = "none";
        closedLayer.style.background = CLOSED_BG;
        closedLayer.style.opacity = "1";
        closedLayer.style.transition = "none";

        const insideLayer = document.createElement("div");
        insideLayer.style.position = "absolute";
        insideLayer.style.inset = "0";
        insideLayer.style.pointerEvents = "none";
        insideLayer.style.background = INSIDE_BG;
        insideLayer.style.opacity = "0";
        insideLayer.style.transition = "none";

        heroBg.prepend(insideLayer);
        heroBg.prepend(closedLayer);

        const heroGrid = heroBg.querySelector(".hero-laptop__grid");
        const glow1 = heroBg.querySelector(".hero-laptop__glow--1");
        const glow2 = heroBg.querySelector(".hero-laptop__glow--2");

        // Smoothed state
        const s = {
            mouseX: 0,
            mouseY: 0,
            targetMouseX: 0,
            targetMouseY: 0,
            progress: 0,
            targetProgress: 0,
            ticking: false
        };

        function clamp(v, lo, hi) {
            return Math.min(Math.max(v, lo), hi);
        }

        function lerp(a, b, t) {
            return a + (b - a) * t;
        }

        function mapRange(v, a, b, c, d) {
            return clamp((v - a) / (b - a), 0, 1) * (d - c) + c;
        }

        function easeOut3(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        function easeInOut3(t) {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function readScrollProgress() {
            const rect = hero.getBoundingClientRect();
            const total = Math.max(hero.offsetHeight - window.innerHeight, 1);
            return clamp(-rect.top / total, 0, 1);
        }

        function syncShellToScreen(zoomP) {
            if (zoomP <= 0.01) {
                root.style.setProperty("--shell-opacity", "0");
                return;
            }

            const sr = screen.getBoundingClientRect();
            const work = document.getElementById("work");

            const vw = window.innerWidth;
            const vh = window.innerHeight;

            const startScale = Math.min(sr.width / vw, sr.height / vh);
            const scale = lerp(startScale, 1, zoomP);

            const screenCx = sr.left + sr.width / 2;
            const screenCy = sr.top + sr.height / 2;

            let targetCx = vw / 2;
            let targetCy = vh / 2;

            if (work) {
                const workRect = work.getBoundingClientRect();
                targetCx = vw / 2;
                targetCy = Math.min(vh * 0.34, workRect.top + Math.max(140, workRect.height * 0.12));
            }

            const dx = lerp(screenCx - targetCx, 0, zoomP);
            const dy = lerp(screenCy - targetCy, 0, zoomP);

            const radius = lerp(8, 0, easeOut3(zoomP));
            const opacity = clamp(mapRange(zoomP, 0.0, 0.10, 0, 1), 0, 1);

            root.style.setProperty("--shell-scale", String(scale));
            root.style.setProperty("--shell-x", `${dx}px`);
            root.style.setProperty("--shell-y", `${dy}px`);
            root.style.setProperty("--shell-radius", `${radius}px`);
            root.style.setProperty("--shell-opacity", String(opacity));
        }

        function render() {
            s.ticking = false;

            s.progress = lerp(s.progress, s.targetProgress, 0.10);
            s.mouseX = lerp(s.mouseX, s.targetMouseX, 0.07);
            s.mouseY = lerp(s.mouseY, s.targetMouseY, 0.07);

            const p = s.progress;

            const openP = easeInOut3(clamp(mapRange(p, 0.05, 0.30, 0, 1), 0, 1));
            const powerP = easeInOut3(clamp(mapRange(p, 0.18, 0.38, 0, 1), 0, 1));
            const workRevealP = easeInOut3(clamp(mapRange(p, 0.28, 0.50, 0, 1), 0, 1));
            const zoomP = easeInOut3(clamp(mapRange(p, 0.28, 0.78, 0, 1), 0, 1));
            const fadeP = easeInOut3(clamp(mapRange(p, 0.72, 0.90, 0, 1), 0, 1));

            /* ---------------------------------------------------------
               BACKGROUND CROSSFADE
               - hero starts with CLOSED_BG
               - while laptop opens, hero transitions into INSIDE_BG
               - after the device disappears, everything still feels like
                 the same world because the page shell is already INSIDE_BG
            --------------------------------------------------------- */
            const bgShiftP = easeInOut3(clamp(mapRange(p, 0.10, 0.30, 0, 1), 0, 1));
            const heroFadeOutP = easeInOut3(clamp(mapRange(p, 0.82, 0.96, 0, 1), 0, 1));

            closedLayer.style.opacity = String(1 - bgShiftP);
            insideLayer.style.opacity = String(bgShiftP);

            if (heroGrid) {
                heroGrid.style.opacity = String(lerp(0.065, 0.045, bgShiftP));
            }

            if (glow1) {
                glow1.style.opacity = String(lerp(0.78, 0.42, bgShiftP));
                glow1.style.transform = `scale(${lerp(1, 0.9, bgShiftP)})`;
            }

            if (glow2) {
                glow2.style.opacity = String(lerp(0.72, 0.36, bgShiftP));
                glow2.style.transform = `scale(${lerp(1, 0.88, bgShiftP)})`;
            }

            // Once the laptop is basically gone, the hero bg itself fades away
            // so only the page-shell world remains.
            heroBg.style.opacity = String(1 - heroFadeOutP * 0.92);

            /* ---------------------------------------------------------
               DEVICE / MOTION
            --------------------------------------------------------- */
            const tiltInfluence = 1 - zoomP;
            const tiltX = s.mouseY * -3.5 * tiltInfluence;
            const tiltY = s.mouseX * 5.0 * tiltInfluence;

            const lidAngle = -95 + openP * 95;
            const restTilt = (1 - openP) * 2.5;
            lid.style.transform = `rotateX(${lidAngle + restTilt}deg)`;

            const deviceScale = lerp(1, 3.2, zoomP);
            const liftY = lerp(0, -18, openP);

            deviceWrap.style.transform = `
            translate3d(
                ${s.mouseX * 8 * tiltInfluence}px,
                ${liftY + s.mouseY * 3 * tiltInfluence}px,
                0
            )
            rotateX(${tiltX}deg)
            rotateY(${tiltY}deg)
            scale(${deviceScale})
        `;

            deviceWrap.style.opacity = String(clamp(1 - fadeP * 1.4, 0, 1));

            const brightness = 0.18 + powerP * 0.82;
            const saturation = 0.15 + powerP * 1.1;
            const grayscale = 1 - powerP;

            screen.style.opacity = String(0.2 + powerP * 0.8);
            screen.style.filter = `brightness(${brightness}) saturate(${saturation}) grayscale(${grayscale})`;

            if (base) {
                base.style.opacity = String(clamp(1 - zoomP * 1.6, 0, 1));
            }

            if (shadow) {
                shadow.style.opacity = String(clamp(0.82 - zoomP * 1.1, 0, 1));
            }

            if (welcome) {
                const wFade = easeInOut3(clamp(mapRange(p, 0.08, 0.28, 0, 1), 0, 1));
                welcome.style.opacity = String(1 - wFade);
                welcome.style.transform = `translate3d(0, ${wFade * -30}px, 0) scale(${1 - wFade * 0.04})`;
                welcome.style.filter = `blur(${wFade * 6}px)`;
            }

            if (indicator) {
                const hide = clamp(mapRange(p, 0.04, 0.14, 0, 1), 0, 1);
                indicator.style.opacity = String(1 - hide);
                indicator.style.transform = `translateX(-50%) translateY(${hide * 10}px)`;
            }

            /* ---------------------------------------------------------
   WORK SECTION REVEAL
   fades in where it already is so it feels like
   the laptop screen powers on instead of scrolling into it
--------------------------------------------------------- */
            workSection.style.opacity = String(workRevealP);
            workSection.style.transform = `scale(${lerp(0.985, 1, workRevealP)})`;
            workSection.style.filter = `blur(${lerp(14, 0, workRevealP)}px)`;
            workSection.classList.toggle("is-visible", workRevealP > 0.02);

            /* ---------------------------------------------------------
               SHELL HANDOFF
            --------------------------------------------------------- */
            const isEmbedded = zoomP > 0.02 && p < 0.90;
            const isFull = p >= 0.90;

            if (!pageShell.classList.contains("is-laptop-full") || !isFull) {
                pageShell.classList.toggle("is-laptop-embedded", isEmbedded);
                pageShell.classList.toggle("is-laptop-full", isFull);
            }

            syncShellToScreen(zoomP);

            hero.classList.toggle("hero-laptop--done", fadeP > 0.9);

            if (
                Math.abs(s.progress - s.targetProgress) > 0.0003 ||
                Math.abs(s.mouseX - s.targetMouseX) > 0.0003 ||
                Math.abs(s.mouseY - s.targetMouseY) > 0.0003
            ) {
                requestTick();
            }
        }

        function requestTick() {
            if (s.ticking) return;
            s.ticking = true;
            requestAnimationFrame(render);
        }

        window.addEventListener(
            "scroll",
            () => {
                s.targetProgress = readScrollProgress();
                requestTick();
            },
            { passive: true }
        );

        window.addEventListener("resize", () => {
            s.targetProgress = readScrollProgress();
            requestTick();
        });

        window.addEventListener("mousemove", (e) => {
            s.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            s.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
            requestTick();
        });

        s.targetProgress = readScrollProgress();
        requestTick();
    }

    /* =========================================================
       SMART ANCHOR SCROLLING
       Routes nav/dot clicks to the inner shell when embedded,
       or to the normal window when in full mode.
       ========================================================= */
    function initAnchorScrolling() {
        const pageShell = document.getElementById("laptopPageShell");
        if (!pageShell) return;

        function scrollToSection(id) {
            const target = document.getElementById(id);
            if (!target) return;

            if (pageShell.classList.contains("is-laptop-embedded")) {
                // Scroll inside the fixed shell overlay
                const sr = pageShell.getBoundingClientRect();
                const tr = target.getBoundingClientRect();
                const top = tr.top - sr.top + pageShell.scrollTop - 80;
                pageShell.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
            } else {
                // Normal page scroll
                const y = target.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: y, behavior: "smooth" });
            }
        }

        document.querySelectorAll(".nav-link, .section-dots .dot, .brand").forEach((link) => {
            link.addEventListener("click", (e) => {
                const href = link.getAttribute("href");
                if (!href?.startsWith("#")) return;
                const id = href.slice(1);
                if (id === "top") {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    return;
                }
                if (document.getElementById(id)) {
                    e.preventDefault();
                    scrollToSection(id);
                }
            });
        });
    }

    /* =========================================================
       WORK RAIL
       - cards move as a group
       - grabbed card stays attached to pointer
       - nearby cards jiggle/react
       - page scroll remains normal
       ========================================================= */
    function initWorkRail() {
        const stage = document.getElementById("workRailStage");
        const cards = [...document.querySelectorAll(".rail-card")];

        if (!stage || !cards.length) return;

        const cardStates = cards.map((card, index) => ({
            el: card,
            index,
            swing: 0,
            swingVelocity: 0,
            swingFactor: Number(card.dataset.swingFactor || 1),
            phase: index * 0.45,
            impulse: 0,
            impulseVelocity: 0
        }));

        const state = {
            railOffset: 0,
            railVelocity: 0,

            isDragging: false,
            grabbedIndex: -1,
            grabbedCardOffset: 0,
            dragStartX: 0,
            lastPointerX: 0,
            lastTime: 0,

            gap: 520,
            friction: 0.965,
            wheelForce: 0.34,
            edgeResistance: 0.12,
            bounce: 0.1,
            swingLimit: 10,
            swingSpring: 0.09,
            swingDamping: 0.86,
            dragThreshold: 6
        };

        function getStageRect() {
            return stage.getBoundingClientRect();
        }

        function getStageCenterX() {
            const rect = getStageRect();
            return rect.left + rect.width / 2;
        }

        function getCardWidth() {
            const firstCard = cards[0];
            if (!firstCard) return 360;
            return firstCard.getBoundingClientRect().width || 360;
        }

        function getEdgeInset() {
            const rect = getStageRect();
            const vw = window.innerWidth;

            let baseInset;

            if (vw <= 640) baseInset = Math.max(14, rect.width * 0.03);
            else if (vw <= 980) baseInset = Math.max(20, rect.width * 0.04);
            else baseInset = Math.max(28, rect.width * 0.05);

            return baseInset + Math.min(80, rect.width * 0.06);
        }

        function getResponsiveGap() {
            const vw = window.innerWidth;
            const cardWidth = getCardWidth();

            let gutter;
            if (vw <= 640) gutter = 34;
            else if (vw <= 760) gutter = 42;
            else if (vw <= 980) gutter = 56;
            else if (vw <= 1200) gutter = 74;
            else if (vw <= 1500) gutter = 92;
            else gutter = 110;

            return cardWidth + gutter;
        }

        function getSwingLimit() {
            const vw = window.innerWidth;
            if (vw <= 640) return 7;
            if (vw <= 980) return 8;
            if (vw <= 1400) return 9;
            return 10;
        }

        function getBaseX(index) {
            const centerIndex = (cards.length - 1) / 2;
            return (index - centerIndex) * state.gap;
        }

        function getCardX(index) {
            return getBaseX(index) - state.railOffset;
        }

        function getCardCenterX(index) {
            return getStageCenterX() + getCardX(index);
        }

        function getClampBounds() {
            const rect = getStageRect();
            const stageCenterX = rect.width / 2;
            const cardWidth = getCardWidth();
            const edgeInset = getEdgeInset();
            const lastIndex = cards.length - 1;

            const minOffset =
                stageCenterX + getBaseX(0) - (edgeInset + cardWidth / 2);

            const maxOffset =
                stageCenterX + getBaseX(lastIndex) - (rect.width - edgeInset - cardWidth / 2);

            return {
                minOffset,
                maxOffset
            };
        }

        function clampRailOffset(value) {
            const { minOffset, maxOffset } = getClampBounds();
            return utils.clamp(value, minOffset, maxOffset);
        }

        function applyNeighborImpulse(centerIndex, strength) {
            cardStates.forEach((cardState) => {
                const distance = Math.abs(cardState.index - centerIndex);
                const falloff = Math.max(0, 1 - distance * 0.28);
                if (falloff <= 0) return;

                cardState.impulseVelocity += strength * falloff * 0.08;
            });
        }

        function setGrabbedCardPriority() {
            cards.forEach((card) => {
                card.style.zIndex = "";
                card.classList.remove("is-grabbed");
            });

            if (state.grabbedIndex > -1) {
                cards[state.grabbedIndex].style.zIndex = "999";
                cards[state.grabbedIndex].classList.add("is-grabbed");
            }
        }

        function render() {
            const now = performance.now();

            cardStates.forEach((cardState) => {
                const { el, index, swingFactor, phase } = cardState;

                const x = getCardX(index);
                const normalized = x / Math.max(state.gap, 1);
                const abs = Math.abs(normalized);

                const railAngle = -normalized * 3.1;
                const motionInfluence = state.railVelocity * 0.9 * swingFactor;
                const microOscillation = Math.sin(now * 0.0015 + phase) * 0.06;

                cardState.impulseVelocity += (0 - cardState.impulse) * 0.08;
                cardState.impulseVelocity *= 0.84;
                cardState.impulse += cardState.impulseVelocity;

                const targetSwing = utils.clamp(
                    railAngle + motionInfluence + microOscillation + cardState.impulse,
                    -state.swingLimit,
                    state.swingLimit
                );

                const swingPull = (targetSwing - cardState.swing) * state.swingSpring;
                cardState.swingVelocity += swingPull;
                cardState.swingVelocity *= state.swingDamping;
                cardState.swing += cardState.swingVelocity;

                const y = Math.min(abs * 7, 12) + Math.abs(cardState.swing) * 0.55;
                const scale = 1 - Math.min(abs * 0.018, 0.05);

                if (!el.classList.contains("is-grabbed")) {
                    el.style.zIndex = String(100 + (cards.length - Math.round(abs * 10)));
                }

                el.style.transform = `
          translateX(calc(-50% + ${x}px))
          translateY(${y}px)
          rotate(${cardState.swing}deg)
          scale(${scale})
        `;
            });
        }

        function tick() {
            const { minOffset, maxOffset } = getClampBounds();

            if (!state.isDragging) {
                state.railOffset += state.railVelocity;
                state.railVelocity *= state.friction;

                if (state.railOffset < minOffset) {
                    const over = minOffset - state.railOffset;
                    state.railVelocity += over * state.edgeResistance;
                    state.railVelocity *= state.bounce;
                }

                if (state.railOffset > maxOffset) {
                    const over = state.railOffset - maxOffset;
                    state.railVelocity -= over * state.edgeResistance;
                    state.railVelocity *= state.bounce;
                }

                if (Math.abs(state.railVelocity) < 0.002) {
                    state.railVelocity = 0;
                    state.railOffset = clampRailOffset(state.railOffset);
                }
            } else {
                state.railVelocity *= 0.9;
                state.railOffset = clampRailOffset(state.railOffset);
            }

            render();
            requestAnimationFrame(tick);
        }

        function updateMetrics() {
            state.gap = getResponsiveGap();
            state.swingLimit = getSwingLimit();
            state.railOffset = clampRailOffset(state.railOffset);
            render();
        }

        function handleWheel(event) {
            const rect = stage.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;

            if (!inView || state.isDragging) return;

            const dominantDelta =
                Math.abs(event.deltaX) > Math.abs(event.deltaY)
                    ? event.deltaX
                    : event.deltaY;

            state.railVelocity += dominantDelta * state.wheelForce * 0.01;
            applyNeighborImpulse(Math.floor(cards.length / 2), dominantDelta * 0.01);
        }

        function handlePointerDown(event) {
            const grabbedCard = event.target.closest(".rail-card");
            if (!grabbedCard) return;

            if (
                event.target.closest("a, button, input, textarea, select, label")
            ) {
                return;
            }

            const grabbedIndex = cards.indexOf(grabbedCard);
            if (grabbedIndex === -1) return;

            state.isDragging = true;
            state.grabbedIndex = grabbedIndex;
            state.dragStartX = event.clientX;
            state.lastPointerX = event.clientX;
            state.lastTime = performance.now();
            state.railVelocity = 0;

            const cardCenterX = getCardCenterX(grabbedIndex);
            state.grabbedCardOffset = event.clientX - cardCenterX;

            stage.classList.add("is-dragging");
            stage.setPointerCapture(event.pointerId);
            setGrabbedCardPriority();
        }

        function handlePointerMove(event) {
            if (!state.isDragging || state.grabbedIndex === -1) return;

            const now = performance.now();
            const dt = Math.max(now - state.lastTime, 1);
            const pointerDx = event.clientX - state.lastPointerX;

            const baseX = getBaseX(state.grabbedIndex);
            const stageCenterX = getStageCenterX();
            const desiredCardCenterX = event.clientX - state.grabbedCardOffset;
            const desiredRailOffset = stageCenterX + baseX - desiredCardCenterX;

            state.railOffset = clampRailOffset(desiredRailOffset);
            state.railVelocity = -(pointerDx / dt) * 16;

            applyNeighborImpulse(state.grabbedIndex, -pointerDx * 0.12);

            state.lastPointerX = event.clientX;
            state.lastTime = now;
        }

        function endDrag(event) {
            if (!state.isDragging) return;

            if (event && stage.hasPointerCapture?.(event.pointerId)) {
                stage.releasePointerCapture(event.pointerId);
            }

            state.isDragging = false;
            state.grabbedIndex = -1;
            state.railOffset = clampRailOffset(state.railOffset);
            stage.classList.remove("is-dragging");

            cards.forEach((card) => {
                card.style.zIndex = "";
                card.classList.remove("is-grabbed");
            });
        }

        window.addEventListener("wheel", handleWheel, { passive: true });
        window.addEventListener("resize", updateMetrics);

        stage.addEventListener("pointerdown", handlePointerDown);
        stage.addEventListener("pointermove", handlePointerMove);
        stage.addEventListener("pointerup", endDrag);
        stage.addEventListener("pointercancel", endDrag);

        requestAnimationFrame(() => {
            updateMetrics();
            tick();
        });
    }

    /* =========================================================
       SECTION DOTS ACTIVE STATE
       ========================================================= */
    function initSectionDots() {
        const pageShell = document.getElementById("laptopPageShell");
        const sections = [...document.querySelectorAll("main section[id]")];
        const dots = [...document.querySelectorAll(".section-dots .dot")];

        if (!sections.length || !dots.length) return;

        function updateActiveDot() {
            let activeId = sections[0].id;
            const mid = window.innerHeight * 0.38;

            sections.forEach((sec) => {
                const r = sec.getBoundingClientRect();
                if (r.top <= mid && r.bottom >= mid) activeId = sec.id;
            });

            dots.forEach((dot) => {
                dot.classList.toggle("is-active", dot.getAttribute("href") === `#${activeId}`);
            });
        }

        if (pageShell) pageShell.addEventListener("scroll", updateActiveDot, { passive: true });
        window.addEventListener("scroll", updateActiveDot, { passive: true });
        window.addEventListener("resize", updateActiveDot);
        updateActiveDot();
    }

    /* =========================================================
       EDUCATION PATH
       continuous journey animation
       ========================================================= */
    function initEducationPath() {
        const section = document.getElementById("education");
        const track = document.getElementById("eduPathTrack");
        const hero = document.getElementById("eduPathHero");
        const nodes = [...document.querySelectorAll(".edu-node")];
        const progressFill = document.getElementById("eduPathProgress");
        const yearFloat = document.getElementById("eduPathYearFloat");

        if (!section || !track || !hero || !nodes.length || !progressFill || !yearFloat) return;

        const state = {
            current: 0,
            target: 0,
            ticking: false
        };

        function clamp(value, min, max) {
            return Math.min(Math.max(value, min), max);
        }

        function lerp(start, end, amount) {
            return start + (end - start) * amount;
        }

        function getScrollProgress() {
            const rect = section.getBoundingClientRect();
            const total = Math.max(section.offsetHeight - window.innerHeight, 1);
            return clamp(-rect.top / total, 0, 1);
        }

        function updateScene(progress) {
            const viewportH = window.innerHeight;

            const travel = Math.max((nodes.length - 1) * viewportH * 0.9, 3200);
            const trackY = -progress * travel;

            track.style.transform = `translate3d(0, ${trackY}px, 0)`;

            const introFade = clamp(progress / 0.1, 0, 1);
            const heroY = -introFade * 140;
            const heroScale = 1 - introFade * 0.14;
            const heroOpacity = 1 - introFade * 1.2;

            hero.style.transform = `translate3d(0, ${heroY}px, 0) scale(${heroScale})`;
            hero.style.opacity = String(Math.max(0, heroOpacity));
            hero.style.filter = `blur(${introFade * 10}px)`;

            progressFill.style.height = `${progress * 100}%`;

            let closestNode = nodes[0];
            let closestDistance = Infinity;

            nodes.forEach((node, index) => {
                const rect = node.getBoundingClientRect();
                const center = rect.top + rect.height / 2;

                const targetCenter = viewportH * 0.52;
                const distance = Math.abs(center - targetCenter);

                const normalized = clamp(distance / (viewportH * 0.42), 0, 1);
                const focus = 1 - normalized;

                const scale = 0.82 + focus * 0.18;
                const opacity = 0.12 + focus * 0.88;
                const rotateX = (1 - focus) * 16;
                const y = (1 - focus) * 36;
                const blur = (1 - focus) * 7;

                node.style.opacity = String(opacity);
                node.style.transform = `translateX(-50%) translateY(${y}px) scale(${scale})`;
                node.style.filter = `blur(${blur}px)`;

                const card = node.querySelector(".edu-node__card");
                if (card) {
                    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg)`;
                }

                const dot = node.querySelector(".edu-node__dot");
                if (dot) {
                    dot.style.transform = `scale(${0.88 + focus * 0.38})`;
                    dot.style.borderColor = focus > 0.7 ? "#9ee7ff" : "rgba(255,255,255,0.2)";
                    dot.style.boxShadow = focus > 0.7
                        ? "0 0 0 10px rgba(158, 231, 255, 0.09), 0 0 22px rgba(158, 231, 255, 0.28)"
                        : "0 0 0 8px rgba(158, 231, 255, 0.05)";
                }

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestNode = node;
                    state.target = index;
                }
            });

            const activeYear = closestNode.dataset.year || "";
            yearFloat.textContent = activeYear;

            const floatShift = state.target * -6;
            yearFloat.style.transform =
                window.innerWidth <= 980
                    ? `translate3d(0, ${floatShift}px, 0)`
                    : `translate3d(0, calc(-50% + ${floatShift}px), 0)`;

            yearFloat.style.opacity = String(0.35 + clamp(progress * 1.1, 0, 0.55));
        }

        function animate() {
            const targetProgress = getScrollProgress();
            state.current = lerp(state.current, targetProgress, 0.16);
            updateScene(state.current);

            if (Math.abs(state.current - targetProgress) > 0.0005) {
                requestAnimationFrame(animate);
            } else {
                state.ticking = false;
            }
        }

        function requestTick() {
            if (state.ticking) return;
            state.ticking = true;
            requestAnimationFrame(animate);
        }

        window.addEventListener("scroll", requestTick, { passive: true });
        window.addEventListener("resize", requestTick);

        requestTick();
    }

    /* =========================================================
       SCROLL REVEAL
       ========================================================= */
    function initScrollReveal() {
        const items = [...document.querySelectorAll(".reveal-on-scroll")];
        if (!items.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.16,
                rootMargin: "0px 0px -8% 0px"
            }
        );

        items.forEach((item) => observer.observe(item));
    }

    /* =========================================================
       INIT
       ========================================================= */
    function init() {
        initHeroSection();
        initWorkRail();
        initAnchorScrolling();
        initSectionDots();
        initEducationPath();
        initScrollReveal();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();