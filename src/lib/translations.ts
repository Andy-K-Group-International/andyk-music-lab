export type Locale = "en" | "sk" | "de" | "es";

export interface TranslationKeys {
  nav: { tools: string; pricing: string; about: string; };
  hero: { eyebrow: string; subtitle: string; ctaPrimary: string; ctaSecondary: string; badge1: string; badge2: string; badge3: string; };
  tools: { label: string; heading: string; description: string; accountRequired: string; joinWaitlist: string; };
  pricing: { label: string; heading: string; subtitle: string; earlyAccess: string; earlyClosed: string; spotsRemaining: string; oneTime: string; perMonth: string; perYear: string; mostPopular: string; joinWaitlist: string; };
  whoFor: { label: string; heading: string; headingItalic: string; producers: string; producersDesc: string; djs: string; djsDesc: string; artists: string; artistsDesc: string; };
  whyExists: { label: string; heading: string; headingItalic: string; body1: string; body2: string; body3: string; quote: string; };
  founder: { label: string; heading: string; headingItalic: string; body: string; cta: string; };
  footer: { tagline: string; copyright: string; };
  mastering: { label: string; heading: string; headingItalic: string; };
}

const en: TranslationKeys = {
  nav: { tools: "Tools", pricing: "Pricing", about: "About" },
  hero: {
    eyebrow: "BY ANDY'K GROUP INTERNATIONAL",
    subtitle: "Professional audio tools — built by DJ Andy'K",
    ctaPrimary: "Join Waitlist",
    ctaSecondary: "See Pricing",
    badge1: "Spotify -14 LUFS Ready",
    badge2: "Apple Music Compliant",
    badge3: "100% Browser-Based",
  },
  tools: {
    label: "TOOLS",
    heading: "Everything in one place",
    description: "Professional tools for producers and DJs. Browser-native DSP — no plugins.",
    accountRequired: "ACCOUNT REQUIRED",
    joinWaitlist: "Join Waitlist →",
  },
  pricing: {
    label: "PRICING",
    heading: "Simple transparent pricing",
    subtitle: "Early access is open. Payments are securely processed by Revolut Business.",
    earlyAccess: "EARLY ACCESS — FIRST 40 MEMBERS GET 40% OFF THE YEARLY PLAN",
    earlyClosed: "EARLY ACCESS CLOSED — JOIN WAITLIST FOR NEXT ROUND",
    spotsRemaining: "SPOTS REMAINING",
    oneTime: "one-time",
    perMonth: "/month",
    perYear: "/year",
    mostPopular: "MOST POPULAR",
    joinWaitlist: "Join Waitlist →",
  },
  whoFor: {
    label: "WHO IT IS FOR",
    heading: "Made for",
    headingItalic: "creators",
    producers: "For Producers",
    producersDesc: "Prepare tracks for release, check loudness, compare mixes and generate creative ideas.",
    djs: "For DJs",
    djsDesc: "Detect BPM and key, plan harmonic sets and organise transitions faster.",
    artists: "For Independent Artists",
    artistsDesc: "Finish music without complex plugins or expensive studio workflows.",
  },
  whyExists: {
    label: "WHY THE LAB EXISTS",
    heading: "Built from a real",
    headingItalic: "workflow",
    body1: "Andy'K Music Lab was created from the real workflow of DJ Andy'K — from preparing tracks for release to analysing loudness, BPM, key, transitions and final sound.",
    body2: "Every producer knows the same problem: too many tools, too many plugins, too many steps. The Lab brings the essential music preparation workflow into one clean browser-based space.",
    body3: "It is not built to replace creativity. It is built to protect it.",
    quote: "Music is your passion. The Lab is where it becomes ready.",
  },
  founder: {
    label: "FOUNDER",
    heading: "Built by",
    headingItalic: "DJ Andy'K",
    body: "DJ Andy'K is a producer focused on trance, progressive house and emotional electronic music. Andy'K Music Lab was built from his own release workflow — turning the same preparation process into simple tools for other producers and DJs.",
    cta: "Explore DJ Andy'K →",
  },
  footer: {
    tagline: "Professional audio tools — built by DJ Andy'K",
    copyright: "℗ & © 2026 ANDY'K GROUP INTERNATIONAL LTD",
  },
  mastering: {
    label: "MASTERING DEMO",
    heading: "Hear the",
    headingItalic: "difference",
  },
};

