// ============================================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================================
let preloaderTimeout = null;
let pageLoaded = false;
let activeDropdown = null;
let currentSlideIndex = 0;
let totalSlides = 0;
let gallerySlider = null;

let projectCarousels = {
    repair: { index: 0, total: 3, initialized: false, carousel: null },
    dev: { index: 0, total: 3, initialized: false, carousel: null }
};

let calcCarouselPhotos = [];
let calcCarouselIndex = 0;

// ============================================================
// КАЛЬКУЛЯТОР УСЛУГ
// ============================================================
function formatPrice(price) {
    return Math.round(price).toLocaleString('ru-RU') + ' ₽';
}

function updateCalcTotal() {
    let total = 0;
    document.querySelectorAll('.calc-service-item.selected input[type="checkbox"]').forEach(cb => {
        total += parseInt(cb.getAttribute('data-price') || 0);
    });
    const totalPriceEl = document.getElementById('totalPrice');
    if (totalPriceEl) totalPriceEl.textContent = formatPrice(total);
    updateCalcCarousel();
}

function updateCalcCarousel() {
    const container = document.getElementById('calcPhotoCarousel');
    const track = document.getElementById('calcCarouselTrack');
    if (!container || !track) return;

    calcCarouselPhotos = [];
    document.querySelectorAll('.calc-service-item.selected input[type="checkbox"]').forEach(cb => {
        const src = cb.getAttribute('data-image');
        if (!src) return;
        const label = cb.closest('.calc-service-item');
        const name = label?.querySelector('.calc-service-name')?.textContent?.trim() || '';
        calcCarouselPhotos.push({ src, name });
    });

    if (calcCarouselPhotos.length === 0) {
        container.style.display = 'none';
        track.innerHTML = '';
        calcCarouselIndex = 0;
        return;
    }

    container.style.display = 'block';
    if (calcCarouselIndex >= calcCarouselPhotos.length) {
        calcCarouselIndex = calcCarouselPhotos.length - 1;
    }

    track.innerHTML = calcCarouselPhotos.map(photo => `
        <div class="calc-carousel-slide">
            <img src="${photo.src}" alt="${photo.name}" onerror="this.closest('.calc-carousel-slide').style.display='none'">
            <span class="calc-carousel-caption">${photo.name}</span>
        </div>
    `).join('');

    updateCalcCarouselPosition();
}

function updateCalcCarouselPosition() {
    const track = document.getElementById('calcCarouselTrack');
    const counter = document.getElementById('calcCarouselCounter');
    if (track) track.style.transform = `translateX(${-calcCarouselIndex * 100}%)`;
    if (counter && calcCarouselPhotos.length > 0) {
        counter.textContent = `${calcCarouselIndex + 1} / ${calcCarouselPhotos.length}`;
    }
}

function calcCarouselPrev() {
    if (calcCarouselPhotos.length === 0) return;
    calcCarouselIndex = (calcCarouselIndex - 1 + calcCarouselPhotos.length) % calcCarouselPhotos.length;
    updateCalcCarouselPosition();
}

function calcCarouselNext() {
    if (calcCarouselPhotos.length === 0) return;
    calcCarouselIndex = (calcCarouselIndex + 1) % calcCarouselPhotos.length;
    updateCalcCarouselPosition();
}

function toggleCalcAccordion(titleEl) {
    const body = titleEl.nextElementSibling;
    const isOpen = titleEl.classList.contains('open');

    document.querySelectorAll('.calc-accordion-title.open').forEach(t => {
        if (t !== titleEl) {
            t.classList.remove('open');
            if (t.nextElementSibling) t.nextElementSibling.classList.remove('open');
        }
    });

    titleEl.classList.toggle('open', !isOpen);
    if (body) body.classList.toggle('open', !isOpen);
}

function resetAllSelections() {
    document.querySelectorAll('.calc-service-item').forEach(item => {
        item.classList.remove('selected');
        const cb = item.querySelector('input[type="checkbox"]');
        if (cb) cb.checked = false;
    });
    updateCalcTotal();
}

