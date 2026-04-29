// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ (ТОЛЬКО ОДИН РАЗ!) =====
let preloaderTimeout = null;
let pageLoaded = false;
let activeDropdown = null;
let currentSlideIndex = 0;
let totalSlides = 0;
let gallerySlider = null;

// ===== ФУНКЦИИ ДЛЯ МОДАЛЬНЫХ ОКОН =====
function openModal() {
    console.log('openModal вызван');
    const modal = document.getElementById('applicationModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    } else {
        console.error('Модальное окно с id "applicationModal" не найдено!');
    }
}

function closeModal() {
    const modal = document.getElementById('applicationModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function showSuccessModal(applicationId, firstName = 'клиент') {
    const successModal = document.getElementById('successModal');
    const numberElement = document.getElementById('successApplicationNumber');
    const nameElement = document.getElementById('successClientName');

    if (numberElement) numberElement.textContent = applicationId;
    if (nameElement) nameElement.textContent = firstName;

    if (successModal) {
        successModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function submitForm(event) {
    event.preventDefault();

    const consentCheckbox = document.getElementById('consentCheckbox');
    if (!consentCheckbox || !consentCheckbox.checked) {
        alert('Пожалуйста, согласитесь на обработку персональных данных');
        return false;
    }

    const form = document.getElementById('applicationForm');
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    submitBtn.innerHTML = '⏳ Отправка...';
    submitBtn.disabled = true;

    fetch('/submit-application', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        closeModal();
        setTimeout(() => {
            showSuccessModal(data.application_id || 'MOD-' + Math.floor(Math.random() * 900000 + 100000),
                           formData.get('firstname') || 'клиент');
        }, 300);
        form.reset();
        if (consentCheckbox) consentCheckbox.checked = false;
        if (submitBtn) submitBtn.disabled = true;
    })
    .catch(error => {
        console.error('Ошибка:', error);
        closeModal();
        setTimeout(() => {
            showSuccessModal('MOD-' + Math.floor(Math.random() * 900000 + 100000),
                           formData.get('firstname') || 'клиент');
        }, 300);
        form.reset();
        if (consentCheckbox) consentCheckbox.checked = false;
        if (submitBtn) submitBtn.disabled = true;
    })
    .finally(() => {
        submitBtn.innerHTML = originalText;
    });

    return false;
}

// ===== ТЕМНАЯ ТЕМА =====
function updateThemeIcon(isDark) {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('.theme-text');

    if (isDark) {
        if (icon) {
            icon.className = 'fas fa-sun';
        }
        if (text) text.textContent = 'Светлая тема';
    } else {
        if (icon) {
            icon.className = 'fas fa-moon';
        }
        if (text) text.textContent = 'Темная тема';
    }
}

function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    } else {
        document.body.classList.remove('dark-mode');
        updateThemeIcon(false);
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark);

        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    });
}

// ===== 3D ЭФФЕКТЫ ДЛЯ КАРТОЧЕК =====
function init3DCards() {
    const cards = document.querySelectorAll('.why-card, .review-card');

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
        item.addEventListener('mouseenter', () => {
            item.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });

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
            item.style.transform = 'perspective(500px) rotateX(0) rotateY(0) translateX(0) translateY(0)';
        });
    });
}

// ===== МОДАЛЬНОЕ ОКНО ДЛЯ ОТЗЫВОВ =====
function openReviewModal() {
    console.log('openReviewModal вызван');
    const modal = document.getElementById('reviewModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        resetReviewForm();
        setTimeout(initStarsSimple, 50);
    } else {
        console.error('Модальное окно с id "reviewModal" не найдено!');
    }
}

