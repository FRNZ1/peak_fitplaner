//Version 1.2.1 in Liquid Glass Design

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Home, Calendar, Activity, Sun, Moon, PlayCircle, PauseCircle,
  SkipForward, ChevronDown, ChevronUp, Shuffle, Settings,
  Flame, Target, Dumbbell, Clock, CheckCircle2, BookOpen, HeartPulse
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
  if (hour >= 0 && hour < 5) return ["Nachteule! 🦉", "Spätschicht im Training! 🌙"][Math.floor(Math.random() * 2)];
  if (hour >= 5 && hour < 9) return ["Guten Morgen! 🌅", "Der frühe Vogel... 🐦"][Math.floor(Math.random() * 2)];
  if (hour >= 9 && hour < 12) return ["Guten Vormittag! ⚡", "Zeit für Bewegung! 💪"][Math.floor(Math.random() * 2)];
  if (hour >= 12 && hour < 14) return ["Mittagspause! 🍽️", "Mittags-Boost! 🚀"][Math.floor(Math.random() * 2)];
  if (hour >= 14 && hour < 18) return ["Guten Nachmittag! ☕", "Packen wir es an! 🔥"][Math.floor(Math.random() * 2)];
  return ["Guten Abend! 🌇", "Feierabend-Workout! 🍻"][Math.floor(Math.random() * 2)];
};

// --- DATENBANK ---
const TARGETS = {
  Strength: ['Oberkörper', 'Unterkörper', 'Core'],
  Cardio: ['HIIT (Bodyweight)', 'Laufen', 'Radfahren', 'Rudergerät'],
  Recovery: ['Stretching', 'Mobilisierung', 'Aktive Erholung']
};

const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const TODAY = DAYS[(new Date().getDay() + 6) % 7];

// Helfer für Level-Zuweisung bei Recovery-Übungen
const assignLvl = (arr, lvl) => arr.map(ex => ({ ...ex, lvl }));

