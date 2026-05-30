
document.addEventListener("DOMContentLoaded", () => {
    kitaplariListele();
    adminKitaplariniListele();
});


async function kitaplariListele() {
    const e_tablo = document.getElementById("e-genel-kitap-listesi");
    if (!e_tablo) return;
    
    const e_cevap = await fetch('/api/251109039/kitaplar');
    const e_kitaplar = await e_cevap.json();
    
    e_tablo.innerHTML = "";
    e_kitaplar.forEach(e_kitap => {
        e_tablo.innerHTML += `
            <tr>
                <td>${e_kitap["251109039_kitap_adi"]}</td>
                <td>${e_kitap["251109039_yazar"]}</td>
                <td>${e_kitap["251109039_fiyat"]} TL</td>
            </tr>
        `;
    });
}


async function adminKitaplariniListele() {
    const e_tablo = document.getElementById("e-admin-kitap-listesi");
    if (!e_tablo) return;
    
    const e_cevap = await fetch('/api/251109039/kitaplar');
    const e_kitaplar = await e_cevap.json();
    
    e_tablo.innerHTML = "";
    e_kitaplar.forEach(e_kitap => {
        e_tablo.innerHTML += `
            <tr>
                <td>${e_kitap["251109039_kitap_adi"]}</td>
                <td>${e_kitap["251109039_yazar"]}</td>
                <td>${e_kitap["251109039_fiyat"]} TL</td>
                <td>
                    <button onclick="kitapSil(${e_kitap._id})" style="background-color:red; color:white; border:none; padding:5px; cursor:pointer;">Sil</button>
                    <button onclick="kitapFiyatGuncelle(${e_kitap._id})" style="background-color:orange; color:white; border:none; padding:5px; cursor:pointer; margin-left:5px;">Fiyat Güncelle</button>
                </td>
            </tr>
        `;
    });
}


document.getElementById('e-kitap-ekle-formu')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const e_veri = {
        kitapAdi: document.getElementById('e-kitap-adi').value,
        yazar: document.getElementById('e-yazar-adi').value,
        fiyat: document.getElementById('e-kitap-fiyat').value
    };

    const e_sonuc = await fetch('/api/251109039/kitaplar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(e_veri)
    });

    if (e_sonuc.ok) {
        alert("Kitap başarıyla eklendi.");
        document.getElementById('e-kitap-ekle-formu').reset();
        adminKitaplariniListele();
    }
});


async function kitapSil(e_id) {
    if (!confirm("Bu veriyi silmek istediğinize emin misiniz?")) return;
    const e_sonuc = await fetch(`/api/251109039/kitaplar/${e_id}`, { method: 'DELETE' });
    if (e_sonuc.ok) {
        alert("Kitap silindi.");
        adminKitaplariniListele();
    }
}


async function kitapFiyatGuncelle(e_id) {
    const e_yeni_fiyat = prompt("Yeni fiyatı giriniz:");
    if (!e_yeni_fiyat) return;

    const e_sonuc = await fetch(`/api/251109039/kitaplar/${e_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fiyat: e_yeni_fiyat })
    });

    if (e_sonuc.ok) {
        alert("Fiyat başarıyla güncellendi.");
        adminKitaplariniListele();
    }
}

// İletişim formu gönderimi
document.getElementById('e-iletisim-formu')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const e_veri = {
        isim: document.getElementById('e-form-isim').value,
        icerik: document.getElementById('e-form-mesaj').value
    };

    const e_sonuc = await fetch('/api/251109039/mesajlar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(e_veri)
    });

    if (e_sonuc.ok) {
        alert("Mesajınız iletildi.");
        document.getElementById('e-iletisim-formu').reset();
    }
});