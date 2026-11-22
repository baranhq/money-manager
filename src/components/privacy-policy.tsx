import { Card } from "@/components/ui/card"
import { NoticeLayout } from "@/components/notice-layout"

export type PrivacyLocale = "en" | "bg" | "tr"

type Section = { id: string; title: string; paragraphs: string[] }
type Resource = { label: string; href: string }
type PolicyCopy = {
  lang: string
  pageTitle: string
  pageDescription: string
  updated: string
  languageLabel: string
  contentsLabel: string
  contentsTitle: string
  summary: string
  backLabel: string
  privacyLabel: string
  licencesLabel: string
  sections: Section[]
  resourcesTitle: string
  resources: Resource[]
}

const policy: Record<PrivacyLocale, PolicyCopy> = {
  en: {
    lang: "en-GB",
    pageTitle: "Privacy Policy",
    pageDescription: "How Money Manager stores app data and how website requests and privacy enquiries are handled.",
    updated: "Last updated: 22 November 2026",
    languageLabel: "Policy language",
    contentsLabel: "Privacy Policy contents",
    contentsTitle: "On this page",
    summary: "Money Manager keeps your financial records in your browser. This policy explains the personal data processed when you visit the website or contact me.",
    backLabel: "About & legal",
    privacyLabel: "Privacy",
    licencesLabel: "Licences",
    sections: [
      {
        id: "controller",
        title: "Controller and contact",
        paragraphs: [
          "I am Baran Ahmedov, an individual based in Bulgaria and the controller for personal data I process when you visit this website or contact me. Reach me at the email address below.",
        ],
      },
      {
        id: "app-data",
        title: "Data stored in the app",
        paragraphs: [
          "The app stores profiles, accounts, transactions, categories, budgets, savings goals and contributions, and preferences in your browser. It has no online account, bank connection or cloud sync. These records and imported files are not sent to me.",
          "The app checks your password locally. A password lock alone does not encrypt stored records; storage encryption is a separate option. If you lose the password for encrypted records, the app cannot recover them. The app also stores whether you completed or skipped its tour in browser storage. The app itself sets no cookies.",
          "You can clear records in the app or remove this website’s data in your browser settings. Downloaded exports are separate files and are not removed by either action.",
        ],
      },
      {
        id: "website-data",
        title: "Website requests and traffic reports",
        paragraphs: [
          "Requests are handled by network delivery and security services and by the website host. To deliver the site and protect it against abuse, these services may process your IP address, request date and time, requested URL or resource, response status, browser or device information, referrer when sent, and network or security signals. Security features may use strictly necessary cookies. The app contains no browser analytics beacon; Cloudflare Web Analytics is disabled.",
          "The host creates access logs and provides AWStats, which is enabled for this hosting account. AWStats produces traffic reports from server logs. This is server-side reporting, separate from browser-based analytics and from records stored in the app.",
          "I rely on my legitimate interests in delivering, administering and protecting the website and reviewing its traffic and security for processing whose purposes I determine. Hosting and network providers process data on my behalf where they act on my instructions. A provider may separately act as an independent controller for processing whose purposes it determines. You may object to processing based on legitimate interests as described below.",
        ],
      },
      {
        id: "messages",
        title: "Messages you send me",
        paragraphs: [
          "If you email me, I process your address, message, attachments and other information you choose to include to respond and handle necessary follow-up. I rely on my legitimate interests in handling correspondence and related claims, and on legal obligations when responding to data protection requests. Providing information is voluntary, but I may be unable to respond without enough detail. An email service provider receives and stores the correspondence to deliver the service.",
        ],
      },
      {
        id: "retention",
        title: "Storage periods and backups",
        paragraphs: [
          "Hosting access logs and AWStats reports are kept according to the host’s settings and service terms; I have not confirmed a fixed retention period. The hosting account uses weekly incremental backups. Four recovery points were visible when this policy was prepared, but the backup contents and rotation period have not been confirmed. Data held on the hosting account may remain in a backup until it is removed under the provider’s rotation process. Browser-only app records are not stored in the hosting account and remain in your browser until you clear them in the app or browser settings. I keep correspondence only as long as needed to respond, handle related follow-up or claims, or meet legal obligations; the email service may retain it under its own terms and settings.",
        ],
      },
      {
        id: "recipients-transfers",
        title: "Recipients and international transfers",
        paragraphs: [
          "The recipients are hosting providers, network delivery and security providers, and an email service provider, each to the extent needed for its service. Published hosting information describes hosting and backup facilities in the EU/EEA, but the server and backup locations and the data-processing terms applying to this account have not been confirmed. The network security service uses a global network, so request data may be processed outside the EEA. Its published transfer terms refer to the EU–US Data Privacy Framework for eligible transfers and Standard Contractual Clauses for other restricted transfers. I have not confirmed which arrangement applies to this account; contact me for the applicable safeguard and, where required, a copy. Providers may also process some data as independent controllers under their own privacy information.",
        ],
      },
      {
        id: "rights",
        title: "Your rights",
        paragraphs: [
          "You may request access, correction, erasure or restriction of personal data I process, and object where processing is based on legitimate interests. You may also request data portability where the legal conditions are met. You can complain to Bulgaria’s Commission for Personal Data Protection (CPDP / КЗЛД) or another competent supervisory authority without contacting me first. I cannot access browser-only app records; manage or delete them in the app or your browser.",
          "Email me to make a request. If I have reasonable doubts about your identity, I may ask for information needed to verify it. I will respond without undue delay and normally within one month. For complex or numerous requests, I may extend that period by up to two further months and will explain the reason within the first month. For data a provider processes as an independent controller, contact that provider directly.",
        ],
      },
    ],
    resourcesTitle: "Legal information",
    resources: [
      { label: "General Data Protection Regulation (GDPR)", href: "https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng" },
      { label: "Bulgarian Personal Data Protection Act", href: "https://cpdp.bg/en/legislation/personal-data-protection-act/" },
    ],
  },
  bg: {
    lang: "bg-BG",
    pageTitle: "Политика за поверителност",
    pageDescription: "Как Money Manager съхранява данните в приложението и как се обработват заявките към сайта и запитванията за поверителност.",
    updated: "Последна актуализация: 22 ноември 2026 г.",
    languageLabel: "Език на политиката",
    contentsLabel: "Съдържание на политиката за поверителност",
    contentsTitle: "В тази страница",
    summary: "Money Manager съхранява финансовите ви записи в браузъра. Тази политика обяснява какви лични данни се обработват при посещение на сайта или контакт с мен.",
    backLabel: "За приложението и правна информация",
    privacyLabel: "Поверителност",
    licencesLabel: "Лицензи",
    sections: [
      {
        id: "controller",
        title: "Администратор и контакт",
        paragraphs: [
          "Аз съм Baran Ahmedov, физическо лице в България и администратор на личните данни, които обработвам при посещение на сайта или при контакт с мен. Можете да се свържете с мен на имейл адреса по-долу.",
        ],
      },
      {
        id: "app-data",
        title: "Данни, съхранявани в приложението",
        paragraphs: [
          "Приложението съхранява профили, сметки, транзакции, категории, бюджети, цели за спестяване и вноски към тях, както и предпочитания в браузъра ви. То няма онлайн акаунт, връзка с банка или синхронизиране в облак. Тези записи и импортираните файлове не се изпращат до мен.",
          "Приложението проверява паролата ви локално. Само заключването с парола не шифрова записите; шифроването на съхранението е отделна настройка. Ако загубите паролата за шифровани записи, приложението не може да ги възстанови. То също съхранява в браузъра дали сте завършили или пропуснали обиколката. Самото приложение не задава бисквитки.",
          "Можете да изчистите записите в приложението или да премахнете данните на сайта от настройките на браузъра. Изтеглените експорти са отделни файлове и не се премахват при нито едно от тези действия.",
        ],
      },
      {
        id: "website-data",
        title: "Заявки към сайта и отчети за трафика",
        paragraphs: [
          "Заявките се обработват от услуги за мрежово доставяне и защита, както и от хостинга на сайта. За да доставят сайта и да го защитават от злоупотреби, тези услуги може да обработват IP адреса ви, дата и час на заявката, заявен URL адрес или ресурс, статус на отговора, данни за браузъра или устройството, източник на препращане, когато е изпратен, и мрежови сигнали или сигнали за сигурност. Защитните функции може да използват бисквитки, които са строго необходими. Приложението не зарежда скрипт за аналитика в браузъра; Cloudflare Web Analytics е изключен.",
          "Хостинг доставчикът създава логове за достъп и предоставя AWStats, който е включен за този хостинг акаунт. AWStats създава отчети за трафика от сървърните логове. Това е сървърно отчитане, отделно от аналитичните инструменти в браузъра и от записите в приложението.",
          "Позовавам се на легитимните си интереси да доставям, управлявам и защитавам сайта и да преглеждам трафика и сигурността му за обработването, чиито цели определям. Хостинг и мрежовите доставчици обработват данни от мое име, когато действат по мои инструкции. Доставчик може отделно да действа като самостоятелен администратор за обработване, чиито цели определя. Можете да възразите срещу обработване на основание легитимен интерес, както е описано по-долу.",
        ],
      },
      {
        id: "messages",
        title: "Съобщения, които ми изпращате",
        paragraphs: [
          "Ако ми пишете по имейл, обработвам адреса ви, съобщението, прикачените файлове и другата информация, която решите да включите, за да отговоря и да предприема необходимите последващи действия. Позовавам се на легитимните си интереси да обработвам кореспонденцията и свързаните претенции, както и на законовите си задължения, когато отговарям на искания за защита на данните. Предоставянето на информация е доброволно, но без достатъчно подробности може да не успея да отговоря. Доставчикът на имейл услугата получава и съхранява кореспонденцията, за да предоставя услугата.",
        ],
      },
      {
        id: "retention",
        title: "Срокове за съхранение и резервни копия",
        paragraphs: [
          "Хостинг логовете за достъп и отчетите от AWStats се съхраняват според настройките и условията на хостинг доставчика; не съм потвърдил фиксиран срок. В хостинг акаунта се правят седмични инкрементални резервни копия. При подготовката на тази политика се виждаха четири точки за възстановяване, но съдържанието и графикът за ротация на копията не са потвърдени. Данни, намиращи се в хостинг акаунта, може да останат в резервно копие до премахването им според процеса на ротация на доставчика. Записите в приложението, които са само в браузъра, не се съхраняват в хостинга и остават там, докато не ги изчистите от приложението или от настройките на браузъра. Съхранявам кореспонденцията само докато е необходима за отговор, последващи действия, претенции или изпълнение на законови задължения; доставчикът на имейл може да я съхранява съгласно собствените си условия и настройки.",
        ],
      },
      {
        id: "recipients-transfers",
        title: "Получатели и международни трансфери",
        paragraphs: [
          "Получателите са доставчици на хостинг, мрежово доставяне и защита, както и доставчик на имейл, доколкото това е необходимо за съответната услуга. Публикуваната информация за хостинга посочва центрове за данни в ЕС/ЕИП, но местоположението на сървъра и резервните копия, както и условията за обработване, приложими към този акаунт, не са потвърдени. Мрежовата услуга за защита използва глобална мрежа и заявките може да се обработват извън ЕИП. Публикуваните ѝ условия за трансфер посочват Рамката за защита на личните данни между ЕС и САЩ за допустимите трансфери и Стандартните договорни клаузи за други трансфери с ограничения. Не съм потвърдил коя уредба важи за този акаунт; свържете се с мен за приложимата гаранция и, когато се изисква, нейно копие. Доставчиците може също да обработват някои данни като самостоятелни администратори съгласно собствената си информация за поверителност.",
        ],
      },
      {
        id: "rights",
        title: "Вашите права",
        paragraphs: [
          "Можете да поискате достъп, коригиране, изтриване или ограничаване на личните данни, които обработвам, и да възразите, когато обработването се основава на легитимен интерес. Можете да поискате преносимост на данните, когато са изпълнени законовите условия. Можете да подадете жалба до Комисията за защита на личните данни (КЗЛД) или друг компетентен надзорен орган, без първо да се свързвате с мен. Нямам достъп до записите в приложението, които се съхраняват само във вашия браузър; управлявайте или изтрийте ги от приложението или браузъра.",
          "Изпратете искането си по имейл. Ако имам основателни съмнения относно самоличността ви, мога да поискам необходимата информация за потвърждаването ѝ. Ще отговоря без ненужно забавяне и обикновено в срок до един месец. При сложни или многобройни искания мога да удължа срока с до още два месеца и ще обясня причината през първия месец. За данни, които доставчик обработва като самостоятелен администратор, се обърнете директно към него.",
        ],
      },
    ],
    resourcesTitle: "Правна информация",
    resources: [
      { label: "Общ регламент относно защитата на данните (GDPR)", href: "https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng" },
      { label: "Закон за защита на личните данни", href: "https://cpdp.bg/en/legislation/personal-data-protection-act/" },
    ],
  },
  tr: {
    lang: "tr-TR",
    pageTitle: "Gizlilik Politikası",
    pageDescription: "Money Manager uygulama verilerini nasıl saklar; site istekleri ve gizlilik başvuruları nasıl işlenir.",
    updated: "Son güncelleme: 22 Kasım 2026",
    languageLabel: "Politika dili",
    contentsLabel: "Gizlilik Politikası içeriği",
    contentsTitle: "Bu sayfada",
    summary: "Money Manager finansal kayıtlarınızı tarayıcınızda saklar. Bu politika, web sitesini ziyaret ettiğinizde veya benimle iletişime geçtiğinizde işlenen kişisel verileri açıklar.",
    backLabel: "Hakkında ve yasal bilgiler",
    privacyLabel: "Gizlilik",
    licencesLabel: "Lisanslar",
    sections: [
      {
        id: "controller",
        title: "Veri sorumlusu ve iletişim",
        paragraphs: [
          "Ben Baran Ahmedov; Bulgaristan'da yaşayan bir gerçek kişi ve web sitesini ziyaret ettiğinizde veya benimle iletişime geçtiğinizde işlediğim kişisel verilerin veri sorumlusuyum. Aşağıdaki e-posta adresinden bana ulaşabilirsiniz.",
        ],
      },
      {
        id: "app-data",
        title: "Uygulamada saklanan veriler",
        paragraphs: [
          "Uygulama profilleri, hesapları, işlemleri, kategorileri, bütçeleri, birikim hedeflerini ve bu hedeflere yapılan katkıları, ayrıca tercihleri tarayıcınızda saklar. Çevrim içi hesap, banka bağlantısı veya bulut eşitlemesi yoktur. Bu kayıtlar ve içe aktarılan dosyalar bana gönderilmez.",
          "Uygulama parolanızı yerel olarak doğrular. Yalnızca parola kilidi kayıtları şifrelemez; depolama şifrelemesi ayrı bir seçenektir. Şifrelenmiş kayıtların parolasını kaybederseniz uygulama bunları kurtaramaz. Uygulama ayrıca tanıtımı tamamlayıp tamamlamadığınızı tarayıcıda saklar. Uygulamanın kendisi çerez ayarlamaz.",
          "Kayıtları uygulamadan silebilir veya bu sitenin verilerini tarayıcı ayarlarından kaldırabilirsiniz. İndirilen dışa aktarma dosyaları ayrıdır ve bu işlemlerle silinmez.",
        ],
      },
      {
        id: "website-data",
        title: "Site istekleri ve trafik raporları",
        paragraphs: [
          "Site istekleri ağ dağıtım ve güvenlik hizmetleri ile site barındırıcısı tarafından işlenir. Siteyi sunmak ve kötüye kullanıma karşı korumak için bu hizmetler IP adresinizi, istek tarih ve saatini, istenen URL veya kaynağı, yanıt durumunu, tarayıcı veya cihaz bilgilerini, gönderilmişse yönlendiren sayfayı ve ağ veya güvenlik sinyallerini işleyebilir. Güvenlik özellikleri kesinlikle gerekli çerezleri kullanabilir. Uygulama tarayıcı analitiği için kod yüklemez; Cloudflare Web Analytics kapalıdır.",
          "Barındırma sağlayıcısı erişim günlükleri oluşturur ve bu hesapta etkin olan AWStats hizmetini sağlar. AWStats sunucu günlüklerinden trafik raporları üretir. Bu, tarayıcı tabanlı analiz araçlarından ve uygulamadaki kayıtlardan ayrı, sunucu taraflı bir raporlamadır.",
          "Amaçlarını belirlediğim işlemlerde siteyi sunma, yönetme, koruma ve trafiğini ve güvenliğini inceleme konusundaki meşru menfaatime dayanırım. Barındırma ve ağ sağlayıcıları talimatlarıma göre hareket ettiklerinde benim adıma veri işler. Bir sağlayıcı belirlediği amaçlar için ayrıca bağımsız veri sorumlusu olabilir. Aşağıda açıklandığı şekilde meşru menfaate dayalı işlemeye itiraz edebilirsiniz.",
        ],
      },
      {
        id: "messages",
        title: "Bana gönderdiğiniz mesajlar",
        paragraphs: [
          "Bana e-posta gönderirseniz, yanıt vermek ve gerekli takibi yürütmek için adresinizi, mesajınızı, ekleri ve eklemeyi seçtiğiniz diğer bilgileri işlerim. Yazışmaları ve ilgili talepleri ele alma konusundaki meşru menfaatime, veri koruma taleplerini yanıtlarken ise gerektiğinde yasal yükümlülüklerime dayanırım. Bilgi vermek isteğe bağlıdır, ancak yeterli ayrıntı olmadan yanıt veremeyebilirim. E-posta hizmeti sağlayıcısı, hizmetini sunmak için yazışmaları alır ve saklar.",
        ],
      },
      {
        id: "retention",
        title: "Saklama süreleri ve yedekler",
        paragraphs: [
          "Barındırma erişim günlükleri ve AWStats raporları sağlayıcının ayarlarına ve hizmet koşullarına göre saklanır; sabit bir saklama süresini doğrulamadım. Barındırma hesabında haftalık artımlı yedekler alınır. Bu politika hazırlanırken dört kurtarma noktası görünüyordu; yedeklerin içeriği ve döndürme süresi doğrulanmadı. Barındırma hesabında bulunan veriler, sağlayıcının döndürme sürecinde kaldırılana kadar yedeklerde kalabilir. Yalnızca tarayıcıda bulunan uygulama kayıtları barındırmada saklanmaz; uygulamadan veya tarayıcı ayarlarından silinene kadar tarayıcıda kalır. Yazışmaları yanıt vermek, gerekli takibi veya talepleri yürütmek ya da yasal yükümlülükleri karşılamak için gerektiği süre boyunca saklarım; e-posta hizmeti sağlayıcısı kendi koşul ve ayarlarına göre saklayabilir.",
        ],
      },
      {
        id: "recipients-transfers",
        title: "Alıcılar ve uluslararası aktarımlar",
        paragraphs: [
          "Alıcılar, ilgili hizmet için gerektiği ölçüde barındırma, ağ dağıtım ve güvenlik sağlayıcıları ile e-posta hizmeti sağlayıcısıdır. Yayımlanan barındırma bilgileri tesislerin AB/AEA içinde olduğunu belirtir; ancak bu hesap için sunucu ve yedek konumları ile geçerli veri işleme koşulları doğrulanmadı. Ağ güvenlik hizmeti küresel bir ağ kullanır ve istek verileri AEA dışında işlenebilir. Yayımlanan aktarım koşulları, uygun aktarımlar için AB-ABD Veri Gizliliği Çerçevesine ve diğer kısıtlı aktarımlar için Standart Sözleşme Maddelerine atıfta bulunur. Bu hesap için hangi düzenlemenin geçerli olduğunu doğrulamadım; geçerli güvenceyi ve gerektiğinde bir kopyasını benden isteyebilirsiniz. Sağlayıcılar bazı verileri kendi gizlilik bilgileri uyarınca bağımsız veri sorumluları olarak da işleyebilir.",
        ],
      },
      {
        id: "rights",
        title: "Haklarınız",
        paragraphs: [
          "İşlediğim kişisel veriler için erişim, düzeltme, silme veya işlemenin kısıtlanmasını talep edebilir ve işlem meşru menfaate dayanıyorsa itiraz edebilirsiniz. Yasal koşullar karşılandığında veri taşınabilirliği de talep edebilirsiniz. Benimle önce iletişime geçmeden Bulgaristan Kişisel Verileri Koruma Komisyonuna (CPDP / КЗЛД) veya başka bir yetkili denetim makamına şikâyette bulunabilirsiniz. Yalnızca tarayıcınızda bulunan uygulama kayıtlarına erişemem; bunları uygulamadan veya tarayıcınızdan yönetin ya da silin.",
          "Talebinizi e-posta ile gönderin. Kimliğiniz hakkında makul şüphelerim varsa doğrulama için gerekli bilgileri isteyebilirim. Talebi gereksiz gecikme olmadan ve normalde bir ay içinde yanıtlarım. Talep karmaşıksa veya çok sayıda talep varsa süreyi en fazla iki ay uzatabilir ve ilk ay içinde nedenini açıklarım. Bir sağlayıcının bağımsız veri sorumlusu olarak işlediği veriler için doğrudan o sağlayıcıya başvurun.",
        ],
      },
    ],
    resourcesTitle: "Yasal bilgiler",
    resources: [
      { label: "Genel Veri Koruma Tüzüğü (GDPR)", href: "https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng" },
      { label: "Bulgaristan Kişisel Verilerin Korunması Kanunu", href: "https://cpdp.bg/en/legislation/personal-data-protection-act/" },
    ],
  },
}

