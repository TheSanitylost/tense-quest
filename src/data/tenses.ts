export type TenseId =
  | 'present-simple'
  | 'present-continuous'
  | 'present-perfect'
  | 'present-perfect-continuous'
  | 'past-simple'
  | 'past-continuous'
  | 'past-perfect'
  | 'past-perfect-continuous'
  | 'future-simple'
  | 'future-continuous'
  | 'future-perfect'
  | 'future-perfect-continuous'

export interface TenseLevel {
  id: TenseId
  order: number
  nameEn: string
  namePl: string
  shortLabel: string
  vibe: string
  briefing: string
  when: string
  signalWords: string[]
  examples: {
    affirmative: string
    negative: string
    question: string
    tip: string
  }
}

export const TENSES: TenseLevel[] = [
  {
    id: 'present-simple',
    order: 1,
    nameEn: 'Present Simple',
    namePl: 'Czas teraźniejszy prosty',
    shortLabel: 'PS',
    vibe: 'Rutyna. Fakty. Zero dramatu.',
    briefing:
      'Używasz go do nawyków, rozkładów dnia i faktów, które po prostu są prawdziwe. Typowy „codzienny” czas.',
    when: 'nawyki, fakty, rozkłady (autobusy, lekcje)',
    signalWords: ['always', 'usually', 'often', 'sometimes', 'never', 'every day'],
    examples: {
      affirmative: 'She plays football after school.',
      negative: 'She does not (doesn’t) play football after school.',
      question: 'Does she play football after school?',
      tip: 'He/She/It → czasownik + -s/-es. Pytania i przeczenia: do/does.',
    },
  },
  {
    id: 'present-continuous',
    order: 2,
    nameEn: 'Present Continuous',
    namePl: 'Czas teraźniejszy ciągły',
    shortLabel: 'PC',
    vibe: 'Dzieje się TERAZ. Albo prawie.',
    briefing:
      'Coś trwa w tej chwili albo jest tymczasowe. Też plany „na bank” w najbliższej przyszłości.',
    when: 'akcja w toku, tymczasowość, umówione plany',
    signalWords: ['now', 'at the moment', 'Look!', 'Listen!', 'this week'],
    examples: {
      affirmative: 'They are studying for a test right now.',
      negative: 'They are not (aren’t) studying for a test right now.',
      question: 'Are they studying for a test right now?',
      tip: 'be (am/is/are) + czasownik-ing.',
    },
  },
  {
    id: 'present-perfect',
    order: 3,
    nameEn: 'Present Perfect',
    namePl: 'Czas present perfect',
    shortLabel: 'PP',
    vibe: 'Przeszłość z efektem na teraz.',
    briefing:
      'Coś się wydarzyło (nie mówisz dokładnie kiedy) i ma znaczenie teraz. Albo trwa od przeszłości do teraz.',
    when: 'doświadczenia, wynik, „od… do teraz”',
    signalWords: ['already', 'yet', 'just', 'ever', 'never', 'since', 'for'],
    examples: {
      affirmative: 'I have finished my homework.',
      negative: 'I have not (haven’t) finished my homework.',
      question: 'Have you finished your homework?',
      tip: 'have/has + III forma (past participle).',
    },
  },
  {
    id: 'present-perfect-continuous',
    order: 4,
    nameEn: 'Present Perfect Continuous',
    namePl: 'Present perfect continuous',
    shortLabel: 'PPC',
    vibe: 'Trwało… i widać skutki.',
    briefing:
      'Podkreślasz, że coś trwało / nadal trwa. Często: zmęczenie, bałagan, „od godziny…”.',
    when: 'akcja od przeszłości, często z for/since',
    signalWords: ['for', 'since', 'all day', 'recently', 'lately'],
    examples: {
      affirmative: 'She has been running for an hour.',
      negative: 'She has not been running for an hour.',
      question: 'Has she been running for an hour?',
      tip: 'have/has + been + -ing.',
    },
  },
  {
    id: 'past-simple',
    order: 5,
    nameEn: 'Past Simple',
    namePl: 'Czas przeszły prosty',
    shortLabel: 'Past',
    vibe: 'Koniec. Było. Poszło.',
    briefing:
      'Skończone wydarzenia w przeszłości. Znasz (mniej więcej) kiedy: yesterday, last week, in 2020.',
    when: 'skończone akcje w przeszłości',
    signalWords: ['yesterday', 'last week', 'ago', 'in 2019', 'when I was…'],
    examples: {
      affirmative: 'We visited Kraków last summer.',
      negative: 'We did not (didn’t) visit Kraków last summer.',
      question: 'Did you visit Kraków last summer?',
      tip: 'Czasownik w II formie. Pytania/przeczenia: did + I forma.',
    },
  },
  {
    id: 'past-continuous',
    order: 6,
    nameEn: 'Past Continuous',
    namePl: 'Czas przeszły ciągły',
    shortLabel: 'PCont',
    vibe: 'Tło akcji. Film w tle.',
    briefing:
      'Coś trwało w pewnym momencie w przeszłości. Często: „robiłem X, gdy nagle Y”.',
    when: 'akcja w toku w przeszłości, tło dla past simple',
    signalWords: ['while', 'when', 'at 5 pm', 'all evening'],
    examples: {
      affirmative: 'I was reading when the phone rang.',
      negative: 'I was not (wasn’t) reading when the phone rang.',
      question: 'Were you reading when the phone rang?',
      tip: 'was/were + -ing.',
    },
  },
  {
    id: 'past-perfect',
    order: 7,
    nameEn: 'Past Perfect',
    namePl: 'Past perfect',
    shortLabel: 'PPerf',
    vibe: 'Jeszcze wcześniej niż „wtedy”.',
    briefing:
      'Akcja, która wydarzyła się PRZED inną przeszłą akcją. Timeline: earlier → later (past).',
    when: 'wcześniejsza przeszłość względem innej przeszłości',
    signalWords: ['already', 'before', 'after', 'by the time', 'until'],
    examples: {
      affirmative: 'She had left before I arrived.',
      negative: 'She had not (hadn’t) left before I arrived.',
      question: 'Had she left before you arrived?',
      tip: 'had + III forma.',
    },
  },
  {
    id: 'past-perfect-continuous',
    order: 8,
    nameEn: 'Past Perfect Continuous',
    namePl: 'Past perfect continuous',
    shortLabel: 'PPC↓',
    vibe: 'Długo trwało… zanim coś się stało.',
    briefing:
      'Podkreślasz czas trwania przed innym momentem w przeszłości. „Czekałem godzinę, zanim…”.',
    when: 'trwanie przed punktem w przeszłości',
    signalWords: ['for', 'since', 'before', 'until', 'all morning'],
    examples: {
      affirmative: 'They had been waiting for an hour before the bus came.',
      negative: 'They had not been waiting for an hour.',
      question: 'Had they been waiting for an hour?',
      tip: 'had + been + -ing.',
    },
  },
  {
    id: 'future-simple',
    order: 9,
    nameEn: 'Future Simple',
    namePl: 'Czas przyszły prosty (will)',
    shortLabel: 'Will',
    vibe: 'Zdecyduję. Obiecuję. Przepowiadam.',
    briefing:
      'Will = decyzje spontaniczne, obietnice, przewidywania. (Be going to to osobna historia planów.)',
    when: 'spontaniczne decyzje, obietnice, przewidywania',
    signalWords: ['tomorrow', 'soon', 'I think', 'probably', 'I promise'],
    examples: {
      affirmative: 'I will help you with the project.',
      negative: 'I will not (won’t) help you with the project.',
      question: 'Will you help me with the project?',
      tip: 'will + I forma czasownika.',
    },
  },
  {
    id: 'future-continuous',
    order: 10,
    nameEn: 'Future Continuous',
    namePl: 'Future continuous',
    shortLabel: 'FCont',
    vibe: 'O tej porze jutro… będę w akcji.',
    briefing:
      'Coś będzie trwało w konkretnym momencie w przyszłości. Albo uprzejme pytania o plany.',
    when: 'akcja w toku w przyszłym momencie',
    signalWords: ['at this time tomorrow', 'this time next week', 'all day tomorrow'],
    examples: {
      affirmative: 'This time tomorrow I will be flying to Spain.',
      negative: 'I will not be flying to Spain.',
      question: 'Will you be flying to Spain?',
      tip: 'will + be + -ing.',
    },
  },
  {
    id: 'future-perfect',
    order: 11,
    nameEn: 'Future Perfect',
    namePl: 'Future perfect',
    shortLabel: 'FPerf',
    vibe: 'Do jutra będzie już zrobione.',
    briefing:
      'Do pewnego momentu w przyszłości coś będzie już zakończone. Deadline vibes.',
    when: 'ukończenie przed punktem w przyszłości',
    signalWords: ['by tomorrow', 'by then', 'by the time', 'before'],
    examples: {
      affirmative: 'By Friday she will have finished the book.',
      negative: 'She will not have finished the book by Friday.',
      question: 'Will she have finished the book by Friday?',
      tip: 'will + have + III forma.',
    },
  },
  {
    id: 'future-perfect-continuous',
    order: 12,
    nameEn: 'Future Perfect Continuous',
    namePl: 'Future perfect continuous',
    shortLabel: 'Boss+',
    vibe: 'Boss level. Ile już będę to robić?',
    briefing:
      'Do konkretnego momentu w przyszłości coś będzie trwało określoną ilość czasu. Rare, ale brzmi pro.',
    when: 'trwanie aż do przyszłego punktu',
    signalWords: ['by then', 'for', 'by next year', 'by the time'],
    examples: {
      affirmative: 'By June I will have been learning English for five years.',
      negative: 'I will not have been learning English for five years by June.',
      question: 'Will you have been learning English for five years by June?',
      tip: 'will + have + been + -ing.',
    },
  },
]

export function getTense(id: string): TenseLevel | undefined {
  return TENSES.find((t) => t.id === id)
}

export function getTenseByOrder(order: number): TenseLevel | undefined {
  return TENSES.find((t) => t.order === order)
}