function closeReviewModal() {
    const modal = document.getElementById('reviewModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function resetReviewForm() {
    const form = document.getElementById('reviewForm');
    if (form) {
        form.reset();
        form.style.display = 'block';
    }

    const ratingInput = document.getElementById('reviewRating');
    if (ratingInput) ratingInput.value = '';

    const stars = document.querySelectorAll('#ratingStars .star');
    stars.forEach(star => {
        star.classList.remove('active');
        star.textContent = '☆';
    });

    const successMsg = document.getElementById('reviewSuccessMsg');
    if (successMsg) successMsg.style.display = 'none';

    const ratingHint = document.getElementById('ratingHint');
    if (ratingHint) ratingHint.textContent = 'Нажмите на звезду, чтобы оценить';

    document.querySelectorAll('.form-input, .form-textarea').forEach(input => {
        if (input.value === '') {
            input.removeAttribute('placeholder');
        }
    });
}

function initStarsSimple() {
    const stars = document.querySelectorAll('#ratingStars .star');
    const ratingInput = document.getElementById('reviewRating');

    if (!stars.length || !ratingInput) {
        console.log('Звёзды не найдены в модальном окне');
        return;
    }

    console.log('Инициализация звёзд, найдено:', stars.length);

    stars.forEach(star => {
        const newStar = star.cloneNode(true);
        star.parentNode.replaceChild(newStar, star);

        newStar.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            ratingInput.value = rating;
            console.log('Выбрана оценка:', rating);

            const allStars = document.querySelectorAll('#ratingStars .star');
            allStars.forEach((s, i) => {
                if (i < rating) {
                    s.classList.add('active');
                    s.textContent = '★';
                } else {
                    s.classList.remove('active');
                    s.textContent = '☆';
                }
            });

            const ratingHint = document.getElementById('ratingHint');
            if (ratingHint) {
                const hints = {1: 'Очень плохо', 2: 'Плохо', 3: 'Нормально', 4: 'Хорошо', 5: 'Отлично!'};
                ratingHint.textContent = hints[rating];
            }
        });

        newStar.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            const ratingHint = document.getElementById('ratingHint');
            if (ratingHint) {
                const hints = {1: 'Очень плохо', 2: 'Плохо', 3: 'Нормально', 4: 'Хорошо', 5: 'Отлично!'};
                ratingHint.textContent = hints[rating];
            }
        });
    });

    const ratingHint = document.getElementById('ratingHint');
    if (ratingHint) {
        ratingHint.addEventListener('mouseleave', function() {
            ratingHint.textContent = 'Нажмите на звезду, чтобы оценить';
        });
    }
}

function initRatingStars() {
    const editStars = document.querySelectorAll('.edit-star');
    if (editStars.length) {
        editStars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.dataset.rating);
                editStars.forEach((s, i) => {
                    if (i < rating) {
                        s.classList.add('active');
                        s.textContent = '★';
                    } else {
                        s.classList.remove('active');
                        s.textContent = '☆';
                    }
                });
            });
        });
    }
}

function initReviewFormSubmit() {
    const reviewForm = document.getElementById('reviewForm');
    if (!reviewForm) return;

    const newForm = reviewForm.cloneNode(true);
    reviewForm.parentNode.replaceChild(newForm, reviewForm);

    newForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('reviewName').value;
        const service = document.getElementById('reviewService').value;
        const rating = document.getElementById('reviewRating').value;
        const text = document.getElementById('reviewText').value;

        if (!name || !service || !rating || !text) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        const submitBtn = newForm.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Отправка...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name, service, rating: parseInt(rating), text})
            });

            const data = await response.json();

            if (data.success) {
                newForm.style.display = 'none';
                const successMsg = document.getElementById('reviewSuccessMsg');
                if (successMsg) successMsg.style.display = 'block';
                setTimeout(() => {
                    closeReviewModal();
                    location.reload();
                }, 2000);
            } else {
                alert('Ошибка: ' + data.message);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка отправки отзыва');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

function applyPhoneMask(input) {
    if (!input) return;
    input.addEventListener('input', function(e) {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
        e.target.value = !x[2] ? x[1] : '+7 (' + x[2] + ') ' + x[3] + (x[4] ? '-' + x[4] : '') + (x[5] ? '-' + x[5] : '');
    });
}

function checkFadeIn() {
    document.querySelectorAll('.fade-in').forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100 && rect.bottom > 0) {
            element.classList.add('visible');
        }
    });
}

// ===== ПРЕЛОАДЕР =====
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

