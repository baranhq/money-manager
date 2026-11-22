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
    summary: "Money Manager stores your financial records in this browser and does not upload them. This notice covers website requests, hosting logs, AWStats reports and messages sent to me.",
    backLabel: "About & legal",
    privacyLabel: "Privacy",
    licencesLabel: "Licences",
    sections: [
      {
        id: "controller",
        title: "Controller and contact",
        paragraphs: [
          "I am Baran Ahmedov, an individual controller for personal data I process in connection with this website and privacy enquiries. You can contact me at the email address below.",
        ],
      },
      {
        id: "app-data",
        title: "Information stored by the app",
        paragraphs: [
          "Money Manager stores profiles, accounts, transactions, budgets, savings records and preferences in your browser. It has no online account, bank connection or cloud sync.",
          "The app does not upload these records, imported files or your app password. I cannot access or delete the records remotely. You can clear a profile’s records in the app or remove this site’s data in your browser settings. Downloaded files are separate and are not deleted by either action.",
          "The app checks your password locally. The password alone locks access but does not encrypt stored records. You can enable storage encryption separately; if you lose the password, the app cannot recover encrypted records. The app also stores whether you completed or skipped its tour in browser storage. Money Manager itself does not set cookies.",
        ],
      },
      {
        id: "website-data",
        title: "Website requests, hosting logs and providers",
        paragraphs: [
          "Cloudflare delivers and protects the website. It receives technical request and connection information, which may include your IP address, requested page or resource, request time, browser or device details, network information and security signals. Depending on the features in use, Cloudflare may set security cookies. See its official privacy policy and cookie information.",
          "The hosting provider automatically creates access logs for requests it receives. Depending on its server configuration, logs may include your IP address, date and time, requested URL or resource, HTTP status, browser or user-agent information, referrer and other technical request details. The hosting company provides AWStats and has it enabled on this hosting account. AWStats is a traffic-reporting tool that produces reports from access logs; I use them to understand overall website traffic. This is hosting-level processing, separate from your financial records in the app.",
          "The hosting provider manages these logs and reports. My control over the fields recorded, configuration and retention is limited. Retention depends on the provider’s settings and service terms; I cannot state a fixed period.",
          "I rely on my legitimate interests in delivering, operating and protecting the website and understanding its overall traffic for processing purposes I determine. You may object to processing based on legitimate interests as described below. The hosting, website-delivery and email providers act as my processors when they process personal data on my behalf and under my instructions. If a provider determines its own purposes and means, it acts as an independent controller and is responsible for its own processing. These roles depend on the service and processing in use. Contact an independent controller about its processing.",
          "Cloudflare and the hosting provider may process information outside Bulgaria and, where applicable, outside the EEA. Actual locations and transfer arrangements depend on the service and account terms. Cloudflare publishes a Data Processing Addendum and EU Standard Contractual Clauses, but their publication does not show which terms apply to this site. Contact me for information or a copy of safeguards applicable to transfers by providers acting on my behalf. For independent-controller processing, see the provider’s privacy information or contact it directly.",
        ],
      },
      {
        id: "contact-retention",
        title: "Messages and retention",
        paragraphs: [
          "If you email me, I process your email address, message, attachments and other information you include to reply and handle necessary follow-up. I rely on legitimate interests in handling correspondence and related legal claims, and on legal obligations where applicable, including for data protection requests. Providing information is voluntary, but I may be unable to respond or act without enough detail.",
          "I keep correspondence only as long as needed to respond, handle related follow-up or legal claims, or meet legal obligations. The email provider also processes messages to provide its service and may retain them under its own service terms and settings. App records remain in your browser until you delete them or the browser removes them.",
        ],
      },
      {
        id: "rights",
        title: "Your rights",
        paragraphs: [
          "For personal data I process, you may request access, correction, erasure or restriction where the law allows, and object to processing based on legitimate interests. You may complain to Bulgaria’s Commission for Personal Data Protection (CPDP / КЗЛД) or another competent supervisory authority without contacting me first. I cannot access browser-only app records to act on such a request; manage them in the app or your browser.",
          "Email the address above to make a request. If I have reasonable doubts about your identity, I may ask for information needed to verify it. I will respond without undue delay and normally within one month of receiving the request. If it is complex or I receive numerous requests, I may extend the period by up to two further months. I will tell you within the first month and explain why.",
          "For personal data a provider processes as an independent controller, contact that provider under its own privacy information.",
        ],
      },
    ],
    resourcesTitle: "Legal and provider information",
    resources: [
      { label: "General Data Protection Regulation (GDPR)", href: "https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng" },
      { label: "Bulgarian Personal Data Protection Act", href: "https://cpdp.bg/en/legislation/personal-data-protection-act/" },
      { label: "Cloudflare Privacy Policy", href: "https://www.cloudflare.com/privacypolicy/" },
      { label: "Cloudflare cookie information", href: "https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/" },
      { label: "Cloudflare Data Processing Addendum", href: "https://www.cloudflare.com/cloudflare-customer-dpa/" },
      { label: "Cloudflare EU Standard Contractual Clauses", href: "https://www.cloudflare.com/cloudflare-customer-scc/" },
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
    summary: "Money Manager съхранява финансовите ви записи в този браузър и не ги качва на сървър. Тази информация обхваща заявките към сайта, хостинг логовете, отчетите от AWStats и съобщенията, които ми изпращате.",
    backLabel: "За приложението и правна информация",
    privacyLabel: "Поверителност",
    licencesLabel: "Лицензи",
    sections: [
      {
        id: "controller",
        title: "Администратор и контакт",
        paragraphs: [
          "Аз съм Baran Ahmedov — физическо лице и администратор на личните данни, които обработвам във връзка със сайта и запитванията за поверителност. Свържете се с мен на имейл адреса по-долу.",
        ],
      },
      {
        id: "app-data",
        title: "Информация, съхранявана от приложението",
        paragraphs: [
          "Money Manager съхранява профили, сметки, транзакции, бюджети, записи за спестявания и предпочитания в браузъра ви. Приложението няма онлайн акаунт, връзка с банка или синхронизиране в облак.",
          "Приложението не качва тези записи, импортираните файлове или паролата за приложението. Не мога да преглеждам или изтривам записите от разстояние. Можете да изчистите записите на даден профил в приложението или да премахнете данните на сайта от настройките на браузъра. Изтеглените файлове са отделни и не се изтриват при нито едно от тези действия.",
          "Приложението проверява паролата ви локално. Паролата сама по себе си заключва достъпа, но не шифрова записите. Можете отделно да включите шифроване на данните; ако загубите паролата, приложението не може да възстанови шифрованите записи. Приложението също съхранява в браузъра дали сте завършили или пропуснали обиколката. Самото Money Manager не задава бисквитки.",
        ],
      },
      {
        id: "website-data",
        title: "Заявки към сайта, хостинг логове и доставчици",
        paragraphs: [
          "Cloudflare доставя и защитава сайта. Получава техническа информация за заявките и връзката, която може да включва IP адреса ви, заявената страница или ресурс, часа на заявката, данни за браузъра или устройството, мрежова информация и сигнали за сигурност. Според активните функции Cloudflare може да задава бисквитки за сигурност. Вижте официалната му политика за поверителност и информацията за бисквитките.",
          "Хостинг доставчикът автоматично създава логове за заявките, които получава. В зависимост от конфигурацията на сървъра те може да включват IP адрес, дата и час, заявен URL адрес или ресурс, HTTP статус, информация за браузъра или user-agent, източник на препращане и други технически данни за заявката. Хостинг компанията предоставя AWStats и го е включила за този хостинг акаунт. AWStats е инструмент за отчети за трафика, който създава отчети от логовете; използвам ги, за да разбирам общия трафик към сайта. Това обработване на ниво хостинг е отделно от финансовите ви записи в приложението.",
          "Хостинг доставчикът управлява тези логове и отчети. Контролът ми върху записваните полета, конфигурацията и срока на съхранение е ограничен. Срокът зависи от настройките и условията на доставчика; не мога да посоча фиксиран период.",
          "Позовавам се на легитимните си интереси да доставям, управлявам и защитавам сайта и да разбирам общия трафик за обработването, чиито цели определям. Можете да възразите срещу обработване на това основание, както е описано по-долу. Хостинг доставчикът, Cloudflare и доставчикът на имейл са мои обработващи, когато обработват лични данни от мое име и по мои инструкции. Ако доставчик сам определя целите и средствата, той е самостоятелен администратор и отговаря за собственото си обработване. Тези роли зависят от услугата и конкретното обработване. За обработване от самостоятелен администратор се обърнете към него.",
          "Cloudflare и хостинг доставчикът могат да обработват информация извън България и, когато е приложимо, извън Европейското икономическо пространство (ЕИП). Действителните местоположения и условията за трансфер зависят от услугата и акаунта. Cloudflare публикува Допълнение за обработване на данни и Стандартни договорни клаузи на ЕС, но публикуването им не показва кои условия важат за този сайт. Свържете се с мен за информация или копие от гаранциите, приложими към трансфери от доставчици, които обработват данни от мое име. За обработване от самостоятелен администратор вижте неговата информация за поверителност или се обърнете директно към него.",
        ],
      },
      {
        id: "contact-retention",
        title: "Съобщения и съхранение",
        paragraphs: [
          "Ако ми пишете по имейл, обработвам адреса ви, съобщението, прикачените файлове и другата включена информация, за да отговоря и да предприема необходимите последващи действия. За кореспонденцията и свързаните правни претенции се позовавам на легитимен интерес, а когато е приложимо — на законови задължения, включително при искания за защита на данните. Предоставянето на информация е доброволно, но без достатъчно подробности може да не успея да отговоря или да изпълня искането.",
          "Съхранявам кореспонденцията само докато е необходима за отговор, свързани последващи действия или правни претенции, или за изпълнение на законови задължения. Доставчикът на имейл също обработва съобщенията, за да предоставя услугата си, и може да ги съхранява според собствените си условия и настройки. Записите в приложението остават в браузъра, докато не ги изтриете или браузърът не ги премахне.",
        ],
      },
      {
        id: "rights",
        title: "Вашите права",
        paragraphs: [
          "За личните данни, които обработвам, можете да поискате достъп, коригиране, изтриване или ограничаване на обработването, когато законът го допуска, и да възразите срещу обработване на основание легитимен интерес. Можете да подадете жалба до Комисията за защита на личните данни (КЗЛД) или друг компетентен надзорен орган, без първо да се свързвате с мен. Нямам достъп до записите в приложението, които се съхраняват само във вашия браузър; управлявайте ги от приложението или браузъра.",
          "Изпратете искането си на имейл адреса по-горе. Ако имам основателни съмнения относно самоличността ви, мога да поискам информация, необходима за потвърждаването ѝ. Ще отговоря без ненужно забавяне и обикновено в срок до един месец от получаването на искането. При сложно искане или многобройни искания мога да удължа срока с до още два месеца. Ще ви уведомя през първия месец и ще посоча причините.",
          "За лични данни, които доставчик обработва като самостоятелен администратор, се обърнете към него съгласно собствената му информация за поверителност.",
        ],
      },
    ],
    resourcesTitle: "Правна информация и доставчици",
    resources: [
      { label: "Общ регламент относно защитата на данните (GDPR)", href: "https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng" },
      { label: "Закон за защита на личните данни", href: "https://cpdp.bg/en/legislation/personal-data-protection-act/" },
      { label: "Политика за поверителност на Cloudflare", href: "https://www.cloudflare.com/privacypolicy/" },
      { label: "Информация на Cloudflare за бисквитките", href: "https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/" },
      { label: "Допълнение за обработване на данни на Cloudflare", href: "https://www.cloudflare.com/cloudflare-customer-dpa/" },
      { label: "Стандартни договорни клаузи на ЕС на Cloudflare", href: "https://www.cloudflare.com/cloudflare-customer-scc/" },
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
    summary: "Money Manager finansal kayıtlarınızı bu tarayıcıda saklar ve yüklemez. Bu bildirim; site isteklerini, barındırma günlüklerini, AWStats raporlarını ve bana gönderdiğiniz mesajları kapsar.",
    backLabel: "Hakkında ve yasal bilgiler",
    privacyLabel: "Gizlilik",
    licencesLabel: "Lisanslar",
    sections: [
      {
        id: "controller",
        title: "Veri sorumlusu ve iletişim",
        paragraphs: [
          "Ben Baran Ahmedov. Bu web sitesiyle bağlantılı olarak ve gizlilik başvurularını yanıtlarken işlediğim kişisel verilerin veri sorumlusuyum. Aşağıdaki e-posta adresinden bana ulaşabilirsiniz.",
        ],
      },
      {
        id: "app-data",
        title: "Uygulamanın sakladığı bilgiler",
        paragraphs: [
          "Money Manager profilleri, hesapları, işlemleri, bütçeleri, birikim kayıtlarını ve tercihleri tarayıcınızda saklar. Çevrim içi hesabı, banka bağlantısı veya bulut eşitlemesi yoktur.",
          "Uygulama bu kayıtları, içe aktarılan dosyaları veya uygulama parolanızı yüklemez. Kayıtlara uzaktan erişemem veya bunları silemem. Bir profile ait kayıtları uygulamadan silebilir ya da bu sitenin verilerini tarayıcı ayarlarından kaldırabilirsiniz. İndirilen dosyalar ayrıdır ve bu işlemlerle silinmez.",
          "Uygulama parolanızı yerel olarak doğrular. Parola tek başına erişimi kilitler, ancak kayıtları şifrelemez. Depolama şifrelemesini ayrıca açabilirsiniz; parolayı kaybederseniz uygulama şifrelenmiş kayıtları kurtaramaz. Uygulama ayrıca tanıtımı tamamlayıp tamamlamadığınızı tarayıcıda saklar. Money Manager kendi çerezlerini ayarlamaz.",
        ],
      },
      {
        id: "website-data",
        title: "Site istekleri, barındırma günlükleri ve sağlayıcılar",
        paragraphs: [
          "Cloudflare siteyi sunar ve korur. IP adresiniz, istediğiniz sayfa veya kaynak, istek zamanı, tarayıcı ya da cihaz bilgileri, ağ bilgileri ve güvenlik sinyalleri gibi teknik istek ve bağlantı bilgilerini alır. Kullanılan özelliklere bağlı olarak güvenlik çerezleri ayarlayabilir. Resmî gizlilik politikasına ve çerez bilgilerine bakın.",
          "Barındırma sağlayıcısı aldığı istekler için erişim günlüklerini otomatik oluşturur. Sunucu ayarlarına bağlı olarak bu günlüklerde IP adresi, tarih ve saat, istenen URL veya kaynak, HTTP durum kodu, tarayıcı veya user-agent bilgisi, yönlendiren sayfa ve diğer teknik istek bilgileri bulunabilir. Barındırma şirketi AWStats hizmetini sağlar ve bu hesapta etkinleştirmiştir. AWStats erişim günlüklerinden trafik raporları üreten bir araçtır; bu raporları sitenin genel trafiğini anlamak için kullanırım. Bu barındırma işlemi, uygulamadaki finansal kayıtlarınızdan ayrıdır.",
          "Barındırma sağlayıcısı bu günlükleri ve raporları yönetir. Kaydedilen alanlar, yapılandırma ve saklama süresi üzerindeki kontrolüm sınırlıdır. Saklama süresi sağlayıcının ayarlarına ve hizmet koşullarına bağlıdır; sabit bir süre veremiyorum.",
          "Amaçlarını belirlediğim işlemlerde siteyi sunma, işletme, koruma ve genel trafiği anlama konusundaki meşru menfaatime dayanırım. Aşağıda açıklandığı şekilde meşru menfaate dayalı işlemeye itiraz edebilirsiniz. Barındırma, site dağıtım ve e-posta sağlayıcıları kişisel verileri benim adıma ve talimatlarıma göre işlerken veri işleyenimdir. Bir sağlayıcı işlemenin amaç ve araçlarını kendisi belirlediğinde bağımsız veri sorumlusu olur ve kendi işlemesinden sorumludur. Bu roller kullanılan hizmete ve işleme faaliyetine bağlıdır. Bağımsız veri sorumlusunun işlemesi için doğrudan ona başvurun.",
          "Cloudflare ve barındırma sağlayıcısı bilgileri Bulgaristan dışında ve uygun olduğu durumlarda Avrupa Ekonomik Alanı (AEA) dışında işleyebilir. Gerçek konumlar ve aktarım koşulları hizmete ve hesap koşullarına bağlıdır. Cloudflare bir Veri İşleme Eki ve AB Standart Sözleşme Maddeleri yayımlar, ancak bunların yayımlanmış olması bu site için hangi koşulların geçerli olduğunu göstermez. Benim adıma veri işleyen sağlayıcıların aktarımlarına uygulanan güvenceler hakkında bilgi veya bu güvencelerin bir kopyasını benden isteyebilirsiniz. Bağımsız veri sorumlusunun işlemesi için gizlilik bilgilerine bakın veya doğrudan ona başvurun.",
        ],
      },
      {
        id: "contact-retention",
        title: "Mesajlar ve saklama",
        paragraphs: [
          "Bana e-posta gönderirseniz, yanıt vermek ve gerekli takibi yürütmek için e-posta adresinizi, mesajınızı, ekleri ve eklediğiniz diğer bilgileri işlerim. Yazışmalar ve ilgili hukuki talepler için meşru menfaatime, gerektiğinde veri koruma taleplerini yanıtlama gibi yasal yükümlülüklere dayanırım. Bilgi vermek isteğe bağlıdır; yeterli ayrıntı olmadan yanıt veremeyebilir veya talebi yerine getiremeyebilirim.",
          "Yazışmaları yalnızca yanıt vermek, ilgili takibi veya hukuki talepleri yürütmek ya da yasal yükümlülükleri karşılamak için gerektiği süre boyunca saklarım. E-posta sağlayıcısı da hizmetini sunmak için mesajları işler ve kendi hizmet koşulları ile ayarlarına göre saklayabilir. Uygulama kayıtları siz silene veya tarayıcı kaldırana kadar tarayıcınızda kalır.",
        ],
      },
      {
        id: "rights",
        title: "Haklarınız",
        paragraphs: [
          "İşlediğim kişisel veriler için, yasanın izin verdiği ölçüde erişim, düzeltme, silme veya işlemeyi kısıtlama talep edebilir ve meşru menfaate dayalı işlemeye itiraz edebilirsiniz. Benimle önce iletişime geçmeden Bulgaristan Kişisel Verileri Koruma Komisyonuna (CPDP / КЗЛД) veya başka bir yetkili denetim makamına şikâyette bulunabilirsiniz. Yalnızca tarayıcınızda saklanan uygulama kayıtlarına erişemem; bunları uygulamadan veya tarayıcınızdan yönetin.",
          "Talebinizi yukarıdaki e-posta adresine gönderin. Kimliğiniz hakkında makul şüphelerim varsa doğrulama için gerekli bilgileri isteyebilirim. Talebi aldıktan sonra gereksiz gecikme olmadan ve normalde bir ay içinde yanıt veririm. Talep karmaşıksa veya çok sayıda talep varsa süreyi en fazla iki ay uzatabilirim. İlk ay içinde sizi bilgilendirir ve nedeni açıklarım.",
          "Bir sağlayıcının bağımsız veri sorumlusu olarak işlediği kişisel veriler için kendi gizlilik bilgileri uyarınca o sağlayıcıya başvurun.",
        ],
      },
    ],
    resourcesTitle: "Yasal ve sağlayıcı bilgileri",
    resources: [
      { label: "Genel Veri Koruma Tüzüğü (GDPR)", href: "https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng" },
      { label: "Bulgaristan Kişisel Verilerin Korunması Kanunu", href: "https://cpdp.bg/en/legislation/personal-data-protection-act/" },
      { label: "Cloudflare Gizlilik Politikası", href: "https://www.cloudflare.com/privacypolicy/" },
      { label: "Cloudflare çerez bilgileri", href: "https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/" },
      { label: "Cloudflare Veri İşleme Eki", href: "https://www.cloudflare.com/cloudflare-customer-dpa/" },
      { label: "Cloudflare AB Standart Sözleşme Maddeleri", href: "https://www.cloudflare.com/cloudflare-customer-scc/" },
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
