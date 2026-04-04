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
        },

        mapRange(value, inMin, inMax, outMin, outMax) {
            if (inMax === inMin) return outMin;
            const t = utils.clamp((value - inMin) / (inMax - inMin), 0, 1);
            return outMin + (outMax - outMin) * t;
        },

        easeOut3(t) {
            return 1 - Math.pow(1 - t, 3);
        },

        easeInOut3(t) {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }
    };

    const dom = {
        winW: window.innerWidth,
        winH: window.innerHeight,
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches
    };

    const resizeSubscribers = new Set();

    function onResize(callback) {
        resizeSubscribers.add(callback);
    }

    function runResizeSubscribers() {
        dom.winW = window.innerWidth;
        dom.winH = window.innerHeight;
        dom.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        resizeSubscribers.forEach((callback) => callback());
    }

    let resizeRaf = 0;
    window.addEventListener("resize", () => {
        if (resizeRaf) cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(() => {
            resizeRaf = 0;
            runResizeSubscribers();
        });
    });

    /* =========================================================
       HERO LAPTOP JOURNEY
       Optimized:
       - caches hero metrics
       - avoids repeated DOM queries inside render
       - keeps all style writes grouped in one frame
       ========================================================= */
    function initHeroSection() {
        const hero = document.querySelector(".hero-laptop");
        const scene = document.getElementById("heroLaptopScene");
        const welcome = document.getElementById("heroLaptopWelcome");
        const finalWelcome = document.getElementById("heroLaptopWelcomeFinal");
        const loader = document.getElementById("heroLaptopLoader");
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

        if (
            !hero || !scene || !deviceWrap || !device || !lid || !screen ||
            !pageShell || !heroBg || !workSection || !finalWelcome || !loader
        ) return;

        const root = document.documentElement;
        const body = document.body;

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

        body.style.background = INSIDE_BG;
        body.style.backgroundAttachment = "fixed";
        pageShell.style.background = INSIDE_BG;

        heroBg.style.background = "none";
        heroBg.style.overflow = "hidden";

        const closedLayer = document.createElement("div");
        Object.assign(closedLayer.style, {
            position: "absolute",
            inset: "0",
            pointerEvents: "none",
            background: CLOSED_BG,
            opacity: "1",
            transition: "none"
        });

        const insideLayer = document.createElement("div");
        Object.assign(insideLayer.style, {
            position: "absolute",
            inset: "0",
            pointerEvents: "none",
            background: INSIDE_BG,
            opacity: "0",
            transition: "none"
        });

        heroBg.prepend(insideLayer);
        heroBg.prepend(closedLayer);

        const heroGrid = heroBg.querySelector(".hero-laptop__grid");
        const glow1 = heroBg.querySelector(".hero-laptop__glow--1");
        const glow2 = heroBg.querySelector(".hero-laptop__glow--2");

        const state = {
            mouseX: 0,
            mouseY: 0,
            targetMouseX: 0,
            targetMouseY: 0,
            progress: 0,
            targetProgress: 0,
            ticking: false
        };

        const metrics = {
            heroTop: 0,
            heroHeight: 0,
            heroScrollable: 1,
            workTopViewport: 0,
            workHeight: 0
        };

        function measure() {
            const heroRect = hero.getBoundingClientRect();
            const workRect = workSection.getBoundingClientRect();

            metrics.heroTop = heroRect.top + window.scrollY;
            metrics.heroHeight = hero.offsetHeight;
            metrics.heroScrollable = Math.max(metrics.heroHeight - dom.winH, 1);

            metrics.workTopViewport = workRect.top;
            metrics.workHeight = workRect.height;
        }

        function readScrollProgress() {
            const heroTopInViewport = metrics.heroTop - window.scrollY;
            return utils.clamp(-heroTopInViewport / metrics.heroScrollable, 0, 1);
        }

        function syncShellToScreen(zoomP) {
            if (zoomP <= 0.01) {
                root.style.setProperty("--shell-opacity", "0");
                return;
            }

            const sr = screen.getBoundingClientRect();

            const startScale = Math.min(sr.width / dom.winW, sr.height / dom.winH);
            const scale = utils.lerp(startScale, 1, zoomP);

            const screenCx = sr.left + sr.width / 2;
            const screenCy = sr.top + sr.height / 2;

            const targetCx = dom.winW / 2;
            const targetCy = Math.min(
                dom.winH * 0.34,
                metrics.workTopViewport + Math.max(140, metrics.workHeight * 0.12)
            );

            const dx = utils.lerp(screenCx - targetCx, 0, zoomP);
            const dy = utils.lerp(screenCy - targetCy, 0, zoomP);

            const radius = utils.lerp(8, 0, utils.easeOut3(zoomP));
            const opacity = utils.clamp(utils.mapRange(zoomP, 0.0, 0.10, 0, 1), 0, 1);

            root.style.setProperty("--shell-scale", String(scale));
            root.style.setProperty("--shell-x", `${dx}px`);
            root.style.setProperty("--shell-y", `${dy}px`);
            root.style.setProperty("--shell-radius", `${radius}px`);
            root.style.setProperty("--shell-opacity", String(opacity));
        }

        function render() {
            state.ticking = false;

            state.progress = dom.reducedMotion
                ? state.targetProgress
                : utils.lerp(state.progress, state.targetProgress, 0.10);

            state.mouseX = dom.reducedMotion
                ? state.targetMouseX
                : utils.lerp(state.mouseX, state.targetMouseX, 0.07);

            state.mouseY = dom.reducedMotion
                ? state.targetMouseY
                : utils.lerp(state.mouseY, state.targetMouseY, 0.07);

            const p = state.progress;

            const openP = utils.easeInOut3(utils.clamp(utils.mapRange(p, 0.05, 0.28, 0, 1), 0, 1));
            const powerP = utils.easeInOut3(utils.clamp(utils.mapRange(p, 0.16, 0.34, 0, 1), 0, 1));
            const zoomP = utils.easeInOut3(utils.clamp(utils.mapRange(p, 0.28, 0.70, 0, 1), 0, 1));
            const fadeP = utils.easeInOut3(utils.clamp(utils.mapRange(p, 0.68, 0.82, 0, 1), 0, 1));
            const finalWelcomeP = utils.easeInOut3(utils.clamp(utils.mapRange(p, 0.80, 0.92, 0, 1), 0, 1));
            const workRevealP = utils.easeInOut3(utils.clamp(utils.mapRange(p, 0.90, 1.00, 0, 1), 0, 1));
            const bgShiftP = utils.easeInOut3(utils.clamp(utils.mapRange(p, 0.10, 0.30, 0, 1), 0, 1));
            const heroFadeOutP = utils.easeInOut3(utils.clamp(utils.mapRange(p, 0.84, 0.98, 0, 1), 0, 1));

            closedLayer.style.opacity = String(1 - bgShiftP);
            insideLayer.style.opacity = String(bgShiftP);

            if (heroGrid) {
                heroGrid.style.opacity = String(utils.lerp(0.065, 0.045, bgShiftP));
            }

            if (glow1) {
                glow1.style.opacity = String(utils.lerp(0.78, 0.42, bgShiftP));
                glow1.style.transform = `scale(${utils.lerp(1, 0.9, bgShiftP)})`;
            }

            if (glow2) {
                glow2.style.opacity = String(utils.lerp(0.72, 0.36, bgShiftP));
                glow2.style.transform = `scale(${utils.lerp(1, 0.88, bgShiftP)})`;
            }

            heroBg.style.opacity = String(1 - heroFadeOutP * 0.92);

            const tiltInfluence = dom.reducedMotion ? 0 : 1 - zoomP;
            const tiltX = state.mouseY * -3.5 * tiltInfluence;
            const tiltY = state.mouseX * 5.0 * tiltInfluence;

            const lidAngle = -95 + openP * 95;
            const restTilt = (1 - openP) * 2.5;
            lid.style.transform = `rotateX(${lidAngle + restTilt}deg)`;

            const deviceScale = utils.lerp(1, 3.2, zoomP);
            const liftY = utils.lerp(0, -18, openP);

            deviceWrap.style.transform = `
                translate3d(
                    ${state.mouseX * 8 * tiltInfluence}px,
                    ${liftY + state.mouseY * 3 * tiltInfluence}px,
                    0
                )
                rotateX(${tiltX}deg)
                rotateY(${tiltY}deg)
                scale(${deviceScale})
            `;

            deviceWrap.style.opacity = String(utils.clamp(1 - fadeP * 1.4, 0, 1));

            const brightness = 0.18 + powerP * 0.82;
            const saturation = 0.15 + powerP * 1.1;
            const grayscale = 1 - powerP;

            screen.style.opacity = String(0.2 + powerP * 0.8);
            screen.style.filter = `brightness(${brightness}) saturate(${saturation}) grayscale(${grayscale})`;

            if (base) {
                base.style.opacity = String(utils.clamp(1 - zoomP * 1.6, 0, 1));
            }

            if (shadow) {
                shadow.style.opacity = String(utils.clamp(0.82 - zoomP * 1.1, 0, 1));
            }

            if (welcome) {
                const wFade = utils.easeInOut3(utils.clamp(utils.mapRange(p, 0.06, 0.20, 0, 1), 0, 1));
                welcome.style.opacity = String(1 - wFade);
                welcome.style.transform = `translate3d(0, ${wFade * -30}px, 0) scale(${1 - wFade * 0.04})`;
                welcome.style.filter = `blur(${wFade * 6}px)`;
            }

            const loaderP = utils.easeInOut3(utils.clamp(utils.mapRange(p, 0.16, 0.34, 0, 1), 0, 1));
            const loaderOutP = utils.easeInOut3(utils.clamp(utils.mapRange(p, 0.34, 0.48, 0, 1), 0, 1));
            const loaderVisible = loaderP * (1 - loaderOutP);

            loader.style.opacity = String(loaderVisible);
            loader.style.transform = `scale(${utils.lerp(0.92, 1, loaderVisible)})`;
            loader.style.filter = `blur(${utils.lerp(8, 0, loaderVisible)}px)`;

            if (indicator) {
                const hide = utils.clamp(utils.mapRange(p, 0.04, 0.14, 0, 1), 0, 1);
                indicator.style.opacity = String(1 - hide);
                indicator.style.transform = `translateX(-50%) translateY(${hide * 10}px)`;
            }

            finalWelcome.style.opacity = String(finalWelcomeP);
            finalWelcome.style.transform = `
                translate(-50%, calc(-50% + ${utils.lerp(28, 0, finalWelcomeP)}px))
                scale(${utils.lerp(0.96, 1, finalWelcomeP)})
            `;
            finalWelcome.style.filter = `blur(${utils.lerp(12, 0, finalWelcomeP)}px)`;

            workSection.style.opacity = String(workRevealP);
            workSection.style.transform = `translate3d(0, ${utils.lerp(34, 0, workRevealP)}px, 0) scale(${utils.lerp(0.985, 1, workRevealP)})`;
            workSection.style.filter = `blur(${utils.lerp(18, 0, workRevealP)}px)`;
            workSection.classList.toggle("is-visible", workRevealP > 0.02);

            const isEmbedded = zoomP > 0.02 && p < 0.90;
            const isFull = p >= 0.90;

            if (!pageShell.classList.contains("is-laptop-full") || !isFull) {
                pageShell.classList.toggle("is-laptop-embedded", isEmbedded);
                pageShell.classList.toggle("is-laptop-full", isFull);
            }

            syncShellToScreen(zoomP);
            hero.classList.toggle("hero-laptop--done", fadeP > 0.9);

            if (
                Math.abs(state.progress - state.targetProgress) > 0.0003 ||
                Math.abs(state.mouseX - state.targetMouseX) > 0.0003 ||
                Math.abs(state.mouseY - state.targetMouseY) > 0.0003
            ) {
                requestTick();
            }
        }

        function requestTick() {
            if (state.ticking) return;
            state.ticking = true;
            requestAnimationFrame(render);
        }

        function updateProgress() {
            metrics.workTopViewport = workSection.getBoundingClientRect().top;
            state.targetProgress = readScrollProgress();
            requestTick();
        }

        window.addEventListener("scroll", updateProgress, { passive: true });

        window.addEventListener("mousemove", (e) => {
            state.targetMouseX = (e.clientX / dom.winW - 0.5) * 2;
            state.targetMouseY = (e.clientY / dom.winH - 0.5) * 2;
            requestTick();
        }, { passive: true });

        onResize(() => {
            measure();
            updateProgress();
        });

        measure();
        state.targetProgress = readScrollProgress();
        requestTick();
    }

    /* =========================================================
       SMART ANCHOR SCROLLING
       ========================================================= */
    function initAnchorScrolling() {
        const pageShell = document.getElementById("laptopPageShell");
        if (!pageShell) return;

        function scrollToSection(id) {
            const target = document.getElementById(id);
            if (!target) return;

            if (pageShell.classList.contains("is-laptop-embedded")) {
                const sr = pageShell.getBoundingClientRect();
                const tr = target.getBoundingClientRect();
                const top = tr.top - sr.top + pageShell.scrollTop - 80;
                pageShell.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
            } else {
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
       Optimized:
       - caches stage metrics
       - avoids repeated getBoundingClientRect in card loop
       - pauses animation work when offscreen
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
            lastPointerX: 0,
            lastTime: 0,

            gap: 520,
            friction: 0.965,
            wheelForce: 0.34,
            edgeResistance: 0.05,
            bounce: 0.05,
            swingLimit: 10,
            swingSpring: 0.09,
            swingDamping: 0.86,

            stageLeft: 0,
            stageWidth: 0,
            stageCenterX: 0,
            cardWidth: 360,
            edgeInset: 54,
            minOffset: 0,
            maxOffset: 0,
            isInView: true
        };

        function getResponsiveGap() {
            const vw = dom.winW;
            const cardWidth = state.cardWidth;

            let gutter;
            if (vw <= 480) gutter = 20;
            else if (vw <= 640) gutter = 24;
            else if (vw <= 760) gutter = 30;
            else if (vw <= 980) gutter = 42;
            else if (vw <= 1200) gutter = 74;
            else if (vw <= 1500) gutter = 92;
            else gutter = 110;

            return cardWidth + gutter;
        }

        function getSwingLimit() {
            const vw = dom.winW;
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
            return state.stageCenterX + getCardX(index);
        }

        function measure() {
            const rect = stage.getBoundingClientRect();
            state.stageLeft = rect.left;
            state.stageWidth = rect.width;
            state.stageCenterX = rect.left + rect.width / 2;
            state.cardWidth = cards[0]?.getBoundingClientRect().width || 360;

            if (dom.winW <= 480) state.edgeInset = Math.max(34, rect.width * 0.11);
            else if (dom.winW <= 640) state.edgeInset = Math.max(38, rect.width * 0.10);
            else if (dom.winW <= 760) state.edgeInset = Math.max(42, rect.width * 0.09);
            else if (dom.winW <= 980) state.edgeInset = Math.max(46, rect.width * 0.085);
            else state.edgeInset = Math.max(54, rect.width * 0.08);

            state.gap = getResponsiveGap();
            state.swingLimit = getSwingLimit();

            const stageCenterLocalX = rect.width / 2;
            const lastIndex = cards.length - 1;

            state.minOffset =
                stageCenterLocalX + getBaseX(0) - (state.edgeInset + state.cardWidth / 2);

            state.maxOffset =
                stageCenterLocalX + getBaseX(lastIndex) - (rect.width - state.edgeInset - state.cardWidth / 2);

            state.isInView = rect.top < dom.winH && rect.bottom > 0;
            state.railOffset = clampRailOffset(state.railOffset);
        }

        function clampRailOffset(value) {
            return utils.clamp(value, state.minOffset, state.maxOffset);
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

            for (let i = 0; i < cardStates.length; i++) {
                const cardState = cardStates[i];
                const { el, index, swingFactor, phase } = cardState;

                const x = getCardX(index);
                const normalized = x / Math.max(state.gap, 1);
                const abs = Math.abs(normalized);

                const railAngle = -normalized * 3.1;
                const motionInfluence = state.railVelocity * 0.9 * swingFactor;
                const microOscillation = dom.reducedMotion ? 0 : Math.sin(now * 0.0015 + phase) * 0.06;

                cardState.impulseVelocity += (0 - cardState.impulse) * 0.08;
                cardState.impulseVelocity *= 0.84;
                cardState.impulse += cardState.impulseVelocity;

                const targetSwing = utils.clamp(
                    railAngle + motionInfluence + microOscillation + cardState.impulse,
                    -state.swingLimit,
                    state.swingLimit
                );

                cardState.swingVelocity += (targetSwing - cardState.swing) * state.swingSpring;
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
            }
        }

        function tick() {
            if (!state.isInView && !state.isDragging && Math.abs(state.railVelocity) < 0.002) {
                requestAnimationFrame(tick);
                return;
            }

            if (!state.isDragging) {
                state.railOffset += state.railVelocity;
                state.railVelocity *= state.friction;

                if (state.railOffset < state.minOffset) {
                    const over = state.minOffset - state.railOffset;
                    state.railVelocity += over * state.edgeResistance;
                    state.railVelocity *= state.bounce;
                }

                if (state.railOffset > state.maxOffset) {
                    const over = state.railOffset - state.maxOffset;
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

        function handleWheel(event) {
            if (!state.isInView || state.isDragging) return;

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

            if (event.target.closest("a, button, input, textarea, select, label")) {
                return;
            }

            const grabbedIndex = cards.indexOf(grabbedCard);
            if (grabbedIndex === -1) return;

            state.isDragging = true;
            state.grabbedIndex = grabbedIndex;
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
            const desiredCardCenterX = event.clientX - state.grabbedCardOffset;
            const desiredRailOffset = state.stageCenterX + baseX - desiredCardCenterX;

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
        window.addEventListener("scroll", () => {
            const rect = stage.getBoundingClientRect();
            state.isInView = rect.top < dom.winH && rect.bottom > 0;
        }, { passive: true });

        onResize(() => {
            measure();
            render();
        });

        stage.addEventListener("pointerdown", handlePointerDown);
        stage.addEventListener("pointermove", handlePointerMove);
        stage.addEventListener("pointerup", endDrag);
        stage.addEventListener("pointercancel", endDrag);

        measure();
        requestAnimationFrame(() => {
            render();
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

        let ticking = false;

        function updateActiveDot() {
            ticking = false;

            let activeId = sections[0].id;
            const mid = dom.winH * 0.38;

            for (let i = 0; i < sections.length; i++) {
                const r = sections[i].getBoundingClientRect();
                if (r.top <= mid && r.bottom >= mid) {
                    activeId = sections[i].id;
                    break;
                }
            }

            dots.forEach((dot) => {
                dot.classList.toggle("is-active", dot.getAttribute("href") === `#${activeId}`);
            });
        }

        function requestUpdate() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(updateActiveDot);
        }

        if (pageShell) pageShell.addEventListener("scroll", requestUpdate, { passive: true });
        window.addEventListener("scroll", requestUpdate, { passive: true });
        onResize(requestUpdate);

        updateActiveDot();
    }

    /* =========================================================
       EDUCATION PATH
       Optimized:
       - one section measurement cache
       - less layout work per frame
       - card lookup cached
       ========================================================= */
    function initEducationPath() {
        const section = document.getElementById("education");
        const track = document.getElementById("eduPathTrack");
        const hero = document.getElementById("eduPathHero");
        const nodes = [...document.querySelectorAll(".edu-node")];
        const progressFill = document.getElementById("eduPathProgress");
        const yearFloat = document.getElementById("eduPathYearFloat");

        if (!section || !track || !hero || !nodes.length || !progressFill || !yearFloat) return;

        const nodeRefs = nodes.map((node) => ({
            node,
            card: node.querySelector(".edu-node__card"),
            dot: node.querySelector(".edu-node__dot"),
            year: node.dataset.year || ""
        }));

        const state = {
            current: 0,
            target: 0,
            ticking: false
        };

        const metrics = {
            sectionTop: 0,
            sectionHeight: 0,
            sectionScrollable: 1
        };

        function measure() {
            const rect = section.getBoundingClientRect();
            metrics.sectionTop = rect.top + window.scrollY;
            metrics.sectionHeight = section.offsetHeight;
            metrics.sectionScrollable = Math.max(metrics.sectionHeight - dom.winH, 1);
        }

        function getScrollProgress() {
            const sectionTopInViewport = metrics.sectionTop - window.scrollY;
            return utils.clamp(-sectionTopInViewport / metrics.sectionScrollable, 0, 1);
        }

        function updateScene(progress) {
            const viewportH = dom.winH;
            const viewportMidTarget = viewportH * 0.52;

            const travel = Math.max((nodeRefs.length - 1) * viewportH * 0.9, 3200);
            const trackY = -progress * travel;

            track.style.transform = `translate3d(0, ${trackY}px, 0)`;

            const introFade = utils.clamp(progress / 0.1, 0, 1);
            const heroY = -introFade * 140;
            const heroScale = 1 - introFade * 0.14;
            const heroOpacity = 1 - introFade * 1.2;

            hero.style.transform = `translate3d(0, ${heroY}px, 0) scale(${heroScale})`;
            hero.style.opacity = String(Math.max(0, heroOpacity));
            hero.style.filter = `blur(${introFade * 10}px)`;

            progressFill.style.height = `${progress * 100}%`;

            let closestIndex = 0;
            let closestDistance = Infinity;

            for (let i = 0; i < nodeRefs.length; i++) {
                const ref = nodeRefs[i];
                const rect = ref.node.getBoundingClientRect();
                const center = rect.top + rect.height / 2;
                const distance = Math.abs(center - viewportMidTarget);

                const normalized = utils.clamp(distance / (viewportH * 0.42), 0, 1);
                const focus = 1 - normalized;

                const scale = 0.82 + focus * 0.18;
                const opacity = 0.12 + focus * 0.88;
                const rotateX = (1 - focus) * 16;
                const y = (1 - focus) * 36;
                const blur = (1 - focus) * 7;

                ref.node.style.opacity = String(opacity);
                ref.node.style.transform = `translateX(-50%) translateY(${y}px) scale(${scale})`;
                ref.node.style.filter = `blur(${blur}px)`;

                if (ref.card) {
                    ref.card.style.transform = `perspective(1200px) rotateX(${rotateX}deg)`;
                }

                if (ref.dot) {
                    ref.dot.style.transform = `scale(${0.88 + focus * 0.38})`;
                    ref.dot.style.borderColor = focus > 0.7 ? "#9ee7ff" : "rgba(255,255,255,0.2)";
                    ref.dot.style.boxShadow = focus > 0.7
                        ? "0 0 0 10px rgba(158, 231, 255, 0.09), 0 0 22px rgba(158, 231, 255, 0.28)"
                        : "0 0 0 8px rgba(158, 231, 255, 0.05)";
                }

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = i;
                }
            }

            state.target = closestIndex;
            yearFloat.textContent = nodeRefs[closestIndex].year;

            const floatShift = closestIndex * -6;
            yearFloat.style.transform =
                dom.winW <= 980
                    ? `translate3d(0, ${floatShift}px, 0)`
                    : `translate3d(0, calc(-50% + ${floatShift}px), 0)`;

            yearFloat.style.opacity = String(0.35 + utils.clamp(progress * 1.1, 0, 0.55));
        }

        function animate() {
            const targetProgress = getScrollProgress();

            state.current = dom.reducedMotion
                ? targetProgress
                : utils.lerp(state.current, targetProgress, 0.16);

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

        onResize(() => {
            measure();
            requestTick();
        });

        measure();
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
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();