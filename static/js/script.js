// PlusPC - основной JavaScript файл
console.log('✅ PlusPC JS загружен');

// Активация плавающей кнопки
document.addEventListener('DOMContentLoaded', function() {
    const floatingMessengers = document.querySelector('.floating-messengers');
    const floatingToggle = document.querySelector('.floating-toggle');

    if (floatingToggle && floatingMessengers) {
        floatingToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            floatingMessengers.classList.toggle('active');
        });

        document.addEventListener('click', function(e) {
            if (!floatingMessengers.contains(e.target)) {
                floatingMessengers.classList.remove('active');
            }
        });
    }
});