function submitAllServices() {
    let message = 'ВЫБРАННЫЕ УСЛУГИ:\n\n';
    let hasServices = false;

    const repairItems = document.querySelectorAll('.calc-service-item.selected .repair-checkbox');
    if (repairItems.length > 0) {
        message += 'РЕМОНТ ТЕХНИКИ:\n';
        repairItems.forEach(cb => {
            const label = cb.closest('.calc-service-item');
            const name = label?.querySelector('.calc-service-name')?.textContent?.trim() || 'Услуга';
            const price = label?.querySelector('.calc-service-price')?.textContent?.trim() || '';
            message += `• ${name} — ${price}\n`;
            hasServices = true;
        });
        message += '\n';
    }

    const devItems = document.querySelectorAll('.calc-service-item.selected .dev-checkbox');
    if (devItems.length > 0) {
        message += 'РАЗРАБОТКА И ДИЗАЙН:\n';
        devItems.forEach(cb => {
            const label = cb.closest('.calc-service-item');
            const name = label?.querySelector('.calc-service-name')?.textContent?.trim() || 'Услуга';
            const price = label?.querySelector('.calc-service-price')?.textContent?.trim() || '';
            message += `• ${name} — ${price}\n`;
            hasServices = true;
        });
        message += '\n';
    }

    if (!hasServices) {
        alert('Пожалуйста, выберите хотя бы одну услугу.');
        return;
    }

    const totalPrice = document.getElementById('totalPrice')?.textContent || '0 ₽';
    message += `ИТОГОВАЯ СТОИМОСТЬ: ${totalPrice}`;

    alert(message);
}

function initCalculator() {
    console.log('Инициализация калькулятора...');

    document.querySelectorAll('.calc-service-item').forEach(item => {
        const cb = item.querySelector('input[type="checkbox"]');
        if (!cb) return;

        item.addEventListener('click', function(e) {
            if (e.target === cb) return;
            e.preventDefault();
            cb.checked = !cb.checked;
            item.classList.toggle('selected', cb.checked);
            updateCalcTotal();
        });

        cb.addEventListener('change', function() {
            item.classList.toggle('selected', this.checked);
            updateCalcTotal();
        });
    });

    updateCalcTotal();
    console.log('✅ Калькулятор инициализирован');
}

// ============================================================
// ГАЛЕРЕЯ МАСТЕРСКОЙ
// ============================================================
function initGalleryCarousel() {
    gallerySlider = document.getElementById('gallerySlider');
    if (!gallerySlider) {
        console.warn('Элемент #gallerySlider не найден');
        return false;
    }

    const slides = document.querySelectorAll('.gallery-slide');
    totalSlides = slides.length;

    if (totalSlides === 0) {
        console.warn('Нет слайдов в галерее');
        return false;
    }

    updateGalleryDots();
    console.log(`✅ Галерея инициализирована, слайдов: ${totalSlides}`);
    return true;
}

function updateGallerySlider() {
    if (!gallerySlider) return;
    const translateValue = -currentSlideIndex * 100;
    gallerySlider.style.transform = `translateX(${translateValue}%)`;
    updateGalleryDots();
}

function updateGalleryDots() {
    const dots = document.querySelectorAll('.gallery-dot');
    dots.forEach((dot, index) => {
        if (index === currentSlideIndex) {
            dot.style.background = '#000';
            dot.style.transform = 'scale(1.2)';
        } else {
            dot.style.background = '#ccc';
            dot.style.transform = 'scale(1)';
        }
    });
}

function galleryPrevSlide() {
    if (totalSlides === 0) return;
    currentSlideIndex--;
    if (currentSlideIndex < 0) currentSlideIndex = totalSlides - 1;
    updateGallerySlider();
    console.log(`⬅️ Слайд ${currentSlideIndex + 1} из ${totalSlides}`);
}

