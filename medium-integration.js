// Medium RSS Feed Integration
class MediumBlogIntegration {
    constructor() {
        this.config = window.MEDIUM_CONFIG || {
            username: 'mehmetalibeylikci',
            corsProxy: 'https://api.allorigins.win/raw?url=',
            settings: {
                blogPagePostCount: 6,
                maxDescriptionLength: 150,
                defaultImages: [
                    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
                ],
                categoryMappings: {
                    'sürdürülebilir': 'Sürdürülebilirlik',
                    'çevre': 'Çevre Koruma',
                    'enerji': 'Enerji',
                    'teknoloji': 'Teknoloji',
                    'iklim': 'İklim',
                    'atık': 'Atık Yönetimi',
                    'doğa': 'Doğa Koruma'
                }
            }
        };
        
        // Support multiple RSS URLs from config (backwards compatible)
        this.rssUrls = (this.config.rssUrls && this.config.rssUrls.length)
            ? this.config.rssUrls
            : [`https://medium.com/feed/@${this.config.username}`];
        this.blogContainer =
          document.getElementById('blog-container') ||
          document.getElementById('featured-post-container') ||
          document.getElementById('blog-grid');
        this.init();
    }

    async init() {
        try {
            console.log('MediumBlogIntegration başlatılıyor...');
            console.log('Kullanıcı(lar):', this.config.usernames || [this.config.username]);
            console.log('RSS URL(ler):', this.rssUrls);
            
            await this.loadBlogPosts();
        } catch (error) {
            console.error('Blog yüklenirken hata oluştu:', error);
            console.error('Hata detayları:', {
                message: error.message,
                stack: error.stack,
                config: this.config,
                rssUrl: this.rssUrls
            });
            this.showError();
        }
    }

