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
    summary: "No account is required. Your financial records stay in this browser. Cloudflare and the hosting provider still process technical request information when they deliver and protect the site.",
    backLabel: "About & legal",
    privacyLabel: "Privacy",
    licencesLabel: "Licences",
    sections: [
      {
        id: "controller",
        title: "Controller and contact",
        paragraphs: [
          "The controller for website request information and messages sent to the privacy contact is Baran Ahmedov, an individual based in Bulgaria. For privacy questions or to exercise your rights, contact the controller using the address below.",
          "Money Manager does not send the financial records you enter to the controller through the app’s features. The app does not provide online registration, user accounts, bank connections or cloud synchronisation.",
        ],
      },
      {
        id: "local-data",
        title: "Information you enter and keep in your browser",
        paragraphs: [
          "Money Manager stores a local workspace in your browser. Depending on what you choose to enter, it can contain profile names and selected avatar colours and icons; account names, types and opening balances; income and expense entries, amounts, dates, descriptions, categories, account labels and notes; budgets; savings pots, targets, dates, deposits, withdrawals and notes; custom categories; and currency, theme, regional date and number formats, and reduced-motion preferences. The initial setup draft can also contain the account name, balance and preferences you enter before finishing or skipping setup.",
          "These fields are free text in places. They may identify you or another person, and you should avoid adding sensitive or unnecessary details. Money Manager does not ask for bank passwords or connect to your bank.",
        ],
      },
      {
        id: "browser-storage",
        title: "Browser storage and local security",
        paragraphs: [
          "The workspace is kept in IndexedDB in this browser, in a database named money-manager. The app also keeps its site-password settings there. A site password is a local app lock, not an online account. Storage encryption is optional: if you enable it, the browser encrypts the local workspace using a key derived from your password; if you do not, the records remain readable to someone with access to this browser profile. The password is not sent to the controller. There is no password reset, and encrypted records cannot be recovered if you forget it.",
          "The app uses browser local storage only to remember whether you completed or skipped the optional app tour, after you choose one of those actions. An earlier version may have stored that the invitation was shown; the app removes that old marker when it checks the tour state. The choice remains until you clear the browser’s site data; if removed, the tour invitation can appear again. The app does not use sessionStorage and does not set or read application cookies. It reads the device’s light or dark appearance preference locally when needed and does not send that preference as a separate data item.",
          "The app lock and encryption do not protect data from someone who can access or alter your device, browser profile or the app itself. Use the production site over HTTPS and keep your device and any exported files private.",
        ],
      },
      {
        id: "requests",
        title: "Website requests, hosting logs and analytics",
        paragraphs: [
          "Cloudflare provides the site’s content-delivery and security services. When your browser requests a page or file, Cloudflare can process connection and request details such as your IP address, requested page or resource, date and time, browser or device information, network information and security signals. Cloudflare may use security cookies when a protection feature requires them; their presence and duration depend on the feature and configuration.",
          "The shared hosting provider generates access logs for requests it receives. Those logs may include an IP address, date and time, requested URL or resource, HTTP status, browser or user-agent details, referrer information when sent, and other technical request details. Your browser may also send headers such as Accept-Language; whether providers record them depends on their configuration. AWStats is enabled through the hosting provider and the operator uses its traffic reports generated from those logs. Cloudflare and hosting-level request processing still take place when the app is used; they are separate from browser analytics. The technical request information is needed to deliver the pages you request; without it, the site cannot be accessed.",
          "Money Manager does not use Cloudflare Web Analytics or another app-managed analytics, advertising or tracking script. Cloudflare Web Analytics is disabled for this app. The app’s production code does not send your ledger, profile names, password or imported file contents to an application server.",
        ],
      },
      {
        id: "purposes",
        title: "Purposes and legal bases",
        paragraphs: [
          "The app processes your local records in the browser to provide the ledger, calculations, settings, import, export and backup functions you choose to use. The app does not transmit those records to the controller through its normal features.",
          "The operator’s use of website request information and AWStats reports is intended to deliver and protect the site, maintain availability, troubleshoot faults, prevent abuse and understand overall traffic. Where this information is personal data, the stated legal basis is the operator’s legitimate interests under Article 6(1)(f) GDPR in operating and securing the service, subject to the required balancing of those interests against people’s rights and freedoms. Providers may also process information where required by law.",
          "If you email the privacy contact, the operator uses your email address, message, attachments and related message details to answer and manage your enquiry. The legal basis is the operator’s legitimate interest in handling correspondence and, where relevant, establishing, exercising or defending legal claims; legal obligations may apply to rights requests.",
        ],
      },
      {
        id: "providers",
        title: "Service providers and international transfers",
        paragraphs: [
          "The service providers involved in the processing described here are Cloudflare for content delivery and security, the shared hosting provider for hosting, access logs and AWStats, and the operator’s email service provider when you contact the privacy address. Provider personnel may access information only as needed to operate, secure or support their services. Information may also be disclosed where required by law or where necessary for legal claims.",
          "Cloudflare and the hosting provider may process technical information outside Bulgaria or the European Economic Area (EEA), depending on their service and account settings. The exact processing locations and the transfer safeguards applicable to this production deployment have not yet been confirmed. Email the controller for current details. The controller must verify the providers’ applicable transfer arrangements before publication.",
        ],
      },
      {
        id: "retention",
        title: "Retention, exports and deletion",
        paragraphs: [
          "Records in IndexedDB remain in your browser until you clear them in Money Manager, remove the site’s data through your browser, or the browser removes them under its own storage rules. The app does not set an expiry date for ledger records. Finishing or skipping setup replaces the setup draft with a completion state. The tour choice remains in local storage until you or the browser remove it.",
          "JSON backups and CSV transaction exports are generated in your browser and downloaded to a location chosen by you. A JSON backup contains the selected profile’s financial records and preferences, but not its profile name or avatar. A CSV export contains transactions for the date range you select. You can choose to password-protect either file. Imported files are read and processed in the browser. The operator does not receive or keep these files through the app; you must manage or delete downloaded copies separately.",
          "The operator has no server-side copy or application backup of your local ledger because the app does not upload it. Hosting access logs, AWStats reports and Cloudflare service records follow the providers’ retention settings and policies; the exact periods for this deployment have not been confirmed. Email correspondence is kept only for as long as reasonably needed to answer the enquiry, meet applicable obligations or handle a related legal claim.",
          "To clear a profile’s financial records, use Settings → Data & backup in the app. This leaves that profile’s name and avatar and shared appearance preferences in the browser. Clearing the browser’s site data removes the app’s local profiles, records, settings and local lock information. Downloaded files are not deleted by either action.",
        ],
      },
      {
        id: "security",
        title: "Security",
        paragraphs: [
          "The app keeps financial records on the device rather than in an online account. Optional local encryption can protect the browser-stored workspace when the app is closed, but it does not make a compromised device or browser safe. Without encryption, browser storage is not encrypted by Money Manager. No internet service or device can be guaranteed completely secure.",
        ],
      },
      {
        id: "rights",
        title: "Your rights",
        paragraphs: [
          "Depending on the circumstances, you may have the right to access, rectify, erase or restrict personal data processed by the controller, to object to processing based on legitimate interests, and to request data portability where the legal conditions are met. You may also lodge a complaint with a data-protection supervisory authority. These rights are subject to legal conditions and exceptions.",
          "To make a request, use the privacy email address below. The controller may ask for information reasonably needed to identify the relevant records and prevent disclosure to the wrong person. Requests are normally answered within one month; the law allows an extension in certain cases, with notice.",
          "The controller cannot inspect or remotely delete records stored only in your browser. You can review, export or clear those records using Money Manager and your browser’s site-data controls. You may complain to Bulgaria’s Commission for Personal Data Protection (CPDP / КЗЛД) without first contacting the controller.",
        ],
      },
      {
        id: "children-decisions",
        title: "Children and automated decisions",
        paragraphs: [
          "Money Manager does not ask your age, create online accounts for children or verify a parent’s or guardian’s authority. Financial records are stored in your browser and are not sent to the controller through the app. Under Bulgaria’s Personal Data Protection Act, when processing a child’s personal data under 14 is based on consent, that consent must be given by a parent exercising parental rights or the child’s guardian. This statement does not collect or verify such consent.",
          "The app calculates totals and budget or savings progress from records in your browser for you to review. The controller does not use those calculations to make decisions about you that have legal or similarly significant effects.",
        ],
      },
      {
        id: "changes",
        title: "Changes to this policy",
        paragraphs: [
          "This policy may be updated if the app, its providers or its data handling changes. The current update date appears at the top of this page. Any new processing or storage that requires a legal choice will be reviewed before it is introduced.",
        ],
      },
    ],
    resourcesTitle: "Official and provider information",
    resources: [
      { label: "General Data Protection Regulation (GDPR)", href: "https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng" },
      { label: "ePrivacy Directive, Article 5(3)", href: "https://eur-lex.europa.eu/eli/dir/2002/58/oj/eng" },
      { label: "Bulgarian Electronic Commerce Act", href: "https://www.mi.government.bg/file/2015/09/zakon_za_elektronnata_targoviq-2024.pdf" },
      { label: "Bulgarian Personal Data Protection Act", href: "https://cpdp.bg/en/legislation/personal-data-protection-act/" },
      { label: "How to lodge a complaint with Bulgaria’s CPDP", href: "https://cpdp.bg/en/lodging-complaints-and-alerts/" },
      { label: "Cloudflare Privacy Policy", href: "https://www.cloudflare.com/privacypolicy/" },
      { label: "Cloudflare cookie documentation", href: "https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/" },
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
    summary: "Не е необходим акаунт. Финансовите ви записи остават в този браузър. Cloudflare и хостинг доставчикът обработват техническа информация за заявките, когато доставят и защитават сайта.",
    backLabel: "За приложението и правна информация",
    privacyLabel: "Поверителност",
    licencesLabel: "Лицензи",
    sections: [
      {
        id: "controller",
        title: "Администратор и контакт",
        paragraphs: [
          "Администраторът за информацията за заявките към сайта и съобщенията, изпратени до контакта за поверителност, е Baran Ahmedov — физическо лице, което живее в България. За въпроси относно поверителността или за упражняване на права се свържете с администратора на посочения по-долу адрес.",
          "Чрез функциите си Money Manager не изпраща въведените от вас финансови записи до администратора. Приложението не предлага онлайн регистрация, потребителски акаунти, връзка с банка или синхронизиране в облак.",
        ],
      },
      {
        id: "local-data",
        title: "Информацията, която въвеждате и съхранявате в браузъра",
        paragraphs: [
          "Money Manager съхранява локално работно пространство в браузъра ви. Според въведеното от вас то може да съдържа имена на профили и избрани цветове и икони на аватарите; имена и видове сметки и начални салда; приходи и разходи, суми, дати, описания, категории, етикети на сметки и бележки; бюджети; спестовни цели, целеви суми, дати, вноски, тегления и бележки; ваши категории; както и валута, тема, регионални формати за дата и числа и настройки за намалено движение. Черновата за първоначална настройка може да съдържа и името на сметката, салдото и настройките, въведени преди приключване или пропускане на настройката.",
          "На някои места полетата са свободен текст. Те могат да идентифицират вас или друго лице, затова избягвайте да добавяте чувствителни или ненужни подробности. Money Manager не изисква пароли за банки и не се свързва с банка.",
        ],
      },
      {
        id: "browser-storage",
        title: "Съхранение в браузъра и локална защита",
        paragraphs: [
          "Работното пространство се пази в IndexedDB на този браузър, в база данни с име money-manager. Там приложението пази и настройките за паролата на сайта. Паролата е локално заключване на приложението, а не онлайн акаунт. Шифроването на хранилището е по избор: ако го включите, браузърът шифрова локалното работно пространство с ключ, изведен от паролата ви; ако не го включите, записите остават четими за човек с достъп до профила на този браузър. Паролата не се изпраща на администратора. Няма възстановяване на паролата и шифрованите записи не могат да бъдат възстановени, ако я забравите.",
          "Приложението използва локалното хранилище на браузъра само за да запомни дали сте завършили или пропуснали незадължителната обиколка на приложението, след като изберете едно от тези действия. В по-стара версия може да е било записано, че поканата е показана; приложението премахва този стар маркер, когато проверява състоянието на обиколката. Изборът остава, докато не изтриете данните на сайта от браузъра; ако бъде премахнат, поканата за обиколка може да се появи отново. Приложението не използва sessionStorage и не задава или чете свои бисквитки. Когато е необходимо, то прочита локално настройката на устройството за светъл или тъмен изглед и не изпраща тази настройка като отделен елемент данни.",
          "Заключването и шифроването не защитават данните от човек, който има достъп до устройството, профила на браузъра или самото приложение, или може да ги променя. Използвайте продукционния сайт през HTTPS и пазете устройството и експортираните файлове.",
        ],
      },
      {
        id: "requests",
        title: "Заявки към сайта, хостинг логове и анализи",
        paragraphs: [
          "Cloudflare предоставя услугите за доставка на съдържание и сигурност на сайта. Когато браузърът ви заяви страница или файл, Cloudflare може да обработва данни за връзката и заявката, като IP адрес, заявена страница или ресурс, дата и час, информация за браузъра или устройството, мрежова информация и сигнали за сигурност. Cloudflare може да използва бисквитки за сигурност, когато функция за защита ги изисква; наличието и срокът им зависят от функцията и настройките.",
          "Общият хостинг доставчик генерира логове за заявките, които получава. Те може да съдържат IP адрес, дата и час, заявен URL адрес или ресурс, HTTP статус, информация за браузъра или потребителския агент, информация за източника на препращане, когато е изпратена, и други технически подробности за заявката. Браузърът ви може да изпраща и заглавки като Accept-Language; дали доставчиците записват тези стойности зависи от настройките им. AWStats е включен чрез хостинг доставчика, а операторът използва генерираните от тези логове справки за трафика. Cloudflare и хостинг доставчикът обработват информация за заявките и при използване на приложението; това е различно от браузърните анализи. Техническата информация за заявката е необходима за доставяне на поисканите страници; без нея сайтът не може да бъде достъпен.",
          "Money Manager не използва Cloudflare Web Analytics или други управлявани от приложението скриптове за анализи, реклама или проследяване. Cloudflare Web Analytics е изключен за това приложение. Продукционният код на приложението не изпраща финансовата книга, имената на профилите, паролата или съдържанието на импортираните файлове до сървър на приложението.",
        ],
      },
      {
        id: "purposes",
        title: "Цели и правни основания",
        paragraphs: [
          "Приложението обработва локалните ви записи в браузъра, за да предоставя финансовата книга, изчисленията, настройките, импортирането, експортирането и архивирането, които избирате да използвате. Чрез обичайните функции приложението не предава тези записи на администратора.",
          "Операторът използва информацията за заявките към сайта и справките на AWStats, за да доставя и защитава сайта, да поддържа достъпността му, да отстранява неизправности, да предотвратява злоупотреби и да разбира общия трафик. Когато тази информация е лични данни, посоченото правно основание е легитимният интерес на оператора по член 6, параграф 1, буква „е“ от GDPR да управлява и защитава услугата, при необходимото балансиране спрямо правата и свободите на хората. Доставчиците може да обработват информация и когато това се изисква от закона.",
          "Ако пишете на контакта за поверителност, операторът използва имейл адреса, съобщението, прикачените файлове и свързаните данни за съобщението, за да отговори и обработи запитването ви. Основанието е легитимният интерес на оператора да обработва кореспонденцията и, когато е относимо, да установява, упражнява или защитава правни претенции; при искания за права може да се прилагат законови задължения.",
        ],
      },
      {
        id: "providers",
        title: "Доставчици и международни трансфери",
        paragraphs: [
          "Доставчиците, участващи в описаната тук обработка, са Cloudflare за доставка на съдържание и сигурност, общият хостинг доставчик за хостинга, логовете за достъп и AWStats, както и доставчикът на имейл услугата на оператора, когато се свържете с адреса за поверителност. Персоналът на доставчиците може да има достъп до информация само доколкото е необходимо за работа, защита или поддръжка на услугите им. Информация може да бъде разкрита и когато законът го изисква или когато е необходимо във връзка с правни претенции.",
          "В зависимост от услугата и настройките на акаунта Cloudflare и хостинг доставчикът може да обработват техническа информация извън България или Европейското икономическо пространство (ЕИП). Точните местоположения и гаранции за трансфер, приложими за тази продукционна инсталация, все още не са потвърдени. Пишете на администратора за актуална информация. Преди публикуване администраторът трябва да провери приложимите договорености за трансфер с доставчиците.",
        ],
      },
      {
        id: "retention",
        title: "Съхранение, експортиране и изтриване",
        paragraphs: [
          "Записите в IndexedDB остават в браузъра ви, докато не ги изтриете в Money Manager, не премахнете данните на сайта чрез браузъра или браузърът не ги премахне съгласно собствените си правила за съхранение. Приложението не задава срок на валидност за финансовите записи. При приключване или пропускане на първоначалната настройка черновата се заменя със състояние за приключване. Изборът за обиколката остава в локалното хранилище, докато вие или браузърът не го премахнете.",
          "JSON архивите и CSV експортите на транзакции се създават в браузъра и се изтеглят на избрано от вас място. JSON архивът съдържа финансовите записи и настройките на избрания профил, но не и името или аватара му. CSV експортът съдържа транзакции за избрания период. Можете да защитите с парола всеки от двата файла. Импортираните файлове се прочитат и обработват в браузъра. Чрез приложението операторът не получава и не съхранява тези файлове; отделно трябва да управлявате или изтривате изтеглените копия.",
          "Операторът няма сървърно копие или архив на локалната ви финансова книга, защото приложението не я качва. Логовете на хостинга, справките на AWStats и записите от услугите на Cloudflare се съхраняват според настройките и политиките на доставчиците; точните срокове за тази инсталация не са потвърдени. Кореспонденцията по имейл се пази само толкова дълго, колкото е разумно необходимо за отговор на запитването, изпълнение на приложими задължения или обработване на свързана правна претенция.",
          "За да изчистите финансовите записи на профил, използвайте Settings → Data & backup в приложението. Името и аватарът на профила, както и общите настройки за изглед, остават в браузъра. Изтриването на данните на сайта от браузъра премахва локалните профили, записи, настройки и информацията за локалното заключване. Изтеглените файлове не се изтриват с нито едно от тези действия.",
        ],
      },
      {
        id: "security",
        title: "Сигурност",
        paragraphs: [
          "Приложението пази финансовите записи на устройството, а не в онлайн акаунт. Незадължителното локално шифроване може да защити работното пространство в браузъра, когато приложението е затворено, но не прави компрометирано устройство или браузър безопасни. Без шифроване Money Manager не шифрова хранилището на браузъра. Не може да се гарантира пълна сигурност на интернет услуга или устройство.",
        ],
      },
      {
        id: "rights",
        title: "Вашите права",
        paragraphs: [
          "В зависимост от обстоятелствата може да имате право на достъп, коригиране, изтриване или ограничаване на личните данни, обработвани от администратора; на възражение срещу обработване, основано на легитимен интерес; и на преносимост, когато са изпълнени законовите условия. Може да подадете жалба и до надзорен орган за защита на данните. Тези права са предмет на законови условия и изключения.",
          "За да подадете искане, използвайте имейл адреса за поверителност по-долу. Администраторът може да поиска информация, разумно необходима за установяване на относимите записи и за предотвратяване на разкриването им на неправилно лице. Обичайният срок за отговор е един месец; законът допуска удължаване в определени случаи, за което ще бъдете уведомени.",
          "Администраторът не може да преглежда или изтрива дистанционно записи, съхранявани само във вашия браузър. Можете да ги прегледате, експортирате или изчистите чрез Money Manager и настройките на браузъра за данните на сайта. Можете да подадете жалба до Комисията за защита на личните данни (КЗЛД) и без предварително да се свързвате с администратора.",
        ],
      },
      {
        id: "children-decisions",
        title: "Деца и автоматизирани решения",
        paragraphs: [
          "Money Manager не иска възрастта ви, не създава онлайн акаунти за деца и не проверява правомощията на родител или настойник. Финансовите записи се съхраняват в браузъра ви и не се изпращат до администратора чрез приложението. Съгласно българския Закон за защита на личните данни, когато обработването на лични данни на дете под 14 години се основава на съгласие, то трябва да бъде дадено от родител, упражняващ родителските права, или от настойника на детето. С това уведомление не се събира или проверява такова съгласие.",
          "Приложението изчислява общи суми и напредъка по бюджети или спестявания от записите в браузъра ви, за да ги прегледате. Администраторът не използва тези изчисления, за да взема решения за вас с правни или сходно значими последици.",
        ],
      },
      {
        id: "changes",
        title: "Промени в политиката",
        paragraphs: [
          "Политиката може да бъде актуализирана при промяна на приложението, доставчиците или начина на обработване на данни. Датата на актуализация е посочена в началото на страницата. Всяка нова обработка или съхранение, за която се изисква избор по закон, ще бъде прегледана преди въвеждането ѝ.",
        ],
      },
    ],
    resourcesTitle: "Официална информация и данни от доставчици",
    resources: [
      { label: "Общ регламент относно защитата на данните (GDPR)", href: "https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng" },
      { label: "Директива за електронната поверителност, член 5, параграф 3", href: "https://eur-lex.europa.eu/eli/dir/2002/58/oj/eng" },
      { label: "Български Закон за електронната търговия", href: "https://www.mi.government.bg/file/2015/09/zakon_za_elektronnata_targoviq-2024.pdf" },
      { label: "Български Закон за защита на личните данни", href: "https://cpdp.bg/en/legislation/personal-data-protection-act/" },
      { label: "Подаване на жалба до КЗЛД", href: "https://cpdp.bg/en/lodging-complaints-and-alerts/" },
      { label: "Политика за поверителност на Cloudflare", href: "https://www.cloudflare.com/privacypolicy/" },
      { label: "Документация на Cloudflare за бисквитките", href: "https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/" },
    ],
  },
  tr: {
    lang: "tr-TR",
    pageTitle: "Gizlilik Politikası",
    pageDescription: "Baran’s Money Manager uygulamasını kullandığınızda bilgilerin nasıl işlendiği.",
    updated: "Son güncelleme: 22 Kasım 2026",
    languageLabel: "Politika dili",
    contentsLabel: "Gizlilik Politikası içindekiler",
    contentsTitle: "Bu sayfada",
    summary: "Hesap açmanız gerekmez. Finansal kayıtlarınız bu tarayıcıda kalır. Cloudflare ve barındırma sağlayıcısı, siteyi sunup korurken teknik istek bilgilerini yine de işler.",
    backLabel: "Hakkında ve yasal bilgiler",
    privacyLabel: "Gizlilik",
    licencesLabel: "Lisanslar",
    sections: [
      {
        id: "controller",
        title: "Veri sorumlusu ve iletişim",
        paragraphs: [
          "Site istek bilgileri ve gizlilik iletişim adresine gönderilen mesajlar bakımından veri sorumlusu, Bulgaristan’da yaşayan gerçek kişi Baran Ahmedov’dur. Gizlilikle ilgili sorularınız veya hak talepleriniz için aşağıdaki adresten veri sorumlusuna ulaşabilirsiniz.",
          "Money Manager, uygulama özellikleri aracılığıyla girdiğiniz finansal kayıtları veri sorumlusuna göndermez. Uygulama çevrim içi kayıt, kullanıcı hesabı, banka bağlantısı veya bulut eşitlemesi sunmaz.",
        ],
      },
      {
        id: "local-data",
        title: "Girdiğiniz ve tarayıcınızda tuttuğunuz bilgiler",
        paragraphs: [
          "Money Manager, tarayıcınızda yerel bir çalışma alanı saklar. Seçimlerinize bağlı olarak bu alanda profil adları ve seçilen avatar renkleri ile simgeler; hesap adları, türleri ve açılış bakiyeleri; gelir ve gider kayıtları, tutarlar, tarihler, açıklamalar, kategoriler, hesap etiketleri ve notlar; bütçeler; birikim hedefleri, hedef tutarlar, tarihler, yatırımlar, çekimler ve notlar; özel kategoriler; para birimi, tema, bölgesel tarih ve sayı biçimleri ve azaltılmış hareket tercihleri bulunabilir. İlk kurulum taslağında, kurulumu bitirmeden veya atlamadan önce girdiğiniz hesap adı, bakiye ve tercihler de yer alabilir.",
          "Bazı alanlar serbest metindir. Sizi veya başka bir kişiyi tanımlayabilir; gereksiz ya da hassas ayrıntıları eklemekten kaçının. Money Manager banka parolası istemez ve bankanıza bağlanmaz.",
        ],
      },
      {
        id: "browser-storage",
        title: "Tarayıcı depolaması ve yerel güvenlik",
        paragraphs: [
          "Çalışma alanı bu tarayıcıdaki money-manager adlı IndexedDB veritabanında tutulur. Uygulama, site parolası ayarlarını da burada saklar. Site parolası yerel bir uygulama kilididir; çevrim içi hesap değildir. Depolama şifrelemesi isteğe bağlıdır: etkinleştirirseniz tarayıcı yerel çalışma alanını parolanızdan türetilen bir anahtarla şifreler; etkinleştirmezseniz bu tarayıcı profiline erişebilen kişiler kayıtları okuyabilir. Parola veri sorumlusuna gönderilmez. Parola sıfırlama yoktur; parolayı unutursanız şifrelenmiş kayıtlar kurtarılamaz.",
          "Uygulama, tarayıcının yerel depolamasını yalnızca isteğe bağlı uygulama turunu tamamlamayı veya atlamayı seçtikten sonra bu tercihi hatırlamak için kullanır. Eski bir sürüm, davetin gösterildiğini kaydetmiş olabilir; uygulama tur durumunu kontrol ederken bu eski işareti siler. Seçiminiz, tarayıcının site verilerini temizleyene kadar kalır; silinirse tur daveti yeniden görünebilir. Uygulama sessionStorage kullanmaz ve uygulama çerezi ayarlamaz ya da okumaz. Gerektiğinde cihazın açık veya koyu görünüm tercihini yerel olarak okur ve bu tercihi ayrı bir veri olarak göndermez.",
          "Uygulama kilidi ve şifreleme, cihazınıza, tarayıcı profilinize veya uygulamanın kendisine erişebilen ya da bunları değiştirebilen bir kişiye karşı koruma sağlamaz. Üretim sitesini HTTPS üzerinden kullanın; cihazınızı ve dışa aktardığınız dosyaları gizli tutun.",
        ],
      },
      {
        id: "requests",
        title: "Site istekleri, barındırma kayıtları ve analizler",
        paragraphs: [
          "Cloudflare, sitenin içerik dağıtımı ve güvenlik hizmetlerini sağlar. Tarayıcınız bir sayfa veya dosya istediğinde Cloudflare IP adresiniz, istenen sayfa veya kaynak, tarih ve saat, tarayıcı ya da cihaz bilgileri, ağ bilgileri ve güvenlik sinyalleri gibi bağlantı ve istek ayrıntılarını işleyebilir. Bir koruma özelliği gerektirdiğinde Cloudflare güvenlik çerezleri kullanabilir; çerezlerin bulunması ve süresi özelliğe ve yapılandırmaya bağlıdır.",
          "Ortak barındırma sağlayıcısı aldığı istekler için erişim kayıtları oluşturur. Bu kayıtlarda IP adresi, tarih ve saat, istenen URL veya kaynak, HTTP durumu, tarayıcı ya da kullanıcı aracısı bilgileri, gönderilmişse yönlendiren sayfa bilgisi ve diğer teknik istek ayrıntıları bulunabilir. Tarayıcınız Accept-Language gibi başlıklar da gönderebilir; sağlayıcıların bunları kaydedip kaydetmediği kendi yapılandırmalarına bağlıdır. AWStats, barındırma sağlayıcısı üzerinden etkindir ve operatör bu kayıtlardan oluşturulan trafik raporlarını kullanır. Cloudflare ve barındırma düzeyindeki istek işleme, uygulama kullanılırken de gerçekleşir; bunlar tarayıcı analizlerinden ayrıdır. İstenen sayfaların sunulması için teknik istek bilgilerinin gönderilmesi gerekir; bu işlem olmadan siteye erişilemez.",
          "Money Manager, Cloudflare Web Analytics’i veya uygulama tarafından yönetilen başka bir analiz, reklam ya da izleme betiğini kullanmaz. Bu uygulama için Cloudflare Web Analytics devre dışıdır. Uygulamanın üretim kodu finansal kayıtlarınızı, profil adlarınızı, parolanızı veya içe aktarılan dosyaların içeriğini uygulama sunucusuna göndermez.",
        ],
      },
      {
        id: "purposes",
        title: "Amaçlar ve hukuki dayanaklar",
        paragraphs: [
          "Uygulama, kullanmayı seçtiğiniz defter, hesaplama, ayar, içe aktarma, dışa aktarma ve yedekleme işlevlerini sağlamak için yerel kayıtlarınızı tarayıcıda işler. Normal özellikleri aracılığıyla bu kayıtları veri sorumlusuna iletmez.",
          "Operatör, site istek bilgilerini ve AWStats raporlarını siteyi sunmak ve korumak, hizmetin kullanılabilirliğini sürdürmek, sorunları gidermek, kötüye kullanımı önlemek ve genel trafiği anlamak amacıyla kullanır. Bu bilgiler kişisel veriyse, belirtilen hukuki dayanak GDPR Madde 6(1)(f) uyarınca hizmeti işletme ve güvence altına alma konusundaki meşru menfaattir; bu menfaatin kişilerin hak ve özgürlükleriyle gerekli şekilde dengelenmesi gerekir. Sağlayıcılar bilgileri kanunen gerekli olduğunda da işleyebilir.",
          "Gizlilik iletişim adresine e-posta gönderirseniz operatör; e-posta adresinizi, mesajınızı, eklerinizi ve ilgili mesaj ayrıntılarını talebinizi yanıtlamak ve yönetmek için kullanır. Hukuki dayanak, yazışmaları ele alma ve gerektiğinde hukuki talepleri tesis etme, kullanma veya savunma konusundaki meşru menfaattir; hak taleplerinde yasal yükümlülükler geçerli olabilir.",
        ],
      },
      {
        id: "providers",
        title: "Hizmet sağlayıcıları ve uluslararası aktarımlar",
        paragraphs: [
          "Burada açıklanan işleme dahil sağlayıcılar; içerik dağıtımı ve güvenlik için Cloudflare, barındırma, erişim kayıtları ve AWStats için ortak barındırma sağlayıcısı ve gizlilik adresiyle iletişime geçtiğinizde operatörün e-posta hizmeti sağlayıcısıdır. Sağlayıcı personeli bilgilere yalnızca hizmetlerini yürütmek, güvenceye almak veya desteklemek için gerektiği ölçüde erişebilir. Bilgiler kanunen gerekli olduğunda veya hukuki talepler için gerektiğinde açıklanabilir.",
          "Hizmete ve hesap ayarlarına bağlı olarak Cloudflare ve barındırma sağlayıcısı teknik bilgileri Bulgaristan dışında veya Avrupa Ekonomik Alanı (AEA) dışında işleyebilir. Bu üretim kurulumu için kesin işleme konumları ve geçerli aktarım güvenceleri henüz doğrulanmamıştır. Güncel ayrıntılar için veri sorumlusuna e-posta gönderin. Veri sorumlusu, yayımdan önce sağlayıcıların geçerli aktarım düzenlemelerini doğrulamalıdır.",
        ],
      },
      {
        id: "retention",
        title: "Saklama, dışa aktarma ve silme",
        paragraphs: [
          "IndexedDB kayıtları; Money Manager’da siz temizleyene, tarayıcı ayarlarından sitenin verilerini kaldırana veya tarayıcı kendi depolama kuralları uyarınca kaldırana kadar tarayıcınızda kalır. Uygulama finansal kayıtlar için bir sona erme tarihi belirlemez. İlk kurulumu bitirmeniz veya atlamanız, kurulum taslağının yerine tamamlanma durumunu kaydeder. Tur tercihi, siz veya tarayıcı kaldırana kadar yerel depolamada kalır.",
          "JSON yedekleri ve CSV işlem dışa aktarımları tarayıcınızda oluşturulur ve seçtiğiniz konuma indirilir. JSON yedeği seçilen profilin finansal kayıtlarını ve tercihlerini içerir; profil adını veya avatarını içermez. CSV dışa aktarımı seçtiğiniz tarih aralığındaki işlemleri içerir. Her iki dosyayı da parolayla korumayı seçebilirsiniz. İçe aktarılan dosyalar tarayıcıda okunur ve işlenir. Uygulama üzerinden operatör bu dosyaları almaz veya saklamaz; indirdiğiniz kopyaları ayrıca yönetmeli ya da silmelisiniz.",
          "Uygulama finansal defterinizi yüklemediğinden operatörün sunucuda bir kopyası veya uygulama yedeği yoktur. Barındırma erişim kayıtları, AWStats raporları ve Cloudflare hizmet kayıtları sağlayıcıların saklama ayarlarına ve politikalarına tabidir; bu kurulum için kesin süreler doğrulanmamıştır. E-posta yazışmaları yalnızca talebi yanıtlamak, geçerli yükümlülükleri yerine getirmek veya ilgili bir hukuki talebi ele almak için makul ölçüde gerekli olduğu sürece tutulur.",
          "Bir profilin finansal kayıtlarını temizlemek için uygulamada Settings → Data & backup bölümünü kullanın. Profilin adı ve avatarı ile ortak görünüm tercihleri tarayıcıda kalır. Tarayıcıdaki site verilerini silmek, uygulamanın yerel profillerini, kayıtlarını, ayarlarını ve yerel kilit bilgilerini kaldırır. İndirilen dosyalar bu işlemlerle silinmez.",
        ],
      },
      {
        id: "security",
        title: "Güvenlik",
        paragraphs: [
          "Uygulama, finansal kayıtları çevrim içi bir hesapta değil cihazınızda tutar. İsteğe bağlı yerel şifreleme, uygulama kapalıyken tarayıcıdaki çalışma alanını koruyabilir; ancak güvenliği ihlal edilmiş bir cihazı veya tarayıcıyı güvenli hâle getirmez. Şifreleme kapalıysa Money Manager tarayıcı depolamasını şifrelemez. Hiçbir internet hizmeti veya cihaz için mutlak güvenlik garantisi verilemez.",
        ],
      },
      {
        id: "rights",
        title: "Haklarınız",
        paragraphs: [
          "Koşullara bağlı olarak veri sorumlusunun işlediği kişisel verilere erişme, bunları düzeltme, silme veya işlemeyi kısıtlama; meşru menfaate dayalı işlemeye itiraz etme ve yasal koşullar karşılandığında veri taşınabilirliği talep etme hakkınız olabilir. Bir veri koruma denetim makamına da şikâyette bulunabilirsiniz. Bu haklar yasal koşullara ve istisnalara tabidir.",
          "Talepte bulunmak için aşağıdaki gizlilik e-posta adresini kullanın. Veri sorumlusu, ilgili kayıtları belirlemek ve bilgilerin yanlış kişiye açıklanmasını önlemek için makul ölçüde gerekli bilgileri isteyebilir. Talepler normalde bir ay içinde yanıtlanır; yasa, belirli durumlarda bildirimde bulunarak süre uzatılmasına izin verir.",
          "Veri sorumlusu yalnızca tarayıcınızda tutulan kayıtları inceleyemez veya uzaktan silemez. Bu kayıtları Money Manager ve tarayıcınızın site verisi kontrolleriyle inceleyebilir, dışa aktarabilir veya temizleyebilirsiniz. Veri sorumlusuyla önce iletişime geçmeden Bulgaristan Kişisel Verileri Koruma Komisyonuna (CPDP / КЗЛД) şikâyette bulunabilirsiniz.",
        ],
      },
      {
        id: "children-decisions",
        title: "Çocuklar ve otomatik kararlar",
        paragraphs: [
          "Money Manager yaşınızı sormaz, çocuklar için çevrim içi hesap oluşturmaz ve bir ebeveynin ya da vasinin yetkisini doğrulamaz. Finansal kayıtlar tarayıcınızda saklanır ve uygulama aracılığıyla veri sorumlusuna gönderilmez. Bulgaristan Kişisel Verilerin Korunması Kanunu uyarınca, 14 yaşından küçük bir çocuğun kişisel verilerinin işlenmesi rızaya dayanıyorsa bu rıza, ebeveynlik haklarını kullanan bir ebeveyn veya çocuğun vasisi tarafından verilmelidir. Bu açıklama böyle bir rıza almaz veya doğrulamaz.",
          "Uygulama, incelemeniz için tarayıcınızdaki kayıtlardan toplamları ve bütçe ya da birikim ilerlemesini hesaplar. Veri sorumlusu bu hesaplamaları sizin hakkınızda hukuki veya benzer ölçüde önemli sonuç doğuran kararlar vermek için kullanmaz.",
        ],
      },
      {
        id: "changes",
        title: "Bu politikadaki değişiklikler",
        paragraphs: [
          "Uygulama, sağlayıcılar veya veri işleme yöntemleri değiştiğinde bu politika güncellenebilir. Geçerli güncelleme tarihi sayfanın üstünde gösterilir. Yasal bir tercih gerektiren yeni işleme veya depolama, devreye alınmadan önce değerlendirilir.",
        ],
      },
    ],
    resourcesTitle: "Resmî ve sağlayıcı bilgileri",
    resources: [
      { label: "Genel Veri Koruma Tüzüğü (GDPR)", href: "https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng" },
      { label: "ePrivacy Direktifi, Madde 5(3)", href: "https://eur-lex.europa.eu/eli/dir/2002/58/oj/eng" },
      { label: "Bulgaristan Elektronik Ticaret Kanunu", href: "https://www.mi.government.bg/file/2015/09/zakon_za_elektronnata_targoviq-2024.pdf" },
      { label: "Bulgaristan Kişisel Verilerin Korunması Kanunu", href: "https://cpdp.bg/en/legislation/personal-data-protection-act/" },
      { label: "Bulgaristan CPDP’ye şikâyet başvurusu", href: "https://cpdp.bg/en/lodging-complaints-and-alerts/" },
      { label: "Cloudflare Gizlilik Politikası", href: "https://www.cloudflare.com/privacypolicy/" },
      { label: "Cloudflare çerez belgeleri", href: "https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/" },
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
                <>
                  <p className="text-sm leading-relaxed">
                    <a className="text-primary underline underline-offset-4" href="mailto:baran@baranhq.com">
                      baran@baranhq.com
                    </a>
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <a
                      className="text-primary underline underline-offset-4"
                      href="https://cpdp.bg/en/lodging-complaints-and-alerts/"
                    >
                      {locale === "en" ? "Bulgarian CPDP complaint information" : locale === "bg" ? "Информация за жалби до КЗЛД" : "Bulgaristan CPDP şikâyet bilgileri"}
                    </a>
                  </p>
                </>
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
