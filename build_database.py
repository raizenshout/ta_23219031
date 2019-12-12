import os
from datetime import datetime
from config import db
from models import Resep, Bahan

# Data to initialize database with
RESEP = [
    {
        "nama_resep": "Gulai sapi lemak",
        "penulis": "Wina",
        "tags": "Masakan Hari Raya",
        "bahan": [
            ("Daging sapi khas dalam", "500", "gram", "2019-01-06 22:17:54"),
            ("Kelapa muda", "0.25", "butir", "2019-01-06 22:17:54"),
            ("Kecap Bango", "2", "sdm", "2019-01-06 22:17:54"),
            ("Gula merah", "1.5", "sdt", "2019-01-06 22:17:54"),
            ("Minyak sayur", "3", "sdm", "2019-01-06 22:17:54"),
            ("Santan", "750", "ml", "2019-01-06 22:17:54"),
            ("Garam", "2", "sdt", "2019-01-06 22:17:54"),
        ],
    },
    {
        "nama_resep": "Martabak telur",
        "penulis": "Wina",
        "tags": "Sarapan",
        "bahan": [
            ("Kulit Lumpia", "3", "lembar", "2019-01-06 22:17:54"),
            ("Minyak", "1", "ml", "2019-01-06 22:17:54"),
            ("Daging sapi cincang", "200", "gram", "2019-01-06 22:17:54"),
            ("Daun jeruk", "3", "lembar", "2019-01-06 22:17:54"),
            ("Serai", "1", "batang", "2019-01-06 22:17:54"),
            ("Royco kaldu sapi", "1", "sdt", "2019-01-06 22:17:54"),
            ("Bawang daun", "2", "batang", "2019-01-06 22:17:54"),
        ],
    },
    {
        "nama_resep": "Sup krim jagung",
        "penulis": "Maddie",
        "tags": "Sarapan",
        "bahan": [
            ("Jagung manis", "1", "kaleng", "2019-01-06 22:17:54"),
            ("Wortel", "1", "buah", "2019-01-06 22:17:54"),
            ("Air", "2", "liter", "2019-01-06 22:17:54"),
            ("Telur ukuran sedang", "2", "butir", "2019-01-06 22:17:54"),
            ("Royco sup krim jagung", "1", "bungkus", "2019-01-06 22:17:54"),
            ("Daun bawang", "2", "batang", "2019-01-06 22:17:54"),
            ("Jagung manis cream", "1", "kaleng", "2019-01-06 22:17:54"),
        ],
    },

]

# Delete database file if it exists currently
if os.path.exists("master.db"):
    os.remove("master.db")

# Create the database
db.create_all()

# iterate over the RESEP structure and populate the database
for resep in RESEP:
    p = Resep(nama_resep=resep.get("nama_resep"), penulis=resep.get("penulis"), tags=resep.get("tags"))

    # Add the notes for the person
    for bahan in resep.get("bahan"):
        nama_bahan, kuantitas, satuan, timestamp = bahan
        p.bahan.append(
            Bahan(
                nama_bahan=nama_bahan,
                kuantitas=kuantitas,
                satuan=satuan,
                timestamp=datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S"),
            )
        )
    db.session.add(p)

db.session.commit()