function galleryNextSlide() {
    if (totalSlides === 0) return;
    currentSlideIndex++;
    if (currentSlideIndex >= totalSlides) currentSlideIndex = 0;
    updateGallerySlider();
    console.log(`➡️ Слайд ${currentSlideIndex + 1} из ${totalSlides}`);
}

function galleryGoToSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    currentSlideIndex = index;
    updateGallerySlider();
    console.log(`🎯 Переход к слайду ${index + 1}`);
}

// ============================================================
// КАРУСЕЛЬ "СФЕРЫ ДЕЯТЕЛЬНОСТИ"
// ============================================================
function initProjectCarousel(type) {
    const carousel = document.getElementById(`${type}Carousel`);
    if (!carousel) {
        console.warn(`Карусель ${type}Carousel не найдена`);
        return false;
    }

    const slides = carousel.querySelectorAll('.works-slide');
    const totalSlidesCount = slides.length;

    if (totalSlidesCount === 0) {
        console.warn(`В карусели ${type} нет слайдов`);
        return false;
    }

    projectCarousels[type].carousel = carousel;
    projectCarousels[type].total = totalSlidesCount;
    projectCarousels[type].initialized = true;

    const dotsContainer = document.getElementById(`${type}Dots`);
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalSlidesCount; i++) {
            const dot = document.createElement('span');
            dot.className = 'carousel-dot';
            if (i === projectCarousels[type].index) dot.classList.add('active');
            dot.onclick = (function(idx) {
                return function() { goToProjectSlide(type, idx); };
            })(i);
            dotsContainer.appendChild(dot);
        }
    }

    updateProjectCarousel(type);
    console.log(`✅ Карусель ${type} инициализирована, слайдов: ${totalSlidesCount}`);
    return true;
}

function updateProjectCarousel(type) {
    const state = projectCarousels[type];
    if (!state.initialized || !state.carousel) return;

    const translateValue = -state.index * 100;
    state.carousel.style.transform = `translateX(${translateValue}%)`;

    const dots = document.querySelectorAll(`#${type}Dots .carousel-dot`);
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === state.index);
    });
}

function slideProjectCarousel(type, direction) {
    const state = projectCarousels[type];
    if (!state.initialized) {
        if (!initProjectCarousel(type)) return;
    }

    if (direction === 'prev') {
        state.index = (state.index - 1 + state.total) % state.total;
    } else {
        state.index = (state.index + 1) % state.total;
    }

    updateProjectCarousel(type);
    console.log(`🔄 Карусель ${type}: слайд ${state.index + 1} из ${state.total}`);
}

function goToProjectSlide(type, index) {
    const state = projectCarousels[type];
    if (!state.initialized) {
        if (!initProjectCarousel(type)) return;
    }

    if (index >= 0 && index < state.total) {
        state.index = index;
        updateProjectCarousel(type);
        console.log(`🎯 Карусель ${type}: переход к слайду ${index + 1}`);
    }
}

