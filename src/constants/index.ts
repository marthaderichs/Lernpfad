import { Course, LevelStatus, LevelType, ShopItem } from '../types';

export const SHOP_ITEMS: ShopItem[] = [
  // Avatars
  { id: 'avatar_ninja', name: 'Ninja', description: 'Lerne im Verborgenen', price: 100, icon: '🥷', category: 'avatar' },
  { id: 'avatar_wizard', name: 'Zauberer', description: 'Magisches Wissen', price: 150, icon: '🧙', category: 'avatar' },
  { id: 'avatar_robot', name: 'Roboter', description: 'Logik-Genie', price: 200, icon: '🤖', category: 'avatar' },
  { id: 'avatar_astronaut', name: 'Astronaut', description: 'Strebe nach den Sternen', price: 250, icon: '👨‍🚀', category: 'avatar' },
  { id: 'avatar_scientist', name: 'Wissenschaftler', description: 'Wissen ist Macht', price: 200, icon: '🧑‍🔬', category: 'avatar' },
  { id: 'avatar_dragon', name: 'Drache', description: 'Feurige Motivation', price: 500, icon: '🐉', category: 'avatar' },

  // Badges
  { id: 'badge_fire', name: 'Feuer-Badge', description: 'Zeige deine Leidenschaft', price: 150, icon: '🔥', category: 'badge' },
  { id: 'badge_star', name: 'Stern-Badge', description: 'Du bist ein Star!', price: 200, icon: '⭐', category: 'badge' },
  { id: 'badge_crown', name: 'Krone', description: 'König des Wissens', price: 400, icon: '👑', category: 'badge' },
  { id: 'badge_diamond', name: 'Diamant', description: 'Unzerbrechlicher Wille', price: 600, icon: '💎', category: 'badge' },

  // Power-ups
  { id: 'powerup_xp_boost', name: 'XP-Boost', description: '2x XP für 24 Stunden', price: 250, icon: '🚀', category: 'powerup' },
];
export const SYSTEM_PROMPT = `
Du bist ein strikter "JSON Course Compiler" für die App "LernPfad AI".
Deine Aufgabe ist es, einen akademisch hochwertigen Kurs in **perfektem, technischem JSON** zu generieren.
Warte auf das Thema des Nutzers am Ende dieses Prompts.

### 🚨 GEFAHR: HÄUFIGE FEHLER VERMEIDEN
Halte dich SKLAVISCH an diese Regeln, sonst stürzt die App ab:

1.  **NESTING REGEL (Wichtig!):**
    *   Jedes Level hat ein \`content\` Objekt. Die Daten liegen DARIN.
    *   ❌ FALSCH: \`{ "type": "QUIZ", "quizQuestions": [...] }\`
    *   ✅ RICHTIG: \`{ "type": "QUIZ", "content": { "quizQuestions": [...] } }\`

2.  **PRACTICE TASKS (Struktur!):**
    *   Nutze NUR \`question\`, \`solution\` und optional \`hint\`.
    *   ❌ VERBOTEN: \`title\`, \`description\`, \`content\` innerhalb eines Tasks.
    *   ✅ RICHTIG: \`{ "question": "Berechne X...", "solution": "Lösungsweg...", "hint": "Formel Y" }\`

3.  **QUIZ LOGIK:**
    *   \`answerIndex\` muss eine Zahl (0-3) sein.
    *   \`options\` muss GENAU 4 Objekte enthalten (\`text\`, \`explanation\`).
    *   KEINE \`isCorrect\` Booleans in den Optionen!

4.  **FARBEN:**
    *   Nutze nur: 'brand-purple', 'brand-blue', 'brand-sky', 'brand-teal', 'brand-green', 'brand-orange', 'brand-red', 'brand-pink'.

---

### DATEN-SCHEMA REFERENZ (TypeScript Definition)

**1. LevelType: "THEORY" oder "SUMMARY"**
\`\`\`json
"content": {
  "title": "Überschrift",
  "description": "Kurzbeschreibung",
  "markdownContent": "## Markdown Text hier..."
}
\`\`\`

**2. LevelType: "QUIZ"**
\`\`\`json
"content": {
  "title": "Quiz Zeit",
  "description": "Teste dich",
  "quizQuestions": [
    {
      "question": "Frage?",
      "options": [
        { "text": "A", "explanation": "Warum falsch/richtig" },
        { "text": "B", "explanation": "..." },
        { "text": "C", "explanation": "..." },
        { "text": "D", "explanation": "..." }
      ],
      "answerIndex": 0
    }
  ]
}
\`\`\`

**3. LevelType: "FLASHCARDS"**
\`\`\`json
"content": {
  "title": "Vokabeln",
  "description": "Lernen",
  "flashcards": [
    { "front": "Vorderseite", "back": "Rückseite" }
  ]
}
\`\`\`

**4. LevelType: "PRACTICE"**
\`\`\`json
"content": {
  "title": "Übung",
  "description": "Anwenden",
  "practiceTasks": [
    {
      "question": "Aufgabenstellung (Markdown erlaubt)",
      "hint": "Optionaler Hinweis",
      "solution": "Lösungsweg (Markdown erlaubt)"
    }
  ]
}
\`\`\`

---

### JSON VORLAGE (Kopiere diese Struktur exakt!)

\`\`\`json
{
  "id": "c_unique_id_123",
  "title": "TITEL DES KURSES",
  "professor": "Dr. Name",
  "icon": "🧬",
  "themeColor": "brand-blue",
  "totalProgress": 0,
  "units": [
    {
      "id": "u1",
      "title": "Kapitel 1",
      "description": "Beschreibung",
      "colorTheme": "brand-blue",
      "levels": [
        {
          "id": "l1",
          "type": "THEORY",
          "status": "UNLOCKED",
          "stars": 0,
          "title": "Einführung",
          "content": {
            "title": "Grundlagen",
            "description": "Einstieg ins Thema",
            "markdownContent": "## Hallo Welt\\nDas ist der Text."
          }
        },
        {
          "id": "l2",
          "type": "FLASHCARDS",
          "status": "LOCKED",
          "stars": 0,
          "title": "Begriffe",
          "content": {
            "title": "Wichtige Begriffe",
            "description": "5 Karten",
            "flashcards": [
              { "front": "Begriff A", "back": "Erklärung A" }
            ]
          }
        },
        {
          "id": "l3",
          "type": "PRACTICE",
          "status": "LOCKED",
          "stars": 0,
          "title": "Training",
          "content": {
            "title": "Anwendung",
            "description": "Löse die Aufgaben",
            "practiceTasks": [
              {
                "question": "Was ergibt 2+2?",
                "hint": "Einfache Addition",
                "solution": "Die Lösung ist **4**."
              }
            ]
          }
        },
        {
          "id": "l4",
          "type": "QUIZ",
          "status": "LOCKED",
          "stars": 0,
          "title": "Abschlussquiz",
          "content": {
            "title": "Prüfung",
            "description": "Alles verstanden?",
            "quizQuestions": [
               {
                 "question": "Frage...",
                 "options": [
                    {"text": "A", "explanation": ".."},
                    {"text": "B", "explanation": ".."},
                    {"text": "C", "explanation": ".."},
                    {"text": "D", "explanation": ".."}
                 ],
                 "answerIndex": 0
               }
            ]
          }
        }
      ]
    }
  ]
}
\`\`\`

Antworte NUR mit dem JSON Code. Kein Text davor oder danach.
Das Thema des Nutzers lautet:
`;

