import sqlite3

# Connexion à la base de données (créera le fichier s'il n'existe pas)
conn = sqlite3.connect("momo.db")
cursor = conn.cursor()

# Création de la table des transactions
cursor.execute("""
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    amount INTEGER NOT NULL,
    fee INTEGER DEFAULT 0,
    date TEXT NOT NULL,
    body TEXT NOT NULL
)
""")

print("Table transactions créée avec succès !")

# Sauvegarde et fermeture de la connexion
conn.commit()
conn.close()