from datetime import datetime

from marshmallow import fields

from config import db, ma


class Resep(db.Model):
    __tablename__ = "resep"
    resep_id = db.Column(db.Integer, primary_key=True)
    nama_resep = db.Column(db.String(32))
    penulis = db.Column(db.String(32))
    tags = db.Column(db.String(32))
    timestamp = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    bahan = db.relationship(
        "Bahan",
        backref="resep",
        cascade="all, delete, delete-orphan",
        single_parent=True,
        order_by="desc(Bahan.timestamp)",
    )


class Bahan(db.Model):
    __tablename__ = "bahan"
    bahan_id = db.Column(db.Integer, primary_key=True)
    resep_id = db.Column(db.Integer, db.ForeignKey("resep.resep_id"))
    nama_bahan = db.Column(db.String(32))
    kuantitas = db.Column(db.Integer)
    satuan = db.Column(db.String(32))
    timestamp = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class ResepSchema(ma.ModelSchema):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    class Meta:
        model = Resep
        sqla_session = db.session

    bahan = fields.Nested("ResepBahanSchema", default=[], many=True)


class ResepBahanSchema(ma.ModelSchema):
    """
    This class exists to get around a recursion issue
    """

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    bahan_id = fields.Int()
    resep_id = fields.Int()
    nama_bahan = fields.Str()
    kuantitas = fields.Int()
    satuan = fields.Str()
    timestamp = fields.Str()


class BahanSchema(ma.ModelSchema):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    class Meta:
        model = Bahan
        sqla_session = db.session

    resep = fields.Nested("BahanResepSchema", default=None)


class BahanResepSchema(ma.ModelSchema):
    """
    This class exists to get around a recursion issue
    """

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    resep_id = fields.Int()
    nama_resep = fields.Str()
    penulis = fields.Str()
    tags = fields.Str()
    timestamp = fields.Str()