const sk: TranslationKeys = {
  nav: { tools: "Nástroje", pricing: "Ceny", about: "O nás" },
  hero: {
    eyebrow: "OD ANDY'K GROUP INTERNATIONAL",
    subtitle: "Profesionálne audio nástroje — vytvorené DJ Andy'K",
    ctaPrimary: "Pridaj sa na zoznam",
    ctaSecondary: "Zobraziť ceny",
    badge1: "Spotify -14 LUFS Ready",
    badge2: "Apple Music Compliant",
    badge3: "100% V prehliadači",
  },
  tools: {
    label: "NÁSTROJE",
    heading: "Všetko na jednom mieste",
    description: "Profesionálne nástroje pre producentov a DJ-ov. Browser-native DSP — žiadne pluginy.",
    accountRequired: "ÚČET VYŽADOVANÝ",
    joinWaitlist: "Pridaj sa →",
  },
  pricing: {
    label: "CENY",
    heading: "Jednoduché transparentné ceny",
    subtitle: "Skorý prístup je otvorený. Platby sú bezpečne spracované cez Revolut Business.",
    earlyAccess: "SKORÝ PRÍSTUP — PRVÝCH 40 ČLENOV DOSTANE 40% ZĽAVU NA ROČNÝ PLÁN",
    earlyClosed: "SKORÝ PRÍSTUP UZAVRETÝ — PRIDAJ SA NA ZOZNAM",
    spotsRemaining: "MIEST ZOSTÁVA",
    oneTime: "jednorazovo",
    perMonth: "/mesiac",
    perYear: "/rok",
    mostPopular: "NAJPOPULÁRNEJŠIE",
    joinWaitlist: "Pridaj sa →",
  },
  whoFor: {
    label: "PRE KOHO JE TO URČENÉ",
    heading: "Vytvorené pre",
    headingItalic: "tvorcov",
    producers: "Pre producentov",
    producersDesc: "Pripravte skladby na vydanie, skontrolujte hlasitosť, porovnajte mixy a generujte kreatívne nápady.",
    djs: "Pre DJ-ov",
    djsDesc: "Detekujte BPM a kľúč, plánujte harmonické sety a organizujte prechody rýchlejšie.",
    artists: "Pre nezávislých umelcov",
    artistsDesc: "Dokončite hudbu bez zložitých pluginov alebo drahých štúdiových pracovných postupov.",
  },
  whyExists: {
    label: "PREČO LAB EXISTUJE",
    heading: "Postavené z reálneho",
    headingItalic: "pracovného postupu",
    body1: "Andy'K Music Lab bol vytvorený z reálneho pracovného postupu DJ Andy'K — od prípravy skladieb na vydanie až po analýzu hlasitosti, BPM, kľúča, prechodov a finálneho zvuku.",
    body2: "Každý producent pozná rovnaký problém: príliš veľa nástrojov, príliš veľa pluginov, príliš veľa krokov. Lab prináša základný pracovný postup prípravy hudby do jedného čistého priestoru v prehliadači.",
    body3: "Nie je postavený na to, aby nahradil kreativitu. Je postavený na to, aby ju chránil.",
    quote: "Hudba je vaša vášeň. Lab je miesto, kde sa stane pripravená.",
  },
  founder: {
    label: "ZAKLADATEĽ",
    heading: "Vytvorené",
    headingItalic: "DJ Andy'K",
    body: "DJ Andy'K je producent zameraný na trance, progressive house a emotívnu elektronickú hudbu. Andy'K Music Lab bol postavený z jeho vlastného pracovného postupu vydávania — premenením rovnakého prípravného procesu na jednoduché nástroje pre iných producentov a DJ-ov.",
    cta: "Objaviť DJ Andy'K →",
  },
  footer: {
    tagline: "Profesionálne audio nástroje — vytvorené DJ Andy'K",
    copyright: "℗ & © 2026 ANDY'K GROUP INTERNATIONAL LTD",
  },
  mastering: {
    label: "DEMO MASTERINGU",
    heading: "Počujte",
    headingItalic: "rozdiel",
  },
};

