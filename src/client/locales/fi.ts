
const primaryLanguageExplanationMarkdown = `
 Opintojen suorittamiseen vaikuttaa koulusivistyskielesi.  

 Lue tarkemmat ohjeet Opiskelu-palvelun sivulta
 [Mikä on koulusivistyskielesi?](https://studies.helsinki.fi/ohjeet/artikkeli/mika-koulusivistyskieleni) 

`

const searchedLanguageExplanationMarkdown = `
Kaikkiin kandidaatin tutkintoihin kuuluu vähintään 10 op pakollisia kieli- ja viestintäopintoja. Opinnot suoritetaan koulusivistyskielesi mukaan seuraavasti:  

  - äidinkieli (suomi/ruotsi) 3 op  

  - Toinen kotimainen kieli (ruotsi/suomi) 3 op 

  - Vieras kieli (lähtötaitotaso englannissa CEFR B2, muissa kielissä CEFR B1) 4 op 
`


const previouslyDoneLangExplanationMarkdown= `
Tutkinnon pakolliset kieli- ja viestintäopinnot voidaan korvata aiempaan kotimaiseen korkeakoulututkintoon sisältyneillä vastaavilla opinnoilla sekä muilla vastaavilla aiemmilla suorituksilla. 
`
export default {
  'common': {},
  'form': {
    'previoslyDoneLangExplanation': previouslyDoneLangExplanationMarkdown,
    'searchedLanguageExplanation': searchedLanguageExplanationMarkdown,
    'primaryLanguageQuestion': 'Mikä on koulusivistyskielesi?',
    'languageQuestion': 'Mistä kielestä haet kursseja?',
    'primaryLanguageSpecificationQuestion': 'Kumman ensisijaisen kielen tyypin haluat valita?',
    'previouslyDoneLangQuestion': 'Minulla on aiempaan kotimaiseen korkeakoulututkintoon (valmis tai keskeneräinen) suoritettuja vastaavia opintoja tai muita vastaavia suorituksia.',
    'studyPeriodQuestion': 'Mikä on haluamasi kurssin suoritusajankohta?',
    'replacementQuestion': 'Koen, että olen jo aiemmissa opinnoissani / työelämässä / vapaa-ajalla hankkinut tutkintooni kuuluvia opintoja vastaavat tiedot ja taidot (CEFR B1/B2).',
    'mentoringQuestion': 'Tarvitsetko harjoitusta ennen kuin suoritat tutkintoon kuuluvan opintojakson?',
    'challengeQuestion': 'Minulle kielenoppiminen on erityisen haasteellista ja se jännittää/pelottaa minua paljon',
    'graduationQuestion': 'Valmistutko lähiaikoina?',
    'studyPlaceQuestion': 'Mikä opiskelumuoto sopii sinulle parhaiten?',
    'integratedQuestion': 'Olen kiinnostonut kurssista, joka on integroitu oman alani opintoihin.',
    'independentQuestion': 'Haluan työskennellä itsenäisesti tai autonomisesti.',
    'flexibleQuestion': 'Haluan osallistua kurssille, jonka aikataulu on joustava.',
    'moocQuestion': 'Haluatko etsiä MOOC-kursseja (Massive Open Online Courses)?',
    'finnish': 'suomi',
    'swedish': 'ruotsi',
    'english': 'englanti',
    'yes': 'Kyllä',
    'no': 'Ei',
    'neutralChoice': 'Ei valintaa',
    'both': 'Molemmat',
    'written': 'Kirjoitusviestintä',
    'spoken': 'Puheviestintä',
    'summer': 'Kesä',
    'period': 'periodi',
    'mentoringQuestionYes': 'Kaipaisin valmennusta ennen opintojen suoritusta',
    'mentoringQuestionNo': 'En koe tarvitsevani harjoitusta',
    'graduationQuestionYes': 'Kyllä, puolen vuoden sisällä.',
    'graduationQuestionNo': 'En ole valmistumassa puolen vuoden sisällä.',
    'studyPlaceRemote': 'Etätapaamisia sisältävä opiskelu.',
    'studyPlaceOnline': 'Itsenäinen verkko-opiskelu',
    'studyPlaceCombined': 'Etäopiskelu ja lähiopetus',
    'studyPlaceF2F': 'Lähitapaamisia sisältävä opiskelu',
    'studyPlaceNeutral': 'Opiskelumuodolla ei ole väliä',
    'primaryLanguageExplanation': primaryLanguageExplanationMarkdown,
    'replacementQuestion_fi_primary_written': 'Oletko kirjoittanut äidinkielen (suomi) (tai S2:n) ylioppilaskokeesta laudaturin tai eximian tai oletko muuten taitava ja itseohjautuva kirjoittaja?',
    'challengeQuestion_fi_primary_written': 'Onko sinun elämäntilanteesi tai jännittämisen vuoksi vaikea osallistua läsnäoloa tai yhteisiä verkkotapaamisia sisältäville toteutuksille?',
    'challengeQuestion_fi_primary_spoken': 'Sosiaaliset tilanteet ovat minusta pelottavia ja jännitän vahvasti erilaisissa vuorovaikutustilanteissa.',
  },
  'question': {
    'extrainfo': 'Lisätietoa',
    'checkInstructionsCrediting': 'Katso ohjeet hyväksilukemiseen',
    'fromHere': 'täältä',
    'noExtrainfo': 'Ei lisätietoa',
    'pickStudy': 'Valitse tiedekunta',
    'skipped': 'Kysymys ohitettu: ei vaikutusta',
    'mandatory': 'Pakollinen',
    'close': 'Sulje'
  },
  'app': {
    'logout': 'Kirjaudu ulos',
    'questionaire': 'Kysely',
    'recommendations': 'Suositukset',
    'send': 'Lähetä',
    'back': 'Takaisin'
  },
  'recommendations': {
    'accurate': 'Tarkimmat suositukset:',
    'all': 'Kaikki suositukset (tarkuus voi vaihdella):',
    'pointbased': 'Pistepohjaiset suositukset'
  },
  'course': {
    'show': 'Näytä',
    'credits': 'op',
    'reasons': 'perusteet'
  }
}
