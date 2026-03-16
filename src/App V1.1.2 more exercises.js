import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Home, Calendar, Activity, Sun, Moon, PlayCircle, PauseCircle,
  SkipForward, ChevronDown, ChevronUp, Shuffle, Settings,
  Flame, Target, Dumbbell, Clock, CheckCircle2, BookOpen, Search
} from 'lucide-react';

// --- HILFSFUNKTIONEN ---
const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const getDynamicGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5) return ["Nachteule! 🦉", "Spätschicht im Training! 🌙", "Noch wach? Gib Gas! 🔋"][Math.floor(Math.random() * 3)];
  if (hour >= 5 && hour < 9) return ["Guten Morgen! 🌅", "Der frühe Vogel... 🐦", "Morgen-Workout für den perfekten Tag! ☀️"][Math.floor(Math.random() * 3)];
  if (hour >= 9 && hour < 12) return ["Guten Vormittag! ⚡", "Bleib in Bewegung! 💪", "Zeit für eine aktive Pause! 🏃"][Math.floor(Math.random() * 3)];
  if (hour >= 12 && hour < 14) return ["Mahlzeit! Mittagspause = Trainingszeit! 🍽️", "Mittags-Boost! 🚀"][Math.floor(Math.random() * 2)];
  if (hour >= 14 && hour < 18) return ["Guten Nachmittag! ☕", "Das Nachmittags-Tief bekämpfen! 💥", "Packen wir es an! 🔥"][Math.floor(Math.random() * 3)];
  return ["Guten Abend! 🌇", "Feierabend-Workout! 🍻", "Stress abbauen, Muskeln aufbauen! 🧘"][Math.floor(Math.random() * 3)];
};

// --- DATENBANK ---
const TARGETS = {
  Strength: ['Oberkörper', 'Unterkörper', 'Core'],
  Cardio: ['HIIT (Bodyweight)', 'Laufen', 'Radfahren', 'Rudergerät'],
  Rest: ['Stretching', 'Mobilisierung']
};

const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const TODAY = DAYS[(new Date().getDay() + 6) % 7];

