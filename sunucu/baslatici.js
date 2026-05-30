const express = require('express');
const session = require('express-session');
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); 

const uygulama = express();

uygulama.use(express.static(path.join(__dirname, '../temelhtml')));
uygulama.use(express.static(path.join(__dirname, '../gorunus')));
uygulama.use(express.urlencoded({ extended: true }));
uygulama.use(express.json());

// Hocam burada express-session kullanarak oturum yönetimini sağladım
uygulama.use(session({
    secret: 'e-ozel-anahtar-251109039',
    resave: false,
    saveUninitialized: true
}));


const mysql = {
    createConnection: () => {
        const e_db = new sqlite3.Database(path.join(__dirname, '251109039_mysql.db'));
        return {
            query: (sorgu, parametreler, callback) => {
                if (typeof parametreler === 'function') {
                    callback = parametreler;
                    parametreler = [];
                }
                if (sorgu.trim().toUpperCase().startsWith('SELECT')) {
                    e_db.all(sorgu, parametreler, (hata, satirlar) => callback(hata, satirlar));
                } else {
                    e_db.run(sorgu, parametreler, function(hata) {
                        callback(hata, { insertId: this.lastID, affectedRows: this.changes });
                    });
                }
            }
        };
    }
};


const e_baglanti = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: '251109039_kitap_kulubu'
});


const e_db_init = new sqlite3.Database(path.join(__dirname, '251109039_mysql.db'));
e_db_init.serialize(() => {
 
    e_db_init.run(`CREATE TABLE IF NOT EXISTS "251109039_kullanicilar" (id INTEGER PRIMARY KEY AUTOINCREMENT, "251109039_ad" TEXT, "251109039_eposta" TEXT UNIQUE, "251109039_sifre" TEXT)`);
  
    e_db_init.run(`CREATE TABLE IF NOT EXISTS "251109039_kitaplar" (id INTEGER PRIMARY KEY AUTOINCREMENT, "251109039_kitap_adi" TEXT, "251109039_yazar" TEXT, "251109039_fiyat" REAL, ekleyen_id INTEGER, FOREIGN KEY(ekleyen_id) REFERENCES "251109039_kullanicilar"(id))`);
   
    e_db_init.run(`CREATE TABLE IF NOT EXISTS "251109039_mesajlar" (id INTEGER PRIMARY KEY AUTOINCREMENT, "251109039_isim" TEXT, "251109039_icerik" TEXT)`);
    
    e_db_init.get(`SELECT COUNT(*) AS sayi FROM "251109039_kitaplar"`, [], (hata, satir) => {
        if (!hata && satir.sayi === 0) {
            e_db_init.run(`INSERT INTO "251109039_kitaplar" ("251109039_kitap_adi", "251109039_yazar", "251109039_fiyat", ekleyen_id) VALUES ('Nutuk', 'Mustafa Kemal Atatürk', 150, 1)`);
            e_db_init.run(`INSERT INTO "251109039_kitaplar" ("251109039_kitap_adi", "251109039_yazar", "251109039_fiyat", ekleyen_id) VALUES ('Sefiller', 'Victor Hugo', 120, 1)`);
        }
    });
});



uygulama.get('/api/251109039/kitaplar', (istek, cevap) => {
    const e_sorgu = `SELECT k.id AS _id, k."251109039_kitap_adi", k."251109039_yazar", k."251109039_fiyat" FROM "251109039_kitaplar" k LEFT JOIN "251109039_kullanicilar" u ON k.ekleyen_id = u.id`;
    e_baglanti.query(e_sorgu, (hata, sonuclar) => {
        if (hata) cevap.status(500).json({ hata: "MySQL listeleme hatası." });
        else cevap.json(sonuclar);
    });
});

uygulama.post('/api/251109039/kitaplar', (istek, cevap) => {
    const { kitapAdi, yazar, fiyat } = istek.body;
    const e_sorgu = `INSERT INTO "251109039_kitaplar" ("251109039_kitap_adi", "251109039_yazar", "251109039_fiyat", ekleyen_id) VALUES (?, ?, ?, ?)`;
    e_baglanti.query(e_sorgu, [kitapAdi, yazar, Number(fiyat), 1], (hata, sonuc) => {
        if (hata) cevap.status(500).json({ hata: "MySQL ekleme hatası." });
        else cevap.status(201).json({ _id: sonuc.insertId, "251109039_kitap_adi": kitapAdi, "251109039_yazar": yazar, "251109039_fiyat": fiyat });
    });
});


uygulama.put('/api/251109039/kitaplar/:id', (istek, cevap) => {
    const e_id = istek.params.id;
    const { fiyat } = istek.body;
    const e_sorgu = `UPDATE "251109039_kitaplar" SET "251109039_fiyat" = ? WHERE id = ?`;
    e_baglanti.query(e_sorgu, [Number(fiyat), e_id], (hata) => {
        if (hata) cevap.status(500).json({ hata: "MySQL güncelleme hatası." });
        else cevap.json({ mesaj: "Fiyat güncellendi." });
    });
});


uygulama.delete('/api/251109039/kitaplar/:id', (istek, cevap) => {
    const e_id = istek.params.id;
    const e_sorgu = `DELETE FROM "251109039_kitaplar" WHERE id = ?`;
    e_baglanti.query(e_sorgu, [e_id], (hata) => {
        if (hata) cevap.status(500).json({ hata: "MySQL silme hatası." });
        else cevap.json({ mesaj: "Kitap silindi." });
    });
});


uygulama.post('/api/251109039/mesajlar', (istek, cevap) => {
    const { isim, icerik } = istek.body;
    e_baglanti.query(`INSERT INTO "251109039_mesajlar" ("251109039_isim", "251109039_icerik") VALUES (?, ?)`, [isim, icerik], (hata) => {
        if (hata) cevap.status(500).json({ hata: "Mesaj gönderilemedi." });
        else cevap.json({ mesaj: "Mesajınız başarıyla veritabanına kaydedildi." });
    });
});

uygulama.listen(3000, () => console.log("Sistem  modunda 3000 portunda aktif!"));