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
    illustrationType: 'deepfocus' | 'nordic' | 'cosmos' | 'zenstone' | 'raincity' | 'horizon';
  };
  summary: string;
  content: {
    lead: string;
    paragraphs: string[];
    quote?: string;
    proTips: string[];
  };
}

export const COLLECTION_ARTICLES: CollectionArticle[] = [
  {
    id: 'zaman-korlugu-ve-gorsel-sayac',
    title: 'Zaman Körlüğünü Yenmek: Görsel Sayaçların Nörolojisi',
    subtitle: 'Sürekli geç kalma ve erteleme döngüsünü görsel ritimle kırma rehberi',
    category: 'Odaklanma & Ders',
    readingTime: '3.5 dk okuma',
    themeId: 'cyber',
    accentColor: '#f97316',
    date: 'Kasım 2026',
    coverStyle: {
      bgGradient: 'radial-gradient(ellipse at 70% 30%, rgba(249, 115, 22, 0.28) 0%, rgba(239, 68, 68, 0.2) 45%, rgba(20, 10, 10, 0.98) 80%)',
      glowColor: 'rgba(249, 115, 22, 0.4)',
      accentHex: '#f97316',
      secondaryHex: '#ef4444',
      illustrationType: 'deepfocus',
    },
    summary: 'İnsan beyni zamanın akışını hissedemediğinde erteleme başlar. Sayıların lineer azalışını göz ucuyla görmek prefrontal korteksi nasıl anında harekete geçirir?',
    content: {
      lead: 'Zaman körlüğü (Time Blindness), saatlerin nasıl geçtiğini fark edememe ve "Daha çok vaktim var" yanılsamasına kapılma durumudur.',
      paragraphs: [
        'Geleneksel duvar saatleri veya telefon kilit ekranları beynimize zamanın "tükendiği" sinyalini veremez; sadece statik bir koordinat gösterir. Oysa CountTo gibi dinamik bir geri sayım ekranı masanızda açıkken, her saniye gözünüzün önünde fiziksel bir hareket yaratır.',
        'Nörobilimsel araştırmalar, azalan rakamları veya daralan halkaları izlemenin prefrontal kortekste aciliyet ve tamamlanma arzusunu tetiklediğini gösteriyor. "Siber Kor" temasının turuncu-kızıl sıcak ışıltısı, dikkat merkezlerini uyararak gevşemeyi önler.',
        'Özellikle büyük projelerde 20 veya 30 dakikalık geri sayım blokları kurup tam ekranda masanızın kenarına koyun. Beyniniz kalan sürenin somutlaştığını gördüğünde, sosyal medyaya kayma dürtüsü yerini hedefi bitirme hırsına bırakır.',
      ],
      quote: '"Zaman soyut kaldığı sürece harcanır; görünür ve somut hale geldiğinde ise bir güce dönüşür."',
      proTips: [
        'Hedefinizi "2 saat çalışacağım" yerine "Sayaç sıfırlanana kadar sadece bu 5 soruyu çözeceğim" diye netleştirin.',
        'Stili "CountTo (Aşağı Kayma)" seçerek her saniyenin akıcı düşüşünü masanızın köşesinde canlı tutun.',
        '"S" kısayoluyla saat tik-tak sesini açın; akustik ritim dikkat dağılmasını engelleyen bir metronom görevi görür.',
      ],
    },
  },
  {
    id: 'derin-calisma-deep-work-ritueli',
    title: 'Sıfır Bildirim, Sonsuz Akış: 90 Dakikalık Derin Seans',
    subtitle: 'Modern dikkat dağınıklığına karşı kurşun geçirmez çalışma masası mimarisi',
    category: 'Minimalizm',
    readingTime: '3 dk okuma',
    themeId: 'nordic',
    accentColor: '#38bdf8',
    date: 'Kasım 2026',
    coverStyle: {
      bgGradient: 'radial-gradient(ellipse at 30% 25%, rgba(56, 189, 248, 0.25) 0%, rgba(99, 102, 241, 0.18) 50%, rgba(10, 16, 28, 0.98) 85%)',
      glowColor: 'rgba(56, 189, 248, 0.35)',
      accentHex: '#38bdf8',
      secondaryHex: '#6366f1',
      illustrationType: 'nordic',
    },
    summary: 'Her bildirim dikkatinizi böldüğünde zihnin toparlanması 23 dakika sürer. İskandinav sadeliğiyle masanızı saf bir üretim laboratuvarına çevirin.',
    content: {
      lead: 'Cal Newport’un "Deep Work" kuramında belirttiği gibi, çağımızın en değerli becerisi dikkat dağıtıcı unsurlar olmadan saatlerce tek bir konuya kilitlenebilmektir.',
      paragraphs: [
        'Açık duran onlarca tarayıcı sekmesi ve sürekli yanıp sönen sohbet pencereleri "dikkat kalıntısı" (attention residue) yaratarak zihninizi tüketir. "Nordic Fiyort" temasının soğuk mavi ve buzul beyazı tonları ise aşırı uyarılmış göz sinirlerini yatıştırır.',
        'Geri sayımınızı tam 90 dakikaya (insan beyninin ultradian odaklanma döngüsü) ayarlayın ve klavyeden "F" tuşuna basarak tam ekrana geçin. Ekranınızdaki tüm pencereler, sekmeler ve menüler kaybolur; geriye yalnızca zamanın asal ve sessiz yürüyüşü kalır.',
        'Masanızda temiz bir defter, bir fincan sade kahve ve tam ekran CountTo varken dikkatinizi dağıtacak hiçbir dijital pürüz kalmaz.',
      ],
      quote: '"Dağınıklık dikkatin katilidir; sadelik ise ustalığın tek sığınağıdır."',
      proTips: [
        'Seansa başlamadan önce tarayıcıdaki tüm alakasız sekmeleri kapatın ve sadece CountTo’yu tam ekrana alın.',
        '"M" kısayoluna basarak saliseleri gizleyin; derin odaklanmada yalnızca saat ve dakikaların sakinliği gerekir.',
        '90 dakikalık seans bittiğinde CountTo çan sesiyle sizi uyaracak; o ana kadar sandalyeden kalkmayın.',
      ],
    },
  },
  {
    id: 'dopamin-detoksu-ve-yavas-zaman',
    title: 'Dijital Dopamin Yorgunluğu ve Gece Sükuneti',
    subtitle: 'Sonsuz kaydırmayı durdurup zihni derin bir fabrika ayarlarına döndürme taktikleri',
    category: 'Gece & Lo-Fi',
    readingTime: '3.5 dk okuma',
    themeId: 'violet',
    accentColor: '#a855f7',
    date: 'Kasım 2026',
    coverStyle: {
      bgGradient: 'radial-gradient(ellipse at 50% 30%, rgba(168, 85, 247, 0.28) 0%, rgba(99, 102, 241, 0.22) 50%, rgba(12, 8, 26, 0.98) 85%)',
      glowColor: 'rgba(168, 85, 247, 0.38)',
      accentHex: '#a855f7',
      secondaryHex: '#6366f1',
      illustrationType: 'cosmos',
    },
    summary: 'Hızlı kaydırmalar beyni yorar, zamanı hızlandırır. Kozmik Menekşe teması ve loş ekran ışığıyla akşam saatlerinde zihinsel dinginliği geri kazanın.',
    content: {
      lead: 'Akşam saatlerinde telefon ekranında kaydırılan yüzlerce kısa video, beyni sahte dopamin fırtınalarıyla doyururken gerçekte derin bir zihinsel yorgunluk bırakır.',
      paragraphs: [
        'Saat 22:00’den sonra "Kozmik Menekşe" temasına geçip "Şu Anki Saat" modunu tam ekran yaptığınızda, mor ve lavanta dalga boyları gözün melatonin üretim mekanizmasını parlak beyaz ışıklar gibi tahrip etmez.',
        'Zamanın telaşsızca aktığını izlemek, beynin varsayılan mod ağına (Default Mode Network) geçmesine izin verir. Bu anlarda telefonunuza dokunmadan yalnızca masanızda oturmak veya günün muhasebesini yapmak, gün boyu biriken düşünce çöplerini temizler.',
        'Masanızın kenarındaki yapışkan not aracını kullanarak yarının en kritik 3 önceliğini yazıp ekranınıza iliştirin; zihniniz gece boyu bu görevleri düşünmek zorunda kalmaz.',
      ],
      quote: '"Zamanı hızlandıran şey saatler değil, dikkatimizi parçalayan sonsuz gürültüdür."',
      proTips: [
        'Saat 21:30 itibarıyla telefonunuzu çalışma alanınızın dışına bırakın.',
        'CountTo temasını "Kozmik Menekşe" yapıp "Şu Anki Saat" modunda masanızda estetik bir gece saati olarak çalıştırın.',
        'Ekrandaki yapışkan not bölümüne yarının tek bir kilit görevini yazarak zihinsel yükü bırakın.',
      ],
    },
  },
  {
    id: 'sinav-sabahi-sakinligi-taktikleri',
    title: 'Sınav Günü Panik Yönetimi: Soğukkanlı Zihin Protokolü',
    subtitle: 'YKS, LGS ve finallerde süreyi stres değil stratejik silaha dönüştürme taktikleri',
    category: 'Odaklanma & Ders',
    readingTime: '4 dk okuma',
    themeId: 'matcha',
    accentColor: '#4ade80',
    date: 'Kasım 2026',
    coverStyle: {
      bgGradient: 'radial-gradient(ellipse at 40% 20%, rgba(74, 222, 128, 0.26) 0%, rgba(21, 128, 61, 0.22) 50%, rgba(6, 18, 10, 0.98) 85%)',
      glowColor: 'rgba(74, 222, 128, 0.35)',
      accentHex: '#4ade80',
      secondaryHex: '#15803d',
      illustrationType: 'zenstone',
    },
    summary: 'Sınav anında adrenalin tavan yaptığında dakikalar su gibi akar. Yeşil çay dinginliği ve nefes ritmiyle süreyi kontrol altında tutma taktikleri.',
    content: {
      lead: 'Deneme sınavlarında ve gerçek maratonlarda başarının yüzde ellisi bilgi ise, diğer yüzde ellisi zamanın yarattığı baskıyı soğukkanlılıkla yönetebilmektir.',
      paragraphs: [
        'Gözlerimiz kırmızı veya yüksek kontrastlı uyarıcılar gördüğünde sempatik sinir sistemi tetiklenir ve kalp atış hızı yükselir. Buna karşılık "Kyoto Yeşili (Matcha)" teması, doğadaki yatıştırıcı bitki klorofili frekanslarını yansıtarak nabzı sakinleştirir.',
        'Haftalık deneme çözerken süreyi tam sınav süresiyle (örneğin 135 veya 165 dakika) başlatın ve sayacı hafif yan açıyla masanızın sol köşesine koyun. Sadece sayfanızı çevirirken başınızı kaldırıp bakacak şekilde konumlandırın.',
        'Sıkıştığınız veya bir soruya takıldığınız anda ekrandaki dairesel halkalara veya sayılara 4 saniye bakın, derin nefes alarak soruyu atlayıp devam edin. Zamanla savaşmak yerine zamanın ritmine ayak uyduranlar her zaman kazanır.',
      ],
      quote: '"Soğukkanlı bir zihin, fırtınanın ortasında bile doğru kararı veren pusuladır."',
      proTips: [
        'Deneme sınavı simülasyonu için "Kyoto Yeşili" temasını ve "3D Flip" ya da "Halkalar" stilini seçin.',
        'Stres hissettiğiniz an "Kutu Nefesi" tekniğini uygulayın: 4 saniye al, 4 saniye tut, 4 saniye ver.',
        'Yapışkan notlar üzerine "Bir soruya 2 dakikadan fazla takılma!" kuralını sabitleyin.',
      ],
    },
  },
  {
    id: 'yagmurlu-pencere-derin-rahatlama',
    title: 'Yağmurlu Balkon Terapisi: Zihni Arındıran Canlı Yağmur',
    subtitle: 'Şehrin stresinden kaçıp sıcak bir fincan çayla zihinsel reset atma rehberi',
    category: 'Yaşam & Tatil',
    readingTime: '3 dk okuma',
    themeId: 'eucalyptus',
    accentColor: '#5eead4',
    date: 'Kasım 2026',
    coverStyle: {
      bgGradient: 'radial-gradient(ellipse at 50% 30%, rgba(94, 234, 212, 0.28) 0%, rgba(15, 118, 110, 0.24) 55%, rgba(6, 20, 24, 0.98) 85%)',
      glowColor: 'rgba(94, 234, 212, 0.35)',
      accentHex: '#5eead4',
      secondaryHex: '#0f766e',
      illustrationType: 'raincity',
    },
    summary: 'Puslu pencere atmosferi ve yağmurun ritmik dinginliğiyle çalışma masanızı derin bir odaklanma alanına dönüştürün.',
    content: {
      lead: 'Yağmur damlalarının pencere camına vuran ritmi ve uzaktaki puslu şehir ışıkları, modern yaşamın telaşını bir anda donduran eşsiz bir terapi gibidir.',
      paragraphs: [
        'CountTo’nun sakin neon ve aurora tonları, buğulu bir akşam metropolünü izliyormuş hissi uyandırır. Loş iç mekan ışıkları ve derin kontrastlar çalışma ortamınıza anında sinematik bir huzur katar.',
        'Beyaz gürültü etkisi yaratan ritmik arka plan tonları, dışarıdaki korna, kapı çarpması ve dikkat dağıtıcı sesleri zihinden uzaklaştırır. Beyin bu frekansta alfa dalgaları üretir ve aşırı düşünme (overthinking) hali kendiliğinden durulur.',
        'Yorucu bir çalışma bloğunun ardından 10 dakikalık bir mola verdiğinizde, ekranınızı tam ekran bir dinginliğe bırakıp sadece bir fincan çay yudumlamak enerjinizi tamamen yeniler.',
      ],
      quote: '"Bazen en büyük üretkenlik, yağmurun ritminde hiçbir şey yapmadan sadece durabilmektir."',
      proTips: [
        'Masanızda dikkati dağıtan tüm bildirimleri kapatın ve geri sayımınızı loş bir tema ile başlatın.',
        '"F" tuşuna basarak tam ekrana geçin; ekranınız sinematik ve sade bir zaman sayacına dönüşsün.',
        'Gözlerinizi 20 saniye boyunca ekrandaki derin tonlara odaklayarak göz kaslarınızı dinlendirin (20-20-20 kuralı).',
      ],
    },
  },
  {
    id: 'buyuk-macera-ve-rotasiz-yollar',
    title: 'Geri Sayım Psikolojisi: Büyük Maceraları Beklemenin Hazzı',
    subtitle: 'Gelecekteki heyecan verici hedeflerin bugünkü motivasyonumuzu nasıl 3 katına çıkardığı',
    category: 'Motivasyon',
    readingTime: '3.5 dk okuma',
    themeId: 'oasis',
    accentColor: '#38bdf8',
    date: 'Kasım 2026',
    coverStyle: {
      bgGradient: 'radial-gradient(ellipse at 60% 30%, rgba(56, 189, 248, 0.28) 0%, rgba(245, 158, 11, 0.24) 55%, rgba(14, 18, 28, 0.98) 85%)',
      glowColor: 'rgba(56, 189, 248, 0.38)',
      accentHex: '#38bdf8',
      secondaryHex: '#f59e0b',
      illustrationType: 'horizon',
    },
    summary: 'Stanford araştırmaları, hedefe ulaşmaktan çok hedefe doğru gün sayarken salgılanan beklenti dopamininin çok daha güçlü olduğunu kanıtlıyor.',
    content: {
      lead: 'Bir tatile çıkmanın, üniversiteyi kazanmanın veya yeni bir hayata adım atmanın büyüsü sadece o günde saklı değildir; ona giden yoldaki her saniyede yaşanır.',
      paragraphs: [
        'Psikolojide "Anticipation Effect" olarak bilinen olgu, yaklaşan güzel bir olayı somut olarak izlemenin bugünkü zorluklara katlanma eşiğimizi dramatik şekilde artırdığını gösterir. "Çöl Vahası" teması altın kum tepeleri ile kristal suların zıtlığıyla bu heyecanı simgeler.',
        'Günlerin 100’den iki haneliye, ardından tek haneliye düşüşünü izlemek, sıradan bir salı sabahında bile masanıza taze bir enerji üfler. Her baktığınızda "Az kaldı, devam et" fısıltısını duyarsınız.',
        'CountTo’nun "Paylaş" butonuyla seyahat veya etkinlik bağlantısını sevdiklerinizle paylaştığınızda bu heyecan ortak bir ritüele dönüşür.',
      ],
      quote: '"Yolculuk varış noktasında değil, geri sayım düğmesine ilk bastığınız anda başlar."',
      proTips: [
        'Etkinlik başlığını güçlü bir fiille yazın (Örn: "Barselona Sokaklarında Kayboluş" veya "Yaz Tatili Başlangıcı").',
        'Stili "Halkalar" veya "CountTo" seçerek zamanın doluşunu estetik bir görsel grafik olarak takip edin.',
        '"Paylaş" butonuna basıp seyahat arkadaşlarınıza bağlantıyı gönderin ve ortak heyecan yaratın.',
      ],
    },
  },
];