// Erweiterte Übungsdatenbank
const EXERCISE_DB = {
  'Warmup-General': [
    { name: 'Hampelmann (Jumping Jacks)', eq: 'none' }, { name: 'Armkreisen (vorwärts/rückwärts)', eq: 'none' },
    { name: 'Beinpendel (vor/zurück)', eq: 'none' }, { name: 'Hüftkreisen', eq: 'none' },
    { name: 'Leichtes Laufen auf der Stelle', eq: 'none' }, { name: 'Torso-Twists', eq: 'none' },
    { name: 'High Knees (Kniehebelauf)', eq: 'none' }, { name: 'Butt Kicks (Anfersen)', eq: 'none' },
    { name: 'Schulterrollen', eq: 'none' }, { name: 'Ausfallschritte mit Rotation', eq: 'none' }
  ],
  'Stretching-Specific': {
    'Oberkörper': [{ name: 'Brust-Dehnung (Wand)', eq: 'none' }, { name: 'Trizeps-Dehnung (Überkopf)', eq: 'none' }, { name: 'Schulter-Stretch quer', eq: 'none' }, { name: 'Nacken-Dehnung seitlich', eq: 'none' }, { name: 'Bizeps-Dehnung (Wand)', eq: 'none' }],
    'Unterkörper': [{ name: 'Quadrizeps-Dehnung (Stehend)', eq: 'none' }, { name: 'Hamstring-Dehnung (Sitzend)', eq: 'none' }, { name: 'Waden-Dehnung (Wand)', eq: 'none' }, { name: 'Hüftbeuger-Dehnung (Kniend)', eq: 'none' }, { name: 'Schmetterlings-Sitz', eq: 'none' }],
    'Core': [{ name: 'Kobra-Pose', eq: 'none' }, { name: 'Katze-Kuh', eq: 'none' }, { name: 'Seitliche Rumpfbeuge', eq: 'none' }],
    'Cardio': [{ name: 'Dynamische Waden-Dehnung', eq: 'none' }, { name: 'Beinschwünge seitlich', eq: 'none' }, { name: 'Knöchel-Kreisen', eq: 'none' }],
    'General': [{ name: 'Ganzkörper-Strecken', eq: 'none' }, { name: 'Herabschauender Hund', eq: 'none' }]
  },
  'Mobilisierung': [
    { name: 'Tiefe Hocke (Prying Squat)', eq: 'none' }, { name: 'Thorax-Rotation (Vierfüßler)', eq: 'none' },
    { name: 'World\'s Greatest Stretch', eq: 'none' }, { name: 'Raupenlauf (Inchworm)', eq: 'none' },
    { name: '90/90 Hüft-Rotation', eq: 'none' }, { name: 'Skorpion-Stretch (Liegend)', eq: 'none' },
    { name: 'Schulter-Dislokationen (mit Handtuch/Besen)', eq: 'basic' }
  ],
  'Main-Sets': {
    'Oberkörper': {
      exercise1: [
        { name: 'Wand-Liegestütze', eq: 'none', lvl: 1 }, { name: 'Liegestütze mit Händen erhöht', eq: 'none', lvl: 1 }, { name: 'Bodyweight Rows (Tischkante)', eq: 'basic', lvl: 1 }, { name: 'Plank Shoulder Taps', eq: 'none', lvl: 1 },
        { name: 'Liegestütze (klassisch)', eq: 'none', lvl: 2 }, { name: 'Klimmzüge (neutral)', eq: 'basic', lvl: 2 }, { name: 'Decline Liegestütze (Füße erhöht)', eq: 'basic', lvl: 2 }, { name: 'Trizeps-Dips (Stuhl)', eq: 'basic', lvl: 2 },
        { name: 'Pike Push-ups (Schultern)', eq: 'none', lvl: 3 }, { name: 'Klimmzüge (breit)', eq: 'basic', lvl: 3 }, { name: 'Archer Push-ups', eq: 'none', lvl: 3 }, { name: 'Handstand Push-ups (Wand)', eq: 'none', lvl: 3 }
      ],
      exercise2: [
        { name: 'Knie-Liegestütze', eq: 'none', lvl: 1 }, { name: 'Negative Klimmzüge', eq: 'basic', lvl: 1 }, { name: 'Superman-Halten', eq: 'none', lvl: 1 }, { name: 'Armkreisen mit Spannung', eq: 'none', lvl: 1 },
        { name: 'Breite Liegestütze', eq: 'none', lvl: 2 }, { name: 'Chin-ups (Untergriff)', eq: 'basic', lvl: 2 }, { name: 'Diamant-Liegestütze', eq: 'none', lvl: 2 }, { name: 'Rückenstrecker (Boden)', eq: 'none', lvl: 2 },
        { name: 'Einarmige Liegestütze (assistiert)', eq: 'none', lvl: 3 }, { name: 'Muscle-Up Progression', eq: 'basic', lvl: 3 }, { name: 'Dips (Barren)', eq: 'basic', lvl: 3 }, { name: 'Explosive Liegestütze (Klatschen)', eq: 'none', lvl: 3 }
      ]
    },
    'Unterkörper': {
      exercise1: [
        { name: 'Kniebeugen (Klassisch)', eq: 'none', lvl: 1 }, { name: 'Sumo-Kniebeugen', eq: 'none', lvl: 1 }, { name: 'Step-Ups (auf Stuhl/Treppe)', eq: 'basic', lvl: 1 }, { name: 'Wandsitz (Wall Sit)', eq: 'none', lvl: 1 },
        { name: 'Jumping Squats', eq: 'none', lvl: 2 }, { name: 'Bulgarian Split Squats', eq: 'basic', lvl: 2 }, { name: 'Ausfallschritte (Vorwärts)', eq: 'none', lvl: 2 }, { name: 'Cossack Squats', eq: 'none', lvl: 2 },
        { name: 'Pistol Squats (assistiert)', eq: 'basic', lvl: 3 }, { name: 'Pistol Squats (frei)', eq: 'none', lvl: 3 }, { name: 'Shrimp Squats', eq: 'none', lvl: 3 }, { name: 'Tuck Jumps (Knie zur Brust)', eq: 'none', lvl: 3 }
      ],
      exercise2: [
        { name: 'Glute Bridges (Beidbeinig)', eq: 'none', lvl: 1 }, { name: 'Wadenheben (Beidbeinig, flach)', eq: 'none', lvl: 1 }, { name: 'Seitliches Beinheben (Liegend)', eq: 'none', lvl: 1 }, { name: 'Good Mornings (ohne Gewicht)', eq: 'none', lvl: 1 },
        { name: 'Ausfallschritte (Rückwärts)', eq: 'none', lvl: 2 }, { name: 'Walking Lunges', eq: 'none', lvl: 2 }, { name: 'Wadenheben (erhöht, Kante)', eq: 'basic', lvl: 2 }, { name: 'Glute Bridge (Einbeinig)', eq: 'none', lvl: 2 },
        { name: 'Nordic Hamstring Curls', eq: 'basic', lvl: 3 }, { name: 'Wadenheben (Einbeinig, erhöht)', eq: 'basic', lvl: 3 }, { name: 'Sprung-Ausfallschritte (Jumping Lunges)', eq: 'none', lvl: 3 }, { name: 'Hip Thrusts (Schultern auf Sofa)', eq: 'basic', lvl: 3 }
      ]
    },
    'Core': {
      exercise1: [
        { name: 'Crunches', eq: 'none', lvl: 1 }, { name: 'Knieheben (Liegend)', eq: 'none', lvl: 1 }, { name: 'Bird-Dog (Vierfüßler)', eq: 'none', lvl: 1 }, { name: 'Fersenberührung (Heel Touches)', eq: 'none', lvl: 1 },
        { name: 'Hollow Body Hold', eq: 'none', lvl: 2 }, { name: 'Knieheben (Hängend)', eq: 'basic', lvl: 2 }, { name: 'Fahrrad-Crunches (Bicycle)', eq: 'none', lvl: 2 }, { name: 'Klappmesser alternierend', eq: 'none', lvl: 2 },
        { name: 'Klappmesser (V-Ups)', eq: 'none', lvl: 3 }, { name: 'Beinheben (Hängend)', eq: 'basic', lvl: 3 }, { name: 'Dragon Flag (Negativ)', eq: 'basic', lvl: 3 }, { name: 'Scheibenwischer (Liegend)', eq: 'none', lvl: 3 }
      ],
      exercise2: [
        { name: 'Plank (auf Knien)', eq: 'none', lvl: 1 }, { name: 'Dead Bugs', eq: 'none', lvl: 1 }, { name: 'Glute Bridge Hold', eq: 'none', lvl: 1 }, { name: 'Rückenstrecker-Halten', eq: 'none', lvl: 1 },
        { name: 'Plank (Unterarmstütz)', eq: 'none', lvl: 2 }, { name: 'Russian Twists', eq: 'none', lvl: 2 }, { name: 'Side Plank (Knie am Boden)', eq: 'none', lvl: 2 }, { name: 'Mountain Climbers (Langsam)', eq: 'none', lvl: 2 },
        { name: 'Side Plank (gestreckte Beine)', eq: 'none', lvl: 3 }, { name: 'L-Sit (Boden/Barren)', eq: 'basic', lvl: 3 }, { name: 'Plank mit Arm/Bein heben', eq: 'none', lvl: 3 }, { name: 'Hollow Body Rocks', eq: 'none', lvl: 3 }
      ]
    },
    'HIIT (Bodyweight)': {
      exercise1: [
        { name: 'Lockeres Hampelmann', eq: 'none', lvl: 1 }, { name: 'Konstantes Traben am Platz', eq: 'none', lvl: 1 },
        { name: 'High Knees (schnell)', eq: 'none', lvl: 2 }, { name: 'Bergsteiger (Mountain Climbers)', eq: 'none', lvl: 2 },
        { name: 'Burpees (mit Liegestütz)', eq: 'none', lvl: 3 }, { name: 'Skaters (Seitliche Sprünge)', eq: 'none', lvl: 3 }
      ],
      exercise2: [
        { name: 'Schattenboxen', eq: 'none', lvl: 1 }, { name: 'Schnelles Gehen am Platz', eq: 'none', lvl: 1 },
        { name: 'Jumping Jacks (auf Tempo)', eq: 'none', lvl: 2 }, { name: 'Plank Jacks', eq: 'none', lvl: 2 },
        { name: 'Squat Jumps', eq: 'none', lvl: 3 }, { name: 'Tuck Jumps', eq: 'none', lvl: 3 }
      ]
    },
    'Laufen': {
      exercise1: [
        { name: 'Zügiges Gehen (Power Walking)', eq: 'none', lvl: 1 }, { name: 'Lockeres Joggen (Puls 110-120)', eq: 'none', lvl: 1 },
        { name: 'Dauerlauf (Moderates Tempo)', eq: 'none', lvl: 2 }, { name: 'Intervall: 1 Min schnell / 1 Min locker', eq: 'none', lvl: 2 },
        { name: 'Sprint-Intervalle (15s Max / 45s Gehen)', eq: 'none', lvl: 3 }, { name: 'Bergsprints (Steigung)', eq: 'none', lvl: 3 }
      ],
      exercise2: [
        { name: 'Gehen zur aktiven Erholung', eq: 'none', lvl: 1 }, { name: 'Ausschütteln im Gehen', eq: 'none', lvl: 1 },
        { name: 'Lockeres Traben', eq: 'none', lvl: 2 }, { name: 'Steigerungsläufe (Tempo aufbauen)', eq: 'none', lvl: 2 },
        { name: 'Tempo-Lauf (Nahe der Schwelle)', eq: 'none', lvl: 3 }, { name: 'Treppenläufe', eq: 'none', lvl: 3 }
      ]
    },
    'Radfahren': {
      exercise1: [
        { name: 'Lockeres Treten (Leichter Widerstand)', eq: 'basic', lvl: 1 }, { name: 'Konstantes Tempo (Flache Strecke)', eq: 'basic', lvl: 1 },
        { name: 'Intervall: 2 Min schwer / 2 Min leicht', eq: 'basic', lvl: 2 }, { name: 'Hohe Trittfrequenz (RPM 100+)', eq: 'basic', lvl: 2 },
        { name: 'Sprint: 30s All-Out (Hoher Widerstand)', eq: 'basic', lvl: 3 }, { name: 'Berg-Simulation (Wiegetritt, Max Widerstand)', eq: 'basic', lvl: 3 }
      ],
      exercise2: [
        { name: 'Freilauf / Sehr leichtes Treten', eq: 'basic', lvl: 1 }, { name: 'Aufrechte Position entspannen', eq: 'basic', lvl: 1 },
        { name: 'Moderater Widerstand (Zone 3)', eq: 'basic', lvl: 2 }, { name: 'Wechselnde Trittfrequenz', eq: 'basic', lvl: 2 },
        { name: 'Tabata-Intervalle (20s Arbeit / 10s Pause)', eq: 'basic', lvl: 3 }, { name: 'Schwellen-Training (Dauerhafte Belastung)', eq: 'basic', lvl: 3 }
      ]
    },
    'Rudergerät': {
      exercise1: [
        { name: 'Technik-Fokus (Lange, ruhige Züge)', eq: 'basic', lvl: 1 }, { name: 'Konstantes Rudern (20 SPM)', eq: 'basic', lvl: 1 },
        { name: 'Kraftzüge (24 SPM, starker Bein-Abdruck)', eq: 'basic', lvl: 2 }, { name: 'Intervall: 500m moderat / 1 Min Pause', eq: 'basic', lvl: 2 },
        { name: '500m Sprint (Pace-Fokus)', eq: 'basic', lvl: 3 }, { name: 'Intervall: 30s Vollgas / 30s Locker', eq: 'basic', lvl: 3 }
      ],
      exercise2: [
        { name: 'Ruder-Bewegung nur mit Armen', eq: 'basic', lvl: 1 }, { name: 'Sehr lockeres Durchziehen (Active Rest)', eq: 'basic', lvl: 1 },
        { name: 'Mittleres Tempo (22 SPM)', eq: 'basic', lvl: 2 }, { name: 'Pyramiden-Intervall (SPM steigern/senken)', eq: 'basic', lvl: 2 },
        { name: 'Maximaler Krafteinsatz (Niedrige SPM, hoher Zug)', eq: 'basic', lvl: 3 }, { name: '1000m Zeitfahren-Pace', eq: 'basic', lvl: 3 }
      ]
    }
  },
  'Active-Rest': [
    { name: 'Tiefe Hocke entspannen', eq: 'none' }, { name: 'Locker ausschütteln', eq: 'none' }, { name: 'Tiefe Atemzüge', eq: 'none' },
    { name: 'Sanftes Gehen', eq: 'none' }, { name: 'Schultern kreisen', eq: 'none' }
  ],
  'Cooldown': [
    { name: 'Child\'s Pose (gehalten)', eq: 'none' }, { name: 'Herabschauender Hund (gehalten)', eq: 'none' }, { name: 'Tiefe Bauchatmung', eq: 'none' },
    { name: 'Rückenlage Knie zur Brust', eq: 'none' }, { name: 'Savasana (Totale Entspannung)', eq: 'none' }, { name: 'Kopfkreisen (sehr langsam)', eq: 'none' }
  ]
};