// ===== ЗАКРЫТИЕ ПО КЛИКУ ВНЕ ОКНА =====
window.onclick = function(event) {
    const modal = document.getElementById('applicationModal');
    const successModal = document.getElementById('successModal');
    const reviewModal = document.getElementById('reviewModal');

    if (event.target == modal) closeModal();
    if (event.target == successModal && successModal.classList.contains('active')) closeSuccessModal();
    if (event.target == reviewModal && reviewModal.classList.contains('active')) closeReviewModal();
}

document.addEventListener('keydown', function(event) {
    const successModal = document.getElementById('successModal');
    const reviewModal = document.getElementById('reviewModal');
    const modal = document.getElementById('applicationModal');

    if (event.key === 'Escape') {
        if (successModal && successModal.classList.contains('active')) closeSuccessModal();
        if (reviewModal && reviewModal.classList.contains('active')) closeReviewModal();
        if (modal && modal.style.display === 'block') closeModal();
    }
});

// ===== ФУНКЦИИ ДЛЯ АДМИНКИ =====
function publishReview(id) {
    if (confirm('Опубликовать этот отзыв?')) {
        fetch(`/api/reviews/${id}/publish`, {method: 'POST'})
            .then(response => response.json())
            .then(data => {
                if (data.success) location.reload();
                else alert('Ошибка: ' + data.message);
            });
    }
}

function rejectReview(id) {
    if (confirm('Отклонить этот отзыв?')) {
        fetch(`/api/reviews/${id}/reject`, {method: 'POST'})
            .then(response => response.json())
            .then(data => {
                if (data.success) location.reload();
                else alert('Ошибка: ' + data.message);
            });
    }
}

function deleteReview(id) {
    if (confirm('Удалить этот отзыв? Это действие нельзя отменить.')) {
        fetch(`/api/reviews/${id}/delete`, {method: 'DELETE'})
            .then(response => response.json())
            .then(data => {
                if (data.success) location.reload();
                else alert('Ошибка: ' + data.message);
            });
    }
}

function editReview(id) {
    const row = document.querySelector(`.review-row[data-id="${id}"]`);
    if (!row) return;

    const name = row.cells[1]?.textContent || '';
    const service = row.cells[2]?.textContent || '';
    const ratingText = row.cells[3]?.textContent || '';
    const rating = ratingText.split('★').length - 1;
    const fullText = row.querySelector('.review-text-full')?.textContent || '';

    document.getElementById('editId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editService').value = service;
    document.getElementById('editText').value = fullText;
    document.getElementById('editAdminComment').value = '';

    const stars = document.querySelectorAll('.edit-star');
    stars.forEach((star, i) => {
        if (i < rating) {
            star.classList.add('active');
            star.textContent = '★';
        } else {
            star.classList.remove('active');
            star.textContent = '☆';
        }
    });

    document.getElementById('editModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
    document.body.style.overflow = '';
}

function toggleText(btn) {
    const cell = btn.closest('.review-text-cell');
    const preview = cell.querySelector('.review-text-preview');
    const full = cell.querySelector('.review-text-full');

    if (preview && full) {
        if (preview.style.display !== 'none') {
            preview.style.display = 'none';
            full.style.display = 'block';
            btn.textContent = 'Скрыть';
        } else {
            preview.style.display = 'block';
            full.style.display = 'none';
            btn.textContent = 'Показать полностью';
        }
    }
}

// ===== ФУНКЦИЯ ДЛЯ ПЕРЕКЛЮЧЕНИЯ ВКЛАДОК (ТОЛЬКО РЕМОНТ И РАЗРАБОТКА) =====
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

// ===== УПРАВЛЕНИЕ ВЫПАДАЮЩИМИ МЕНЮ КАЛЬКУЛЯТОРА =====
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

// ===== КАЛЬКУЛЯТОР =====
function toggleCalcAccordion(titleEl) {
    const body = titleEl.nextElementSibling;
    const isOpen = titleEl.classList.contains('open');

    document.querySelectorAll('.calc-accordion-title.open').forEach(t => {
        if (t !== titleEl) {
            t.classList.remove('open');
            t.nextElementSibling.classList.remove('open');
        }
    });

    titleEl.classList.toggle('open', !isOpen);
    if (body) body.classList.toggle('open', !isOpen);
}

function updateCalcTotal() {
    let total = 0;
    document.querySelectorAll('.calc-service-item.selected input[type="checkbox"]').forEach(cb => {
        total += parseInt(cb.getAttribute('data-price') || 0);
    });
    const totalPriceEl = document.getElementById('totalPrice');
    if (totalPriceEl) totalPriceEl.textContent = formatPrice(total);
}

function updateRepairTotal() { updateCalcTotal(); }
function updateDevTotal() { updateCalcTotal(); }

function formatPrice(price) {
    return Math.round(price).toLocaleString('ru-RU') + ' ₽';
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

    const commentField = document.getElementById('comment');
    if (commentField) commentField.value = message;

    openModal();
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

// ===== КАРУСЕЛЬ ДЛЯ СЕКЦИИ "НАША МАСТЕРСКАЯ" =====
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

// ===== КАРУСЕЛЬ ДЛЯ СЕКЦИИ "НАШИ ПРОЕКТЫ" (ТОЛЬКО РЕМОНТ И РАЗРАБОТКА) =====
let projectCarousels = {
    repair: { index: 0, total: 3, initialized: false, carousel: null },
    dev: { index: 0, total: 3, initialized: false, carousel: null }
};

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

function initRatingHints() {
    const ratingHint = document.getElementById('ratingHint');
    const stars = document.querySelectorAll('.star');

    if (!stars.length) return;

    const hints = {1: 'Очень плохо', 2: 'Плохо', 3: 'Нормально', 4: 'Хорошо', 5: 'Отлично!'};

    stars.forEach(star => {
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            if (ratingHint && hints[rating]) {
                ratingHint.textContent = hints[rating];
            }
        });

        star.addEventListener('mouseleave', function() {
            if (ratingHint) {
                ratingHint.textContent = 'Нажмите на звезду, чтобы оценить';
            }
        });
    });
}

