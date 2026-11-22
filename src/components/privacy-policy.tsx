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
    pageDescription: "How Money Manager stores app data and how I handle website and privacy enquiries.",
    updated: "Last updated: 22 November 2026",
    languageLabel: "Policy language",
    contentsLabel: "Privacy Policy contents",
    contentsTitle: "On this page",
    summary: "The app stores your financial records in this browser and does not upload them to a server. This notice covers personal data I process to operate the website and respond to privacy enquiries.",
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
          "Money Manager stores information you enter, including profiles, accounts, transactions, budgets, savings records and preferences, in your browser. It has no online account, bank connection or cloud sync.",
          "The app does not upload these records, imported files or your app password to a server. I cannot access or delete the records remotely. You can clear a profile’s records in the app or remove the site’s data through your browser settings. Clearing the site’s browser data also removes its stored records. Downloaded files are separate and are not deleted when you clear app or browser data.",
          "The app checks your password locally. By itself, the password locks the app but does not encrypt stored records. You can turn on storage encryption separately. The app cannot recover encrypted records if you lose the password. The app uses browser storage for its records and to remember whether you completed or skipped the tour; it does not set cookies.",
        ],
      },
      {
        id: "website-data",
        title: "Website requests and providers",
        paragraphs: [
          "When you load the website, your IP address, the page requested and related connection information are received by the services that deliver and host it. I rely on my legitimate interests in operating and protecting the website for processing I determine for these purposes.",
          "Cloudflare provides website delivery and security services. The hosting provider receives site requests, and the email provider handles messages you send me. A provider acts as my processor when it processes personal data on my behalf and under my instructions. Where it determines its own purposes and means, it acts as an independent controller and is responsible for its own controller obligations for that processing. A provider’s role depends on the processing and service terms in use. Cloudflare may use security cookies depending on the service and settings; see its official privacy and cookie information. Contact an independent controller directly about its own processing.",
          "A provider may process information outside the European Economic Area (EEA), depending on its service and the terms in place. Contact me for information about safeguards applicable to transfers by providers processing on my behalf. For transfers by an independent controller, see its privacy information or contact it directly.",
        ],
      },
      {
        id: "contact-retention",
        title: "Messages and retention",
        paragraphs: [
          "If you email me, I process your email address, message, attachments and other information you include to respond and handle follow-up. I rely on legitimate interests for ordinary correspondence and, where applicable, on legal obligations to handle data protection requests. Providing information is voluntary, but I may be unable to respond or act without enough detail.",
          "I keep correspondence only as long as needed to handle the message and related follow-up, legal claims or legal obligations. App records remain in your browser until you delete them or the browser removes them. Service providers retain information according to their role and the applicable service terms and privacy information; the email provider may retain messages under its own service and account settings.",
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
    ],
  },
  bg: {
    lang: "bg-BG",
    pageTitle: "Политика за поверителност",
    pageDescription: "Как Money Manager съхранява данните в приложението и как обработвам информацията при управлението на сайта и запитванията за поверителност.",
    updated: "Последна актуализация: 22 ноември 2026 г.",
    languageLabel: "Език на политиката",
    contentsLabel: "Съдържание на политиката за поверителност",
    contentsTitle: "В тази страница",
    summary: "Приложението съхранява финансовите ви записи в този браузър и не ги качва на сървър. Тази информация описва личните данни, които обработвам при управлението на сайта и при отговор на запитвания за поверителност.",
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
          "Money Manager съхранява в браузъра информацията, която въвеждате, включително профили, сметки, транзакции, бюджети, записи за спестявания и предпочитания. Приложението няма онлайн акаунт, връзка с банка или синхронизиране в облак.",
          "Приложението не качва тези записи, импортираните файлове или паролата ви на сървър. Не мога да преглеждам или изтривам записите от разстояние. Можете да изчистите записите на даден профил в приложението или да премахнете данните на сайта от настройките на браузъра. Изчистването на данните на сайта от браузъра премахва и съхранените записи. Изтеглените файлове са отделни и не се изтриват при изчистване на данните в приложението или браузъра.",
          "Приложението проверява паролата ви локално. Сама по себе си тя заключва приложението, но не шифрова съхранените записи. Можете отделно да включите шифроване на данните. Приложението не може да възстанови шифрованите записи, ако загубите паролата. Приложението използва паметта на браузъра за записите и за да запомни дали сте завършили или пропуснали обиколката; то не задава бисквитки.",
        ],
      },
      {
        id: "website-data",
        title: "Заявки към сайта и доставчици",
        paragraphs: [
          "При зареждане на сайта услугите за доставка и хостинг получават IP адреса ви, заявената страница и свързана информация за връзката. За обработването, чиито цели и средства определям, се позовавам на легитимните си интереси да управлявам и защитавам сайта.",
          "Cloudflare предоставя услуги за доставка и сигурност на сайта. Хостинг доставчикът получава заявките към сайта, а доставчикът на имейл обслужва съобщенията, които ми изпращате. Доставчикът действа като мой обработващ, когато обработва лични данни от мое име и по мои инструкции. Когато сам определя целите и средствата, той действа като самостоятелен администратор и отговаря за собствените си задължения в това качество. Ролята му зависи от конкретното обработване и условията на използваната услуга. Cloudflare може да използва бисквитки за сигурност в зависимост от услугата и настройките; вижте официалната му информация за поверителността и бисквитките. За собственото обработване на самостоятелен администратор се обърнете директно към него.",
          "В зависимост от услугата и договорните условия доставчик може да обработва информация извън Европейското икономическо пространство (ЕИП). Свържете се с мен за информация относно гаранциите при трансфери от доставчици, които обработват данни от мое име. За трансфери от самостоятелен администратор вижте неговата информация за поверителност или се обърнете към него.",
        ],
      },
      {
        id: "contact-retention",
        title: "Съобщения и съхранение",
        paragraphs: [
          "Ако ми пишете по имейл, обработвам адреса ви, съобщението, прикачените файлове и другата включена от вас информация, за да отговоря и да предприема последващи действия. За обикновена кореспонденция се позовавам на легитимен интерес, а когато е приложимо — на законови задължения за обработване на искания за защита на данните. Предоставянето на информация е доброволно, но без достатъчно подробности може да не успея да отговоря или да изпълня искането.",
          "Съхранявам кореспонденцията само докато е необходима за обработване на съобщението и свързаните последващи действия, правни претенции или законови задължения. Записите в приложението остават в браузъра, докато не ги изтриете или браузърът не ги премахне. Доставчиците съхраняват информацията според ролята си и приложимите условия на услугата и информация за поверителност; доставчикът на електронна поща може да съхранява съобщенията съгласно собствените си условия и настройки на акаунта.",
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
    ],
  },
  tr: {
    lang: "tr-TR",
    pageTitle: "Gizlilik Politikası",
    pageDescription: "Money Manager uygulama verilerini nasıl saklar ve web sitesi ile gizlilik başvurularında bilgileri nasıl işlerim.",
    updated: "Son güncelleme: 22 Kasım 2026",
    languageLabel: "Politika dili",
    contentsLabel: "Gizlilik Politikası içeriği",
    contentsTitle: "Bu sayfada",
    summary: "Uygulama finansal kayıtlarınızı bu tarayıcıda saklar ve bir sunucuya yüklemez. Bu bildirim, siteyi işletirken ve gizlilik başvurularını yanıtlarken işlediğim kişisel verileri açıklar.",
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
          "Money Manager; profiller, hesaplar, işlemler, bütçeler, birikim kayıtları ve tercihler dâhil girdiğiniz bilgileri tarayıcınızda saklar. Çevrim içi hesabı, banka bağlantısı veya bulut eşitlemesi yoktur.",
          "Uygulama bu kayıtları, içe aktarılan dosyaları veya uygulama parolanızı herhangi bir sunucuya yüklemez. Kayıtlara uzaktan erişemem veya bunları silemem. Bir profile ait kayıtları uygulamadan silebilir veya site verilerini tarayıcınızın ayarlarından kaldırabilirsiniz. Site verilerini tarayıcıdan temizlemek saklanan kayıtları da siler. İndirilen dosyalar ayrıdır ve uygulama veya tarayıcı verilerini temizlediğinizde silinmez.",
          "Uygulama parolanızı yerel olarak doğrular. Parola tek başına uygulamayı kilitler, ancak saklanan kayıtları şifrelemez. Depolama şifrelemesini ayrıca açabilirsiniz. Parolayı kaybederseniz uygulama şifrelenmiş kayıtları kurtaramaz. Uygulama kayıtları saklamak ve tanıtımı tamamlayıp tamamlamadığınızı hatırlamak için tarayıcı depolamasını kullanır; kendisi çerez ayarlamaz.",
        ],
      },
      {
        id: "website-data",
        title: "Site istekleri ve hizmet sağlayıcılar",
        paragraphs: [
          "Siteyi yüklediğinizde, IP adresiniz, istediğiniz sayfa ve bağlantıyla ilgili bilgiler siteyi sunan ve barındıran hizmetler tarafından alınır. Amaç ve araçlarını belirlediğim bu işleme için siteyi işletme ve koruma konusundaki meşru menfaatime dayanırım.",
          "Cloudflare site dağıtımı ve güvenlik hizmeti sağlar. Barındırma sağlayıcısı site isteklerini alır; e-posta sağlayıcısı ise bana gönderdiğiniz mesajları işler. Bir sağlayıcı kişisel verileri benim adıma ve talimatlarım doğrultusunda işlediğinde veri işleyenimdir. Amaç ve araçları kendisinin belirlediği işlemlerde bağımsız veri sorumlusu olur ve bu işleme ilişkin kendi veri sorumlusu yükümlülüklerinden sorumludur. Sağlayıcının rolü yapılan işlemeye ve kullanılan hizmet koşullarına bağlıdır. Cloudflare hizmete ve ayarlara bağlı olarak güvenlik çerezleri kullanabilir; resmî gizlilik ve çerez bilgilerine bakın. Bağımsız veri sorumlusunun kendi işlemesi hakkında bilgi için doğrudan ona başvurun.",
          "Hizmete ve yürürlükteki koşullara bağlı olarak sağlayıcılar bilgileri Avrupa Ekonomik Alanı (AEA) dışında işleyebilir. Benim adıma veri işleyen sağlayıcıların aktarımlarına uygulanan güvenceler hakkında bilgi için benimle iletişime geçin. Bağımsız veri sorumlusunun aktarımları için kendi gizlilik bilgilerine bakın veya doğrudan ona başvurun.",
        ],
      },
      {
        id: "contact-retention",
        title: "Mesajlar ve saklama",
        paragraphs: [
          "Bana e-posta gönderirseniz, yanıt vermek ve gerekli takibi yürütmek için e-posta adresinizi, mesajınızı, ekleri ve eklediğiniz diğer bilgileri işlerim. Olağan yazışmalar için meşru menfaatime, veri koruma taleplerini yanıtlarken ise gerektiğinde yasal yükümlülüklere dayanırım. Bilgi vermek isteğe bağlıdır; yeterli ayrıntı olmadan yanıt veremeyebilir veya talebi yerine getiremeyebilirim.",
          "Yazışmaları yalnızca mesajı ve ilgili takibi yürütmek, hukuki talepleri ele almak veya yasal yükümlülükleri karşılamak için gerektiği süre boyunca saklarım. Uygulama kayıtları siz silene veya tarayıcı kaldırana kadar tarayıcınızda kalır. Hizmet sağlayıcılar bilgileri rollerine, geçerli hizmet koşullarına ve gizlilik bilgilerine göre saklar; e-posta sağlayıcısı mesajları kendi hizmet ve hesap ayarlarına göre saklayabilir.",
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
