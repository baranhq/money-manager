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
    pageDescription: "How Baran’s Money Manager handles information when you use the app.",
    updated: "Last updated: 22 November 2026",
    languageLabel: "Policy language",
    contentsLabel: "Privacy Policy contents",
    contentsTitle: "On this page",
    summary: "No account is needed. Your financial records stay in this browser and are not sent to Baran through the app. Cloudflare and the shared host still process technical data to deliver and protect the site.",
    backLabel: "About & legal",
    privacyLabel: "Privacy",
    licencesLabel: "Licences",
    sections: [
      {
        id: "controller",
        title: "Controller and contact",
        paragraphs: [
          "The controller for website request information and privacy enquiries is Baran Ahmedov, an individual living in Bulgaria. For privacy questions or requests about data the controller can access, use the email address below.",
        ],
      },
      {
        id: "local-data",
        title: "Information kept on your device",
        paragraphs: [
          "Money Manager stores information in your current browser: profiles and their names and avatar choices; account names, types and opening balances; income and expense entries, including descriptions, amounts, dates, accounts, categories and notes; budgets; savings goals, targets and dates, plus deposits or withdrawals and notes; custom categories; and preferences such as currency, theme, date and number formats, and reduced motion. Details entered during first-run setup may also be saved there.",
          "The app uses these records on your device to provide the features you choose. It has no online accounts, bank connections or cloud sync, and it does not send your ledger, app password or imported files to an app server. Entries and notes may contain personal information about you or someone else, so avoid adding sensitive or unnecessary details.",
          "The app also remembers in this browser whether you completed or skipped the optional tour. Money Manager itself does not set cookies.",
        ],
      },
      {
        id: "requests",
        title: "Website requests, hosting logs and AWStats",
        paragraphs: [
          "Cloudflare delivers and protects the site. It may process your IP address, the page or file requested, the time of the request, browser or device details, network information and security signals.",
          "The shared hosting provider receives website requests and creates access logs. These may include an IP address, time, requested page or file, response status, browser details and referrer. AWStats is enabled through the hosting provider and creates traffic reports from those logs. This hosting-level processing is separate from your financial records stored in the browser.",
          "Cloudflare may use security cookies when a security feature requires them. The cookies used and how long they last depend on the feature and account settings. See Cloudflare’s cookie information below.",
        ],
      },
      {
        id: "purposes",
        title: "Why information is used",
        paragraphs: [
          "Website request information and AWStats reports are used to deliver, secure and maintain the site, troubleshoot problems, prevent abuse and understand overall traffic. Where the controller processes personal data for these purposes, the legal basis is legitimate interests in operating and protecting the site. You may object as described below. Providers may also process information under their own legal obligations.",
          "If you email the privacy address, the controller uses your email address, message, attachments and related message details to answer and manage your enquiry. The legal basis is legitimate interests in handling correspondence and, where relevant, legal claims; legal obligations may also apply.",
        ],
      },
      {
        id: "providers",
        title: "Providers and international transfers",
        paragraphs: [
          "Cloudflare provides content delivery and security. The shared hosting provider hosts the site, creates access logs and provides AWStats. Tuta Mail (Tutao GmbH) handles email sent to the privacy address. Their official privacy information is linked below.",
          "Cloudflare says it stores information mainly in the United States and the EEA, and may access or transfer it internationally. Its privacy policy and customer data terms describe transfer safeguards; which terms apply here depends on the site’s Cloudflare account. Tuta states that its data centres are in Germany. The hosting provider’s processing locations and transfer terms depend on its service arrangement.",
        ],
      },
      {
        id: "retention",
        title: "Storage, exports and deletion",
        paragraphs: [
          "Your browser records remain until you clear them in Money Manager, remove the site’s data in your browser, or the browser removes them under its own storage rules. Money Manager sets no expiry date for them. Hosting logs and AWStats reports follow the hosting provider’s retention schedule; Cloudflare records follow its service terms. Email correspondence is kept only as long as needed to answer the enquiry, handle related follow-up or claims, or meet legal obligations, and is reviewed periodically.",
          "You can import files and create JSON backups or CSV transaction exports in your browser. The JSON backup contains the selected profile’s records and preferences, but not its name or avatar; a CSV contains the transactions for the period you choose. You may password-protect exported files. Downloads stay on your device until you delete them.",
          "To clear a profile’s financial records, use Settings → Data & backup. The profile name and avatar and shared appearance preferences remain. Clearing this site’s data in your browser removes its local profiles, records, settings and app-lock information. Neither action deletes downloaded files.",
        ],
      },
      {
        id: "security",
        title: "Security",
        paragraphs: [
          "You can set a local app password and optionally encrypt the data stored in your browser. The password is not sent to a server. Without encryption, someone with access to your browser profile may be able to read the records. If you forget the password used to encrypt them, the app cannot recover them. These controls cannot protect data from someone who can access or alter your device, browser or the app. Keep your device and downloaded files private.",
        ],
      },
      {
        id: "decisions",
        title: "Children and automated decisions",
        paragraphs: [
          "Money Manager does not ask your age or verify parental consent. Bulgarian law requires consent from a parent or guardian when processing a child’s personal data under 14 is based on consent. The app calculates totals and budget or savings progress from your local entries for your own use; the controller does not use those records or calculations to profile you or make decisions with legal or similarly significant effects.",
        ],
      },
      {
        id: "rights",
        title: "Your rights",
        paragraphs: [
          "Depending on the circumstances, you may ask the controller to access, correct, erase or restrict personal data it can access. You may object to processing based on legitimate interests and request data portability where the legal conditions are met. You may also complain to a data-protection authority, including Bulgaria’s Commission for Personal Data Protection (CPDP / КЗЛД), without contacting the controller first.",
          "Email the address above to make a request. The controller may ask for reasonable information to identify the relevant data and protect it from disclosure to the wrong person. A response is normally due within one month. For complex or multiple requests, the law allows up to two additional months; you will be told within the first month if an extension is needed.",
          "The controller cannot inspect or remotely delete records kept only in your browser. Use Money Manager or your browser’s site-data controls to review, export or remove them.",
        ],
      },
      {
        id: "changes",
        title: "Changes to this policy",
        paragraphs: [
          "This policy will be updated if the app, its providers or its data handling changes. The date above shows when it was last revised.",
        ],
      },
    ],
    resourcesTitle: "Official and provider information",
    resources: [
      { label: "General Data Protection Regulation (GDPR)", href: "https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng" },
      { label: "Bulgarian Personal Data Protection Act", href: "https://cpdp.bg/en/legislation/personal-data-protection-act/" },
      { label: "Cloudflare Privacy Policy", href: "https://www.cloudflare.com/privacypolicy/" },
      { label: "Cloudflare cookie information", href: "https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/" },
      { label: "Cloudflare Customer Data Processing Addendum", href: "https://www.cloudflare.com/cloudflare-customer-dpa/" },
      { label: "Tuta Privacy Statement", href: "https://tuta.com/privacy-policy" },
    ],
  },
  bg: {
    lang: "bg-BG",
    pageTitle: "Политика за поверителност",
    pageDescription: "Как Baran’s Money Manager обработва информацията, когато използвате приложението.",
    updated: "Последна актуализация: 22 ноември 2026 г.",
    languageLabel: "Език на политиката",
    contentsLabel: "Съдържание на политиката за поверителност",
    contentsTitle: "В тази страница",
    summary: "Не е необходим акаунт. Финансовите ви записи остават в този браузър и приложението не ги изпраща до Baran. Cloudflare и доставчикът на споделения хостинг обработват технически данни, за да доставят и защитават сайта.",
    backLabel: "За приложението и правна информация",
    privacyLabel: "Поверителност",
    licencesLabel: "Лицензи",
    sections: [
      {
        id: "controller",
        title: "Администратор и контакт",
        paragraphs: [
          "Администратор на информацията за заявките към сайта и запитванията за поверителност е Baran Ahmedov — физическо лице, което живее в България. За въпроси или искания относно данни, до които администраторът има достъп, използвайте имейл адреса по-долу.",
        ],
      },
      {
        id: "local-data",
        title: "Информация, съхранявана на устройството ви",
        paragraphs: [
          "Money Manager съхранява в текущия ви браузър: профили, имената им и избраните аватари; имена и видове сметки и начални салда; записи за приходи и разходи с описания, суми, дати, сметки, категории и бележки; бюджети; спестовни цели, целеви суми и дати, както и вноски или тегления и бележки; персонализирани категории; и настройки като валута, тема, формати за дата и числа и намалено движение. Там може да се запазят и данните, въведени при първоначалната настройка.",
          "Приложението използва тези записи на устройството ви, за да предоставя избраните от вас функции. То няма онлайн акаунти, връзка с банки или синхронизиране в облак и не изпраща финансовата ви книга, паролата за приложението или импортираните файлове до сървър на приложението. Записите и бележките може да съдържат лични данни за вас или за друго лице; не добавяйте чувствителна или ненужна информация.",
          "Приложението запомня в този браузър дали сте завършили или пропуснали незадължителната обиколка. Самото Money Manager не задава бисквитки.",
        ],
      },
      {
        id: "requests",
        title: "Заявки към сайта, хостинг логове и AWStats",
        paragraphs: [
          "Cloudflare доставя и защитава сайта. Може да обработва IP адреса ви, заявената страница или файл, часа на заявката, данни за браузъра или устройството, мрежова информация и сигнали за сигурност.",
          "Доставчикът на споделения хостинг получава заявките към сайта и създава логове за достъп. Те може да съдържат IP адрес, час, заявена страница или файл, статус на отговора, данни за браузъра и източник на препращане. AWStats е включен чрез хостинг доставчика и създава справки за трафика от тези логове. Това обработване на ниво хостинг е отделно от финансовите записи в браузъра ви.",
          "Cloudflare може да използва бисквитки за сигурност, когато дадена защитна функция ги изисква. Бисквитките и срокът им зависят от функцията и настройките на акаунта. Вижте информацията на Cloudflare по-долу.",
        ],
      },
      {
        id: "purposes",
        title: "Защо се използва информацията",
        paragraphs: [
          "Информацията за заявките към сайта и справките на AWStats се използват за доставяне, защита и поддръжка на сайта, отстраняване на проблеми, предотвратяване на злоупотреби и разбиране на общия трафик. Когато администраторът обработва лични данни за тези цели, правното основание е легитимният интерес от управлението и защитата на сайта. Може да възразите, както е описано по-долу. Доставчиците може да обработват информация и за изпълнение на свои законови задължения.",
          "Ако пишете на адреса за поверителност, администраторът използва имейл адреса, съобщението, прикачените файлове и свързаните данни за съобщението, за да отговори и обработи запитването ви. Основанието е легитимен интерес от обработването на кореспонденцията и, когато е относимо, правни претенции; може да се прилагат и законови задължения.",
        ],
      },
      {
        id: "providers",
        title: "Доставчици и международни трансфери",
        paragraphs: [
          "Cloudflare предоставя услуги за доставка на съдържание и сигурност. Доставчикът на споделения хостинг хоства сайта, създава логовете за достъп и предоставя AWStats. Tuta Mail (Tutao GmbH) обработва имейлите, изпратени до адреса за поверителност. Официалната информация за поверителност на доставчиците е посочена по-долу.",
          "Cloudflare посочва, че съхранява информация главно в САЩ и ЕИП и може да има достъп до нея или да я прехвърля международно. Политиката му за поверителност и договорните условия за данни описват гаранциите за трансфер; приложимите за този сайт условия зависят от акаунта му в Cloudflare. Tuta посочва, че центровете му за данни са в Германия. Местоположенията и условията за трансфер на хостинг доставчика зависят от услугата му.",
        ],
      },
      {
        id: "retention",
        title: "Съхранение, експортиране и изтриване",
        paragraphs: [
          "Записите остават в браузъра ви, докато не ги изчистите в Money Manager, не премахнете данните на сайта чрез браузъра или браузърът не ги премахне съгласно собствените си правила. Money Manager не задава срок за автоматично изтриване. Логовете и справките на AWStats се съхраняват според графика на хостинг доставчика; записите на Cloudflare — според условията на услугата му. Имейл кореспонденцията се пази само докато е необходима за отговор, последваща комуникация, правни претенции или законови задължения и се преглежда периодично.",
          "Можете да импортирате файлове и да създавате JSON архиви или CSV експорти на транзакции в браузъра си. JSON архивът съдържа записите и настройките на избрания профил, но не и името или аватара му; CSV съдържа транзакциите за избрания от вас период. Можете да защитите експортираните файлове с парола. Изтеглените файлове остават на устройството ви, докато не ги изтриете.",
          "За да изчистите финансовите записи на профил, използвайте Settings → Data & backup. Името и аватарът на профила и общите настройки за изглед остават. Изтриването на данните на сайта в браузъра премахва локалните профили, записи, настройки и информацията за заключването на приложението. Нито едно от тези действия не изтрива изтеглените файлове.",
        ],
      },
      {
        id: "security",
        title: "Сигурност",
        paragraphs: [
          "Можете да зададете локална парола за приложението и по желание да шифровате данните в браузъра. Паролата не се изпраща до сървър. Без шифроване човек с достъп до профила ви в браузъра може да прочете записите. Ако забравите паролата за шифрованите данни, приложението не може да ги възстанови. Тези защити не предпазват данните от човек, който има достъп до устройството, браузъра или приложението ви, или може да ги променя. Пазете устройството и изтеглените файлове.",
        ],
      },
      {
        id: "decisions",
        title: "Деца и автоматизирани решения",
        paragraphs: [
          "Money Manager не иска възрастта ви и не проверява родителско съгласие. Българският закон изисква съгласие от родител или настойник, когато обработването на лични данни на дете под 14 години се основава на съгласие. Приложението изчислява общи суми и напредъка по бюджети или спестявания от локалните ви записи за ваша употреба; администраторът не използва тези записи или изчисления за профилиране или за решения с правни или сходно значими последици за вас.",
        ],
      },
      {
        id: "rights",
        title: "Вашите права",
        paragraphs: [
          "В зависимост от обстоятелствата може да поискате достъп, коригиране, изтриване или ограничаване на лични данни, до които администраторът има достъп. Може да възразите срещу обработване на основание легитимен интерес и да поискате преносимост, когато са изпълнени законовите условия. Може да подадете жалба до надзорен орган, включително до Комисията за защита на личните данни (КЗЛД), без първо да се свързвате с администратора.",
          "Изпратете искането си на имейл адреса по-горе. Администраторът може да поиска разумно необходима информация, за да установи относимите данни и да не ги разкрие на неправилно лице. Обичайният срок за отговор е един месец. При сложни или многобройни искания законът допуска удължаване с до още два месеца; ще бъдете уведомени през първия месец, ако е необходимо удължаване.",
          "Администраторът не може да преглежда или изтрива дистанционно записи, съхранявани само във вашия браузър. Използвайте Money Manager или настройките на браузъра за данните на сайта, за да ги прегледате, експортирате или премахнете.",
        ],
      },
      {
        id: "changes",
        title: "Промени в политиката",
        paragraphs: [
          "Тази политика ще бъде актуализирана при промяна на приложението, доставчиците или обработването на данни. Датата по-горе показва последната редакция.",
        ],
      },
    ],
    resourcesTitle: "Официална информация и политики на доставчиците",
    resources: [
      { label: "Общ регламент относно защитата на данните (GDPR)", href: "https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng" },
      { label: "Закон за защита на личните данни", href: "https://cpdp.bg/en/legislation/personal-data-protection-act/" },
      { label: "Политика за поверителност на Cloudflare", href: "https://www.cloudflare.com/privacypolicy/" },
      { label: "Информация на Cloudflare за бисквитките", href: "https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/" },
      { label: "Допълнение за обработване на данни на Cloudflare", href: "https://www.cloudflare.com/cloudflare-customer-dpa/" },
      { label: "Декларация за поверителност на Tuta", href: "https://tuta.com/privacy-policy" },
    ],
  },
  tr: {
    lang: "tr-TR",
    pageTitle: "Gizlilik Politikası",
    pageDescription: "Baran’s Money Manager uygulamasını kullandığınızda bilgilerin nasıl işlendiği.",
    updated: "Son güncelleme: 22 Kasım 2026",
    languageLabel: "Politika dili",
    contentsLabel: "Gizlilik Politikası içeriği",
    contentsTitle: "Bu sayfada",
    summary: "Hesap gerekmez. Finansal kayıtlarınız bu tarayıcıda kalır ve uygulama aracılığıyla Baran’a gönderilmez. Cloudflare ve paylaşımlı barındırma sağlayıcısı, siteyi sunmak ve korumak için teknik verileri yine de işler.",
    backLabel: "Hakkında ve yasal bilgiler",
    privacyLabel: "Gizlilik",
    licencesLabel: "Lisanslar",
    sections: [
      {
        id: "controller",
        title: "Veri sorumlusu ve iletişim",
        paragraphs: [
          "Site istekleri ve gizlilik başvuruları için veri sorumlusu, Bulgaristan’da yaşayan birey Baran Ahmedov’dur. Gizlilik soruları veya veri sorumlusunun erişebildiği verilerle ilgili talepler için aşağıdaki e-posta adresini kullanın.",
        ],
      },
      {
        id: "local-data",
        title: "Cihazınızda tutulan bilgiler",
        paragraphs: [
          "Money Manager bilgileri kullandığınız tarayıcıda saklar: profiller, adları ve avatar seçimleri; hesap adları, türleri ve açılış bakiyeleri; açıklama, tutar, tarih, hesap, kategori ve notları içeren gelir ve gider kayıtları; bütçeler; birikim hedefleri, hedef tutarları ve tarihleri ile yatırma veya çekme işlemleri ve notları; özel kategoriler; para birimi, tema, tarih ve sayı biçimleri ve azaltılmış hareket tercihi gibi ayarlar. İlk kurulum sırasında girdiğiniz bilgiler de burada saklanabilir.",
          "Uygulama bu kayıtları seçtiğiniz özellikleri sunmak için cihazınızda işler. Çevrim içi hesap, banka bağlantısı veya bulut eşitleme yoktur; uygulama finansal kayıtlarınızı, uygulama parolanızı veya içe aktardığınız dosyaları uygulama sunucusuna göndermez. Kayıtlar ve notlar sizin veya başka bir kişinin kişisel bilgilerini içerebilir; hassas ya da gereksiz ayrıntılar eklemeyin.",
          "Uygulama, isteğe bağlı tanıtımı tamamlayıp tamamlamadığınızı veya atlayıp atlamadığınızı bu tarayıcıda hatırlar. Money Manager’ın kendisi çerez ayarlamaz.",
        ],
      },
      {
        id: "requests",
        title: "Site istekleri, barındırma günlükleri ve AWStats",
        paragraphs: [
          "Cloudflare siteyi sunar ve korur. IP adresinizi, istenen sayfa veya dosyayı, istek saatini, tarayıcı ya da cihaz bilgilerini, ağ bilgilerini ve güvenlik sinyallerini işleyebilir.",
          "Paylaşımlı barındırma sağlayıcısı site isteklerini alır ve erişim günlükleri oluşturur. Bu günlüklerde IP adresi, saat, istenen sayfa veya dosya, yanıt durumu, tarayıcı bilgileri ve yönlendiren site bulunabilir. AWStats barındırma sağlayıcısı üzerinden etkinleştirilmiştir ve bu günlüklerden trafik raporları oluşturur. Bu barındırma işlemleri tarayıcıda saklanan finansal kayıtlarınızdan ayrıdır.",
          "Cloudflare, bir güvenlik özelliği gerektirdiğinde güvenlik çerezleri kullanabilir. Kullanılan çerezler ve saklama süreleri ilgili özelliğe ve hesap ayarlarına bağlıdır. Aşağıdaki Cloudflare çerez bilgilerine bakın.",
        ],
      },
      {
        id: "purposes",
        title: "Bilgilerin kullanım amacı",
        paragraphs: [
          "Site istek bilgileri ve AWStats raporları siteyi sunmak, korumak ve sürdürmek; sorunları gidermek; kötüye kullanımı önlemek ve genel trafiği anlamak için kullanılır. Veri sorumlusunun bu amaçlarla işlediği kişisel veriler için hukuki dayanak, siteyi işletme ve korumaya yönelik meşru menfaattir. Aşağıda açıklandığı şekilde itiraz edebilirsiniz. Hizmet sağlayıcılar kendi yasal yükümlülükleri kapsamında da bilgi işleyebilir.",
          "Gizlilik adresine e-posta gönderirseniz veri sorumlusu e-posta adresinizi, mesajınızı, eklerinizi ve ilgili iletişim bilgilerini başvurunuzu yanıtlamak ve yönetmek için kullanır. Hukuki dayanak, yazışmaları ve gerektiğinde hukuki talepleri yürütmeye yönelik meşru menfaattir; yasal yükümlülükler de geçerli olabilir.",
        ],
      },
      {
        id: "providers",
        title: "Sağlayıcılar ve uluslararası aktarımlar",
        paragraphs: [
          "Cloudflare içerik dağıtımı ve güvenlik hizmeti sunar. Paylaşımlı barındırma sağlayıcısı siteyi barındırır, erişim günlüklerini oluşturur ve AWStats hizmetini sağlar. Gizlilik adresine gönderilen e-postaları Tuta Mail (Tutao GmbH) işler. Sağlayıcıların resmî gizlilik bilgileri aşağıda bağlantılıdır.",
          "Cloudflare bilgileri ağırlıklı olarak ABD ve AEA’da sakladığını, bunlara uluslararası olarak erişebileceğini veya aktarabileceğini belirtir. Gizlilik politikası ve müşteri veri koşulları aktarım güvencelerini açıklar; bu siteye hangi koşulların uygulandığı Cloudflare hesabına bağlıdır. Tuta, veri merkezlerinin Almanya’da olduğunu belirtir. Barındırma sağlayıcısının veri konumları ve aktarım koşulları kullandığı hizmete bağlıdır.",
        ],
      },
      {
        id: "retention",
        title: "Saklama, dışa aktarma ve silme",
        paragraphs: [
          "Kayıtlarınız Money Manager’da temizleyene, tarayıcınızda site verilerini kaldırana veya tarayıcı kendi saklama kuralları gereği silene kadar tarayıcıda kalır. Money Manager otomatik silme süresi belirlemez. Barındırma günlükleri ve AWStats raporları sağlayıcının saklama takvimine; Cloudflare kayıtları kendi hizmet koşullarına göre saklanır. E-posta yazışmaları yalnızca yanıt vermek, ilgili takibi veya hukuki talepleri yürütmek ya da yasal yükümlülükleri karşılamak için gerektiği sürece tutulur ve düzenli olarak gözden geçirilir.",
          "Dosyaları tarayıcıda içe aktarabilir, JSON yedeği veya CSV işlem dışa aktarımı oluşturabilirsiniz. JSON yedeği seçilen profilin kayıtlarını ve tercihlerini içerir, profil adını veya avatarını içermez; CSV seçtiğiniz dönemin işlemlerini içerir. Dışa aktarılan dosyaları parola ile koruyabilirsiniz. İndirilen dosyaları siz silene kadar cihazınızda kalır.",
          "Bir profilin finansal kayıtlarını temizlemek için Settings → Data & backup bölümünü kullanın. Profilin adı ve avatarı ile ortak görünüm tercihleri kalır. Tarayıcıda bu sitenin verilerini silmek, yerel profilleri, kayıtları, ayarları ve uygulama kilidi bilgilerini kaldırır. İndirilen dosyalar bu işlemlerle silinmez.",
        ],
      },
      {
        id: "security",
        title: "Güvenlik",
        paragraphs: [
          "Yerel bir uygulama parolası belirleyebilir ve tarayıcıda saklanan verileri isteğe bağlı olarak şifreleyebilirsiniz. Parola sunucuya gönderilmez. Şifreleme kapalıysa tarayıcı profilinize erişebilen biri kayıtları okuyabilir. Şifrelenen verilerin parolasını unutursanız uygulama verileri kurtaramaz. Bu kontroller, cihazınıza, tarayıcınıza veya uygulamaya erişebilen ya da bunları değiştirebilen kişilere karşı koruma sağlamaz. Cihazınızı ve indirdiğiniz dosyaları koruyun.",
        ],
      },
      {
        id: "decisions",
        title: "Çocuklar ve otomatik kararlar",
        paragraphs: [
          "Money Manager yaşınızı sormaz veya ebeveyn onayını doğrulamaz. Çocuğun 14 yaşından küçük olduğu ve kişisel verilerinin işlenmesinin rızaya dayandığı durumlarda Bulgaristan hukuku ebeveyn veya vasinin rızasını gerektirir. Uygulama, kendi kullanımınız için yerel kayıtlarınızdan toplamları ve bütçe ya da birikim ilerlemesini hesaplar; veri sorumlusu bu kayıtları veya hesaplamaları sizi profillemek ya da hakkınızda hukuki veya benzer ölçüde önemli etkileri olan kararlar vermek için kullanmaz.",
        ],
      },
      {
        id: "rights",
        title: "Haklarınız",
        paragraphs: [
          "Koşullara bağlı olarak veri sorumlusunun erişebildiği kişisel verilere erişme, bunları düzeltme, silme veya işlemeyi kısıtlama hakkınız olabilir. Meşru menfaate dayalı işlemeye itiraz edebilir ve yasal koşullar karşılandığında veri taşınabilirliği talep edebilirsiniz. Veri sorumlusuyla önce iletişime geçmeden Bulgaristan Kişisel Verileri Koruma Komisyonuna (CPDP / КЗЛД) veya başka bir veri koruma makamına şikâyette bulunabilirsiniz.",
          "Talep için yukarıdaki e-posta adresini kullanın. Veri sorumlusu ilgili verileri belirlemek ve yanlış kişiye açıklanmasını önlemek için makul ölçüde gerekli bilgileri isteyebilir. Yanıt normalde bir ay içinde verilir. Karmaşık veya birden fazla talep için yasa iki aya kadar ek süreye izin verir; uzatma gerekiyorsa ilk ay içinde bilgilendirilirsiniz.",
          "Veri sorumlusu yalnızca tarayıcınızda tutulan kayıtları göremez veya uzaktan silemez. Bunları incelemek, dışa aktarmak ya da kaldırmak için Money Manager’ı veya tarayıcınızın site verisi ayarlarını kullanın.",
        ],
      },
      {
        id: "changes",
        title: "Politikadaki değişiklikler",
        paragraphs: [
          "Uygulama, sağlayıcıları veya veri işleme yöntemleri değişirse bu politika güncellenir. Yukarıdaki tarih son düzenlemeyi gösterir.",
        ],
      },
    ],
    resourcesTitle: "Resmî kaynaklar ve sağlayıcı bilgileri",
    resources: [
      { label: "Genel Veri Koruma Tüzüğü (GDPR)", href: "https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng" },
      { label: "Bulgaristan Kişisel Verilerin Korunması Kanunu", href: "https://cpdp.bg/en/legislation/personal-data-protection-act/" },
      { label: "Cloudflare Gizlilik Politikası", href: "https://www.cloudflare.com/privacypolicy/" },
      { label: "Cloudflare çerez bilgileri", href: "https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/" },
      { label: "Cloudflare Müşteri Veri İşleme Eki", href: "https://www.cloudflare.com/cloudflare-customer-dpa/" },
      { label: "Tuta Gizlilik Beyanı", href: "https://tuta.com/privacy-policy" },
    ],
  },
}

const locales: { id: PrivacyLocale; label: string; href: string }[] = [
  { id: "en", label: "English", href: "/privacy" },
  { id: "bg", label: "Български", href: "/bg/privacy" },
  { id: "tr", label: "Türkçe", href: "/tr/privacy" },
]

export function PrivacyPolicy({ locale }: { locale: PrivacyLocale }) {
  const copy = policy[locale]

  return (
    <NoticeLayout
      title={copy.pageTitle}
      description={copy.pageDescription}
      lang={copy.lang}
      backLabel={copy.backLabel}
      privacyHref={locale === "bg" ? "/bg/privacy" : locale === "tr" ? "/tr/privacy" : "/privacy"}
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
                    {locale === "en" ? "Bulgarian CPDP complaint information" : locale === "bg" ? "Информация за жалби до КЗЛД" : "Bulgaristan CPDP şikâyet bilgileri"}
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
