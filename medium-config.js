// Medium Blog Configuration
// Bu dosyayı düzenleyerek Medium hesabınızı yapılandırın

const MEDIUM_CONFIG = {
    // Tek bir hesap kullanıyorsanız `username` alanını kullanabilirsiniz.
    // Birden fazla hesap eklemek isterseniz `usernames` dizisini kullanın.
    // Örnek: usernames: ['user1', 'user2']
    username: 'mehmetalibeylikci',
    usernames: ['mehmetalibeylikci'],

    // RSS feed URL'leri otomatik oluşturulur. `rssUrls` her iki konfigürasyon
    // şeklini (tekli veya çoklu) destekleyecek şekilde döner.
    get rssUrls() {
        const list = Array.isArray(this.usernames) && this.usernames.length
            ? this.usernames
            : (this.username ? [this.username] : []);
        return list.map(u => `https://medium.com/feed/@${u}`);
    },

    // Geriye dönük uyumluluk için tekil rssUrl getter'ı (ilk hesap)
    get rssUrl() {
        return this.rssUrls.length ? this.rssUrls[0] : '';
    },
    
    // CORS proxy servisi (gerekirse değiştirebilirsiniz)
    corsProxy: 'https://api.allorigins.win/raw?url=',
    
    // Blog ayarları
    settings: {
        // Ana sayfada gösterilecek yazı sayısı
        homepagePostCount: 3,
        
        // Blog sayfasında gösterilecek yazı sayısı
        blogPagePostCount: 6,
        
        // Yazı açıklaması maksimum karakter sayısı
        maxDescriptionLength: 150,
        
        // Ana sayfa yazı açıklaması maksimum karakter sayısı
        homepageMaxDescriptionLength: 120,
        
        // Varsayılan görseller (yazıda görsel yoksa kullanılır)
        defaultImages: [
            'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            'https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            'https://images.unsplash.com/photo-1581578731548-c6a0c3f2f2c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            'https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
        ],
        
        // Kategori eşleştirmeleri (yazı başlığından otomatik çıkarılır)
        categoryMappings: {
            'sürdürülebilir': 'Sürdürülebilirlik',
            'çevre': 'Çevre Koruma',
            'enerji': 'Enerji',
            'teknoloji': 'Teknoloji',
            'iklim': 'İklim',
            'atık': 'Atık Yönetimi',
            'doğa': 'Doğa Koruma',
            'tarım': 'Tarım',
            'su': 'Su Koruma',
            'plastik': 'Kirlilik'
        }
    }
};

// Konfigürasyonu global olarak kullanılabilir yap
window.MEDIUM_CONFIG = MEDIUM_CONFIG;
