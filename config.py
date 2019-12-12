import os
import connexion
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_bcrypt import Bcrypt

# Mengambil alamat direktori aplikasi

basedir = os.path.abspath(os.path.dirname(__file__))

# Membuat instance connexion
connex_app = connexion.App(__name__, specification_dir=basedir)

# Mengambil instance App_Flask yang sedang berjalan
app = connex_app.app
app.secret_key = "kamp"
login_manager = LoginManager()
login_manager.init_app(app)

# Generate Sqlite URL for SqlAlchemy
sqlite_url = "sqlite:///" + os.path.join(basedir, "master.db")

# Konfigurasi SqlAlchemy
app.config["SQLALCHEMY_ECHO"] = False
app.config["SQLALCHEMY_DATABASE_URI"] = sqlite_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Membuat instance db SqlAlchemy
db = SQLAlchemy(app)

# Initialize Marshmallow
ma = Marshmallow(app)