const privacyPaths: Record<PrivacyLocale, string> = {
  en: "/privacy",
  bg: "/bg/privacy",
  tr: "/tr/privacy",
}

const locales: { id: PrivacyLocale; label: string; href: string }[] = [
  { id: "en", label: "English", href: privacyPaths.en },
  { id: "bg", label: "Български", href: privacyPaths.bg },
  { id: "tr", label: "Türkçe", href: privacyPaths.tr },
]

export function PrivacyPolicy({ locale }: { locale: PrivacyLocale }) {
  const copy = policy[locale]

  return (
    <NoticeLayout
      title={copy.pageTitle}
      description={copy.pageDescription}
      lang={copy.lang}
      backLabel={copy.backLabel}
      privacyHref={privacyPaths[locale]}
      privacyLabel={copy.privacyLabel}
      licencesLabel={copy.licencesLabel}
    >
      <div className="max-w-[70ch] space-y-4">
        <Card className="gap-3 bg-accent/60 p-5 shadow-none">
          <p className="text-xs text-muted-foreground">
            <time dateTime="2026-11-22">{copy.updated}</time>
          </p>
          <nav aria-label={copy.languageLabel}>
            <ul className="flex flex-wrap gap-2 text-sm">
              {locales.map(item => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    lang={policy[item.id].lang}
                    aria-current={item.id === locale ? "page" : undefined}
                    className={"inline-flex min-h-10 items-center rounded-md border px-3 font-medium underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring " +
                      (item.id === locale ? "border-primary bg-accent text-foreground" : "text-primary hover:bg-accent hover:underline")}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-sm leading-relaxed">{copy.summary}</p>
        </Card>

        <Card className="gap-2 p-5 shadow-none">
          <h2 className="font-semibold">{copy.contentsTitle}</h2>
          <nav aria-label={copy.contentsLabel}>
            <ol className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {copy.sections.map(section => (
                <li key={section.id}>
                  <a className="text-primary underline underline-offset-4" href={"#" + section.id}>
                    {section.title}
                  </a>
                </li>
              ))}
              <li>
                <a className="text-primary underline underline-offset-4" href="#privacy-resources">
                  {copy.resourcesTitle}
                </a>
              </li>
            </ol>
          </nav>
        </Card>

        <Card className="gap-0 divide-y px-4 py-0 shadow-none sm:px-5">
          {copy.sections.map(section => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={section.id + "-heading"}
              className="scroll-mt-6 space-y-2 py-5"
            >
              <h2 id={section.id + "-heading"} className="text-lg font-semibold tracking-tight">
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph, index) => (
                <p key={section.id + "-p-" + index} className="text-sm leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
              {section.id === "controller" && (
                <p className="text-sm leading-relaxed">
                  <a className="text-primary underline underline-offset-4" href="mailto:baran@baranhq.com">
                    baran@baranhq.com
                  </a>
                </p>
              )}
              {section.id === "rights" && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <a
                    className="text-primary underline underline-offset-4"
                    href="https://cpdp.bg/en/lodging-complaints-and-alerts/"
                  >
                    {locale === "en" ? "Bulgarian CPDP complaint information" : locale === "bg" ? "Информация за жалби до КЗЛД" : "Bulgaristan Kişisel Verileri Koruma Komisyonuna şikâyet bilgileri"}
                  </a>
                </p>
              )}
            </section>
          ))}
          <section
            id="privacy-resources"
            aria-labelledby="privacy-resources-heading"
            className="scroll-mt-6 space-y-2 py-5"
          >
            <h2 id="privacy-resources-heading" className="text-lg font-semibold tracking-tight">
              {copy.resourcesTitle}
            </h2>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
              {copy.resources.map(resource => (
                <li key={resource.href}>
                  <a
                    className="text-primary underline underline-offset-4"
                    href={resource.href}
                    rel="noreferrer"
                  >
                    {resource.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </Card>
      </div>
    </NoticeLayout>
  )
}
