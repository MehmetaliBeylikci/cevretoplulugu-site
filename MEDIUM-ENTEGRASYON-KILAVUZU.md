# Medium Blog Entegrasyonu - Kullanım Kılavuzu

Bu sistem, Medium hesabınızdaki yazıları otomatik olarak web sitenize çeker ve blog sayfalarında gösterir.

## 🚀 Kurulum

### 1. Medium Kullanıcı Adınızı Ayarlayın

`medium-config.js` dosyasını açın ve `username` değerini Medium kullanıcı adınızla değiştirin:

```javascript
const MEDIUM_CONFIG = {
    // Medium kullanıcı adınızı buraya yazın
    username: 'mehmetalibeylikci',
    // ... diğer ayarlar
};
```

### 2. Dosya Yapısı

Aşağıdaki dosyaların projenizde bulunduğundan emin olun:

```
├── medium-config.js          # Konfigürasyon dosyası
├── medium-integration.js     # Ana entegrasyon script'i
├── blog.html                 # Blog sayfası
├── index.html               # Ana sayfa
├── blog.css                 # Blog sayfası stilleri
└── styles.css               # Ana stiller
```

### 3. HTML Sayfalarına Script Ekleme

Blog sayfası (`blog.html`) ve ana sayfa (`index.html`) dosyalarında script'lerin doğru sırayla yüklendiğinden emin olun:

```html
<script src="medium-config.js"></script>
<script src="script.js"></script>
<script src="medium-integration.js"></script>
```

## ⚙️ Konfigürasyon Seçenekleri

`medium-config.js` dosyasında aşağıdaki ayarları özelleştirebilirsiniz:

### Temel Ayarlar
- `username`: Medium kullanıcı adınız
- `corsProxy`: CORS proxy servisi (gerekirse değiştirin)

### Blog Ayarları
- `homepagePostCount`: Ana sayfada gösterilecek yazı sayısı (varsayılan: 3)
- `blogPagePostCount`: Blog sayfasında gösterilecek yazı sayısı (varsayılan: 6)
- `maxDescriptionLength`: Yazı açıklaması maksimum karakter sayısı (varsayılan: 150)
- `homepageMaxDescriptionLength`: Ana sayfa yazı açıklaması maksimum karakter sayısı (varsayılan: 120)

### Görsel Ayarları
- `defaultImages`: Yazıda görsel yoksa kullanılacak varsayılan görseller
- `categoryMappings`: Yazı başlığından otomatik kategori çıkarma kuralları

## 📝 Kullanım

### Medium'da Yazı Yazma

1. Medium hesabınıza giriş yapın
2. Yeni bir yazı oluşturun
3. Yazınızı yayınlayın
4. Yazı otomatik olarak web sitenizde görünecek

### Yazı Özellikleri

- **Başlık**: Yazı başlığı otomatik olarak çekilir
- **Açıklama**: İlk paragraf otomatik olarak açıklama olarak kullanılır
- **Görsel**: Yazıdaki ilk görsel otomatik olarak çekilir
- **Kategori**: Yazı başlığından otomatik kategori çıkarılır
- **Tarih**: Yayın tarihi otomatik olarak çekilir

### Kategori Sistemi

Yazı başlığında geçen kelimelere göre otomatik kategori atanır:

- "sürdürülebilir" → Sürdürülebilirlik
- "çevre" → Çevre Koruma
- "enerji" → Enerji
- "teknoloji" → Teknoloji
- "iklim" → İklim
- "atık" → Atık Yönetimi
- "doğa" → Doğa Koruma

## 🔧 Sorun Giderme

### Yazılar Görünmüyor

1. Medium kullanıcı adınızın doğru olduğundan emin olun
2. Tarayıcı konsolunda hata mesajlarını kontrol edin
3. CORS proxy servisinin çalıştığından emin olun

### Görseller Yüklenmiyor

1. Medium yazılarınızda görsel bulunduğundan emin olun
2. Varsayılan görsellerin URL'lerinin doğru olduğundan emin olun

### Kategoriler Yanlış

`medium-config.js` dosyasındaki `categoryMappings` bölümünü düzenleyin.

## 📱 Responsive Tasarım

Sistem otomatik olarak mobil cihazlarda uyumlu çalışır:
- Ana sayfa: 3 yazı tek sütun
- Blog sayfası: Magazine-style grid
- Mobilde hamburger menü

## 🎨 Özelleştirme

### Stil Değişiklikleri

Blog sayfası stilleri için `blog.css` dosyasını düzenleyin:
- Kart boyutları
- Renkler
- Fontlar
- Spacing

### Layout Değişiklikleri

`medium-integration.js` dosyasındaki `renderBlogPosts` ve `renderHomepagePosts` metodlarını düzenleyin.

## 🔄 Güncelleme

Sistem otomatik olarak Medium RSS feed'ini kontrol eder ve yeni yazıları çeker. Manuel yenileme gerekmez.

## 📞 Destek

Sorunlarınız için:
1. Tarayıcı konsolundaki hata mesajlarını kontrol edin
2. Medium hesabınızın RSS feed'inin çalıştığını kontrol edin
3. CORS proxy servisinin erişilebilir olduğunu kontrol edin

---

**Not**: Bu sistem Medium'un RSS feed'ini kullanır. Medium hesabınızın RSS feed'i etkin olmalıdır.
