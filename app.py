# 3rd party modules
import bcrypt
from flask import render_template, request, session, url_for, redirect, flash
# local modules
from flask_bcrypt import Bcrypt
from flask_login import current_user, LoginManager

import config

# Menghubungkan config ke connex_app
from forms import RegistrationForm
from models.user.user import User
import models.user.errors as UserErrors

connex_app = config.connex_app

# Membaca swagger.yml file untuk konfigurasi endpoint
connex_app.add_api("swagger.yml")


# URL route untuk "/"
@connex_app.route("/login", methods=['GET', 'POST'])
def login():
    return render_template('login.html')


# URL route untuk "/"
@connex_app.route("/")
@connex_app.route("/home")
def home():
    """
    Jika akses di browser pada alamat
    localhost:5000/
    akan
    :return:        the rendered template "home.html"
    """
    return render_template("home.html")


# Create a URL route in our application for "/resep"
@connex_app.route("/resep")
@connex_app.route("/resep/<int:resep_id>")
def resep(resep_id=""):
    """
    This function just responds to the browser URL
    localhost:5000/resep
    :return:        the rendered template "resep.html"
    """
    return render_template("resep.html", resep_id=resep_id)


# Create a URL route to the notes page
@connex_app.route("/resep/<int:resep_id>")
@connex_app.route("/resep/<int:resep_id>/bahan")
@connex_app.route("/resep/<int:resep_id>/bahan/<int:bahan_id>")
def bahan(resep_id, bahan_id=""):
    """
    This function responds to the browser URL
    localhost:5000/bahan/<resep_id>
    :param bahan_id:
    :param resep_id:   Id of the resep to show bahan for
    :return:            the rendered template "bahan.html"
    """
    return render_template("bahan.html", resep_id=resep_id, bahan_id=bahan_id)


@connex_app.route("/register", methods=['GET', 'POST'])
def register_user():
    bcrypt = Bcrypt()
    login_manager = LoginManager()
    login_manager.login_view = 'users.login'
    login_manager.login_message_category = 'info'

    if current_user.is_authenticated:
        return redirect(url_for('home'))
    form = RegistrationForm()
    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        user = User(username=form.username.data, email=form.email.data, password=hashed_password)
        config.db.session.add(user)
        config.db.session.commit()
        flash('Your account has been created! You are now able to log in', 'success')
        return redirect(url_for('users.login'))
    return render_template('users/register.html', title='Register', form=form)


if __name__ == "__main__":
    connex_app.run(debug=True)