// Erweiterte Übungsdatenbank
const EXERCISE_DB = {
  'Warmup-General': [
    { name: 'Hampelmann', eq: 'none' }, { name: 'Armkreisen', eq: 'none' },
    { name: 'Beinpendel', eq: 'none' }, { name: 'Hüftkreisen', eq: 'none' },
    { name: 'Leichtes Laufen', eq: 'none' }, { name: 'Torso-Twists', eq: 'none' },
    { name: 'High Knees', eq: 'none' }, { name: 'Schulterrollen', eq: 'none' }
  ],
  'Stretching-Specific': {
    'Oberkörper': [{ name: 'Brust-Dehnung', eq: 'none' }, { name: 'Trizeps-Dehnung', eq: 'none' }, { name: 'Nacken-Dehnung', eq: 'none' }],
    'Unterkörper': [{ name: 'Quadrizeps-Dehnung', eq: 'none' }, { name: 'Hamstring-Dehnung', eq: 'none' }, { name: 'Waden-Dehnung', eq: 'none' }],
    'Core': [{ name: 'Kobra-Pose', eq: 'none' }, { name: 'Katze-Kuh', eq: 'none' }],
    'General': [{ name: 'Ganzkörper-Strecken', eq: 'none' }, { name: 'Herabschauender Hund', eq: 'none' }]
  },
  'Mobilisierung': [
    { name: 'Tiefe Hocke', eq: 'none' }, { name: 'Thorax-Rotation', eq: 'none' },
    { name: 'World\'s Greatest Stretch', eq: 'none' }, { name: '90/90 Hüft-Rotation', eq: 'none' }
  ],
  'Active-Rest': [
    { name: 'Ausschütteln', eq: 'none' }, { name: 'Tiefe Atemzüge', eq: 'none' }, { name: 'Sanftes Gehen', eq: 'none' }
  ],
  'Cooldown': [
    { name: 'Child\'s Pose', eq: 'none' }, { name: 'Savasana (Entspannung)', eq: 'none' }, { name: 'Kopfkreisen', eq: 'none' }
  ],
  'Main-Sets': {
    // KRAFT
    'Oberkörper': {
      exercise1: [
        { name: 'Wand-Liegestütze', eq: 'none', lvl: 1 }, { name: 'Liegestütze', eq: 'none', lvl: 2 }, { name: 'Pike Push-ups', eq: 'none', lvl: 3 },
        { name: 'Klimmzüge (neutral)', eq: 'basic', lvl: 2 }, { name: 'Klimmzüge (breit)', eq: 'basic', lvl: 3 }
      ],
      exercise2: [
        { name: 'Knie-Liegestütze', eq: 'none', lvl: 1 }, { name: 'Diamant-Liegestütze', eq: 'none', lvl: 2 }, { name: 'Explosive Liegestütze', eq: 'none', lvl: 3 },
        { name: 'Dips (Barren)', eq: 'basic', lvl: 3 }, { name: 'Superman-Halten', eq: 'none', lvl: 1 }
      ]
    },
    'Unterkörper': {
      exercise1: [
        { name: 'Kniebeugen', eq: 'none', lvl: 1 }, { name: 'Jumping Squats', eq: 'none', lvl: 2 }, { name: 'Pistol Squats', eq: 'none', lvl: 3 },
        { name: 'Step-Ups', eq: 'basic', lvl: 1 }, { name: 'Bulgarian Split Squats', eq: 'basic', lvl: 2 }
      ],
      exercise2: [
        { name: 'Glute Bridges', eq: 'none', lvl: 1 }, { name: 'Ausfallschritte', eq: 'none', lvl: 2 }, { name: 'Jumping Lunges', eq: 'none', lvl: 3 },
        { name: 'Wadenheben', eq: 'none', lvl: 1 }, { name: 'Nordic Hamstring Curls', eq: 'basic', lvl: 3 }
      ]
    },
    'Core': {
      exercise1: [
        { name: 'Crunches', eq: 'none', lvl: 1 }, { name: 'Hollow Body Hold', eq: 'none', lvl: 2 }, { name: 'V-Ups', eq: 'none', lvl: 3 }
      ],
      exercise2: [
        { name: 'Plank (auf Knien)', eq: 'none', lvl: 1 }, { name: 'Unterarmstütz', eq: 'none', lvl: 2 }, { name: 'L-Sit', eq: 'basic', lvl: 3 }
      ]
    },
    // CARDIO
    'HIIT (Bodyweight)': {
      exercise1: [
        { name: 'Hampelmann', eq: 'none', lvl: 1 }, { name: 'High Knees', eq: 'none', lvl: 2 }, { name: 'Burpees', eq: 'none', lvl: 3 }
      ],
      exercise2: [
        { name: 'Schattenboxen', eq: 'none', lvl: 1 }, { name: 'Plank Jacks', eq: 'none', lvl: 2 }, { name: 'Squat Jumps', eq: 'none', lvl: 3 }
      ]
    },
    'Laufen': {
      exercise1: [
        { name: 'Zügiges Gehen', eq: 'none', lvl: 1 }, { name: 'Dauerlauf', eq: 'none', lvl: 2 }, { name: 'Sprint-Intervalle', eq: 'none', lvl: 3 }
      ],
      exercise2: [
        { name: 'Aktive Erholung (Gehen)', eq: 'none', lvl: 1 }, { name: 'Steigerungsläufe', eq: 'none', lvl: 2 }, { name: 'Treppenläufe', eq: 'none', lvl: 3 }
      ]
    },
    'Radfahren': {
      exercise1: [
        { name: 'Lockeres Treten', eq: 'basic', lvl: 1 }, { name: 'Intervall (2m schwer/2m leicht)', eq: 'basic', lvl: 2 }, { name: 'Sprint 30s All-Out', eq: 'basic', lvl: 3 }
      ],
      exercise2: [
        { name: 'Freilauf', eq: 'basic', lvl: 1 }, { name: 'Wechselnde Trittfrequenz', eq: 'basic', lvl: 2 }, { name: 'Tabata-Intervalle', eq: 'basic', lvl: 3 }
      ]
    },
    'Rudergerät': {
      exercise1: [
        { name: 'Technik-Fokus', eq: 'basic', lvl: 1 }, { name: 'Kraftzüge (24 SPM)', eq: 'basic', lvl: 2 }, { name: '500m Sprint', eq: 'basic', lvl: 3 }
      ],
      exercise2: [
        { name: 'Ruder-Bewegung nur Arme', eq: 'basic', lvl: 1 }, { name: 'Mittleres Tempo', eq: 'basic', lvl: 2 }, { name: 'Maximaler Krafteinsatz', eq: 'basic', lvl: 3 }
      ]
    }
  }
};

