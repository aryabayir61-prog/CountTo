import { ThemeId } from '../types/countdown';

export interface CollectionArticle {
  id: string;
  title: string;
  subtitle: string;
  category: 'Gece & Lo-Fi' | 'Odaklanma & Ders' | 'Yaşam & Tatil' | 'Minimalizm' | 'Motivasyon';
  readingTime: string;
  themeId: ThemeId;
  accentColor: string;
  date: string;
  coverStyle: {
    bgGradient: string;
    glowColor: string;
    accentHex: string;
    secondaryHex: string;
    illustrationType: 'tokyo' | 'matcha' | 'oasis' | 'minimal' | 'rain' | 'aurora';
  };
  summary: string;
  content: {
    lead: string;
    paragraphs: string[];
    quote?: string;
    proTips: string[];
  };
  recommendedSongSearch?: string;
}

export const COLLECTION_ARTICLES: CollectionArticle[] = [
  {
    id: 'tokyo-gece-ritueli',
    title: "Geceleri CountTo'yu Yine Harika Yapın",
    subtitle: "Gece kuşları için Tokyo Gece teması, lo-fi beat'leri ve derin odaklanma rehberi",
    category: 'Gece & Lo-Fi',
    readingTime: '3 dk okuma',
    themeId: 'tokyo',
    accentColor: '#f43f5e',
    date: 'Ekim 2026',
    coverStyle: {
      bgGradient: 'radial-gradient(ellipse at 70% 30%, rgba(244, 63, 94, 0.28) 0%, rgba(6, 182, 212, 0.2) 45%, rgba(10, 8, 22, 0.98) 80%)',
      glowColor: 'rgba(244, 63, 94, 0.4)',
      accentHex: '#f43f5e',
      secondaryHex: '#06b6d4',
      illustrationType: 'tokyo',
    },
    summary: 'Odanın ışıklarını kapatıp neon pembe ve cam göbeği ışıltılarını açtığınızda ortam bir anda değişiyor. Lo-fi eşliğinde gece saatlerini saf bir akışa dönüştürün.',
    content: {
      lead: 'Selamlar! CountTo sabahları olduğu gibi geceleri de mükemmel hissiyat verir. Peki ama nasıl?',
      paragraphs: [
        'İşte bunu en iyi anlatan tema kesinlikle "Tokyo Gece". Odanın tepe ışıklarını söndürüp sadece küçük bir masa lambasını açık bıraktığınızda, ekrandaki neon fuşya ve Shibuya cam göbeği tonları tüm odaya sinematik bir hava katıyor.',
        'Bu anı daha da güzelleştirmek için alt araç çubuğundaki Müzik simgesine dokunun. Sakin bir Lo-Fi şarkısı seçtiğinizde, klavyenizin mekanik tıkırtıları ve yumuşak synth baslar birbiriyle bütünleşiyor. Gece saatleri artık bir yorgunluk değil, saf ve kesintisiz bir üretim ritüeline dönüşüyor.',
        'Özellikle gece 01:00 sonrası kod yazarken, tasarım yaparken veya sessizce kitap okurken "Şu Anki Saat" moduna alıp tam ekran yapmayı mutlaka deneyin. Ekranınız estetik bir gece saatine dönüşecek.',
      ],
      quote: '"Gece sessizliği, doğru renkler ve hafif bir melodiyle birleştiğinde en verimli çalışma arkadaşınız olur."',
      proTips: [
        'Kısayol Tuşu: "F" tuşuna basarak CountTo\'yu tam ekrana alın.',
        'Müzik önerisi: Müzik kutusundan "Birds of a Feather" veya lo-fi bir parça başlatın.',
        'Işıkları kısın ve monitörün kontrastıyla odanızı Tokyo neonlarıyla aydınlatın.',
      ],
    },
    recommendedSongSearch: 'Lo-Fi Chill Beats',
  },
  {
    id: 'okul-denemesinde-odaklanin',
    title: 'Okul Denemelerinde CountTo ile Odaklanın',
    subtitle: 'Sınav provası yaparken zihni yatıştıran Kyoto Matcha ve Pomodoro akışı',
    category: 'Odaklanma & Ders',
    readingTime: '4 dk okuma',
    themeId: 'matcha',
    accentColor: '#4ade80',
    date: 'Ekim 2026',
    coverStyle: {
      bgGradient: 'radial-gradient(ellipse at 30% 20%, rgba(74, 222, 128, 0.25) 0%, rgba(21, 128, 61, 0.22) 50%, rgba(8, 20, 12, 0.98) 85%)',
      glowColor: 'rgba(74, 222, 128, 0.35)',
      accentHex: '#4ade80',
      secondaryHex: '#15803d',
      illustrationType: 'matcha',
    },
    summary: 'Sınav kaygısını azaltan yeşil çay dinginliği ve 40 dakikalık geri sayım bloklarıyla maksimum dikkat toplama rehberi.',
    content: {
      lead: 'Önemli bir deneme sınavına ya da vize/final maratonuna hazırlanırken en büyük düşmanınız zamanın kendisi değil, saate bakarken hissettiğiniz paniktir.',
      paragraphs: [
        'Kırmızı veya sert renkler insan psikolojisinde alarm hissi uyandırır. Oysa "Kyoto Yeşili (Matcha)" teması, doğanın en dengeli klorofil ve adaçayı yeşili tonlarını bir araya getirerek kalp ritminizi sakinleştirir.',
        'Deneme çözerken yeni bir etkinlik oluşturup tam sınav sürenize (örneğin 135 dakika veya 40 dakikalık etüt süresi) ayarlayın. Ekranı hafif yan açıyla masanızın kenarına koyun. Her baktığınızda gözünüzü yormayan yumuşak yeşil sayılar, zamanın aleyhinize değil lehinize aktığını hissettirir.',
        'Etüt aralarında ise 10 dakikalık bir geri sayım başlatıp derin nefes alın. Doğru renk paletiyle çalışılan 40 dakika, dağınık geçirilen 2 saatten çok daha kalıcı bilgi üretir.',
      ],
      quote: '"Zamanla yarışmayı bıraktığınızda, zaman sizin tarafınıza geçer."',
      proTips: [
        'Yeni bir geri sayım ekleyin: Başlığı "Deneme Sınavı", süreyi 80 veya 135 dakika olarak girin.',
        'Temayı "Kyoto Yeşili (Matcha)" olarak seçin.',
        'Telefonu başka odaya koyun ve sadece CountTo sayacının sakin ritmine odaklanın.',
      ],
    },
    recommendedSongSearch: 'Antidepresan Mert Demir',
  },
  {
    id: 'buyuk-tatil-ve-seyahat',
    title: 'Büyük Tatile Geri Sayım: Çöl Vahası & Bavul Heyecanı',
    subtitle: 'Aylar süren bekleyişi keyifli bir seyahat günlüğüne dönüştürün',
    category: 'Yaşam & Tatil',
    readingTime: '3 dk okuma',
    themeId: 'oasis',
    accentColor: '#38bdf8',
    date: 'Ekim 2026',
    coverStyle: {
      bgGradient: 'radial-gradient(ellipse at 60% 40%, rgba(56, 189, 248, 0.28) 0%, rgba(245, 158, 11, 0.22) 55%, rgba(10, 20, 30, 0.98) 85%)',
      glowColor: 'rgba(56, 189, 248, 0.35)',
      accentHex: '#38bdf8',
      secondaryHex: '#f59e0b',
      illustrationType: 'oasis',
    },
    summary: 'Uçak biletinin alındığı andan havaalanı kapısına kadar geçen günleri izlemek seyahatin ilk ve en heyecanlı adımıdır.',
    content: {
      lead: 'Bir tatile çıkmanın en güzel yanı sadece orada olmak değil; o güne kadar geçen günleri adım adım beklemektir.',
      paragraphs: [
        '"Çöl Vahası (Mirage Oasis)" teması, altın sarısı kum tepeleri ile kristal turkuaz kaynak sularının zıtlığını taşır. Masanızda çalışırken köşede duran sayacın her saniyesi, yaklaşan güneşli kıyıları ve sıcak rüzgarları müjdeler.',
        'Geri sayımınıza özel bir not ekleyin: "Pasaportu kontrol et, güneş kremini unutma!". Her baktığınızda çalışma masanızın havası bir parça hafifleyecek.',
        'Haftalar ilerledikçe gün sayısının iki haneliden tek haneliye düşüşünü izlemek, gündelik işlerin ağırlığını azaltan en tatlı motivasyon kaynağıdır.',
      ],
      quote: '"Seyahat etmek varış noktasından çok önce, geri sayım başladığı anda başlar."',
      proTips: [
        'Geri sayım oluştururken notlar kısmına seyahat rotanızı madde madde yazın.',
        'Stili "Orbital" veya "CountTo" seçerek zaman halkasının doluşunu keyifle izleyin.',
        'Tatil yaklaştıkça arkadaşlarınızla paylaşmak için "Paylaş" butonundan özel bağlantı linkinizi kopyalayın.',
      ],
    },
    recommendedSongSearch: 'As It Was Harry Styles',
  },
  {
    id: 'minimalist-calisma-masasi',
    title: 'Minimalist Masaüstü: Obsidyen Altın & Dijital Arınma',
    subtitle: 'Dikkat dağıtan pencereleri kapatıp analog şıklığında bir masa saatine geçiş',
    category: 'Minimalizm',
    readingTime: '2.5 dk okuma',
    themeId: 'gold',
    accentColor: '#eab308',
    date: 'Ekim 2026',
    coverStyle: {
      bgGradient: 'radial-gradient(ellipse at 50% 25%, rgba(234, 179, 8, 0.22) 0%, rgba(245, 158, 11, 0.15) 45%, rgba(16, 14, 10, 0.98) 80%)',
      glowColor: 'rgba(234, 179, 8, 0.3)',
      accentHex: '#eab308',
      secondaryHex: '#f59e0b',
      illustrationType: 'minimal',
    },
    summary: 'Fazla sekme, fazla bildirim, fazla gürültü... "Obsidyen Altın" veya "Saf Minimal" temasıyla ekranı sakin bir tasarım objesine dönüştürün.',
    content: {
      lead: 'Eğer masanızın üzerinde ikinci bir monitör, tablet veya açık duran bir dizüstü bilgisayar varsa, onu bir dikkat dağıtıcı olmaktan çıkarıp zarif bir tasarım objesine dönüştürebilirsiniz.',
      paragraphs: [
        'CountTo\'nun varsayılan olarak açtığı "Şu Anki Saat" modu, İsviçre saat işçiliğinden ilham alan tipografik sayılarla çalışır. "Obsidyen Altın" temasını seçip tam ekrana geçtiğinizde gereksiz tüm tarayıcı butonları ve çubuklar gizlenir.',
        'Zamanı sadece takip etmekle kalmaz, masanızın estetik bir parçası haline getirirsiniz. Masanızda bir fincan filtre kahve ve ekranınızda altın ışıltılı büyük rakamlar varken çalışmak, zihinsel bir berraklık sunar.',
      ],
      quote: '"Mükemmellik eklenecek bir şey kalmadığında değil, çıkarılacak bir şey kalmadığında elde edilir."',
      proTips: [
        'Tam ekran modunu açmak için sağ üstteki tam ekran simgesine tıklayın.',
        'Varsayılan "Şu Anki Saat" ile masanızda 7/24 yaşayan bir duvar/masa saati oluşturun.',
        'Çift monitör kullanıyorsanız ikinci ekranınızı tamamen CountTo\'ya ayırın.',
      ],
    },
    recommendedSongSearch: 'Blinding Lights The Weeknd',
  },
  {
    id: 'yagmurlu-sonbahar-aksamlari',
    title: 'Yağmurlu Sonbahar Akşamı: Okaliptüs & Camdaki Damlalar',
    subtitle: 'Sıcak bir kupa kahve, serin yağmur efekti ve dinlendirici akustik ambiyans',
    category: 'Yaşam & Tatil',
    readingTime: '3 dk okuma',
    themeId: 'eucalyptus',
    accentColor: '#5eead4',
    date: 'Ekim 2026',
    coverStyle: {
      bgGradient: 'radial-gradient(ellipse at 40% 30%, rgba(94, 234, 212, 0.25) 0%, rgba(15, 118, 110, 0.22) 55%, rgba(6, 20, 24, 0.98) 85%)',
      glowColor: 'rgba(94, 234, 212, 0.35)',
      accentHex: '#5eead4',
      secondaryHex: '#0f766e',
      illustrationType: 'rain',
    },
    summary: 'CountTo\'nun interaktif yağmur efekti ve Okaliptüs Sisi temasıyla dışarıdaki yağmurlu havayı ekranda canlandırın.',
    content: {
      lead: 'Ekim ve kasım aylarında camlara vuran damlaların sesi kadar insana huzur veren pek az şey vardır.',
      paragraphs: [
        '"Okaliptüs Sisi (Eucalyptus Mist)" teması, ıslak orman yapraklarının dinlendirici mavimsi-yeşil tonlarını taşır. Bu temayı CountTo\'nun özel Yağmur Efekti ile birleştirdiğinizde, ekranda yüzeylere çarpan damlalar canlanır.',
        'Eğer pazar akşamı bir şeyler okuyor, planlama yapıyor ya da sadece günün yorgunluğunu atmak istiyorsanız, bu kombinasyon odanızı bir kış bahçesine çevirecek.',
      ],
      quote: '"Bazı insanlar yağmuru hisseder, diğerleri sadece ıslanır."',
      proTips: [
        'Temalar sayfasının başındaki "Yağmur Teması" kartına tıklayarak ekranı yağmur damlalarıyla kaplayın.',
        'Ambiyans sesini açık tutarak synthesizer ses dalgalarının odaya yayılmasına izin verin.',
        'Arka plandaki Spotify oynatıcısından sakin akustik bir parça başlatın.',
      ],
    },
    recommendedSongSearch: 'Hileli manifest Ajda Pekkan',
  },
  {
    id: 'yeni-yil-buyuk-hedefler',
    title: 'Kutup Işığı (Aurora) ile Yeni Bir Sayfa Açmak',
    subtitle: '365 günlük umutlar, kişisel hedefler ve dönüm noktalarını kucaklamak',
    category: 'Motivasyon',
    readingTime: '3.5 dk okuma',
    themeId: 'aurora',
    accentColor: '#06b6d4',
    date: 'Ekim 2026',
    coverStyle: {
      bgGradient: 'radial-gradient(ellipse at 50% 20%, rgba(6, 182, 212, 0.28) 0%, rgba(16, 185, 129, 0.2) 50%, rgba(4, 12, 24, 0.98) 85%)',
      glowColor: 'rgba(6, 182, 212, 0.35)',
      accentHex: '#06b6d4',
      secondaryHex: '#10b981',
      illustrationType: 'aurora',
    },
    summary: 'Kuzey ışıklarının büyülü renkleriyle yeni bir yıla ve hayallerinize saniye saniye yaklaşmanın ilham verici yolculuğu.',
    content: {
      lead: 'Her yeni yıl, hayatımızda temiz bir defterin ilk bembeyaz sayfasını açmak gibidir.',
      paragraphs: [
        'CountTo\'nun imza teması olan "Kutup Işığı (Aurora)", Norveç fiyortları üzerinde dans eden manyetik yeşil ve turkuaz ışık akımlarını temsil eder. Yeni yıla kalan günleri bu atmosferde izlemek, insanın içine garip bir umut ve heyecan aşılar.',
        'Spordan yabancı dile, kariyer hedeflerinden yeni seyahatlere kadar kendinize verdiğiniz sözleri düşünün. Zamanı somut bir şekilde akarken görmek ertelemeyi azaltır ve "Bugün ne yaptım?" sorusunu sordurur.',
      ],
      quote: '"Gelecek, bugünden ona hazırlananlara aittir."',
      proTips: [
        'Etkinlikler listesindeki "Yeni Yıl" sayacına tıklayın.',
        'Not kısmına bu yıl kesinlikle başarmak istediğiniz tek bir büyük hedef yazın.',
        'Kutlama zamanı geldiğinde CountTo\'nun konfeti ve çan efektlerinin tadını çıkarın.',
      ],
    },
    recommendedSongSearch: 'Aurora Runaway',
  },
];
