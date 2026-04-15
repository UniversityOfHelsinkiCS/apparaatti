/**
 * Seed data for the filters table.
 * This converts the hardcoded filter definitions from useQuestions.tsx and
 * filterConfigMap in filterContext.tsx into DB-ready records with localized text.
 *
 * Run as part of seedDatabase() in development, or as a standalone one-off script
 * in production when first deploying the filters table.
 */

import Filter from './models/filter.ts'
import type { FilterConfig } from '../../common/types.ts'
import logger from '../util/logger.ts'

// ── Shared localized option sets ────────────────────────────────────────────

const neutral = { fi: 'En välitä', sv: 'Jag bryr mig inte', en: 'I don\'t care' }
const yes = { fi: 'Kyllä', sv: 'Ja', en: 'Yes' }
const no = { fi: 'Ei', sv: 'Nej', en: 'No' }
const finnish = { fi: 'suomi', sv: 'finska', en: 'finnish' }
const swedish = { fi: 'ruotsi', sv: 'svenska', en: 'swedish' }
const english = { fi: 'englanti', sv: 'engelska', en: 'english' }

const yesNoOptions = [
  { id: 'neutral', name: neutral },
  { id: '0', name: no },
  { id: '1', name: yes },
]

// ── Filter definitions ───────────────────────────────────────────────────────

type FilterSeed = Omit<FilterConfig, 'enabled'> & { enabled: boolean }