const de: TranslationKeys = {
  nav: { tools: "Tools", pricing: "Preise", about: "Über uns" },
  hero: {
    eyebrow: "VON ANDY'K GROUP INTERNATIONAL",
    subtitle: "Professionelle Audio-Tools — entwickelt von DJ Andy'K",
    ctaPrimary: "Warteliste beitreten",
    ctaSecondary: "Preise ansehen",
    badge1: "Spotify -14 LUFS Ready",
    badge2: "Apple Music Compliant",
    badge3: "100% Browser-basiert",
  },
  tools: {
    label: "TOOLS",
    heading: "Alles an einem Ort",
    description: "Professionelle Tools für Produzenten und DJs. Browser-natives DSP — keine Plugins.",
    accountRequired: "KONTO ERFORDERLICH",
    joinWaitlist: "Beitreten →",
  },
  pricing: {
    label: "PREISE",
    heading: "Einfache transparente Preise",
    subtitle: "Früheinstieg ist offen. Zahlungen werden sicher über Revolut Business verarbeitet.",
    earlyAccess: "FRÜHEINSTIEG — DIE ERSTEN 40 MITGLIEDER ERHALTEN 40% RABATT AUF DEN JAHRESPLAN",
    earlyClosed: "FRÜHEINSTIEG GESCHLOSSEN — WARTELISTE BEITRETEN",
    spotsRemaining: "PLÄTZE VERFÜGBAR",
    oneTime: "einmalig",
    perMonth: "/Monat",
    perYear: "/Jahr",
    mostPopular: "AM BELIEBTESTEN",
    joinWaitlist: "Beitreten →",
  },
  whoFor: {
    label: "FÜR WEN IST ES",
    heading: "Gemacht für",
    headingItalic: "Kreative",
    producers: "Für Produzenten",
    producersDesc: "Bereite Tracks für die Veröffentlichung vor, überprüfe die Lautstärke, vergleiche Mixe und generiere kreative Ideen.",
    djs: "Für DJs",
    djsDesc: "Erkenne BPM und Tonart, plane harmonische Sets und organisiere Übergänge schneller.",
    artists: "Für unabhängige Künstler",
    artistsDesc: "Schließe Musik ab ohne komplexe Plugins oder teure Studio-Workflows.",
  },
  whyExists: {
    label: "WARUM DAS LAB EXISTIERT",
    heading: "Aufgebaut aus einem echten",
    headingItalic: "Workflow",
    body1: "Andy'K Music Lab wurde aus dem echten Workflow von DJ Andy'K entwickelt — von der Vorbereitung von Tracks für die Veröffentlichung bis zur Analyse von Lautstärke, BPM, Tonart, Übergängen und Klang.",
    body2: "Jeder Produzent kennt das gleiche Problem: zu viele Tools, zu viele Plugins, zu viele Schritte. Das Lab bringt den wesentlichen Musik-Vorbereitungs-Workflow in einen sauberen browser-basierten Raum.",
    body3: "Es wurde nicht gebaut, um Kreativität zu ersetzen. Es wurde gebaut, um sie zu schützen.",
    quote: "Musik ist deine Leidenschaft. Das Lab ist der Ort, wo sie bereit wird.",
  },
  founder: {
    label: "GRÜNDER",
    heading: "Entwickelt von",
    headingItalic: "DJ Andy'K",
    body: "DJ Andy'K ist ein Produzent, der sich auf Trance, Progressive House und emotionale elektronische Musik konzentriert. Andy'K Music Lab wurde aus seinem eigenen Release-Workflow aufgebaut — indem der gleiche Vorbereitungsprozess in einfache Tools für andere Produzenten und DJs verwandelt wurde.",
    cta: "DJ Andy'K entdecken →",
  },
  footer: {
    tagline: "Professionelle Audio-Tools — entwickelt von DJ Andy'K",
    copyright: "℗ & © 2026 ANDY'K GROUP INTERNATIONAL LTD",
  },
  mastering: {
    label: "MASTERING-DEMO",
    heading: "Hör den",
    headingItalic: "Unterschied",
  },
};