// Mache Recovery auch als Main-Sets verfügbar für die Workout-Engine
EXERCISE_DB['Main-Sets']['Stretching'] = {
  exercise1: assignLvl([...EXERCISE_DB['Stretching-Specific']['General'], ...EXERCISE_DB['Stretching-Specific']['Oberkörper']], 1).concat(assignLvl([...EXERCISE_DB['Stretching-Specific']['General']], 2)).concat(assignLvl([...EXERCISE_DB['Stretching-Specific']['General']], 3)),
  exercise2: assignLvl([...EXERCISE_DB['Stretching-Specific']['Unterkörper'], ...EXERCISE_DB['Stretching-Specific']['Core']], 1).concat(assignLvl([...EXERCISE_DB['Stretching-Specific']['Unterkörper']], 2)).concat(assignLvl([...EXERCISE_DB['Stretching-Specific']['Core']], 3))
};
EXERCISE_DB['Main-Sets']['Mobilisierung'] = {
  exercise1: assignLvl(EXERCISE_DB['Mobilisierung'], 1).concat(assignLvl(EXERCISE_DB['Mobilisierung'], 2)).concat(assignLvl(EXERCISE_DB['Mobilisierung'], 3)),
  exercise2: assignLvl(EXERCISE_DB['Mobilisierung'], 1).concat(assignLvl(EXERCISE_DB['Mobilisierung'], 2)).concat(assignLvl(EXERCISE_DB['Mobilisierung'], 3))
};
EXERCISE_DB['Main-Sets']['Aktive Erholung'] = {
  exercise1: assignLvl(EXERCISE_DB['Active-Rest'], 1).concat(assignLvl(EXERCISE_DB['Active-Rest'], 2)).concat(assignLvl(EXERCISE_DB['Active-Rest'], 3)),
  exercise2: assignLvl(EXERCISE_DB['Active-Rest'], 1).concat(assignLvl(EXERCISE_DB['Active-Rest'], 2)).concat(assignLvl(EXERCISE_DB['Active-Rest'], 3))
};


const INITIAL_CUSTOM_PLAN = DAYS.reduce((acc, day) => {
  acc[day] = {
    isRest: false,
    duration: day === TODAY ? 15 : 20,
    targets: ['Oberkörper'],
    difficulty: 'Fortgeschritten',
    equipment: 'Ohne Geräte'
  };
  return acc;
}, {});
INITIAL_CUSTOM_PLAN['Sonntag'] = { isRest: true, duration: 15, targets: ['Stretching'], difficulty: 'Anfänger', equipment: 'Ohne Geräte' };

// --- STYLING KLASSEN (Liquid Glass) ---
const glassCardLight = "bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]";
const glassCardDark = "dark:bg-[#1c1c1e]/60 dark:backdrop-blur-xl dark:border dark:border-white/10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]";
const glassCard = `${glassCardLight} ${glassCardDark}`;

const glassButtonLight = "bg-white/80 backdrop-blur-md border border-white/50 shadow-sm text-slate-700 hover:bg-white";
const glassButtonDark = "dark:bg-white/5 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10";
const glassButton = `${glassButtonLight} ${glassButtonDark}`;

const glassButtonActiveLight = "bg-blue-500/90 text-white shadow-lg shadow-blue-500/30 border-blue-400";
const glassButtonActiveDark = "dark:bg-blue-500/80 dark:border-blue-400/50 dark:shadow-blue-900/40";
const glassButtonActive = `${glassButtonActiveLight} ${glassButtonActiveDark}`;

// --- KOMPONENTEN ---

