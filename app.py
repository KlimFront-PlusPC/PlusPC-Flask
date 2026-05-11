from flask import Flask, render_template
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'pluspc-secret-key-2024'


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/services')
def services():
    return render_template('services.html')


@app.route('/privacy-policy')
def privacy_policy():
    return render_template('privacy_policy.html')


@app.route('/cookie-policy')
def cookie_policy():
    return render_template('cookie_policy.html')

@app.route('/health')
def health_check():
    return 'OK', 200