// ============================================================
// ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК "НАШИ ПРОЕКТЫ"
// ============================================================
function showWorksTab(tabName) {
    console.log('showWorksTab вызван с параметром:', tabName);

    const repairWorks = document.getElementById('repairWorks');
    const devWorks = document.getElementById('devWorks');
    const tabs = document.querySelectorAll('.works-tab');

    if (!repairWorks || !devWorks) {
        console.error('Один из блоков проектов не найден!');
        return;
    }

    repairWorks.classList.remove('active');
    devWorks.classList.remove('active');

    tabs.forEach((tab, idx) => {
        if ((idx === 0 && tabName === 'repair') ||
            (idx === 1 && tabName === 'dev')) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    if (tabName === 'repair') {
        repairWorks.classList.add('active');
        if (projectCarousels.repair) {
            projectCarousels.repair.index = 0;
            updateProjectCarousel('repair');
        }
        console.log('✅ Показан раздел "Ремонт техники"');
    } else if (tabName === 'dev') {
        devWorks.classList.add('active');
        if (projectCarousels.dev) {
            projectCarousels.dev.index = 0;
            updateProjectCarousel('dev');
        }
        console.log('✅ Показан раздел "Разработка ПО"');
    }
}

// ============================================================
// ВЫПАДАЮЩИЕ МЕНЮ КАЛЬКУЛЯТОРА
// ============================================================
function toggleServiceCategory(category) {
    console.log('toggleServiceCategory вызван для категории:', category);

    const repairBtn = document.getElementById('repairMainBtn');
    const devBtn = document.getElementById('devMainBtn');
    const repairDropdown = document.getElementById('repairDropdown');
    const devDropdown = document.getElementById('devDropdown');

    if (!repairBtn || !devBtn || !repairDropdown || !devDropdown) {
        console.error('Элементы выпадающих меню не найдены!');
        return;
    }

    if (activeDropdown === category) {
        closeDropdown(category);
        return;
    }

    if (activeDropdown) {
        closeDropdown(activeDropdown);
    }

    if (category === 'repair') {
        repairDropdown.classList.add('active');
        repairBtn.classList.add('active');
        activeDropdown = 'repair';
        document.body.style.overflow = 'hidden';
        console.log('✅ Открыто меню ремонта');
    } else if (category === 'dev') {
        devDropdown.classList.add('active');
        devBtn.classList.add('active');
        activeDropdown = 'dev';
        document.body.style.overflow = 'hidden';
        console.log('✅ Открыто меню разработки');
    }
}

function closeDropdown(category) {
    console.log('closeDropdown вызван для категории:', category);

    const repairBtn = document.getElementById('repairMainBtn');
    const devBtn = document.getElementById('devMainBtn');
    const repairDropdown = document.getElementById('repairDropdown');
    const devDropdown = document.getElementById('devDropdown');

    if (category === 'repair') {
        if (repairDropdown) repairDropdown.classList.remove('active');
        if (repairBtn) repairBtn.classList.remove('active');
        console.log('❌ Закрыто меню ремонта');
    } else if (category === 'dev') {
        if (devDropdown) devDropdown.classList.remove('active');
        if (devBtn) devBtn.classList.remove('active');
        console.log('❌ Закрыто меню разработки');
    }

    activeDropdown = null;
    document.body.style.overflow = 'auto';
}

// ============================================================
// ПРЕЛОАДЕР (если есть)
// ============================================================
function hidePreloader() {
    const preloader = document.getElementById('preloader');
    const content = document.querySelector('main');
    const video = document.querySelector('.preloader-video');

    if (preloader && !preloader.classList.contains('hidden')) {
        console.log('🎬 Скрываем прелоадер');
        preloader.classList.add('hidden');

        if (content) {
            content.style.transition = 'opacity 0.5s ease';
            content.style.opacity = '1';
        }

        if (video) {
            video.pause();
            video.currentTime = 0;
        }

        setTimeout(() => {
            if (preloader) {
                preloader.style.display = 'none';
            }
        }, 500);
    }
}

function initPreloader() {
    console.log('🎬 Инициализация прелоадера');

    if (window.location.pathname.includes('/success')) {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.display = 'none';
        }
        return;
    }

    const preloader = document.getElementById('preloader');
    const video = document.querySelector('.preloader-video');
    const content = document.querySelector('main');

    if (!preloader) return;

    if (content) {
        content.style.opacity = '0';
    }

    let playCount = 0;
    const maxPlays = 1;

    if (video) {
        video.addEventListener('ended', function onVideoEnd() {
            playCount++;
            console.log(`🎬 Прелоадер: проигрывание ${playCount} из ${maxPlays}`);

            if (playCount >= maxPlays) {
                video.removeEventListener('ended', onVideoEnd);
                hidePreloader();
            } else {
                video.play().catch(e => console.log('Ошибка воспроизведения:', e));
            }
        });

        video.addEventListener('canplay', function() {
            console.log('🎥 Видео готово к воспроизведению');
            video.play().catch(e => console.log('Автозапуск:', e));
        });

        video.addEventListener('error', function(e) {
            console.error('❌ Ошибка загрузки видео:', e);
            hidePreloader();
        });
    }

    if (preloaderTimeout) clearTimeout(preloaderTimeout);
    preloaderTimeout = setTimeout(function() {
        console.log('⏰ Таймер прелоадера сработал');
        hidePreloader();
    }, 4000);

    if (!pageLoaded) {
        window.addEventListener('load', function() {
            pageLoaded = true;
            console.log('📄 Страница полностью загружена');
            setTimeout(() => {
                if (preloader && !preloader.classList.contains('hidden')) {
                    console.log('📄 Страница загружена, принудительно скрываем прелоадер');
                    hidePreloader();
                }
            }, 2000);
        });
    }
}

// ============================================================
// МАСКА ДЛЯ ПОЛЯ ТЕЛЕФОНА
// ============================================================
function applyPhoneMask(input) {
    if (!input) return;
    input.addEventListener('input', function(e) {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
        e.target.value = !x[2] ? x[1] : '+7 (' + x[2] + ') ' + x[3] + (x[4] ? '-' + x[4] : '') + (x[5] ? '-' + x[5] : '');
    });
}

// ============================================================
// АНИМАЦИИ ПРИ СКРОЛЛЕ
// ============================================================
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.scroll-fade-up, .scroll-fade-left, .scroll-fade-right, .scroll-zoom');

    if (animatedElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
}

function animateCardsStaggered() {
    const cards = document.querySelectorAll('.why-card, .calc-service-item');

    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.5s ease';

        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

function initAboutDecorationAnimation() {
    const decoration = document.getElementById('aboutDecoration');
    if (!decoration) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                decoration.classList.add('visible');
                observer.unobserve(decoration);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(decoration);
}

function initWhyDecorationAnimation() {
    const whyDecoration = document.getElementById('whyDecoration');
    if (!whyDecoration) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    whyDecoration.classList.add('visible');
                }, 300);
                observer.unobserve(whyDecoration);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(whyDecoration);
}