const FILTER_SEEDS: FilterSeed[] = [
  {
    id: 'study-field-select',
    effects: 'org',
    mandatory: true,
    shortName: { fi: 'Opinto-oikeus', sv: 'Studierätt', en: 'Study Right' },
    displayOrder: 0,
    displayType: 'dropdownselect',
    superToggle: false,
    showInWelcomeModal: true,
    hideInCurrentFiltersDisplay: true,
    hideInRecommendationReasons: true,
    hideInFilterSidebar: false,
    isStrictByDefault: false,
    coordinateKey: 'org',
    enabled: true,
    variants: [
      {
        name: 'default',
        question: { fi: 'Valitse tiedekunta', sv: 'Välja en fakultet', en: 'Select a faculty' },
        options: [],
      },
    ],
  },
  {
    id: 'primary-language',
    effects: 'lang',
    mandatory: true,
    shortName: { fi: 'Koulukieli', sv: 'Skolspråk', en: 'School Language' },
    explanation: {
      fi: '\n Opintojen suorittamiseen vaikuttaa koulusivistyskielesi.  \n\n Lue tarkemmat ohjeet Opiskelu-palvelun sivulta\n [Mikä on koulusivistyskielesi?](https://studies.helsinki.fi/ohjeet/artikkeli/mika-koulusivistyskieleni) \n\n',
      sv: '\nDitt utbildningsspråk påverkar slutförandet av dina studier.\n\nLäs mer detaljerade instruktioner på sidan Studietjänst\n[Vad är ditt utbildningsspråk?](https://studies.helsinki.fi/ohjeet/artikkeli/mika-koulusivistyskieleni)\n',
      en: '\nYour language of education affects the completion of your studies.\n\nRead more detailed instructions on the Study Service page\n[What is your language of education?](https://studies.helsinki.fi/ohjeet/artikkeli/mika-koulusivistyskieleni)\n',
    },
    displayOrder: 1,
    superToggle: false,
    showInWelcomeModal: true,
    hideInCurrentFiltersDisplay: true,
    hideInRecommendationReasons: true,
    hideInFilterSidebar: false,
    isStrictByDefault: false,
    enabled: true,
    variants: [
      {
        name: 'default',
        question: { fi: 'Mikä on koulusivistyskielesi?', sv: 'Vilket är ditt undervisningsspråk?', en: 'What is your language of instruction?' },
        options: [
          { id: 'fi', name: finnish },
          { id: 'sv', name: swedish },
        ],
      },
    ],
  },
  {
    id: 'lang',
    effects: 'lang',
    mandatory: true,
    shortName: { fi: 'Kurssi', sv: 'Kurs', en: 'Course' },
    explanation: {
      fi: '\nKaikkiin kandidaatin tutkintoihin kuuluu vähintään 10 op pakollisia kieli- ja viestintäopintoja. Opinnot suoritetaan koulusivistyskielesi mukaan seuraavasti:  \n\n  - äidinkieli (suomi/ruotsi) 3 op  \n\n  - Toinen kotimainen kieli (ruotsi/suomi) 3 op \n\n  - Vieras kieli (lähtötaitotaso englannissa CEFR B2, muissa kielissä CEFR B1) 4 op \n',
      sv: '\nAlla kandidatexamina omfattar minst 10 studiepoäng obligatoriska språk- och kommunikationsstudier. Studierna genomförs enligt ditt utbildningsspråk på följande sätt:\n\n- Modersmål (finska/svenska) 3 sp\n- Andra inhemska språket (svenska/finska) 3 sp\n- Främmande språk (startnivå i engelska CEFR B2, i andra språk CEFR B1) 4 sp\n',
      en: '\nAll bachelor\'s degrees include at least 10 credits of compulsory language and communication studies. The studies are completed according to your language of education as follows:\n\n- Mother tongue (Finnish/Swedish) 3 cr\n- Second national language (Swedish/Finnish) 3 cr\n- Foreign language (starting level in English CEFR B2, in other languages CEFR B1) 4 cr\n',
    },
    displayOrder: 2,
    superToggle: false,
    showInWelcomeModal: true,
    hideInCurrentFiltersDisplay: false,
    hideInRecommendationReasons: true,
    hideInFilterSidebar: false,
    isStrictByDefault: false,
    coordinateKey: 'lang',
    enabled: true,
    variants: [
      {
        name: 'default',
        question: { fi: 'Mistä kielestä haet kursseja?', sv: 'Vilket språk letar du efter kurser i?', en: 'What language are you looking for?' },
        options: [
          { id: 'fi', name: finnish },
          { id: 'sv', name: swedish },
          { id: 'en', name: english },
        ],
      },
    ],
  },
  {
    id: 'primary-language-specification',
    effects: 'lang',
    mandatory: true,
    shortName: { fi: 'Viestintä', sv: 'Kommunikation', en: 'Communication' },
    parentFilterId: 'lang',
    displayOrder: 3,
    superToggle: false,
    showInWelcomeModal: true,
    hideInCurrentFiltersDisplay: false,
    hideInRecommendationReasons: true,
    hideInFilterSidebar: false,
    isStrictByDefault: false,
    enabled: true,
    variants: [
      {
        name: 'default',
        question: { fi: 'Kumman ensisijaisen kielen tyypin haluat valita?', sv: 'Vilken primär språktyp skulle du vilja välja?', en: 'Which primary language type do you want to choose?' },
        options: [
          { id: 'writtenAndSpoken', name: { fi: 'Kirjoitus- ja puheviestintä', sv: 'Skriftlig och muntlig kommunikation', en: 'Written and verbal communication' } },
          { id: 'written', name: { fi: 'Kirjoitusviestintä', sv: 'Skriftlig kommunikation', en: 'Written communication' } },
          { id: 'spoken', name: { fi: 'Puheviestintä', sv: 'Röstkommunikation', en: 'Verbal communication' } },
        ],
      },
    ],
  },
  {
    id: 'previusly-done-lang',
    effects: 'none',
    mandatory: false,
    shortName: { fi: 'Aikaisemmat opinnot', sv: 'Tidigare studier', en: 'Previous Studies' },
    explanation: {
      fi: '\nTutkinnon pakolliset kieli- ja viestintäopinnot voidaan korvata aiempaan kotimaiseen korkeakoulututkintoon sisältyneillä vastaavilla opinnoilla sekä muilla vastaavilla aiemmilla suorituksilla. \n',
      sv: '\nDe obligatoriska språk- och kommunikationsstudierna i examen kan ersättas med motsvarande studier som ingår i en tidigare inhemsk högskoleexamen och andra motsvarande tidigare prestationer.\n',
      en: '\nThe compulsory language and communication studies of the degree can be replaced by equivalent studies included in a previous domestic higher education degree and other equivalent previous achievements.\n',
    },
    extraInfo: {
      fi: 'Lue tarkemmat ohjeet Opiskelu-palvelun sivulta [Tutkinnon viestinnän ja kieliosaamisen opintojen hyväksilukeminen ja hae opintojen korvaamista Sisussa](https://studies.helsinki.fi/ohjeet/artikkeli/opintojen-ja-osaamisen-hyvaksilukeminen?check_logged_in=1)',
      sv: 'Läs mer detaljerade anvisningar på Studieinfo-sidan [Tillgodoräknande av kommunikations- och språkstudier för examen och ansök om ersättande av studier i Sisu](https://studies.helsinki.fi/ohjeet/artikkeli/opintojen-ja-osaamisen-hyvaksilukeminen?check_logged_in=1)',
      en: 'Read more detailed instructions on the Study Service page [Recognition of communication and language studies for a degree and apply for substitution of studies in Sisu](https://studies.helsinki.fi/ohjeet/artikkeli/opintojen-ja-osaamisen-hyvaksilukeminen?check_logged_in=1)',
    },
    displayOrder: 4,
    superToggle: false,
    showInWelcomeModal: false,
    hideInCurrentFiltersDisplay: true,
    hideInRecommendationReasons: true,
    hideInFilterSidebar: false,
    isStrictByDefault: false,
    enabled: true,
    variants: [
      {
        name: 'default',
        question: {
          fi: 'Minulla on aiempaan kotimaiseen korkeakoulututkintoon (valmis tai keskeneräinen) suoritettuja vastaavia opintoja tai muita vastaavia suorituksia.',
          sv: 'Jag har genomfört motsvarande studier eller andra motsvarande prestationer i en tidigare inhemsk högskoleexamen (avslutad eller oavslutad).',
          en: 'I have completed similar studies or other equivalent achievements in a previous domestic higher education degree (completed or incomplete).',
        },
        options: yesNoOptions,
      },
    ],
  },
  {
    id: 'study-year',
    effects: 'date',
    mandatory: false,
    shortName: { fi: 'Lukuvuosi', sv: 'Läsår', en: 'Academic Year' },
    displayOrder: 5,
    displayType: 'singlechoice',
    superToggle: false,
    showInWelcomeModal: false,
    hideInCurrentFiltersDisplay: true,
    hideInRecommendationReasons: false,
    hideInFilterSidebar: false,
    isStrictByDefault: false,
    enabled: true,
    variants: [
      {
        name: 'default',
        question: { fi: 'Valitse lukuvuosi', sv: 'Valitse lukuvuosi', en: 'Select academic year' },
        options: [
          { id: '2025', name: { fi: '2025-2026', sv: '2025-2026', en: '2025-2026' } },
          { id: '2026', name: { fi: '2026-2027', sv: '2026-2027', en: '2026-2027' } },
          { id: '2027', name: { fi: '2027-2028', sv: '2027-2028', en: '2027-2028' } },
        ],
      },
    ],
  },
  {
    id: 'study-period',
    effects: 'date',
    mandatory: false,
    shortName: { fi: 'Periodi', sv: 'Period', en: 'Period' },
    displayOrder: 6,
    displayType: 'multichoice',
    superToggle: false,
    showInWelcomeModal: false,
    hideInCurrentFiltersDisplay: false,
    hideInRecommendationReasons: false,
    hideInFilterSidebar: false,
    isStrictByDefault: false,
    coordinateKey: 'date',
    enabled: true,
    variants: [
      {
        name: 'default',
        question: { fi: 'Mikä on haluamasi kurssin suoritusajankohta?', sv: 'Vilket datum är din önskade kurs?', en: 'What is the date of your desired course?' },
        options: [
          { id: 'intensive_3_previous', name: { fi: 'Intensiivijakso 1', sv: 'Intensivperiod 1', en: 'Intensive Period 1' } },
          { id: 'period_1', name: { fi: '1. periodi', sv: '1. period', en: '1. period' } },
          { id: 'period_2', name: { fi: '2. periodi', sv: '2. period', en: '2. period' } },
          { id: 'period_3', name: { fi: '3. periodi', sv: '3. period', en: '3. period' } },
          { id: 'period_4', name: { fi: '4. periodi', sv: '4. period', en: '4. period' } },
          { id: 'intensive_3', name: { fi: 'Intensiivijakso 2', sv: 'Intensivperiod 2', en: 'Intensive Period 2' } },
        ],
      },
    ],
  },
  {
    id: 'multi-period',
    effects: 'multiPeriod',
    mandatory: false,
    shortName: { fi: 'Kurssin pituus', sv: 'Kurslängd', en: 'Course Duration' },
    displayOrder: 7,
    superToggle: false,
    showInWelcomeModal: false,
    hideInCurrentFiltersDisplay: false,
    hideInRecommendationReasons: false,
    hideInFilterSidebar: false,
    isStrictByDefault: true,
    coordinateKey: 'multiPeriod',
    enabled: true,
    variants: [
      {
        name: 'default',
        question: { fi: 'Hae kursseja jotka kestävät usean periodin ajan', sv: 'Sök kurser som sträcker sig över flera perioder', en: 'Search for courses that span multiple periods' },
        options: yesNoOptions,
      },
    ],
  },
  {
    id: 'replacement',
    effects: 'none',
    mandatory: false,
    shortName: { fi: 'Korvaava', sv: 'Ersättande', en: 'Replacement' },
    displayOrder: 8,
    superToggle: false,
    showInWelcomeModal: true,
    hideInCurrentFiltersDisplay: false,
    hideInRecommendationReasons: false,
    hideInFilterSidebar: false,
    isStrictByDefault: true,
    coordinateKey: 'replacement',
    enabled: true,
    variants: [
      {
        name: 'default',
        question: {
          fi: 'Koen, että olen jo aiemmissa opinnoissani / työelämässä / vapaa-ajalla hankkinut tutkintooni kuuluvia opintoja vastaavat tiedot ja taidot',
          sv: 'Jag anser att jag redan har förvärvat kunskaper och färdigheter motsvarande de som ingår i min examen i mina tidigare studier / arbetsliv / fritid.',
          en: 'I feel that I have already acquired knowledge and skills equivalent to those included in my degree in my previous studies / working life / leisure time.',
        },
        options: yesNoOptions,
      },
      {
        name: 'fi_primary_written',
        explanation: { fi: 'Suomi äidinkielenä oleva infolaatikko', sv: 'Suomi äidinkielenä oleva infolaatikko', en: 'Suomi äidinkielenä oleva infolaatikko' },
        question: {
          fi: 'Oletko kirjoittanut äidinkielen (suomi) (tai S2:n) ylioppilaskokeesta laudaturin tai eximian tai oletko muuten taitava ja itseohjautuva kirjoittaja?',
          sv: 'Har du skrivit en laudatur eller eximia i modersmålets (finska) (eller S2) studentexamen, eller är du i övrigt en skicklig och självstyrd skribent?',
          en: 'Have you written a laudatur or eximia in the mother tongue (Finnish) (or S2) matriculation examination, or are you otherwise a skilled and self-directed writer?',
        },
        options: yesNoOptions,
      },
      {
        name: 'fi_secondary_any',
        question: {
          fi: 'Oletko kaksikielinen (suomi – ruotsi) tai käytätkö suomea paljon ja sujuvasti opinnoissasi ja/tai muussa elämässäsi?',
          sv: 'Är du tvåspråkig (finska – svenska) eller använder du finska mycket och flytande i dina studier och/eller i ditt övriga liv?',
          en: 'Are you bilingual (Finnish - Swedish) or do you use Finnish a lot and fluently in your studies and/or in other areas of your life?',
        },
        options: yesNoOptions,
      },
      {
        name: 'en_secondary_any',
        question: {
          fi: 'Koen, että olen jo aiemmissa opinnoissani / työelämässä / vapaa-ajalla hankkinut tutkintooni kuuluvia opintoja vastaavat tiedot ja taidot (CEFR B2).',
          sv: 'Jag anser att jag redan i mina tidigare studier/arbetsliv/fritid har skaffat mig kunskaper och färdigheter som motsvarar de studier som ingår i min examen (CEFR B2).',
          en: 'I feel that I have already acquired the knowledge and skills corresponding to the studies included in my degree in my previous studies / work life / free time (CEFR B2).',
        },
        options: yesNoOptions,
      },
      {
        name: 'sv_secondary_any',
        question: {
          fi: 'Koen, että olen jo aiemmissa opinnoissani / työelämässä / vapaa-ajalla hankkinut tutkintooni kuuluvia opintoja vastaavat tiedot ja taidot (CEFR B1).',
          sv: 'Jag anser att jag redan i mina tidigare studier/arbetsliv/fritid har skaffat mig kunskaper och färdigheter som motsvarar de studier som ingår i min examen (CEFR B1).',
          en: 'I feel that I have already acquired the knowledge and skills corresponding to the studies included in my degree in my previous studies / work life / free time (CEFR B1).',
        },
        options: yesNoOptions,
      },
      {
        name: 'sv_primary_written',
        question: {
          fi: 'Oletko kirjoittanut äidinkielen (ruotsi) ylioppilaskokeesta laudaturin tai eximian tai oletko muuten taitava ja itseohjautuva kirjoittaja?',
          sv: 'Har du skrivit en laudatur eller eximia i modersmålets (svenska) studentexamen, eller är du i övrigt en skicklig och självstyrd skribent?',
          en: 'Have you written a laudatur or eximia in the mother tongue (Swedish) matriculation examination, or are you otherwise a skilled and self-directed writer?',
        },
        options: yesNoOptions,
      },
    ],
  },
  {
    id: 'mentoring',
    effects: 'mentoring',
    mandatory: false,
    shortName: { fi: 'Valmentava', sv: 'Förberedande', en: 'Preparatory' },
    displayOrder: 9,
    superToggle: false,
    showInWelcomeModal: true,
    hideInCurrentFiltersDisplay: false,
    hideInRecommendationReasons: false,
    hideInFilterSidebar: false,
    isStrictByDefault: true,
    coordinateKey: 'mentoring',
    enabled: true,
    variants: [
      {
        name: 'default',
        question: { fi: 'Tarvitsetko harjoitusta ennen kuin suoritat tutkintoon kuuluvan opintojakson?', sv: 'Behöver du övning innan du slutför en kurs som ingår i din examen?', en: 'Do you need practice before completing a course that is part of your degree?' },
        options: [
          { id: 'neutral', name: neutral },
          { id: '0', name: { fi: 'En koe tarvitsevani harjoitusta', sv: 'Jag känner inte att jag behöver motion.', en: 'I dont think that i need training' } },
          { id: '1', name: { fi: 'Kaipaisin valmennusta ennen opintojen suoritusta', sv: 'Jag skulle vilja ha lite handledning innan jag avslutar mina studier.', en: 'I would like to have a litle bit of training before starting my studies' } },
        ],
      },
      {
        name: 'fi_secondary_any',
        question: {
          fi: 'Haluatko harjoitella arkipäivän asioista keskustelua yhdessä muiden kanssa ja kerrata peruskielioppia ennen tutkintoon kuuluvalle finskan kurssille osallistumista?',
          sv: 'Vill du öva på vardagliga samtal tillsammans med andra och repetera grundläggande grammatik innan du deltar i finskakursen som ingår i examen?',
          en: 'Do you want to practice everyday conversations together with others and review basic grammar before attending the Finnish course that is part of the exam?',
        },
        options: yesNoOptions,
      },
      {
        name: 'sv_primary_spoken',
        question: { fi: '', sv: '', en: '' },
        skipped: true,
        options: yesNoOptions,
      },
      {
        name: 'sv_primary_written',
        question: { fi: 'Tarvitsetko harjoitusta ennen kuin suoritat tutkintoon kuuluvan opintojakson?', sv: 'Behöver du övning innan du slutför en kurs som ingår i din examen?', en: 'Do you need practice before completing a course that is part of your degree?' },
        options: yesNoOptions,
      },
    ],
  },
  {
    id: 'finmu',
    effects: 'finmu',
    mandatory: false,
    shortName: { fi: 'Finmu', sv: 'Finmu', en: 'Finmu' },
    displayOrder: 10,
    superToggle: false,
    showInWelcomeModal: false,
    hideInCurrentFiltersDisplay: false,
    hideInRecommendationReasons: false,
    hideInFilterSidebar: false,
    isStrictByDefault: true,
    coordinateKey: 'finmu',
    enabled: true,
    variants: [
      {
        name: 'default',
        question: { fi: '', sv: '', en: '' },
        skipped: true,
        options: yesNoOptions,
      },
      {
        name: 'fi_secondary_any',
        question: {
          fi: 'Haluatko harjoitella ajankohtaisista asioista ja opinnoistasi suomeksi puhumista ja kirjoittamista yhdessä muiden opiskelijoiden kanssa?',
          sv: 'Vill du öva på att tala och skriva på finska om aktuella ämnen och dina studier tillsammans med andra studenter?',
          en: 'Do you want to practice speaking and writing in Finnish about current topics and your studies together with other students?',
        },
        options: yesNoOptions,
      },
    ],
  },
  {
    id: 'challenge',
    effects: 'challenge',
    mandatory: false,
    shortName: { fi: 'Mukautettu', sv: 'Anpassad', en: 'Custom' },
    displayOrder: 11,
    superToggle: false,
    showInWelcomeModal: false,
    hideInCurrentFiltersDisplay: false,
    hideInRecommendationReasons: false,
    hideInFilterSidebar: false,
    isStrictByDefault: true,
    coordinateKey: 'challenge',
    enabled: true,
    variants: [
      {
        name: 'default',
        question: {
          fi: 'Minulle kielenoppiminen on erityisen haasteellista ja se jännittää/pelottaa minua paljon',
          sv: 'För mig är det särskilt utmanande att lära sig ett språk och det gör mig väldigt nervös/rädd.',
          en: 'For me, learning a language is particularly challenging and it makes me very nervous/scared.',
        },
        options: yesNoOptions,
      },
      {
        name: 'fi_primary_written',
        question: {
          fi: 'Onko sinun elämäntilanteesi tai jännittämisen vuoksi vaikea osallistua läsnäoloa tai yhteisiä verkkotapaamisia sisältäville toteutuksille?',
          sv: 'Är det svårt för dig att delta i genomföranden som inkluderar närvaro eller gemensamma onlinemöten på grund av din livssituation eller ångest?',
          en: 'Is it difficult for you to participate in implementations that include attendance or joint online meetings due to your life situation or anxiety?',
        },
        options: yesNoOptions,
      },
      {
        name: 'fi_primary_spoken',
        question: {
          fi: 'Sosiaaliset tilanteet ovat minusta pelottavia ja jännitän vahvasti erilaisissa vuorovaikutustilanteissa.',
          sv: 'Jag tycker att sociala situationer är skrämmande och jag blir väldigt nervös i olika interaktionssituationer.',
          en: 'I find social situations scary and I get very nervous in different interaction situations.',
        },
        options: yesNoOptions,
      },
      {
        name: 'fi_secondary_any',
        question: {
          fi: 'Jännitätkö suomen kielen käyttämistä niin paljon, että et voi osallistua kurssille, jossa harjoitellaan kieltä yhdessä muiden kanssa?',
          sv: 'Är du så nervös över att använda finska språket att du inte kan delta i en kurs där man övar språket tillsammans med andra?',
          en: 'Are you so anxious about using the Finnish language that you can\'t participate in a course where the language is practiced together with others?',
        },
        options: yesNoOptions,
      },
      {
        name: 'sv_primary_spoken',
        question: { fi: '', sv: '', en: '' },
        skipped: true,
        options: yesNoOptions,
      },
      {
        name: 'sv_primary_written',
        question: { fi: '', sv: '', en: '' },
        skipped: true,
        options: yesNoOptions,
      },
      {
        name: 'sv_primary_any',
        question: { fi: '', sv: '', en: '' },
        skipped: true,
        options: yesNoOptions,
      },
    ],
  },
  {
    id: 'graduation',
    effects: 'graduation',
    mandatory: false,
    shortName: { fi: 'Valmistuville', sv: 'För examinerande', en: 'For Graduating' },
    displayOrder: 12,
    superToggle: false,
    showInWelcomeModal: false,
    hideInCurrentFiltersDisplay: false,
    hideInRecommendationReasons: false,
    hideInFilterSidebar: false,
    isStrictByDefault: true,
    coordinateKey: 'graduation',
    enabled: true,
    variants: [
      {
        name: 'default',
        question: { fi: 'Valmistutko puolen vuoden sisällä?', sv: 'Tar du examen inom sex månader?', en: 'Are you graduating within six months?' },
        options: [
          { id: 'neutral', name: neutral },
          { id: '0', name: { fi: 'En ole valmistumassa puolen vuoden sisällä.', sv: 'Jag tar inte examen om sex månader.', en: 'I am not graduating within half a year.' } },
          { id: '1', name: { fi: 'Kyllä, puolen vuoden sisällä.', sv: 'Ja, inom sex månader.', en: 'Yes, within half a year.' } },
        ],
      },
    ],
  },
  {
    id: 'study-place',
    effects: 'studyPlace',
    mandatory: false,
    shortName: { fi: 'Opetusmuoto', sv: 'Undervisningsform', en: 'Teaching Method' },
    displayOrder: 13,
    displayType: 'multichoice',
    superToggle: false,
    showInWelcomeModal: false,
    hideInCurrentFiltersDisplay: false,
    hideInRecommendationReasons: false,
    hideInFilterSidebar: false,
    isStrictByDefault: true,
    coordinateKey: 'studyPlace',
    enabled: true,
    variants: [
      {
        name: 'default',
        question: { fi: 'Mikä opiskelumuoto sopii sinulle parhaiten?', sv: 'Vilken studieform passar dig bäst?', en: 'Which form of study suits you best?' },
        options: [
          { id: 'teaching-participation-remote', name: { fi: 'Etätapaamisia sisältävä opiskelu.', sv: 'Studier som inkluderar distansmöten', en: 'Studies that include remote sessions' } },
          { id: 'teaching-participation-online', name: { fi: 'Itsenäinen verkko-opiskelu', sv: 'Självständiga nätstudier', en: 'Independent online study' } },
          { id: 'teaching-participation-blended', name: { fi: 'Etäopiskelu ja lähiopetus', sv: 'Distansundervisning och undervisning ansikte mot ansikte', en: 'Distance learning and face-to-face teaching' } },
          { id: 'teaching-participation-contact', name: { fi: 'Lähitapaamisia sisältävä opiskelu', sv: 'Studier som inkluderar möten på plats', en: 'Studies that include face-to-face sessions' } },
        ],
      },
    ],
  },
  {
    id: 'integrated',
    effects: 'integrated',
    mandatory: false,
    shortName: { fi: 'Integroitu', sv: 'Integrerad', en: 'Integrated' },
    displayOrder: 14,
    superToggle: false,
    showInWelcomeModal: false,
    hideInCurrentFiltersDisplay: false,
    hideInRecommendationReasons: false,
    hideInFilterSidebar: false,
    isStrictByDefault: true,
    coordinateKey: 'integrated',
    enabled: true,
    variants: [
      {
        name: 'default',
        question: { fi: 'Olen kiinnostonut kurssista, joka on integroitu oman alani opintoihin.', sv: 'Jag är intresserad av en kurs som är integrerad i mina studier inom mitt område.', en: 'I am interested in a course that is integrated into the studies in my field.' },
        skipped: false,
        options: yesNoOptions,
      },
      {
        name: 'en_secondary_any',
        question: { fi: 'Olen kiinnostonut kurssista, joka on integroitu oman alani opintoihin.', sv: 'Jag är intresserad av en kurs som är integrerad i mina studier inom mitt område.', en: 'I am interested in a course that is integrated into the studies in my field.' },
        options: yesNoOptions,
      },
      {
        name: 'sv_secondary_any',
        question: { fi: 'Olen kiinnostonut kurssista, joka on integroitu oman alani opintoihin.', sv: 'Jag är intresserad av en kurs som är integrerad i mina studier inom mitt område.', en: 'I am interested in a course that is integrated into the studies in my field.' },
        options: yesNoOptions,
      },
    ],
  },
  {
    id: 'independent',
    effects: 'independent',
    mandatory: false,
    shortName: { fi: 'Itsenäinen', sv: 'Självständig', en: 'Independent' },
    displayOrder: 15,
    superToggle: false,
    showInWelcomeModal: false,
    hideInCurrentFiltersDisplay: false,
    hideInRecommendationReasons: false,
    hideInFilterSidebar: false,
    isStrictByDefault: true,
    coordinateKey: 'independent',
    enabled: true,
    variants: [
      {
        name: 'default',
        question: { fi: 'Haluan työskennellä itsenäisesti tai autonomisesti.', sv: 'Jag vill arbeta självständigt eller autonomt.', en: 'I want to work independently or autonomously.' },
        skipped: true,
        options: yesNoOptions,
      },
      {
        name: 'en_secondary_any',
        question: { fi: 'Haluan työskennellä itsenäisesti tai autonomisesti.', sv: 'Jag vill arbeta självständigt eller autonomt.', en: 'I want to work independently or autonomously.' },
        options: yesNoOptions,
      },
      {
        name: 'sv_secondary_any',
        question: { fi: 'Haluan työskennellä itsenäisesti tai autonomisesti.', sv: 'Jag vill arbeta självständigt eller autonomt.', en: 'I want to work independently or autonomously.' },
        options: yesNoOptions,
      },
    ],
  },
  {
    id: 'mooc',
    effects: 'mooc',
    mandatory: false,
    shortName: { fi: 'MOOC', sv: 'MOOC', en: 'MOOC' },
    displayOrder: 16,
    superToggle: false,
    showInWelcomeModal: false,
    hideInCurrentFiltersDisplay: false,
    hideInRecommendationReasons: false,
    hideInFilterSidebar: false,
    isStrictByDefault: true,
    coordinateKey: 'mooc',
    enabled: true,
    variants: [
      {
        name: 'default',
        question: { fi: 'Haluatko etsiä MOOC-kursseja (Massive Open Online Courses)?', sv: 'Vill du söka efter MOOCs (Massive Open Online Courses)?', en: 'Do you want to search for MOOCs (Massive Open Online Courses)?' },
        options: yesNoOptions,
      },
    ],
  },
  {
    id: 'collaboration',
    effects: 'collaboration',
    mandatory: false,
    shortName: { fi: 'Yhteistyö', sv: 'Samarbete', en: 'Collaboration' },
    displayOrder: 17,
    superToggle: false,
    showInWelcomeModal: false,
    hideInCurrentFiltersDisplay: false,
    hideInRecommendationReasons: false,
    hideInFilterSidebar: false,
    isStrictByDefault: true,
    coordinateKey: 'collaboration',
    enabled: true,
    variants: [
      {
        name: 'default',
        question: { fi: 'Näytä yhteistyökumppanien kursseja', sv: 'Visa samarbetspartnerkurser', en: 'Show collaboration partner courses' },
        skipped: false,
        options: yesNoOptions,
      },
    ],
  },
  {
    id: 'exam',
    effects: 'none',
    mandatory: false,
    shortName: { fi: 'Tentti', sv: 'Tentamen', en: 'Exam' },
    displayOrder: 18,
    superToggle: false,
    showInWelcomeModal: false,
    hideInCurrentFiltersDisplay: false,
    hideInRecommendationReasons: false,
    hideInFilterSidebar: false,
    isStrictByDefault: true,
    enabled: true,
    variants: [
      {
        name: 'default',
        question: { fi: 'Näytä tentit', sv: 'Visa tentamen', en: 'Show exams' },
        skipped: false,
        options: yesNoOptions,
      },
    ],
  },
  {
    id: 'flexible',
    effects: 'flexible',
    mandatory: false,
    shortName: { fi: 'Joustava', sv: 'Flexibel', en: 'Flexible' },
    displayOrder: 19,
    superToggle: false,
    showInWelcomeModal: false,
    hideInCurrentFiltersDisplay: false,
    hideInRecommendationReasons: false,
    hideInFilterSidebar: false,
    isStrictByDefault: true,
    coordinateKey: 'flexible',
    enabled: true,
    variants: [
      {
        name: 'default',
        question: { fi: 'Joustavat kurssit', sv: 'Flexibla kurser', en: 'Flexible courses' },
        skipped: false,
        options: yesNoOptions,
      },
    ],
  },
]

// ── Seeding function ─────────────────────────────────────────────────────────

export async function seedFilters() {
  logger.info('Seeding filters...')
  const existing = await Filter.count()
  if (existing > 0) {
    logger.info(`Filters table already has ${existing} rows, skipping seed`)
    return
  }

  const parents = FILTER_SEEDS.filter((f) => !f.parentFilterId)
  const children = FILTER_SEEDS.filter((f) => f.parentFilterId)

  for (const filter of [...parents, ...children]) {
    await Filter.create(filter as any)
  }

  logger.info(`Seeded ${FILTER_SEEDS.length} filters`)
}