// ===== БУРГЕР-МЕНЮ ДЛЯ МОБИЛЬНЫХ =====
(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBurgerMenu);
    } else {
        initBurgerMenu();
    }

    function initBurgerMenu() {
        const navbar = document.querySelector('.navbar');
        const navMenu = document.querySelector('.nav-menu');

        if (!navbar || !navMenu) return;
        if (document.querySelector('.hamburger')) return;

        const hamburger = document.createElement('div');
        hamburger.className = 'hamburger';
        hamburger.innerHTML = '<span></span><span></span><span></span>';
        navbar.appendChild(hamburger);

        function toggleMenu() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        }

        navMenu.querySelectorAll('a, button').forEach(item => {
            item.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });

        hamburger.addEventListener('click', toggleMenu);

        document.addEventListener('click', function(event) {
            if (navMenu.classList.contains('active') &&
                !navMenu.contains(event.target) &&
                !hamburger.contains(event.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
})();

// ===== СЛАЙДЕР ГЕРОЙ-СЕКЦИИ =====
document.addEventListener('DOMContentLoaded', function() {
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
});

// ===== АКТИВАЦИЯ КНОПКИ ПОСЛЕ СОГЛАСИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    const consentCheckbox = document.getElementById('consentCheckbox');
    const submitBtn = document.getElementById('submitBtn');

    if (consentCheckbox && submitBtn) {
        consentCheckbox.addEventListener('change', function() {
            submitBtn.disabled = !this.checked;
        });

        submitBtn.disabled = true;
    }
});

// ===== АНИМАЦИИ ПРИ СКРОЛЛЕ =====
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

function animateNumbers() {
    const numberElements = document.querySelectorAll('.stat-number');

    numberElements.forEach(el => {
        const target = parseInt(el.dataset.target);
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                el.textContent = target;
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(current);
            }
        }, 30);
    });
}

