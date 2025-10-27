const primaryLanguageExplanationMarkdown = `
Ditt utbildningsspråk påverkar slutförandet av dina studier.

Läs mer detaljerade instruktioner på sidan Studietjänst
[Vad är ditt utbildningsspråk?](https://studies.helsinki.fi/ohjeet/artikkeli/mika-koulusivistyskieleni)
`


const searchedLanguageExplanationMarkdown = `
Alla kandidatexamina omfattar minst 10 studiepoäng obligatoriska språk- och kommunikationsstudier. Studierna genomförs enligt ditt utbildningsspråk på följande sätt:

- Modersmål (finska/svenska) 3 sp
- Andra inhemska språket (svenska/finska) 3 sp
- Främmande språk (startnivå i engelska CEFR B2, i andra språk CEFR B1) 4 sp
`

const previouslyDoneLangExplanationMarkdown = `
De obligatoriska språk- och kommunikationsstudierna i examen kan ersättas med motsvarande studier som ingår i en tidigare inhemsk högskoleexamen och andra motsvarande tidigare prestationer.
`

export default {
  'common': {},
  'form': {
    'previoslyDoneLangExplanation': previouslyDoneLangExplanationMarkdown,
    'searchedLanguageExplanation': searchedLanguageExplanationMarkdown,
    'primaryLanguageQuestion': 'Vilket är ditt undervisningsspråk?',
    'languageQuestion': 'Vilket språk letar du efter kurser i?',
    'primaryLanguageSpecificationQuestion': 'Vilken primär språktyp skulle du vilja välja?',
    'previouslyDoneLangQuestion': 'Jag har genomfört motsvarande studier eller andra motsvarande prestationer i en tidigare inhemsk högskoleexamen (avslutad eller oavslutad).',
    'studyPeriodQuestion': 'Vilket datum är din önskade kurs?',
    'replacementQuestion': 'Jag anser att jag redan har förvärvat kunskaper och färdigheter motsvarande de som ingår i min examen i mina tidigare studier / arbetsliv / fritid. (CEFR B1/B2)',
    'mentoringQuestion': 'Behöver du övning innan du slutför en kurs som ingår i din examen?',
    'challengeQuestion': 'För mig är det särskilt utmanande att lära sig ett språk och det gör mig väldigt nervös/rädd.',
    'graduationQuestion': 'Tar du examen snart?',
    'studyPlaceQuestion': 'Vilken studieform passar dig bäst?',
    'integratedQuestion': 'Jag är intresserad av en kurs som är integrerad i mina studier inom mitt område.',
    'independentQuestion': 'Jag vill arbeta självständigt eller autonomt.',
    'flexibleQuestion': 'Jag vill ta en kurs med ett flexibelt schema.',
    'moocQuestion': 'Vill du söka efter MOOCs (Massive Open Online Courses)?',
    'finnish': 'finska',
    'swedish': 'svenska',
    'english': 'engelska',
    'yes': 'Ja',
    'no': 'Nej',
    'neutralChoice': 'Inget val',
    'both': 'Både',
    'written': 'Skriftlig kommunikation',
    'spoken': 'Röstkommunikation',
    'summer': 'Sommar',
    'period': 'period',
    'mentoringQuestionYes': 'Jag skulle vilja ha lite handledning innan jag avslutar mina studier.',
    'mentoringQuestionNo': 'Jag känner inte att jag behöver motion.',
    'graduationQuestionYes': 'Ja, inom sex månader.',
    'graduationQuestionNo': 'Jag tar inte examen om sex månader.',
    'studyPlaceRemote': 'Studier som inkluderar distansmöten',
    'studyPlaceOnline': 'Självständiga nätstudier',
    'studyPlaceCombined': 'Distansundervisning och undervisning ansikte mot ansikte',
    'studyPlaceF2F': 'Studier som inkluderar möten på plats',
    'studyPlaceNeutral': 'Studieformen spelar ingen roll',
    'primaryLanguageExplanation': primaryLanguageExplanationMarkdown,
    'replacementQuestion_fi_primary_written': 'Har du skrivit en laudatur eller eximia i modersmålets (finska) (eller S2) studentexamen, eller är du i övrigt en skicklig och självstyrd skribent?',
    'challengeQuestion_fi_primary_written': 'Är det svårt för dig att delta i genomföranden som inkluderar närvaro eller gemensamma onlinemöten på grund av din livssituation eller ångest?',
    'challengeQuestion_fi_primary_spoken': 'Jag tycker att sociala situationer är skrämmande och jag blir väldigt nervös i olika interaktionssituationer.',
  },
  'question': {
    'extrainfo': 'Ytterligare information',
    'checkInstructionsCrediting': 'Se instruktioner för kreditering',
    'fromHere': 'härifrån',
    'noExtrainfo': 'Ingen ytterligare information',
    'pickStudy': 'Välja en fakultet',
    'skipped': 'Fråga överhoppad: ingen effekt',
    'mandatory': 'Obligatorisk',
    'close': 'Stäng'
  },
  'app': {
    'logout': 'Logga ut',
    'questionaire': 'Förfrågan',
    'recommendations': 'Rekommendationer',
    'send': 'Stäng in',
    'back': 'Tillbaka'
  },
  'recommendations': {
    'accurate': 'De mest exakta rekommendationerna:',
    'all': 'alla rekommendationer (noggrannheten kan variera):',
    'pointbased': 'Poängbaserade rekommendationer'
  },
  'course': {
    'show': 'Visa',
    'credits': 'kr',
    'reasons': 'grundläggande'
  }
}