const INITIAL_CUSTOM_PLAN = DAYS.reduce((acc, day) => {
  acc[day] = {
    isRest: false,
    duration: day === TODAY ? 5 : 20,
    targets: ['Oberkörper'],
    difficulty: 'Fortgeschritten',
    equipment: 'Ohne Geräte'
  };
  return acc;
}, {});
INITIAL_CUSTOM_PLAN['Sonntag'] = { isRest: true, duration: 0, targets: ['Stretching'], difficulty: 'Anfänger', equipment: 'Ohne Geräte' };

// --- KOMPONENTEN ---

function ExerciseCard({ exercise, isMain }) {
  if (isMain) {
    return (
      <div className="p-4 rounded-2xl border-2 border-blue-100 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-900/10 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-start">
          <div>
            <span className="font-black text-lg text-slate-900 dark:text-white flex items-center">
              {exercise.name}
              {exercise.lvl && (
                <span className="ml-2 px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] uppercase tracking-widest">
                  Lvl {exercise.lvl}
                </span>
              )}
            </span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg mt-1 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 whitespace-nowrap">
            {exercise.eq === 'none' ? 'Eigengewicht' : 'Equipment'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex justify-between items-center transition-all hover:border-blue-200">
      <div className="flex items-center">
        <span className="font-medium text-sm text-slate-700 dark:text-slate-300">{exercise.name}</span>
        {exercise.lvl && <span className="ml-2 text-[9px] uppercase font-bold text-slate-400 bg-slate-200 dark:bg-slate-700 px-1 rounded">Lvl {exercise.lvl}</span>}
      </div>
      <span className="text-[9px] text-slate-400 uppercase tracking-widest">{exercise.eq === 'none' ? 'Frei' : 'Eq'}</span>
    </div>
  );
}

// --- ANSICHTEN (VIEWS) ---

// NEU: Übungs-Bibliothek View
function ExerciseLibraryView() {
  const [activeTab, setActiveTab] = useState('Oberkörper');

  // Alle Kategorien für Tabs generieren
  const mainTargets = Object.keys(EXERCISE_DB['Main-Sets']);
  const tabs = [...mainTargets, 'Warmup/Cool', 'Stretching/Mobil'];

  const renderExercisesForCategory = () => {
    if (activeTab === 'Warmup/Cool') {
      return (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h3 className="font-black text-xl mb-3 text-slate-800 dark:text-white flex items-center gap-2"><Flame className="text-orange-500 w-5 h-5" /> Aufwärmen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EXERCISE_DB['Warmup-General'].map((ex, i) => <ExerciseCard key={i} exercise={ex} isMain={false} />)}
            </div>
          </div>
          <div>
            <h3 className="font-black text-xl mb-3 text-slate-800 dark:text-white flex items-center gap-2"><Moon className="text-indigo-500 w-5 h-5" /> Cooldown & Rest</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...EXERCISE_DB['Cooldown'], ...EXERCISE_DB['Active-Rest']].map((ex, i) => <ExerciseCard key={i} exercise={ex} isMain={false} />)}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'Stretching/Mobil') {
      return (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h3 className="font-black text-xl mb-3 text-slate-800 dark:text-white flex items-center gap-2"><Activity className="text-blue-500 w-5 h-5" /> Mobilisierung</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EXERCISE_DB['Mobilisierung'].map((ex, i) => <ExerciseCard key={i} exercise={ex} isMain={false} />)}
            </div>
          </div>
          {Object.entries(EXERCISE_DB['Stretching-Specific']).map(([part, exercises]) => (
            <div key={part}>
              <h3 className="font-black text-lg mb-3 text-slate-700 dark:text-slate-300">Stretching: {part}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {exercises.map((ex, i) => <ExerciseCard key={i} exercise={ex} isMain={false} />)}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Für Main-Sets (Kraft & Cardio)
    const data = EXERCISE_DB['Main-Sets'][activeTab];
    if (!data) return null;

    const allExercises = [...data.exercise1, ...data.exercise2];
    // Gruppieren nach Level
    const lvl1 = allExercises.filter(ex => ex.lvl === 1);
    const lvl2 = allExercises.filter(ex => ex.lvl === 2);
    const lvl3 = allExercises.filter(ex => ex.lvl === 3);

    return (
      <div className="space-y-8 animate-in fade-in">
        {[
          { title: 'Level 1 (Anfänger)', data: lvl1, color: 'text-emerald-500' },
          { title: 'Level 2 (Fortgeschritten)', data: lvl2, color: 'text-blue-500' },
          { title: 'Level 3 (Profi)', data: lvl3, color: 'text-red-500' }
        ].map(section => (
          <div key={section.title} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className={`font-black text-lg mb-4 flex items-center gap-2 ${section.color}`}>
              <Target className="w-5 h-5" /> {section.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {section.data.map((ex, i) => <ExerciseCard key={i} exercise={ex} isMain={false} />)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="pb-10">
      <div className="mb-6 flex items-center gap-3">
        <BookOpen className="text-blue-500 w-8 h-8" />
        <div>
          <h2 className="text-3xl font-black">Übungs-Bibliothek</h2>
          <p className="text-slate-500 font-medium">Entdecke alle integrierten Übungen & Level.</p>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 mb-6 gap-2 hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-2xl font-bold transition-all ${activeTab === tab
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-blue-300'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {renderExercisesForCategory()}
    </div>
  );
}

function CustomPlannerView({ plan, setPlan }) {
  const [expandedDay, setExpandedDay] = useState(TODAY);

  const updateDay = (day, field, value) => {
    setPlan(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const toggleTarget = (day, target) => {
    const currentTargets = plan[day].targets;
    let newTargets = currentTargets.includes(target) ? currentTargets.filter(t => t !== target) : [...currentTargets, target];
    updateDay(day, 'targets', newTargets.length > 0 ? newTargets : ['Oberkörper']);
  };

  return (
    <div className="pb-10">
      <div className="mb-6 flex items-center gap-3">
        <Settings className="text-blue-500 w-8 h-8" />
        <div>
          <h2 className="text-3xl font-black">Wochen-Planer</h2>
          <p className="text-slate-500 font-medium">Passe deine Woche bis ins Detail an.</p>
        </div>
      </div>

      <div className="space-y-4">
        {DAYS.map(day => {
          const isExpanded = expandedDay === day;
          const dayPlan = plan[day];

          return (
            <div key={day} className={`bg-white dark:bg-slate-900 rounded-3xl border ${isExpanded ? 'border-blue-500 shadow-lg' : 'border-slate-200 dark:border-slate-800 shadow-sm'} overflow-hidden transition-all duration-300`}>

              <div
                onClick={() => setExpandedDay(isExpanded ? null : day)}
                className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${dayPlan.isRest ? 'bg-emerald-400' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`} />
                  <span className="font-bold text-lg">{day} {day === TODAY && <span className="text-xs ml-2 bg-blue-100 text-blue-600 px-2 py-1 rounded-md">Heute</span>}</span>
                </div>
                <div className="flex items-center space-x-3">
                  {!dayPlan.isRest && <span className="text-xs font-bold text-slate-400 hidden md:block max-w-[150px] truncate">{dayPlan.targets.join(', ')}</span>}
                  <span className="text-sm font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">{dayPlan.isRest ? 'Ruhe' : `${dayPlan.duration} Min`}</span>
                  {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-6">

                  {/* Ruhetag Toggle */}
                  <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <span className="font-bold flex items-center gap-2"><Moon className="w-4 h-4 text-slate-400" /> Ruhetag einlegen?</span>
                    <button onClick={() => { updateDay(day, 'isRest', !dayPlan.isRest); if (!dayPlan.isRest) updateDay(day, 'targets', ['Stretching']); else updateDay(day, 'targets', ['Oberkörper']); }} className={`w-14 h-7 rounded-full relative transition-colors ${dayPlan.isRest ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${dayPlan.isRest ? 'translate-x-8' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {!dayPlan.isRest && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      {/* Dauer */}
                      <div className="col-span-1 md:col-span-2 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <label className="text-sm font-bold flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> Trainingsdauer</label>
                          <span className="text-blue-600 font-black">{dayPlan.duration} Minuten</span>
                        </div>
                        <input
                          type="range" min="5" max="90" step="5"
                          value={dayPlan.duration}
                          onChange={(e) => updateDay(day, 'duration', parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        {dayPlan.duration <= 10 && (
                          <div className="mt-3 text-xs text-orange-600 font-bold bg-orange-50 dark:bg-orange-900/20 p-2.5 rounded-lg flex items-start gap-2">
                            <Flame className="w-4 h-4 shrink-0" />
                            Kurzprogramm: Aufwärmen wird stark verkürzt, Stretching entfällt, voller Fokus auf die Übungen!
                          </div>
                        )}
                      </div>

                      {/* Fokus */}
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm col-span-1 md:col-span-2">
                        <label className="text-sm font-bold block mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-blue-500" /> Workout-Fokus</label>

                        <div className="mb-3">
                          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Krafttraining</span>
                          <div className="flex flex-wrap gap-2">
                            {TARGETS.Strength.map(target => (
                              <button
                                key={target} onClick={() => toggleTarget(day, target)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${dayPlan.targets.includes(target) ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 hover:border-blue-300'
                                  }`}
                              >
                                {target}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Cardio & Ausdauer</span>
                          <div className="flex flex-wrap gap-2">
                            {TARGETS.Cardio.map(target => (
                              <button
                                key={target} onClick={() => toggleTarget(day, target)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${dayPlan.targets.includes(target) ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 hover:border-orange-300'
                                  }`}
                              >
                                {target}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Level & Equipment */}
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <label className="text-sm font-bold block mb-2 flex items-center gap-2"><Flame className="w-4 h-4 text-blue-500" /> Intensität (Level)</label>
                        <select
                          value={dayPlan.difficulty}
                          onChange={(e) => updateDay(day, 'difficulty', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="Anfänger">Anfänger (Leicht)</option>
                          <option value="Fortgeschritten">Fortgeschritten (Mittel)</option>
                          <option value="Profi">Profi (Schwer)</option>
                        </select>
                      </div>

                      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <label className="text-sm font-bold block mb-2 flex items-center gap-2"><Dumbbell className="w-4 h-4 text-blue-500" /> Equipment</label>
                        <select
                          value={dayPlan.equipment}
                          onChange={(e) => updateDay(day, 'equipment', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="Ohne Geräte">Ohne Geräte (Bodyweight)</option>
                          <option value="Basic">Basic (Stange, Stuhl, Bänder)</option>
                        </select>
                        <p className="text-[10px] text-slate-400 mt-2">Hinweis: Wenn "Radfahren" oder "Rudergerät" gewählt ist, wird das Gerät vorausgesetzt.</p>
                      </div>

                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- WORKOUT ENGINE ---
function ActiveWorkoutEngine({ workoutData, onFinish }) {
  const [isPaused, setIsPaused] = useState(false);
  const globalSecsRef = useRef(0);
  const phaseSecsRef = useRef(0);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [, setTick] = useState(0);

  const targetTotalSecs = (workoutData.duration || 20) * 60;
  const isCooldownPhase = currentPhase?.type === 'cooldown';

  const phaseDurations = useMemo(() => {
    if (!workoutData) return null;
    const targets = workoutData.targets && workoutData.targets.length > 0 ? workoutData.targets : ['Oberkörper'];

    if (workoutData.isRest) return { restPhase: Math.floor(targetTotalSecs / targets.length) || 300 };

    const totalSets = targets.length * 3;
    let warmupDur = 120;
    let stretchDur = 120;

    // LOGIK FÜR KURZE WORKOUTS (<= 10 Min)
    if (targetTotalSecs <= 300) {
      warmupDur = 60; stretchDur = 0;
    } else if (targetTotalSecs <= 600) {
      warmupDur = 90; stretchDur = 60;
    }

    let fixedTime = warmupDur + (targets.length * stretchDur);
    if (fixedTime >= targetTotalSecs) {
      warmupDur = Math.max(Math.floor(targetTotalSecs * 0.2), 30);
      stretchDur = 0;
      fixedTime = warmupDur;
    }

    const remainingTime = targetTotalSecs - fixedTime;
    const mainSetDur = Math.floor(remainingTime / totalSets);
    warmupDur += remainingTime % totalSets;

    return { warmup: warmupDur, stretching: stretchDur, main: mainSetDur, cooldown: 120 };
  }, [workoutData, targetTotalSecs]);

  // Spezifische Cardio Targets identifizieren
  const isCardioTarget = (t) => TARGETS.Cardio.includes(t);

  const getExercises = useCallback((pool, targetLevel, count = 3, targetName = '') => {
    if (!pool || pool.length === 0) return [];

    // 1. Filter nach Equipment (Außer bei expliziten Geräte-Cardio)
    let eqPool = pool;
    const isSpecificCardio = targetName === 'Radfahren' || targetName === 'Rudergerät';

    if (workoutData.equipment === 'Ohne Geräte' && !isSpecificCardio) {
      eqPool = pool.filter(ex => ex.eq === 'none');
    }
    if (eqPool.length === 0) eqPool = pool; // Fallback, damit der Plan nicht crasht

    // 2. Filter nach Level
    let lvlPool = eqPool.filter(ex => ex.lvl === targetLevel);

    // Auffüllen, falls nicht genug da sind
    if (lvlPool.length < count) {
      const others = shuffleArray(eqPool.filter(ex => ex.lvl !== targetLevel));
      lvlPool = [...lvlPool, ...others].slice(0, count);
    } else {
      lvlPool = shuffleArray(lvlPool).slice(0, count);
    }
    return lvlPool;
  }, [workoutData]);

  const generateNextPhase = useCallback((prevPhaseState) => {
    if (!phaseDurations) return { type: 'done' };

    let prevType = prevPhaseState?.type;
    const targetIdx = prevPhaseState?.targetIndex || 0;
    const setIdx = prevPhaseState?.setIndex || 1;
    const targets = workoutData.targets && workoutData.targets.length > 0 ? workoutData.targets : ['Oberkörper'];

    if (workoutData.isRest) { return prevType ? { type: 'done' } : { type: 'rest_activity', title: 'Entspannung', duration: 300, exercises: shuffleArray(EXERCISE_DB['Mobilisierung']).slice(0, 3) }; }
    if (prevType === 'cooldown') return { type: 'done' };

    if (!prevType) return { type: 'warmup', title: 'Aufwärmen', duration: phaseDurations.warmup, targetIndex: 0, exercises: shuffleArray(EXERCISE_DB['Warmup-General']).slice(0, 4) };

    if (prevType === 'warmup') {
      if (phaseDurations.stretching > 0) {
        const t = targets[0];
        const dbTarget = isCardioTarget(t) ? 'Cardio' : t;
        const pool = EXERCISE_DB['Stretching-Specific'][dbTarget] || EXERCISE_DB['Stretching-Specific']['General'];
        return { type: 'stretching', title: `Stretching: ${t}`, duration: phaseDurations.stretching, targetIndex: 0, exercises: shuffleArray(pool).slice(0, 3) };
      } else {
        prevType = 'stretching'; // Skip
      }
    }

    if (prevType === 'stretching' || prevType === 'main') {
      let nextSetIdx = prevType === 'main' ? setIdx + 1 : 1;

      if (nextSetIdx > 3) {
        const nextTargetIdx = targetIdx + 1;
        if (nextTargetIdx < targets.length) {
          if (phaseDurations.stretching > 0) {
            const t = targets[nextTargetIdx];
            const dbTarget = isCardioTarget(t) ? 'Cardio' : t;
            const pool = EXERCISE_DB['Stretching-Specific'][dbTarget] || EXERCISE_DB['Stretching-Specific']['General'];
            return { type: 'stretching', title: `Stretching: ${t}`, duration: phaseDurations.stretching, targetIndex: nextTargetIdx, exercises: shuffleArray(pool).slice(0, 3) };
          } else {
            return generateNextPhase({ type: 'stretching', targetIndex: nextTargetIdx, setIndex: 1 });
          }
        } else {
          return { type: 'cooldown', title: 'Regeneration', duration: phaseDurations.cooldown, exercises: shuffleArray(EXERCISE_DB['Cooldown']).slice(0, 3) };
        }
      }

      const currentTarget = targets[targetIdx];
      // Wenn das Target in der DB exakt so existiert (z.B. "Laufen", "Oberkörper"), nimm es.
      const strengthDB = EXERCISE_DB['Main-Sets'][currentTarget] || EXERCISE_DB['Main-Sets']['Oberkörper'];

      // PROGRESSIVE OVERLOAD: Bestimme Level anhand von Satz (1-3) und gewählter Schwierigkeit
      let intensityCurve = [1, 2, 3]; // Fortgeschritten
      if (workoutData.difficulty === 'Anfänger') intensityCurve = [1, 1, 2];
      if (workoutData.difficulty === 'Profi') intensityCurve = [2, 3, 3];
      const targetLevel = intensityCurve[nextSetIdx - 1];

      return {
        type: 'main',
        title: `Satz ${nextSetIdx}/3: ${currentTarget}`,
        subtitle: `Level ${targetLevel} Intensität`,
        duration: phaseDurations.main,
        targetIndex: targetIdx,
        setIndex: nextSetIdx,
        targetLevel: targetLevel,
        currentTargetName: currentTarget,
        slots: [
          { role: 'Primärübung', options: getExercises(strengthDB.exercise1, targetLevel, 3, currentTarget) },
          { role: 'Sekundärübung', options: getExercises(strengthDB.exercise2, targetLevel, 3, currentTarget) },
          { role: 'Aktive Pause', options: shuffleArray(EXERCISE_DB['Active-Rest']).slice(0, 3) }
        ]
      };
    }

    return { type: 'done' };
  }, [workoutData, phaseDurations, getExercises]);

  useEffect(() => {
    if (workoutData && phaseDurations && !currentPhase) {
      globalSecsRef.current = 0;
      const initial = generateNextPhase(null);
      setCurrentPhase(initial);
      phaseSecsRef.current = initial.duration;
      setTick(t => t + 1);
    }
  }, [workoutData, phaseDurations, currentPhase, generateNextPhase]);

  useEffect(() => {
    if (isPaused || !currentPhase || currentPhase.type === 'done') return;
    const interval = setInterval(() => {
      globalSecsRef.current += 1;
      phaseSecsRef.current -= 1;

      if (phaseSecsRef.current <= 0) {
        const next = generateNextPhase(currentPhase);
        setCurrentPhase(next);
        if (next.type === 'done') onFinish();
        else phaseSecsRef.current = next.duration;
      }
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, currentPhase, generateNextPhase, onFinish]);

  const handleShufflePhase = () => {
    if (!currentPhase || currentPhase.type !== 'main') return;

    const currentTarget = currentPhase.currentTargetName;
    const strengthDB = EXERCISE_DB['Main-Sets'][currentTarget] || EXERCISE_DB['Main-Sets']['Oberkörper'];
    const targetLevel = currentPhase.targetLevel;

    setCurrentPhase({
      ...currentPhase,
      slots: [
        { role: 'Primärübung', options: getExercises(strengthDB.exercise1, targetLevel, 3, currentTarget) },
        { role: 'Sekundärübung', options: getExercises(strengthDB.exercise2, targetLevel, 3, currentTarget) },
        { role: 'Aktive Pause', options: shuffleArray(EXERCISE_DB['Active-Rest']).slice(0, 3) }
      ]
    });
  };

  const handleSkipPhase = () => {
    globalSecsRef.current += phaseSecsRef.current;
    const next = generateNextPhase(currentPhase);
    setCurrentPhase(next);
    if (next.type === 'done') onFinish();
    else phaseSecsRef.current = next.duration;
  };

  if (!currentPhase) return null;

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col h-full space-y-4 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
        <div>
          <span className="text-[10px] font-black uppercase text-slate-400 block tracking-widest flex items-center gap-1">
            <Clock className="w-3 h-3" /> {isCooldownPhase ? 'Beendet' : 'Gesamtzeit'}
          </span>
          <span className={`text-xl font-black font-mono ${isCooldownPhase ? 'text-emerald-500' : 'text-blue-600 dark:text-blue-400'}`}>
            {formatTime(Math.min(globalSecsRef.current, targetTotalSecs))} / {workoutData.duration}:00
          </span>
        </div>
        <button onClick={() => setIsPaused(!isPaused)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl active:scale-95 transition-transform hover:bg-slate-100">
          {isPaused ? <PlayCircle className="text-blue-500 w-8 h-8" /> : <PauseCircle className="w-8 h-8 text-slate-700 dark:text-slate-300" />}
        </button>
      </div>

      <div className={`p-8 rounded-[2.5rem] border text-center shadow-sm relative overflow-hidden transition-colors duration-500 ${isCooldownPhase ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/30' : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800'}`}>
        <span className={`relative z-10 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-2 inline-block ${isCooldownPhase ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'}`}>
          {currentPhase.title}
        </span>
        {currentPhase.subtitle && <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">{currentPhase.subtitle}</p>}

        <div className={`text-7xl md:text-8xl font-black font-mono tracking-tighter my-2 ${isCooldownPhase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
          {formatTime(phaseSecsRef.current)}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {currentPhase.type === 'main' && (
          <div className="flex justify-end mb-2">
            <button onClick={handleShufflePhase} className="flex items-center text-sm font-bold bg-slate-800 text-white px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors shadow-md active:scale-95">
              <Shuffle size={16} className="mr-2" /> Übungen neu mischen
            </button>
          </div>
        )}

        {currentPhase.type === 'main' ? (
          currentPhase.slots.map((slot, i) => (
            <div key={`${currentPhase.title}-${i}`} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in slide-in-from-right-4 duration-300">
              <h4 className="text-sm font-black text-slate-400 uppercase mb-3 flex items-center">
                <div className="w-1.5 h-4 bg-blue-500 rounded-full mr-2" /> {slot.role}
              </h4>
              <ExerciseCard exercise={slot.options[0]} isMain={true} />
              <details className="mt-3 group">
                <summary className="text-xs font-bold text-slate-400 cursor-pointer list-none py-2 hover:text-blue-500 transition-colors flex items-center">
                  <ChevronDown className="w-4 h-4 mr-1 group-open:rotate-180 transition-transform" /> {slot.options.length > 1 ? `${slot.options.length - 1} Alternativen ansehen` : 'Keine Alternativen'}
                </summary>
                <div className="space-y-2 pt-2 animate-in fade-in">
                  {slot.options.slice(1).map((altEx, idx) => (
                    <ExerciseCard key={idx} exercise={altEx} isMain={false} />
                  ))}
                </div>
              </details>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-sm font-black text-slate-400 uppercase mb-4 tracking-widest">Ablauf dieser Phase</h4>
            <div className="space-y-4">
              {currentPhase.exercises.map((ex, i) => (
                <ExerciseCard key={i} exercise={typeof ex === 'string' ? { name: ex, eq: 'none' } : ex} isMain={i === 0} />
              ))}
            </div>
          </div>
        )}
      </div>

      <button onClick={handleSkipPhase} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black flex items-center justify-center shadow-xl active:scale-95 transition-transform text-lg">
        {isCooldownPhase ? 'Workout Beenden' : 'Phase überspringen'} <SkipForward className="ml-2 w-5 h-5" />
      </button>
    </div>
  );
}

// --- APP HÜLLE ---
export default function App() {
  const [theme, setTheme] = useState('light');
  const [currentView, setCurrentView] = useState('dashboard');
  const [customPlan, setCustomPlan] = useState(INITIAL_CUSTOM_PLAN);
  const [activeWorkoutData, setActiveWorkoutData] = useState(null);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setGreeting(getDynamicGreeting());
  }, []);

  const startWorkout = (dayPlan) => {
    setActiveWorkoutData(dayPlan);
    setCurrentView('workout');
  };

  const navButtonClass = (viewName) => `p-2.5 rounded-xl transition-all ${currentView === viewName
      ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none scale-105'
      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
    }`;

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden font-sans selection:bg-blue-200">

        {currentView !== 'workout' && (
          <header className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex justify-between items-center z-20 sticky top-0">
            <div className="flex items-center space-x-2">
              <Activity className="text-blue-600 dark:text-blue-500 w-7 h-7" />
              <span className="font-black text-xl tracking-tight text-blue-950 dark:text-white hidden sm:block">FitPlaner</span>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setCurrentView('dashboard')} className={navButtonClass('dashboard')} title="Home"><Home size={20} /></button>
              <button onClick={() => setCurrentView('custom')} className={navButtonClass('custom')} title="Planer"><Calendar size={20} /></button>
              <button onClick={() => setCurrentView('library')} className={navButtonClass('library')} title="Übungen"><BookOpen size={20} /></button>

              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1 self-center"></div>

              <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 scroll-smooth">
          <div className="max-w-4xl mx-auto h-full">
            {currentView === 'dashboard' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto mt-4 md:mt-10">
                <h2 className="text-4xl md:text-5xl font-black mb-3 text-slate-800 dark:text-white">{greeting}</h2>
                <p className="text-slate-500 text-lg mb-8 font-medium">Dein Plan für Heute ({TODAY})</p>

                <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">

                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                      <h3 className="text-3xl font-black">{customPlan[TODAY].isRest ? 'Ruhetag' : 'Workout Time'}</h3>
                      {!customPlan[TODAY].isRest && (
                        <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-bold px-4 py-1.5 rounded-full flex items-center justify-center gap-2 w-fit">
                          <Clock className="w-4 h-4" /> {customPlan[TODAY].duration} Min
                        </span>
                      )}
                    </div>

                    {!customPlan[TODAY].isRest ? (
                      <div className="space-y-4 mb-10">
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-medium">
                          <Target className="w-5 h-5 text-blue-500 shrink-0" /> Fokus: {customPlan[TODAY].targets.join(', ')}
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-medium">
                          <Flame className="w-5 h-5 text-blue-500 shrink-0" /> Level: {customPlan[TODAY].difficulty}
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-medium">
                          <Dumbbell className="w-5 h-5 text-blue-500 shrink-0" /> Equipment: {customPlan[TODAY].equipment}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-10 text-slate-500 flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" /> Heute erholen sich deine Muskeln.
                      </div>
                    )}

                    <button
                      onClick={() => startWorkout(customPlan[TODAY])}
                      className={`w-full font-black py-5 rounded-2xl text-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${customPlan[TODAY].isRest ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200 dark:shadow-none' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 dark:shadow-none'}`}
                    >
                      <PlayCircle className="w-6 h-6" />
                      {customPlan[TODAY].isRest ? 'MOBILISIERUNG STARTEN' : 'WORKOUT STARTEN'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {currentView === 'custom' && <CustomPlannerView plan={customPlan} setPlan={setCustomPlan} />}
            {currentView === 'library' && <ExerciseLibraryView />}
            {currentView === 'workout' && <ActiveWorkoutEngine workoutData={activeWorkoutData} onFinish={() => setCurrentView('dashboard')} />}
          </div>
        </main>
      </div>
    </div>
  );
} 