function ExerciseCard({ exercise, isMain }) {
  if (isMain) {
    return (
      <div className={`p-4 rounded-2xl ${glassCard} border-l-4 border-l-blue-500 animate-in fade-in zoom-in duration-300`}>
        <div className="flex justify-between items-start">
          <div>
            <span className="font-bold text-lg text-slate-900 dark:text-white flex items-center">
              {exercise.name}
              {exercise.lvl && (
                <span className="ml-2 px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[10px] uppercase tracking-widest backdrop-blur-sm">
                  Lvl {exercise.lvl}
                </span>
              )}
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg mt-1 bg-blue-500/10 text-blue-700 dark:bg-blue-400/20 dark:text-blue-300 whitespace-nowrap border border-blue-500/20">
            {exercise.eq === 'none' ? 'Frei' : 'Eq'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-xl ${glassButton} flex justify-between items-center transition-all`}>
      <div className="flex items-center">
        <span className="font-medium text-sm">{exercise.name}</span>
      </div>
      <span className="text-[9px] opacity-50 uppercase tracking-widest">{exercise.eq === 'none' ? 'Frei' : 'Eq'}</span>
    </div>
  );
}

// --- ANSICHTEN (VIEWS) ---

function ExerciseLibraryView() {
  const [activeTab, setActiveTab] = useState('Oberkörper');
  const tabs = [...Object.keys(EXERCISE_DB['Main-Sets']).filter(t => !['Stretching', 'Mobilisierung', 'Aktive Erholung'].includes(t)), 'Regeneration'];

  const renderExercisesForCategory = () => {
    if (activeTab === 'Regeneration') {
      return (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h3 className="font-bold text-xl mb-3 text-slate-800 dark:text-white flex items-center gap-2"><HeartPulse className="text-emerald-500 w-5 h-5" /> Cooldown & Stretching</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...EXERCISE_DB['Cooldown'], ...EXERCISE_DB['Active-Rest'], ...EXERCISE_DB['Stretching-Specific']['General']].map((ex, i) => <ExerciseCard key={i} exercise={ex} isMain={false} />)}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-3 text-slate-800 dark:text-white flex items-center gap-2"><Activity className="text-blue-500 w-5 h-5" /> Mobilisierung</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EXERCISE_DB['Mobilisierung'].map((ex, i) => <ExerciseCard key={i} exercise={ex} isMain={false} />)}
            </div>
          </div>
        </div>
      );
    }

    const data = EXERCISE_DB['Main-Sets'][activeTab];
    if (!data) return null;

    const allExercises = [...data.exercise1, ...data.exercise2];
    const lvl1 = allExercises.filter(ex => ex.lvl === 1);
    const lvl2 = allExercises.filter(ex => ex.lvl === 2);
    const lvl3 = allExercises.filter(ex => ex.lvl === 3);

    return (
      <div className="space-y-6 animate-in fade-in pb-20">
        {[
          { title: 'Level 1 (Anfänger)', data: lvl1, color: 'text-emerald-500' },
          { title: 'Level 2 (Fortgeschritten)', data: lvl2, color: 'text-blue-500' },
          { title: 'Level 3 (Profi)', data: lvl3, color: 'text-orange-500' }
        ].map(section => (
          <div key={section.title} className={`p-5 rounded-3xl ${glassCard}`}>
            <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${section.color}`}>
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
    <div className="pb-24 md:pb-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl border border-blue-500/20 backdrop-blur-md">
          <BookOpen className="text-blue-500 dark:text-blue-400 w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-black">Bibliothek</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Entdecke alle Übungen.</p>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 mb-2 gap-2 hide-scrollbar snap-x">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`snap-start whitespace-nowrap px-5 py-2.5 rounded-2xl font-bold transition-all ${activeTab === tab ? glassButtonActive : glassButton
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
    if (newTargets.length === 0) newTargets = plan[day].isRest ? ['Stretching'] : ['Oberkörper'];
    updateDay(day, 'targets', newTargets);
  };

  return (
    <div className="pb-24 md:pb-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-3 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl border border-indigo-500/20 backdrop-blur-md">
          <Calendar className="text-indigo-500 dark:text-indigo-400 w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-black">Planer</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Personalisiere deine Woche.</p>
        </div>
      </div>

      <div className="space-y-4">
        {DAYS.map(day => {
          const isExpanded = expandedDay === day;
          const dayPlan = plan[day];

          return (
            <div key={day} className={`${glassCard} overflow-hidden transition-all duration-300 rounded-[2rem] ${isExpanded ? 'ring-2 ring-blue-500/30' : ''}`}>

              <div
                onClick={() => setExpandedDay(isExpanded ? null : day)}
                className="p-5 flex justify-between items-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full shadow-lg ${dayPlan.isRest ? 'bg-emerald-400 shadow-emerald-400/50' : 'bg-blue-500 shadow-blue-500/50'}`} />
                  <span className="font-bold text-lg">{day} {day === TODAY && <span className="text-[10px] ml-2 bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 px-2 py-1 rounded-md uppercase tracking-wider">Heute</span>}</span>
                </div>
                <div className="flex items-center space-x-3">
                  {!dayPlan.isRest && <span className="text-xs font-bold text-slate-400 hidden md:block max-w-[150px] truncate">{dayPlan.targets.join(', ')}</span>}
                  <span className={`text-sm font-bold px-3 py-1.5 rounded-xl border backdrop-blur-sm ${dayPlan.isRest ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' : 'bg-black/5 dark:bg-white/10 border-black/5 dark:border-white/10'}`}>
                    {dayPlan.duration} Min
                  </span>
                  {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="p-5 border-t border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 space-y-6">

                  {/* Ruhetag Toggle */}
                  <div className={`flex items-center justify-between p-4 rounded-2xl ${glassCard} border-emerald-500/20`}>
                    <span className="font-bold flex items-center gap-2"><Moon className="w-4 h-4 text-emerald-500" /> Ruhetag (Recovery)</span>
                    <button onClick={() => {
                      const newIsRest = !dayPlan.isRest;
                      updateDay(day, 'isRest', newIsRest);
                      if (newIsRest) updateDay(day, 'targets', ['Stretching']);
                      else updateDay(day, 'targets', ['Oberkörper']);
                    }}
                      className={`w-14 h-7 rounded-full relative transition-colors ${dayPlan.isRest ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform shadow-md ${dayPlan.isRest ? 'translate-x-8' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Dauer - Immer sichtbar */}
                    <div className={`col-span-1 md:col-span-2 p-4 rounded-2xl ${glassCard}`}>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-bold flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> Dauer {dayPlan.isRest && '(Regeneration)'}</label>
                        <span className="text-blue-600 dark:text-blue-400 font-black">{dayPlan.duration} Minuten</span>
                      </div>
                      <input
                        type="range" min="5" max="90" step="5"
                        value={dayPlan.duration}
                        onChange={(e) => updateDay(day, 'duration', parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>

                    {/* Fokus Auswahl */}
                    <div className={`p-4 rounded-2xl ${glassCard} col-span-1 md:col-span-2`}>
                      <label className="text-sm font-bold block mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-blue-500" /> Trainings-Fokus</label>

                      {!dayPlan.isRest && (
                        <>
                          <div className="mb-4">
                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 block mb-2">Krafttraining</span>
                            <div className="flex flex-wrap gap-2">
                              {TARGETS.Strength.map(target => (
                                <button key={target} onClick={() => toggleTarget(day, target)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${dayPlan.targets.includes(target) ? glassButtonActive : glassButton}`}>
                                  {target}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="mb-4">
                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 block mb-2">Cardio & Ausdauer</span>
                            <div className="flex flex-wrap gap-2">
                              {TARGETS.Cardio.map(target => (
                                <button key={target} onClick={() => toggleTarget(day, target)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${dayPlan.targets.includes(target) ? glassButtonActive : glassButton}`}>
                                  {target}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* IMMER SICHTBAR (Regeneration) */}
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500 block mb-2">Regeneration & Cooldown</span>
                        <div className="flex flex-wrap gap-2">
                          {TARGETS.Recovery.map(target => (
                            <button key={target} onClick={() => toggleTarget(day, target)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${dayPlan.targets.includes(target) ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 border-emerald-400' : glassButton}`}>
                              {target}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Level & Equipment (nur wenn kein reiner Ruhetag) */}
                    {!dayPlan.isRest && (
                      <>
                        <div className={`p-4 rounded-2xl ${glassCard}`}>
                          <label className="text-sm font-bold block mb-2 flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500" /> Intensität (Level)</label>
                          <select
                            value={dayPlan.difficulty}
                            onChange={(e) => updateDay(day, 'difficulty', e.target.value)}
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none backdrop-blur-md"
                          >
                            <option className="bg-white dark:bg-slate-900" value="Anfänger">Anfänger (Leicht)</option>
                            <option className="bg-white dark:bg-slate-900" value="Fortgeschritten">Fortgeschritten (Mittel)</option>
                            <option className="bg-white dark:bg-slate-900" value="Profi">Profi (Schwer)</option>
                          </select>
                        </div>

                        <div className={`p-4 rounded-2xl ${glassCard}`}>
                          <label className="text-sm font-bold block mb-2 flex items-center gap-2"><Dumbbell className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Equipment</label>
                          <select
                            value={dayPlan.equipment}
                            onChange={(e) => updateDay(day, 'equipment', e.target.value)}
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl p-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none backdrop-blur-md"
                          >
                            <option className="bg-white dark:bg-slate-900" value="Ohne Geräte">Ohne Geräte (Bodyweight)</option>
                            <option className="bg-white dark:bg-slate-900" value="Basic">Basic (Stange, Bänder)</option>
                          </select>
                        </div>
                      </>
                    )}

                  </div>
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
  const isCooldownPhase = currentPhase?.type === 'cooldown' || currentPhase?.currentTargetName === 'Stretching' || currentPhase?.currentTargetName === 'Aktive Erholung';

  const phaseDurations = useMemo(() => {
    if (!workoutData) return null;
    const targets = workoutData.targets && workoutData.targets.length > 0 ? workoutData.targets : ['Stretching'];
    const totalSets = targets.length * 3;
    let warmupDur = 120;
    let stretchDur = 120;

    if (workoutData.isRest || targets.every(t => TARGETS.Recovery.includes(t))) {
      return { warmup: 60, stretching: 0, main: Math.floor((targetTotalSecs - 60) / totalSets), cooldown: 0 };
    }

    if (targetTotalSecs <= 300) { warmupDur = 60; stretchDur = 0; }
    else if (targetTotalSecs <= 600) { warmupDur = 90; stretchDur = 60; }

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

  const getExercises = useCallback((pool, targetLevel, count = 3, targetName = '') => {
    if (!pool || pool.length === 0) return [];
    let eqPool = pool;
    const isSpecificCardio = targetName === 'Radfahren' || targetName === 'Rudergerät';

    if (workoutData.equipment === 'Ohne Geräte' && !isSpecificCardio) {
      eqPool = pool.filter(ex => ex.eq === 'none');
    }
    if (eqPool.length === 0) eqPool = pool;

    let lvlPool = eqPool.filter(ex => ex.lvl === targetLevel);
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
    const targets = workoutData.targets && workoutData.targets.length > 0 ? workoutData.targets : ['Stretching'];

    if (prevType === 'cooldown') return { type: 'done' };

    if (!prevType) return { type: 'warmup', title: 'Aufwärmen', duration: phaseDurations.warmup, targetIndex: 0, exercises: shuffleArray(EXERCISE_DB['Warmup-General']).slice(0, 4) };

    if (prevType === 'warmup') {
      if (phaseDurations.stretching > 0 && !TARGETS.Recovery.includes(targets[0])) {
        const t = targets[0];
        const dbTarget = TARGETS.Cardio.includes(t) ? 'Cardio' : t;
        const pool = EXERCISE_DB['Stretching-Specific'][dbTarget] || EXERCISE_DB['Stretching-Specific']['General'];
        return { type: 'stretching', title: `Stretching: ${t}`, duration: phaseDurations.stretching, targetIndex: 0, exercises: shuffleArray(pool).slice(0, 3) };
      } else {
        prevType = 'stretching'; // Skip specific stretch if not needed
      }
    }

    if (prevType === 'stretching' || prevType === 'main') {
      let nextSetIdx = prevType === 'main' ? setIdx + 1 : 1;

      if (nextSetIdx > 3) {
        const nextTargetIdx = targetIdx + 1;
        if (nextTargetIdx < targets.length) {
          if (phaseDurations.stretching > 0 && !TARGETS.Recovery.includes(targets[nextTargetIdx])) {
            const t = targets[nextTargetIdx];
            const dbTarget = TARGETS.Cardio.includes(t) ? 'Cardio' : t;
            const pool = EXERCISE_DB['Stretching-Specific'][dbTarget] || EXERCISE_DB['Stretching-Specific']['General'];
            return { type: 'stretching', title: `Stretching: ${t}`, duration: phaseDurations.stretching, targetIndex: nextTargetIdx, exercises: shuffleArray(pool).slice(0, 3) };
          } else {
            return generateNextPhase({ type: 'stretching', targetIndex: nextTargetIdx, setIndex: 1 });
          }
        } else {
          return phaseDurations.cooldown > 0
            ? { type: 'cooldown', title: 'Regeneration', duration: phaseDurations.cooldown, exercises: shuffleArray(EXERCISE_DB['Cooldown']).slice(0, 3) }
            : { type: 'done' };
        }
      }

      const currentTarget = targets[targetIdx];
      const strengthDB = EXERCISE_DB['Main-Sets'][currentTarget] || EXERCISE_DB['Main-Sets']['Oberkörper'];

      let intensityCurve = [1, 2, 3];
      if (workoutData.difficulty === 'Anfänger') intensityCurve = [1, 1, 2];
      if (workoutData.difficulty === 'Profi') intensityCurve = [2, 3, 3];
      const targetLevel = TARGETS.Recovery.includes(currentTarget) ? 1 : intensityCurve[nextSetIdx - 1];

      return {
        type: 'main',
        title: `${TARGETS.Recovery.includes(currentTarget) ? 'Runde' : 'Satz'} ${nextSetIdx}/3: ${currentTarget}`,
        subtitle: TARGETS.Recovery.includes(currentTarget) ? 'Fokus & Atmung' : `Level ${targetLevel} Intensität`,
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

  if (!currentPhase) return null;
  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col h-full space-y-4 max-w-2xl mx-auto pb-24 md:pb-0 relative z-20">
      <div className={`p-4 rounded-[2rem] flex justify-between items-center ${glassCard}`}>
        <div>
          <span className="text-[10px] font-black uppercase opacity-60 block tracking-widest flex items-center gap-1">
            <Clock className="w-3 h-3" /> Gesamtzeit
          </span>
          <span className={`text-xl font-black font-mono ${isCooldownPhase ? 'text-emerald-500' : 'text-blue-500'}`}>
            {formatTime(Math.min(globalSecsRef.current, targetTotalSecs))} / {workoutData.duration}:00
          </span>
        </div>
        <button onClick={() => setIsPaused(!isPaused)} className={`p-3 rounded-2xl active:scale-95 transition-all ${glassButton}`}>
          {isPaused ? <PlayCircle className="text-blue-500 w-8 h-8" /> : <PauseCircle className="w-8 h-8" />}
        </button>
      </div>

      <div className={`p-8 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden transition-colors duration-500 ${isCooldownPhase ? 'bg-emerald-500/10 border border-emerald-500/30' : glassCardLight + ' dark:bg-[#1c1c1e]/80 border-t-white/40'}`}>
        <span className={`relative z-10 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-2 inline-block ${isCooldownPhase ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-blue-500/20 text-blue-700 dark:text-blue-400'}`}>
          {currentPhase.title}
        </span>
        {currentPhase.subtitle && <p className="text-xs font-bold opacity-50 mb-2 uppercase tracking-widest">{currentPhase.subtitle}</p>}

        <div className={`text-7xl md:text-8xl font-black font-mono tracking-tighter my-2 ${isCooldownPhase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
          {formatTime(phaseSecsRef.current)}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {currentPhase.type === 'main' ? (
          currentPhase.slots.map((slot, i) => (
            <div key={`${currentPhase.title}-${i}`} className={`p-5 rounded-3xl animate-in slide-in-from-right-4 duration-300 ${glassCard}`}>
              <h4 className="text-sm font-black opacity-40 uppercase mb-3 flex items-center">
                <div className={`w-1.5 h-4 rounded-full mr-2 ${isCooldownPhase ? 'bg-emerald-500' : 'bg-blue-500'}`} /> {slot.role}
              </h4>
              <ExerciseCard exercise={slot.options[0]} isMain={true} />
            </div>
          ))
        ) : (
          <div className={`p-6 rounded-3xl ${glassCard}`}>
            <h4 className="text-sm font-black opacity-40 uppercase mb-4 tracking-widest">Ablauf</h4>
            <div className="space-y-4">
              {currentPhase.exercises.map((ex, i) => (
                <ExerciseCard key={i} exercise={typeof ex === 'string' ? { name: ex, eq: 'none' } : ex} isMain={i === 0} />
              ))}
            </div>
          </div>
        )}
      </div>

      <button onClick={() => { globalSecsRef.current += phaseSecsRef.current; setCurrentPhase(generateNextPhase(currentPhase)); }} className={`w-full py-4 rounded-3xl font-black flex items-center justify-center shadow-xl active:scale-95 transition-all text-lg ${glassButtonActiveLight} dark:bg-white dark:text-black dark:shadow-white/20`}>
        {isCooldownPhase ? 'Workout Beenden' : 'Phase überspringen'} <SkipForward className="ml-2 w-5 h-5" />
      </button>
    </div>
  );
}

// --- APP HÜLLE ---
export default function App() {
  const [theme, setTheme] = useState('dark'); // Default Dark Mode for Apple Vibe
  const [currentView, setCurrentView] = useState('dashboard');
  const [customPlan, setCustomPlan] = useState(INITIAL_CUSTOM_PLAN);
  const [activeWorkoutData, setActiveWorkoutData] = useState(null);

  const startWorkout = (dayPlan) => {
    setActiveWorkoutData(dayPlan);
    setCurrentView('workout');
  };

  const navItemClass = (viewName) => `flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all duration-300 ${currentView === viewName
      ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]'
      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
    }`;

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      {/* Background with Apple Liquid Glass Orbs */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-slate-100 dark:bg-[#000000] transition-colors duration-700">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-400/30 dark:bg-blue-600/20 rounded-full blur-[100px] md:blur-[150px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-400/30 dark:bg-indigo-600/20 rounded-full blur-[100px] md:blur-[150px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute top-[40%] left-[20%] w-[30vw] h-[30vw] bg-emerald-400/20 dark:bg-emerald-600/10 rounded-full blur-[80px] md:blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <div className="h-screen w-full text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden font-sans selection:bg-blue-500/30 relative z-10">

        {/* Top Header */}
        {currentView !== 'workout' && (
          <header className="p-4 md:px-8 flex justify-between items-center z-20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/50 dark:bg-white/10 backdrop-blur-md rounded-xl border border-white/50 dark:border-white/10 shadow-sm">
                <Activity className="text-blue-600 dark:text-blue-400 w-6 h-6" />
              </div>
              <span className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400">FitPlaner</span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Desktop Nav (Hidden on Mobile) */}
              <div className="hidden md:flex space-x-2 mr-4 bg-white/40 dark:bg-[#1c1c1e]/40 backdrop-blur-xl p-1.5 rounded-2xl border border-white/40 dark:border-white/10">
                <button onClick={() => setCurrentView('dashboard')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${currentView === 'dashboard' ? 'bg-white dark:bg-white/20 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-white/5'}`}>Home</button>
                <button onClick={() => setCurrentView('custom')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${currentView === 'custom' ? 'bg-white dark:bg-white/20 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-white/5'}`}>Planer</button>
                <button onClick={() => setCurrentView('library')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${currentView === 'library' ? 'bg-white dark:bg-white/20 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-white/5'}`}>Übungen</button>
              </div>

              <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="p-2.5 rounded-xl bg-white/50 dark:bg-white/10 backdrop-blur-md border border-white/50 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all shadow-sm">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </header>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 scroll-smooth">
          <div className="max-w-4xl mx-auto h-full">
            {currentView === 'dashboard' && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-2xl mx-auto mt-4 md:mt-12">
                <h2 className="text-4xl md:text-5xl font-black mb-2 text-slate-800 dark:text-white tracking-tight">{getDynamicGreeting()}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 font-medium">Dein Plan für {TODAY}</p>

                <div className={`p-8 md:p-10 rounded-[3rem] ${glassCard} relative overflow-hidden group hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-500`}>
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                      <h3 className="text-3xl font-black">{customPlan[TODAY].isRest ? 'Regeneration' : 'Workout Time'}</h3>
                      <span className={`font-bold px-4 py-1.5 rounded-full flex items-center justify-center gap-2 w-fit border backdrop-blur-md ${customPlan[TODAY].isRest ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' : 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400'}`}>
                        <Clock className="w-4 h-4" /> {customPlan[TODAY].duration} Min
                      </span>
                    </div>

                    <div className="space-y-4 mb-10">
                      <div className="flex items-center gap-3 font-medium opacity-80">
                        <Target className={`w-5 h-5 shrink-0 ${customPlan[TODAY].isRest ? 'text-emerald-500' : 'text-blue-500'}`} />
                        Fokus: {customPlan[TODAY].targets.join(', ')}
                      </div>
                      {!customPlan[TODAY].isRest && (
                        <>
                          <div className="flex items-center gap-3 font-medium opacity-80">
                            <Flame className="w-5 h-5 text-orange-500 shrink-0" /> Level: {customPlan[TODAY].difficulty}
                          </div>
                          <div className="flex items-center gap-3 font-medium opacity-80">
                            <Dumbbell className="w-5 h-5 text-slate-500 shrink-0" /> Equipment: {customPlan[TODAY].equipment}
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => startWorkout(customPlan[TODAY])}
                      className={`w-full font-black py-5 rounded-[2rem] text-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl ${customPlan[TODAY].isRest ? 'bg-emerald-500 text-white shadow-emerald-500/30' : glassButtonActiveLight + ' dark:bg-white dark:text-black dark:shadow-white/20'}`}
                    >
                      <PlayCircle className="w-6 h-6" />
                      {customPlan[TODAY].isRest ? 'RECOVERY STARTEN' : 'WORKOUT STARTEN'}
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

        {/* Mobile Navigation Dock (Apple Style) */}
        {currentView !== 'workout' && (
          <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[350px] animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="flex justify-around items-center p-2 bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <button onClick={() => setCurrentView('dashboard')} className={navItemClass('dashboard')}>
                <Home size={22} className="mb-0.5" />
                <span className="text-[10px] font-bold">Home</span>
              </button>
              <button onClick={() => setCurrentView('custom')} className={navItemClass('custom')}>
                <Calendar size={22} className="mb-0.5" />
                <span className="text-[10px] font-bold">Planer</span>
              </button>
              <button onClick={() => setCurrentView('library')} className={navItemClass('library')}>
                <BookOpen size={22} className="mb-0.5" />
                <span className="text-[10px] font-bold">Übungen</span>
              </button>
            </div>
          </nav>
        )}

      </div>
    </div>
  );
}