function animateCardsStaggered() {
    const cards = document.querySelectorAll('.why-card, .review-card, .calc-service-item');

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

// ===== TOUCH-СВАЙП ДЛЯ КАРУСЕЛИ (ПРОСТАЯ ВЕРСИЯ) =====
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

// ===== ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ PlusPC JavaScript загружен');

    applyPhoneMask(document.getElementById('phone'));
    initPreloader();
    initRatingStars();
    initRatingHints();
    initGalleryCarousel();
    initProjectCarousel('repair');
    initProjectCarousel('dev');
    initCalculator();
    initReviewFormSubmit();
    initScrollAnimations();
    animateCardsStaggered();
    initSimpleCarouselSwipe();
    initTheme(); // Инициализация темной темы
    init3DCards(); // Инициализация 3D эффекта для карточек
    init3DServiceItems(); // Инициализация 3D эффекта для элементов калькулятора

    const galleryContainer = document.getElementById('galleryContainer');
    if (galleryContainer) {
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

    const editStars = document.querySelectorAll('.edit-star');
    if (editStars.length) {
        editStars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.dataset.rating);
                editStars.forEach((s, i) => {
                    if (i < rating) {
                        s.classList.add('active');
                        s.textContent = '★';
                    } else {
                        s.classList.remove('active');
                        s.textContent = '☆';
                    }
                });
            });
        });
    }

    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const id = document.getElementById('editId').value;
            const name = document.getElementById('editName').value;
            const service = document.getElementById('editService').value;
            const text = document.getElementById('editText').value;
            const adminComment = document.getElementById('editAdminComment').value;
            const rating = document.querySelectorAll('.edit-star.active').length;

            try {
                const response = await fetch(`/api/reviews/${id}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({name, service, rating, text, admin_comment: adminComment})
                });
                const data = await response.json();
                if (data.success) location.reload();
                else alert('Ошибка: ' + data.message);
            } catch (error) {
                alert('Ошибка при сохранении');
            }
        });
    }

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filter = this.dataset.filter;
            const rows = document.querySelectorAll('.review-row');

            rows.forEach(row => {
                if (filter === 'all' || row.dataset.status === filter) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    });

    setTimeout(function() {
        const flashes = document.querySelectorAll('.flash-message');
        flashes.forEach(flash => {
            flash.style.opacity = '0';
            flash.style.transform = 'translateX(100px)';
            setTimeout(() => flash.remove(), 300);
        });
    }, 5000);

    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
                animateNumbers();
            }, 500);
        }, 2000);
    }
});

// ===== ОЧИСТКА ТАЙМЕРА ПРИ ВЫХОДЕ =====
window.addEventListener('beforeunload', function() {
    if (preloaderTimeout) {
        clearTimeout(preloaderTimeout);
    }
});

// ===== ЕДИНЫЙ ЭКСПОРТ В ГЛОБАЛЬНУЮ ОБЛАСТЬ =====
window.openModal = openModal;
window.closeModal = closeModal;
window.closeSuccessModal = closeSuccessModal;
window.submitForm = submitForm;
window.openReviewModal = openReviewModal;
window.closeReviewModal = closeReviewModal;
window.showWorksTab = showWorksTab;
window.publishReview = publishReview;
window.rejectReview = rejectReview;
window.deleteReview = deleteReview;
window.editReview = editReview;
window.closeEditModal = closeEditModal;
window.toggleText = toggleText;
window.toggleServiceCategory = toggleServiceCategory;
window.closeDropdown = closeDropdown;
window.toggleCalcAccordion = toggleCalcAccordion;
window.updateCalcTotal = updateCalcTotal;
window.resetAllSelections = resetAllSelections;
window.submitAllServices = submitAllServices;
window.formatPrice = formatPrice;
window.updateRepairTotal = updateRepairTotal;
window.updateDevTotal = updateDevTotal;
window.galleryPrevSlide = galleryPrevSlide;
window.galleryNextSlide = galleryNextSlide;
window.galleryGoToSlide = galleryGoToSlide;
window.slideProjectCarousel = slideProjectCarousel;
window.goToProjectSlide = goToProjectSlide;
window.prevCarouselSlide = function(type) { slideProjectCarousel(type, 'prev'); };
window.nextCarouselSlide = function(type) { slideProjectCarousel(type, 'next'); };
window.goToCarouselSlide = function(type, index) { goToProjectSlide(type, index); };