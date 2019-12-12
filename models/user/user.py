from dataclasses import dataclass

from flask_login import UserMixin

from config import db


@dataclass
class User(db.Model, UserMixin):
    __tablename__ = "users"
    user_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(32))
    password = db.Column(db.String(32))

    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"