function initTimelineAnimation() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (!timelineItems.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = Array.from(timelineItems).indexOf(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 250);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    timelineItems.forEach(item => observer.observe(item));
}

// ============================================================
// 3D-ЭФФЕКТЫ ПРИ НАВЕДЕНИИ
// ============================================================
function init3DCards() {
    const cards = document.querySelectorAll('.why-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

function init3DServiceItems() {
    const items = document.querySelectorAll('.calc-service-item');

    items.forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 30;
            const rotateY = (centerX - x) / 30;

            item.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(5px) translateY(-2px)`;
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = '';
        });
    });
}

// ============================================================
// TOUCH-СВАЙП ДЛЯ КАРУСЕЛЕЙ
// ============================================================
function initSimpleCarouselSwipe() {
    const carouselWrappers = document.querySelectorAll('#repairWorks .works-carousel-wrapper, #devWorks .works-carousel-wrapper');

    carouselWrappers.forEach(wrapper => {
        let touchStartX = 0;
        let touchEndX = 0;

        const getCarouselType = () => {
            const parentWorks = wrapper.closest('.works-grid');
            if (parentWorks && parentWorks.id === 'repairWorks') return 'repair';
            if (parentWorks && parentWorks.id === 'devWorks') return 'dev';
            return null;
        };

        wrapper.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        wrapper.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchEndX - touchStartX;
            const threshold = 50;

            if (Math.abs(diff) > threshold) {
                const type = getCarouselType();
                if (type) {
                    if (diff < 0) {
                        slideProjectCarousel(type, 'next');
                        console.log(`👉 Свайп влево на карусели ${type}`);
                    } else {
                        slideProjectCarousel(type, 'prev');
                        console.log(`👈 Свайп вправо на карусели ${type}`);
                    }
                }
            }
        }, { passive: true });
    });

    console.log('✅ Touch-свайп активирован для каруселей (ремонт и разработка)');
}

// ============================================================
// СЛАЙДШОУ В ГЕРОЙ-СЕКЦИИ
// ============================================================
function initHeroSlider() {
    const slides = document.querySelectorAll('.slideshow-container .slide');
    if (!slides.length) return;

    const intervals = [12000, 13000, 15000];
    let currentIndex = 0;
    let timeoutId = null;
    let isAnimating = false;

    function showSlide(index) {
        if (isAnimating) return;
        isAnimating = true;

        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            slide.style.animation = 'none';
            slide.offsetHeight;
        });

        slides[index].classList.add('active');
        slides[index].style.animation = 'slowZoom 20s ease-in-out infinite';

        setTimeout(() => {
            isAnimating = false;
        }, 500);
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);

        if (timeoutId) clearTimeout(timeoutId);
        const nextInterval = intervals[currentIndex];
        timeoutId = setTimeout(nextSlide, nextInterval);
    }

    showSlide(0);
    timeoutId = setTimeout(nextSlide, intervals[0]);

    window.addEventListener('beforeunload', function() {
        if (timeoutId) clearTimeout(timeoutId);
    });
}

// ============================================================
// ШАПКА: ПРОЗРАЧНАЯ → БЕЛАЯ
// ============================================================
function initHeaderScrollState() {
    const hero = document.querySelector('.hero');
    const header = document.querySelector('.header');
    if (!header) return;

    if (hero) {
        const heroObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                hero.classList.toggle('hero-visible', entry.isIntersecting);
                header.classList.toggle('scrolled', !entry.isIntersecting);
            });
        }, { threshold: 0.15 });
        heroObserver.observe(hero);
    } else {
        header.classList.add('scrolled');
    }
}

function initHeaderHoursIndicator() {
    const dot = document.querySelector('.header-hours-dot');
    const label = document.querySelector('.header-hours-label');
    if (!dot || !label) return;

    const currentHour = new Date().getHours();
    const isOpen = currentHour >= 9 && currentHour < 21;
    dot.classList.add(isOpen ? 'open' : 'closed');
    label.textContent = isOpen ? 'Сейчас открыто' : 'Сейчас закрыто';
}

// ============================================================
// ГАЛЕРЕЯ: СВАЙП НА ТЕЛЕФОНАХ
// ============================================================
function initGallerySwipe() {
    const galleryContainer = document.getElementById('galleryContainer');
    if (!galleryContainer) return;

    let touchStartX = 0, touchEndX = 0;
    galleryContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    galleryContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
            galleryNextSlide();
        }
        if (touchEndX > touchStartX + swipeThreshold) {
            galleryPrevSlide();
        }
    }, { passive: true });
}

// ============================================================
// ВКЛАДКИ "НАШИ ПРОЕКТЫ"
// ============================================================
function initWorksTabs() {
    const repairWorks = document.getElementById('repairWorks');
    const devWorks = document.getElementById('devWorks');

    if (repairWorks && devWorks) {
        console.log('✅ Блоки "Наши проекты" найдены');
        repairWorks.classList.add('active');
        devWorks.classList.remove('active');

        const tabs = document.querySelectorAll('.works-tab');
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                if (index === 0) {
                    showWorksTab('repair');
                } else if (index === 1) {
                    showWorksTab('dev');
                }
            });
        });
    } else {
        console.warn('⚠️ Блоки "Наши проекты" не найдены на этой странице');
    }
}

function initDropdownGlobalClose() {
    document.addEventListener('click', function(event) {
        if (!activeDropdown) return;

        const repairBtn = document.getElementById('repairMainBtn');
        const devBtn = document.getElementById('devMainBtn');
        const repairDropdown = document.getElementById('repairDropdown');
        const devDropdown = document.getElementById('devDropdown');

        if (activeDropdown === 'repair' && repairBtn && repairDropdown &&
            !repairBtn.contains(event.target) && !repairDropdown.contains(event.target)) {
            closeDropdown('repair');
        }

        if (activeDropdown === 'dev' && devBtn && devDropdown &&
            !devBtn.contains(event.target) && !devDropdown.contains(event.target)) {
            closeDropdown('dev');
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && activeDropdown) {
            closeDropdown(activeDropdown);
        }
    });
}

function initFlashMessagesAutoHide() {
    setTimeout(function() {
        const flashes = document.querySelectorAll('.flash-message');
        flashes.forEach(flash => {
            flash.style.opacity = '0';
            flash.style.transform = 'translateX(100px)';
            setTimeout(() => flash.remove(), 300);
        });
    }, 5000);
}

// ============================================================
// ПЕЧАТНАЯ МАШИНКА В ФУТЕРЕ
// ============================================================
function initFooterTyping() {
    const phrases = [
        'PlusPC',
        'Ремонт компьютеров с душой',
        'Ваш ПК — наша забота',
        'Сделаем ваш компьютер лучше',
        'Профессионалы своего дела',
        'Цена = качество',
        'Подарим вашему пк вторую жизнь',
        'PlusPC'
    ];

    let phraseIndex = 0, charIndex = 0, isDeleting = false;
    const typingEl = document.querySelector('.typing-text');
    const cursorEl = document.querySelector('.typing-cursor');

    if (!typingEl || !cursorEl) return;

    function type() {
        const phrase = phrases[phraseIndex];
        typingEl.textContent = isDeleting
            ? phrase.substring(0, charIndex - 1)
            : phrase.substring(0, charIndex + 1);
        charIndex += isDeleting ? -1 : 1;

        let delay = isDeleting ? 30 : 80;

        if (!isDeleting && charIndex === phrase.length) {
            delay = 2500;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            delay = 500;
        }
        setTimeout(type, delay);
    }

    setTimeout(type, 1000);
}

// ============================================================
// 3D-КОМПОЗИЦИЯ (Ч/Б МИНИМАЛИЗМ)
// ============================================================
function initHeroThree() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const container = canvas.closest('.hero-right') || canvas.parentElement;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);

    function setSize() {
        const w = container.clientWidth || 400;
        const h = container.clientHeight || 400;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        const minSide = Math.min(w, h);
        camera.position.z = minSide < 260 ? 10.5 : (minSide < 380 ? 9 : 7.2);
        camera.updateProjectionMatrix();
    }
    setSize();

    const group = new THREE.Group();
    scene.add(group);

    const coreGeo = new THREE.IcosahedronGeometry(1.7, 1);
    const coreEdges = new THREE.EdgesGeometry(coreGeo);
    const coreMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
    const core = new THREE.LineSegments(coreEdges, coreMat);
    group.add(core);

    const coreFillMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.035 });
    const coreFill = new THREE.Mesh(coreGeo, coreFillMat);
    group.add(coreFill);

    const shellGeo = new THREE.DodecahedronGeometry(2.6, 0);
    const shellEdges = new THREE.EdgesGeometry(shellGeo);
    const shellMat = new THREE.LineBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.32 });
    const shell = new THREE.LineSegments(shellEdges, shellMat);
    group.add(shell);

    const ringGeo = new THREE.TorusGeometry(3.05, 0.006, 8, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.5;
    ring.rotation.y = 0.3;
    group.add(ring);

    const isMobile = window.innerWidth < 769;
    const pointsCount = isMobile ? 22 : 46;
    const pointsGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(pointsCount * 3);
    for (let i = 0; i < pointsCount; i++) {
        const r = 3.5 + Math.random() * 1.1;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
    }
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pointsMat = new THREE.PointsMaterial({ color: 0xe6e6e6, size: 0.035, transparent: true, opacity: 0.55 });
    const points = new THREE.Points(pointsGeo, pointsMat);
    group.add(points);

    group.rotation.x = 0.35;
    group.rotation.y = -0.2;

    let targetX = 0, targetY = 0;
    let currentX = group.rotation.y, currentY = group.rotation.x;

    window.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) - 0.5;
        const ny = ((e.clientY - rect.top) / rect.height) - 0.5;
        targetX = nx * 0.7;
        targetY = ny * 0.5;
    });

    let frameId;
    function animate() {
        frameId = requestAnimationFrame(animate);

        core.rotation.y += 0.0018;
        core.rotation.x += 0.0007;
        coreFill.rotation.copy(core.rotation);
        shell.rotation.y -= 0.0009;
        shell.rotation.x += 0.0005;
        ring.rotation.z += 0.0012;
        points.rotation.y += 0.0006;

        currentX += (targetX - currentX) * 0.03;
        currentY += (0.35 + targetY - currentY) * 0.03;
        group.rotation.y = currentX - 0.2;
        group.rotation.x = currentY;

        renderer.render(scene, camera);
    }

    if (prefersReducedMotion) {
        renderer.render(scene, camera);
    } else {
        animate();
    }

    window.addEventListener('resize', setSize);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && frameId) {
            cancelAnimationFrame(frameId);
        } else if (!document.hidden && !prefersReducedMotion) {
            animate();
        }
    });
}

// ============================================================
// ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ PlusPC JavaScript загружен');

    // --- Базовая инициализация ---
    applyPhoneMask(document.getElementById('phone'));
    initGalleryCarousel();
    initProjectCarousel('repair');
    initProjectCarousel('dev');
    initCalculator();
    initHeroSlider();

    // --- Анимации при скролле ---
    initScrollAnimations();
    animateCardsStaggered();
    initAboutDecorationAnimation();
    initWhyDecorationAnimation();
    initTimelineAnimation();

    // --- 3D-эффекты и свайпы ---
    init3DCards();
    init3DServiceItems();
    initSimpleCarouselSwipe();
    initGallerySwipe();

    // --- Шапка сайта ---
    initHeaderScrollState();
    initHeaderHoursIndicator();

    // --- Вкладки и выпадающие меню ---
    initWorksTabs();
    initDropdownGlobalClose();

    // --- Прочее ---
    initFlashMessagesAutoHide();
    initFooterTyping(); // <-- ВАЖНО: запуск печатной машинки

    // --- Запуск 3D-композиции, если Three.js загружен ---
    if (typeof THREE !== 'undefined') {
        initHeroThree();
    } else {
        window.addEventListener('load', initHeroThree);
    }

    // Прелоадер (если есть)
    if (document.getElementById('preloader')) {
        initPreloader();
    }
});

// ============================================================
// ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ (для onclick)
// ============================================================
window.showWorksTab = showWorksTab;
window.toggleServiceCategory = toggleServiceCategory;
window.closeDropdown = closeDropdown;
window.toggleCalcAccordion = toggleCalcAccordion;
window.updateCalcTotal = updateCalcTotal;
window.resetAllSelections = resetAllSelections;
window.submitAllServices = submitAllServices;
window.formatPrice = formatPrice;
window.galleryPrevSlide = galleryPrevSlide;
window.galleryNextSlide = galleryNextSlide;
window.galleryGoToSlide = galleryGoToSlide;
window.slideProjectCarousel = slideProjectCarousel;
window.goToProjectSlide = goToProjectSlide;
window.prevCarouselSlide = function(type) { slideProjectCarousel(type, 'prev'); };
window.nextCarouselSlide = function(type) { slideProjectCarousel(type, 'next'); };
window.goToCarouselSlide = function(type, index) { goToProjectSlide(type, index); };
window.calcCarouselPrev = calcCarouselPrev;
window.calcCarouselNext = calcCarouselNext;
window.initHeroThree = initHeroThree;