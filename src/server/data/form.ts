import type { Form } from "../../common/types.ts"

export const FORM: Form = {
  id: "1",
  questions: [
    {
      id: "1",
      question: {
        fi: "Mikä on minttu?",
        sv: "Vad är mint?",
        en: "What is mint?",
      },
      type: "select",
      options: [
        { id: "1", name: { fi: "Kasvi", sv: "Växt", en: "Plant" } },
        { id: "2", name: { fi: "Juoma", sv: "Dryck", en: "Drink" } },
        { id: "3", name: { fi: "Maku", sv: "Smak", en: "Flavor" } },
      ],
    },
    {
      id: "2",
      question: {
        fi: "Mikä on lempivärisi?",
        sv: "Vad är din favoritfärg?",
        en: "What is your favorite color?",
      },
      type: "select",
      options: [
        { id: "1", name: { fi: "Punainen", sv: "Röd", en: "Red" } },
        { id: "2", name: { fi: "Sininen", sv: "Blå", en: "Blue" } },
        { id: "3", name: { fi: "Vihreä", sv: "Grön", en: "Green" } },
      ],
    },
  ],
}