const es: TranslationKeys = {
  nav: { tools: "Herramientas", pricing: "Precios", about: "Sobre" },
  hero: {
    eyebrow: "POR ANDY'K GROUP INTERNATIONAL",
    subtitle: "Herramientas de audio profesionales — creadas por DJ Andy'K",
    ctaPrimary: "Únete a la lista",
    ctaSecondary: "Ver precios",
    badge1: "Spotify -14 LUFS Ready",
    badge2: "Apple Music Compliant",
    badge3: "100% Basado en navegador",
  },
  tools: {
    label: "HERRAMIENTAS",
    heading: "Todo en un solo lugar",
    description: "Herramientas profesionales para productores y DJs. DSP nativo del navegador — sin plugins.",
    accountRequired: "CUENTA REQUERIDA",
    joinWaitlist: "Únete →",
  },
  pricing: {
    label: "PRECIOS",
    heading: "Precios simples y transparentes",
    subtitle: "El acceso anticipado está abierto. Los pagos se procesan de forma segura a través de Revolut Business.",
    earlyAccess: "ACCESO ANTICIPADO — LOS PRIMEROS 40 MIEMBROS OBTIENEN 40% DE DESCUENTO EN EL PLAN ANUAL",
    earlyClosed: "ACCESO ANTICIPADO CERRADO — ÚNETE A LA LISTA DE ESPERA",
    spotsRemaining: "LUGARES DISPONIBLES",
    oneTime: "única vez",
    perMonth: "/mes",
    perYear: "/año",
    mostPopular: "MÁS POPULAR",
    joinWaitlist: "Únete →",
  },
  whoFor: {
    label: "PARA QUIÉN ES",
    heading: "Hecho para",
    headingItalic: "creadores",
    producers: "Para Productores",
    producersDesc: "Prepara pistas para su lanzamiento, verifica la sonoridad, compara mezclas y genera ideas creativas.",
    djs: "Para DJs",
    djsDesc: "Detecta BPM y tonalidad, planifica sets armónicos y organiza transiciones más rápido.",
    artists: "Para Artistas Independientes",
    artistsDesc: "Termina música sin plugins complejos o costosos flujos de trabajo de estudio.",
  },
  whyExists: {
    label: "POR QUÉ EXISTE EL LAB",
    heading: "Construido desde un",
    headingItalic: "flujo de trabajo real",
    body1: "Andy'K Music Lab fue creado desde el flujo de trabajo real de DJ Andy'K — desde preparar pistas para su lanzamiento hasta analizar sonoridad, BPM, tonalidad, transiciones y sonido final.",
    body2: "Cada productor conoce el mismo problema: demasiadas herramientas, demasiados plugins, demasiados pasos. El Lab trae el flujo de trabajo esencial de preparación musical a un espacio limpio basado en el navegador.",
    body3: "No fue construido para reemplazar la creatividad. Fue construido para protegerla.",
    quote: "La música es tu pasión. El Lab es donde se vuelve lista.",
  },
  founder: {
    label: "FUNDADOR",
    heading: "Construido por",
    headingItalic: "DJ Andy'K",
    body: "DJ Andy'K es un productor enfocado en trance, progressive house y música electrónica emocional. Andy'K Music Lab fue construido desde su propio flujo de trabajo de lanzamiento — convirtiendo el mismo proceso de preparación en herramientas simples para otros productores y DJs.",
    cta: "Explorar DJ Andy'K →",
  },
  footer: {
    tagline: "Herramientas de audio profesionales — creadas por DJ Andy'K",
    copyright: "℗ & © 2026 ANDY'K GROUP INTERNATIONAL LTD",
  },
  mastering: {
    label: "DEMO DE MASTERIZACIÓN",
    heading: "Escucha la",
    headingItalic: "diferencia",
  },
};

export const translations: Record<Locale, TranslationKeys> = { en, sk, de, es };
