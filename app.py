from flask import Flask, render_template, request, jsonify
import json
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'pluspc-secret-key-2024'

# Папки для хранения
REVIEWS_FOLDER = os.path.join(app.root_path, 'reviews')

os.makedirs(REVIEWS_FOLDER, exist_ok=True)

REVIEWS_FILE = os.path.join(REVIEWS_FOLDER, 'reviews.json')


# ===== ФУНКЦИИ ДЛЯ ОТЗЫВОВ =====
def load_reviews():
    """Загрузить отзывы из файла"""
    if os.path.exists(REVIEWS_FILE):
        try:
            with open(REVIEWS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return []
    return []


def save_reviews(reviews):
    """Сохранить отзывы в файл"""
    with open(REVIEWS_FILE, 'w', encoding='utf-8') as f:
        json.dump(reviews, f, ensure_ascii=False, indent=2)


def init_reviews():
    """Инициализация тестовых отзывов при первом запуске"""
    reviews = load_reviews()
    if not reviews:
        sample_reviews = []
        save_reviews(sample_reviews)
        print("✅ Инициализированы тестовые отзывы")


# ===== МАРШРУТЫ =====
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/services')
def services():
    return render_template('services.html')


@app.route('/privacy-policy')
def privacy_policy():
    """Страница политики обработки персональных данных"""
    return render_template('privacy_policy.html')


@app.route('/cookie-policy')
def cookie_policy():
    """Страница политики использования файлов cookie"""
    return render_template('cookie_policy.html')


# ===== МАРШРУТЫ ДЛЯ ОТЗЫВОВ =====
@app.route('/reviews')
def reviews():
    return render_template('reviews.html')


@app.route('/reviews-page')
def reviews_page():
    """Страница с опубликованными отзывами"""
    reviews = load_reviews()
    published = [r for r in reviews if r.get('status') == 'published']
    published.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return render_template('reviews_display.html', reviews=published)


@app.route('/admin/reviews')
def admin_reviews():
    """Страница админ-панели отзывов"""
    reviews = load_reviews()

    # Защита: добавляем поле rating, если его нет
    for review in reviews:
        if 'rating' not in review:
            review['rating'] = 5
        if 'service' not in review:
            review['service'] = 'Не указана'
        if 'text' not in review:
            review['text'] = ''
        if 'admin_comment' not in review:
            review['admin_comment'] = ''
        if 'status' not in review:
            review['status'] = 'pending'
        if 'created_at' not in review:
            review['created_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    reviews.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return render_template('admin_reviews.html', reviews=reviews)


@app.route('/api/reviews', methods=['GET'])
def get_reviews():
    """Получить все отзывы (для API)"""
    reviews = load_reviews()
    return jsonify(reviews)


@app.route('/api/reviews', methods=['POST'])
def add_review():
    """Добавить новый отзыв (от пользователя)"""
    try:
        data = request.get_json()

        name = data.get('name', '').strip()
        service = data.get('service', '').strip()
        rating = data.get('rating', 0)
        text = data.get('text', '').strip()

        if not name or not service or not rating or not text:
            return jsonify({'success': False, 'message': 'Заполните все поля'}), 400

        if rating < 1 or rating > 5:
            return jsonify({'success': False, 'message': 'Рейтинг должен быть от 1 до 5'}), 400

        reviews = load_reviews()
        new_id = max([r.get('id', 0) for r in reviews], default=0) + 1

        new_review = {
            'id': new_id,
            'name': name,
            'service': service,
            'rating': rating,
            'text': text,
            'admin_comment': '',
            'status': 'pending',
            'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'ip_address': request.remote_addr
        }

        reviews.append(new_review)
        save_reviews(reviews)

        return jsonify({'success': True, 'message': 'Отзыв отправлен на модерацию', 'id': new_review['id']})

    except Exception as e:
        print(f"❌ Ошибка при добавлении отзыва: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/reviews/<int:review_id>/publish', methods=['POST'])
def publish_review(review_id):
    """Опубликовать отзыв (админ)"""
    try:
        reviews = load_reviews()
        for review in reviews:
            if review.get('id') == review_id:
                review['status'] = 'published'
                save_reviews(reviews)
                return jsonify({'success': True})
        return jsonify({'success': False, 'message': 'Отзыв не найден'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/reviews/<int:review_id>/reject', methods=['POST'])
def reject_review(review_id):
    """Отклонить отзыв (админ)"""
    try:
        reviews = load_reviews()
        for review in reviews:
            if review.get('id') == review_id:
                review['status'] = 'rejected'
                save_reviews(reviews)
                return jsonify({'success': True})
        return jsonify({'success': False, 'message': 'Отзыв не найден'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/reviews/<int:review_id>/delete', methods=['DELETE'])
def delete_review(review_id):
    """Удалить отзыв (админ)"""
    try:
        reviews = load_reviews()
        reviews = [r for r in reviews if r.get('id') != review_id]
        save_reviews(reviews)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/reviews/<int:review_id>', methods=['PUT'])
def update_review(review_id):
    """Редактировать отзыв (админ)"""
    try:
        data = request.get_json()
        reviews = load_reviews()

        for review in reviews:
            if review.get('id') == review_id:
                if 'name' in data:
                    review['name'] = data['name']
                if 'service' in data:
                    review['service'] = data['service']
                if 'rating' in data:
                    review['rating'] = data['rating']
                if 'text' in data:
                    review['text'] = data['text']
                if 'admin_comment' in data:
                    review['admin_comment'] = data['admin_comment']

                save_reviews(reviews)
                return jsonify({'success': True})

        return jsonify({'success': False, 'message': 'Отзыв не найден'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ===== ЗАПУСК =====
if __name__ == '__main__':
    # Инициализируем тестовые отзывы (один раз!)
    init_reviews()

    print("=" * 50)
    print("🚀 PlusPC сервер запущен!")
    print("📍 http://localhost:5000 - Главная страница")
    print("📍 http://localhost:5000/admin/reviews - Управление отзывами")
    print("📍 http://localhost:5000/reviews-page - Страница отзывов")
    print("📍 http://localhost:5000/privacy-policy - Политика конфиденциальности")
    print("📍 http://localhost:5000/cookie-policy - Политика cookie")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)