    async loadBlogPosts() {
        console.log('RSS feed(ler) yükleniyor...');

        // Fetch all RSS feeds in parallel
        const fetches = this.rssUrls.map(url => fetch(`${this.config.corsProxy}${encodeURIComponent(url)}`)
            .then(resp => {
                if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText} for ${url}`);
                return resp.text();
            })
            .catch(err => {
                console.error('RSS fetch hatası for', url, err);
                return null;
            })
        );

        const xmlResults = await Promise.all(fetches);
        const parser = new DOMParser();
        let allItems = [];

        xmlResults.forEach((xmlText, idx) => {
            if (!xmlText) return;
            console.log(`RSS response alındı (${this.rssUrls[idx]}), uzunluk:`, xmlText.length);
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            const parseError = xmlDoc.querySelector('parsererror');
            if (parseError) {
                console.error('RSS parse hatası for', this.rssUrls[idx], parseError.textContent);
                return;
            }
            const items = xmlDoc.querySelectorAll('item');
            console.log('Bulunan yazı sayısı for', this.rssUrls[idx], items.length);
            allItems = allItems.concat(Array.from(items));
        });

        if (allItems.length === 0) {
            console.warn('Hiç yazı bulunamadı (tüm RSS kaynakları)');
            this.showNoPostsMessage();
            return;
        }

        // Parse, dedupe by link, sort by pubDate desc, and slice to configured count
        const parsed = allItems.map(item => this.parsePost(item)).filter(p => p !== null);

        // Deduplicate by link
        const dedupMap = new Map();
        parsed.forEach(p => {
            if (!dedupMap.has(p.link) || (dedupMap.get(p.link).pubDate < p.pubDate)) {
                dedupMap.set(p.link, p);
            }
        });

        const deduped = Array.from(dedupMap.values());

        deduped.sort((a, b) => b.pubDate - a.pubDate);

        const posts = deduped.slice(0, this.config.settings.blogPagePostCount);
        console.log('Toplanan ve sıralanan yazı sayısı:', posts.length);

        this.renderBlogPosts(posts);
    }

    parsePost(item) {
        console.log('Post parse ediliyor:', item);
        
        const titleElement = item.querySelector('title');
        const linkElement = item.querySelector('link');
        const pubDateElement = item.querySelector('pubDate');
        const descriptionElement = item.querySelector('description');
        
        // Sadece zorunlu elementleri kontrol et (description opsiyonel)
        if (!titleElement || !linkElement || !pubDateElement) {
            console.error('RSS item eksik zorunlu elementler içeriyor:', {
                title: !!titleElement,
                link: !!linkElement,
                pubDate: !!pubDateElement,
                description: !!descriptionElement
            });
            return null;
        }
        
        const title = titleElement.textContent;
        const link = linkElement.textContent;
        const pubDate = new Date(pubDateElement.textContent);
        const description = descriptionElement ? descriptionElement.textContent : '';
        
        console.log('Parse edilen veriler:', { title, link, pubDate, description: description ? description.substring(0, 50) + '...' : 'Yok' });
        
        // Description varsa HTML içeriğinden temiz metin çıkar
        let shortDescription;
        let imageUrl;

    // Helper: try various RSS image sources (clean, single-line regexes)
        const extractImageFromItem = (it) => {
            const MRSS = 'http://search.yahoo.com/mrss/';
            const CNTNS = 'http://purl.org/rss/1.0/modules/content/';

            const tn = it.getElementsByTagNameNS?.(MRSS, 'thumbnail')?.[0];
            if (tn && tn.getAttribute('url')) return tn.getAttribute('url');

            const mc = it.getElementsByTagNameNS?.(MRSS, 'content')?.[0];
            if (mc && mc.getAttribute('url')) return mc.getAttribute('url');

            const enclosure = it.querySelector('enclosure');
            if (enclosure && enclosure.getAttribute('url')) return enclosure.getAttribute('url');

            const contentEncoded =
                it.getElementsByTagNameNS?.(CNTNS, 'encoded')?.[0] ||
                it.querySelector?.('content\\:encoded');

            if (contentEncoded && contentEncoded.textContent) {
                const match = contentEncoded.textContent.match(/<img[^>]+src="([^"]+)"/i);
                if (match) return match[1];
    }

            if (description) {
                const imgMatch = description.match(/<img[^>]+src="([^"]+)"/i);
                if (imgMatch) return imgMatch[1];
    }
    return null;
};

        if (description) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = description;
            const cleanDescription = tempDiv.textContent || tempDiv.innerText || '';
            shortDescription = cleanDescription.substring(0, this.config.settings.maxDescriptionLength) + '...';

            // Try to extract post cover image but do NOT fall back to placeholders
            imageUrl = extractImageFromItem(item) || null;
        } else {
            // Description yoksa kısa açıklama oluştur; no placeholder image
            shortDescription = 'Bu yazıyı Medium\'da okuyarak detaylarına ulaşabilirsiniz.';
            imageUrl = extractImageFromItem(item) || null;
        }

       // Extract author name (namespace güvenli)
        let authorName = 'Çevre Topluluğu';
        let authorImage = null;

        const DCNS = 'http://purl.org/dc/elements/1.1/';
        let authorElement =
            item.querySelector?.('author') ||                                 // <author>
            item.getElementsByTagNameNS?.(DCNS, 'creator')?.[0] ||            // <dc:creator>
            item.querySelector?.('dc\\:creator') ||                           // fallback: escaped selector
            item.querySelector?.('creator');                                  // bazı feedlerde <creator>

        if (authorElement && authorElement.textContent) {
            authorName = authorElement.textContent.trim();
}


        // Try to find an author avatar in content or description (namespace-safe)
        const authorImageCandidates = [];
    const CNTNS = 'http://purl.org/rss/1.0/modules/content/';
        const contentEncodedEl =
        item.getElementsByTagNameNS?.(CNTNS, 'encoded')?.[0] ||
        item.querySelector?.('content\\:encoded'); // fallback

        if (contentEncodedEl && contentEncodedEl.textContent) {
        authorImageCandidates.push(contentEncodedEl.textContent);
}
        if (description) authorImageCandidates.push(description);

        
        return {
            title,
            link,
            pubDate,
            description: shortDescription,
            imageUrl,
            author: authorName,
            authorImage: authorImage,
            category: this.extractCategory(title)
        };
    }

    extractCategory(title) {
        const lowerTitle = title.toLowerCase();
        for (const [key, value] of Object.entries(this.config.settings.categoryMappings)) {
            if (lowerTitle.includes(key)) {
                return value;
            }
        }
        return 'Genel';
    }

    getDefaultImage() {
        return this.config.settings.defaultImages[Math.floor(Math.random() * this.config.settings.defaultImages.length)];
    }

    renderBlogPosts(posts) {
        console.log('Blog yazıları render ediliyor:', posts.length);
        
        // Öne çıkan yazı
        if (posts.length > 0) {
            const featuredPost = posts[0];
            console.log('Öne çıkan yazı render ediliyor:', featuredPost.title);
            this.renderFeaturedPost(featuredPost);
        }

        // Diğer yazılar
        const otherPosts = posts.slice(1);
        console.log('Diğer yazılar render ediliyor:', otherPosts.length);
        this.renderOtherPosts(otherPosts);
    }

    renderFeaturedPost(post) {
        const featuredContainer = document.getElementById('featured-post-container');
        if (!featuredContainer) {
            console.error('featured-post-container elementi bulunamadı');
            return;
        }
        
        console.log('Featured post render ediliyor:', post.title);

        featuredContainer.innerHTML = `
            <article class="featured-post">
                <div class="featured-content">
                    <div class="post-meta">
                        <span class="post-category">En Yeni</span>
                        <span class="post-date">${this.formatDate(post.pubDate)}</span>
                    </div>
                    <h2>${post.title}</h2>
                    <p>${post.description}</p>
                    <div class="post-author">
                        ${post.authorImage ? `<img src="${post.authorImage}" alt="${post.author}" class="author-avatar">` : ''}
                        <div class="author-info">
                            <span class="author-name">${post.author}</span>
                        </div>
                    </div>
                    <a href="${post.link}" target="_blank" class="btn btn-primary">Medium'da Oku</a>
                </div>
            </article>
        `;
    }

    renderOtherPosts(posts) {
        const blogGrid = document.getElementById('blog-grid');
        if (!blogGrid) {
            console.error('blog-grid elementi bulunamadı');
            return;
        }
        
        console.log('Other posts render ediliyor:', posts.length);

        blogGrid.innerHTML = posts.map(post => `
            <article class="blog-card">

                <div class="blog-content">
                    <div class="post-meta">
                        <span class="post-category">${post.category}</span>
                        <span class="post-date">${this.formatDate(post.pubDate)}</span>
                    </div>
                    <h3>${post.title}</h3>
                    <p>${post.description}</p>
                    <div class="post-author">
                        <span class="author-name">${post.author}</span>
                    </div>
                    <a href="${post.link}" target="_blank" class="read-more">Medium'da Oku →</a>
                </div>
            </article>
        `).join('');
    }

    formatDate(date) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('tr-TR', options);
    }

    showNoPostsMessage() {
        const featuredContainer = document.getElementById('featured-post-container');
        const blogGrid = document.getElementById('blog-grid');
        
        if (featuredContainer) {
            featuredContainer.innerHTML = `
                <div class="loading-message">
                    <h3>Henüz Yazı Bulunamadı</h3>
                    <p>Medium hesabınızda henüz yayınlanmış yazı bulunmuyor.</p>
                    <p>İlk yazınızı yayınladıktan sonra burada görünecektir.</p>
                    <a href="https://medium.com/@${this.config.username}" target="_blank" class="btn btn-primary">Medium Profilimi Görüntüle</a>
                </div>
            `;
        }
        
        if (blogGrid) {
            blogGrid.innerHTML = `
                <div class="loading-message">
                    <h3>Henüz Yazı Bulunamadı</h3>
                    <p>Medium hesabınızda henüz yayınlanmış yazı bulunmuyor.</p>
                </div>
            `;
        }
    }

    showError() {
        if (this.blogContainer) {
            this.blogContainer.innerHTML = `
                <div class="error-message">
                    <h3>Blog yazıları yüklenirken bir hata oluştu</h3>
                    <p>Lütfen daha sonra tekrar deneyin.</p>
                    <a href="https://medium.com/@${this.config.username}" target="_blank" class="btn btn-primary">Medium'da Görüntüle</a>
                </div>
            `;
        }
    }
}

// Sayfa yüklendiğinde uygun entegrasyonu başlat
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM yüklendi, sayfa kontrolü yapılıyor...');
  console.log('Current pathname:', window.location.pathname);

  const path = location.pathname.replace(/\/+$/, '');

  // BLOG sayfası: /blog, /blog.html veya container/grids varlığı
  const isBlogPage =
    path === '/blog' ||
    path.endsWith('/blog.html') ||
    document.getElementById('featured-post-container') ||
    document.getElementById('blog-grid') ||
    document.querySelector('[data-blog-page]');

  if (isBlogPage) {
    console.log('Blog sayfası tespit edildi, MediumBlogIntegration başlatılıyor...');
    new MediumBlogIntegration();
  }

  // ANA SAYFA: kök yol veya homepage grid
  const isHomePage =
    path === '' ||
    path === '/' ||
    document.getElementById('homepage-posts-grid');

  if (isHomePage) {
    console.log('Ana sayfa tespit edildi, HomepageBlogPreview başlatılıyor...');
    new HomepageBlogPreview();
  }
});

// Ana sayfa için blog önizlemesi
class HomepageBlogPreview {
    constructor() {
        this.config = window.MEDIUM_CONFIG || {
            username: 'mehmetalibeylikci',
            corsProxy: 'https://api.allorigins.win/raw?url=',
            settings: {
                homepagePostCount: 3,
                homepageMaxDescriptionLength: 120,
                defaultImages: [
                    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
                ]
            }
        };
        
        this.rssUrl = `https://medium.com/feed/@${this.config.username}`;
        this.init();
    }

    async init() {
        try {
            console.log('HomepageBlogPreview başlatılıyor...');
            console.log('Kullanıcı:', this.config.username);
            await this.loadLatestPosts();
        } catch (error) {
            console.error('Ana sayfa blog önizlemesi yüklenirken hata:', error);
            console.error('Hata detayları:', {
                message: error.message,
                stack: error.stack,
                config: this.config
            });
        }
    }

    async loadLatestPosts() {
        console.log('Ana sayfa RSS feed yükleniyor...');
        
        const response = await fetch(`${this.config.corsProxy}${encodeURIComponent(this.rssUrl)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const xmlText = await response.text();
        console.log('Ana sayfa RSS response alındı');
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
            throw new Error('Ana sayfa RSS feed parse hatası: ' + parseError.textContent);
        }
        
        const items = xmlDoc.querySelectorAll('item');
        console.log('Ana sayfa bulunan yazı sayısı:', items.length);
        
        if (items.length === 0) {
            console.warn('Ana sayfa RSS feed\'de hiç yazı bulunamadı');
            return;
        }
        
        const posts = Array.from(items).slice(0, this.config.settings.homepagePostCount)
            .map(item => this.parsePost(item))
            .filter(post => post !== null); // null değerleri filtrele
        
        console.log('Ana sayfa parse edilen yazı sayısı:', posts.length);
        this.renderHomepagePosts(posts);
    }

    parsePost(item) {
        const titleElement = item.querySelector('title');
        const linkElement = item.querySelector('link');
        const descriptionElement = item.querySelector('description');
        
        // Sadece zorunlu elementleri kontrol et (description opsiyonel)
        if (!titleElement || !linkElement) {
            console.error('Homepage RSS item eksik zorunlu elementler içeriyor:', {
                title: !!titleElement,
                link: !!linkElement,
                description: !!descriptionElement
            });
            return null;
        }
        
    const title = titleElement.textContent;
    const link = linkElement.textContent;
    const description = descriptionElement ? descriptionElement.textContent : '';
        
        // Description varsa HTML içeriğinden temiz metin çıkar
        let shortDescription;
        let imageUrl;
        
        // Namespace-safe image extractor (media:*, enclosure, content:encoded, or <img> in description)
const extractImageFromItem = (it) => {
  const MRSS  = 'http://search.yahoo.com/mrss/';
  const CNTNS = 'http://purl.org/rss/1.0/modules/content/';

  // <media:thumbnail> / <media:content>
  const tn = it.getElementsByTagNameNS?.(MRSS, 'thumbnail')?.[0];
  if (tn && tn.getAttribute('url')) return tn.getAttribute('url');

  const mc = it.getElementsByTagNameNS?.(MRSS, 'content')?.[0];
  if (mc && mc.getAttribute('url')) return mc.getAttribute('url');

  // <enclosure>
  const enclosure = it.querySelector?.('enclosure');
  if (enclosure && enclosure.getAttribute('url')) return enclosure.getAttribute('url');

  // <content:encoded> HTML blob
  const contentEncodedEl =
    it.getElementsByTagNameNS?.(CNTNS, 'encoded')?.[0] ||
    it.querySelector?.('content\\:encoded'); // fallback for non-NS parsers

  if (contentEncodedEl && contentEncodedEl.textContent) {
    const m = contentEncodedEl.textContent.match(/<img[^>]+(?:src|data-src|data-original|data-lazy-src)=["']([^"']+)["']/i);
    if (m) return m[1];
    const s = contentEncodedEl.textContent.match(/<img[^>]+srcset=["']([^"']+)["']/i);
    if (s) return s[1].split(',')[0].trim().split(' ')[0];
  }

  // description içindeki <img>
  if (description) {
    const m = description.match(/<img[^>]+(?:src|data-src|data-original|data-lazy-src)=["']([^"']+)["']/i);
    if (m) return m[1];
    const s = description.match(/<img[^>]+srcset=["']([^"']+)["']/i);
    if (s) return s[1].split(',')[0].trim().split(' ')[0];
  }

  return null;
};

        if (description) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = description;
            const cleanDescription = tempDiv.textContent || tempDiv.innerText || '';
            shortDescription = cleanDescription.substring(0, this.config.settings.homepageMaxDescriptionLength) + '...';
            imageUrl = extractImageFromItem(item) || this.getDefaultImage();
        } else {
            shortDescription = 'Bu yazıyı Medium\'da okuyarak detaylarına ulaşabilirsiniz.';
            imageUrl = extractImageFromItem(item) || this.getDefaultImage();
        }
        
        return {
            title,
            link,
            description: shortDescription,
            imageUrl
        };
    }

    getDefaultImage() {
        return this.config.settings.defaultImages[Math.floor(Math.random() * this.config.settings.defaultImages.length)];
    }

    renderHomepagePosts(posts) {
        const postsGrid = document.getElementById('homepage-posts-grid');
        if (!postsGrid) {
            console.error('homepage-posts-grid elementi bulunamadı');
            return;
        }
        
        console.log('Homepage posts render ediliyor:', posts.length);

        postsGrid.innerHTML = posts.map(post => `
            <article class="post-card">
                <div class="post-content">
                    <h3>${post.title}</h3>
                    <p>${post.description}</p>
                    <div class="post-author-small">
                        ${post.authorImage ? `<img src="${post.authorImage}" alt="${post.title}" class="author-avatar-small">` : ''}
                        <span class="author-name-small">${post.author || ''}</span>
                    </div>
                    <a href="${post.link}" target="_blank" class="read-more">Medium'da Oku</a>
                </div>
            </article>
        `).join('');
    }
}


// Bu kod artık yukarıda birleştirildi