export const INITIAL_COURSES: Course[] = [
  {
    id: 'c_demo_1',
    title: 'LernPfad Demo',
    professor: 'AI Architect',
    icon: '🧠',
    totalProgress: 0,
    themeColor: 'brand-purple',
    units: [
      {
        id: 'u1',
        title: 'Modul 1: UI Konzepte',
        description: 'Design & Interaktion',
        colorTheme: 'brand-purple',
        levels: [
          {
            id: 'l1_theory',
            title: 'Das Konzept',
            type: LevelType.THEORY,
            status: LevelStatus.UNLOCKED,
            stars: 0,
            content: {
              title: 'Willkommen',
              description: 'Einführung in die App',
              markdownContent: "## Willkommen bei LernPfad AI! 👋\n\nHier lernst du **interaktiv** und **effizient**.\n\n### Deine Lern-Formate:\n\n1. **Theorie**: Kompakt aufbereitete Texte mit Markdown-Support.\n2. **Quiz**: Detaillierte Fragen mit Erklärungen für *jede* Antwortmöglichkeit.\n3. **Flashcards**: Intelligentes Wiederholungssystem (Spaced Repetition).\n4. **Praxis**: Schritt-für-Schritt Aufgaben mit Lösungen.\n\nKlicke unten, um fortzufahren!"
            }
          },
          {
            id: 'l2_quiz',
            title: 'UI Quiz',
            type: LevelType.QUIZ,
            status: LevelStatus.LOCKED,
            stars: 0,
            content: {
              title: 'Design Check',
              description: 'Verstehst du das UI?',
              quizQuestions: [
                {
                  question: "Warum nutzen wir Karten-Design?",
                  options: [
                    { text: "Weil es cool aussieht", explanation: "Auch wahr, aber nicht der Hauptgrund. Es geht um Übersichtlichkeit." },
                    { text: "Modulare Informationen", explanation: "**Chunking** hilft dem Gehirn, Informationen besser zu verarbeiten." },
                    { text: "Um Papier zu sparen", explanation: "Wir sind eine digitale App, Papier ist hier nicht relevant." },
                    { text: "Zufall", explanation: "Nein, Design ist nie Zufall." }
                  ],
                  answerIndex: 1
                },
                {
                  question: "Was passiert bei falschen Flashcards?",
                  options: [
                    { text: "Sie werden gelöscht", explanation: "Nein, dann würdest du nichts lernen." },
                    { text: "Man muss bezahlen", explanation: "Quatsch, Lernen ist hier kostenlos." },
                    { text: "Sie kommen zurück", explanation: "Falsche Karten werden hinten eingereiht und später erneut abgefragt." },
                    { text: "Das Handy explodiert", explanation: "Bitte nicht! Das wäre ein schlechtes Feature." }
                  ],
                  answerIndex: 2
                }
              ]
            }
          }
        ]
      },
      {
        id: 'u2',
        title: 'Modul 2: Mathe & Logik',
        description: 'Praxis Training',
        colorTheme: 'brand-green',
        levels: [
          {
            id: 'l3_flash',
            title: 'Formeln',
            type: LevelType.FLASHCARDS,
            status: LevelStatus.LOCKED,
            stars: 0,
            content: {
              title: 'Mathe Basics',
              description: '3 Karten',
              flashcards: [
                { front: "Satz des Pythagoras", back: "a² + b² = c²" },
                { front: "Kreisfläche", back: "A = π * r²" },
                { front: "Binomische Formel (1)", back: "(a+b)² = a² + 2ab + b²" }
              ]
            }
          },
          {
            id: 'l4_prac',
            title: 'Rechenaufgaben',
            type: LevelType.PRACTICE,
            status: LevelStatus.LOCKED,
            stars: 0,
            content: {
              title: 'Kopfrechnen',
              description: 'Aktiviere dein Gehirn',
              practiceTasks: [
                {
                  question: "Ein Produkt kostet 120€. Es wird um 20% reduziert. Was ist der neue Preis?",
                  hint: "Berechne erst 10%, dann verdopple es für 20%.",
                  solution: "1. 10% von 120€ = 12€\n2. 20% sind also 24€\n3. 120€ - 24€ = **96€**"
                },
                {
                  question: "Löse nach x auf: 3x + 9 = 24",
                  solution: "1. 3x = 15 (auf beiden Seiten -9)\n2. **x = 5** (durch 3 teilen)"
                }
              ]
            }
          }
        ]
      },
      {
        id: 'u3',
        title: 'Modul 3: Finale',
        description: 'Zusammenfassung',
        colorTheme: 'brand-orange',
        levels: [
          {
            id: 'l5_sum',
            title: 'Abschluss',
            type: LevelType.SUMMARY,
            status: LevelStatus.LOCKED,
            stars: 0,
            content: {
              title: 'Zusammenfassung',
              description: 'Das hast du gelernt',
              markdownContent: "### Herzlichen Glückwunsch! 🎉\n\nDu hast das Demo-Modul durchgespielt.\n\n**Deine Achievements:**\n- ✅ Umgang mit der UI\n- ✅ Verstehen der Level-Typen\n- ✅ Mathe-Basics wiederholt\n\nDu kannst jetzt eigene Kurse generieren lassen!"
            }
          }
        ]
      }
    ]
  }
];