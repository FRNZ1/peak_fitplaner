import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Home, Calendar, Dumbbell, Activity, Clock, Flame,
  CheckCircle2, Settings, Moon, Sun,
  PlayCircle, PauseCircle, SkipForward,
  Wand2, X, ChevronDown, ChevronUp, Save, Edit3, Shuffle
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

const getRandomExercises = (pool, count = 3) => {
  return shuffleArray(pool).slice(0, count);
};

// --- KONSTANTEN & DATEN ---
const TARGETS = {
  Strength: ['Upper-Body', 'Lower-Body', 'Core'],
  Cardio: ['Laufen', 'Radfahren', 'Rudern'],
  Rest: ['Stretching', 'Mobilisierung']
};

const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

const EXERCISE_DB = {
  'Warmup-General': [
    'Hampelmann (Jumping Jacks)', 'Armkreisen', 'Beinpendel', 'Hüftkreisen',
    'Schulternrollen', 'Leichtes Laufen auf der Stelle', 'Torso-Twists'
  ],
  'Stretching-Specific': {
    'Upper-Body': [
      { name: 'Brust-Dehnung (Wand/Türrahmen)', eq: 'Bodyweight' },
      { name: 'Trizeps-Dehnung (Überkopf)', eq: 'Bodyweight' },
      { name: 'Schulter-Stretch', eq: 'Bodyweight' },
      { name: 'Handgelenk-Kreisen', eq: 'Bodyweight' }
    ],
    'Lower-Body': [
      { name: 'Quadrizeps-Dehnung (Stehend)', eq: 'Bodyweight' },
      { name: 'Hamstring-Dehnung (Vornüberbeugen)', eq: 'Bodyweight' },
      { name: 'Waden-Dehnung', eq: 'Bodyweight' },
      { name: 'Hüftbeuger-Stretch', eq: 'Bodyweight' }
    ],
    'Core': [
      { name: 'Kobra-Pose', eq: 'Bodyweight' },
      { name: 'Katze-Kuh', eq: 'Bodyweight' },
      { name: 'Seitliche Rumpfbeuge', eq: 'Bodyweight' },
      { name: 'Child\'s Pose', eq: 'Bodyweight' }
    ],
    'Cardio': [
      { name: 'Dynamische Waden-Dehnung', eq: 'Bodyweight' },
      { name: 'Beinschwünge (Vor/Zurück & Seitlich)', eq: 'Bodyweight' },
      { name: 'Hüftkreisen (Groß)', eq: 'Bodyweight' }
    ],
    'General': [
      { name: 'Ganzkörper-Strecken', eq: 'Bodyweight' },
      { name: 'Tiefe Hocke (Ausharren)', eq: 'Bodyweight' },
      { name: 'Nacken-Dehnung', eq: 'Bodyweight' }
    ]
  },
  'Mobilisierung': [
    { name: 'Tiefe Hocke (Prying Squat)', eq: 'Bodyweight' },
    { name: 'Thorax-Rotation (Vierfüßlerstand)', eq: 'Bodyweight' },
    { name: 'Hüft-Rotation (90/90 Sitz)', eq: 'Bodyweight' },
    { name: 'Scapula Push-ups', eq: 'Bodyweight' },
    { name: 'Knöchel-Mobilisierung', eq: 'Bodyweight' }
  ],
  'Main-Sets': {
    'Upper-Body': {
      exercise1: [
        { name: 'Klimmzüge (breit)', eq: 'Powertower' },
        { name: 'Chin-ups (Untergriff)', eq: 'Powertower' },
        { name: 'Klimmzüge (neutral)', eq: 'Powertower' }
      ],
      exercise2: [
        { name: 'Dips', eq: 'Powertower' },
        { name: 'Liegestütze (klassisch)', eq: 'Bodyweight' },
        { name: 'Pike Push-ups', eq: 'Bodyweight' }
      ]
    },
    'Lower-Body': {
      exercise1: [
        { name: 'Pistol Squats (assistiert)', eq: 'Powertower' },
        { name: 'Bulgarian Split Squats', eq: 'Bodyweight' },
        { name: 'Jumping Squats', eq: 'Bodyweight' }
      ],
      exercise2: [
        { name: 'Wadenheben (einbeinig)', eq: 'Bodyweight' },
        { name: 'Nordic Hamstring Curls', eq: 'Bodyweight' },
        { name: 'Walking Lunges', eq: 'Bodyweight' }
      ]
    },
    'Core': {
      exercise1: [
        { name: 'Beinheben hängend', eq: 'Powertower' },
        { name: 'Knieheben hängend', eq: 'Powertower' },
        { name: 'L-Sit (auf Dips-Barren)', eq: 'Powertower' }
      ],
      exercise2: [
        { name: 'Hollow Body Hold', eq: 'Bodyweight' },
        { name: 'Plank (Schulter-Taps)', eq: 'Bodyweight' },
        { name: 'Russian Twists', eq: 'Bodyweight' }
      ]
    },
    'Cardio': {
      exercise1: [
        { name: 'Schnelle Intervalle (Laufen/Rad/Rudern)', eq: 'Gerät/Track' },
        { name: 'Burpees', eq: 'Bodyweight' },
        { name: 'Bergsteiger (Mountain Climbers)', eq: 'Bodyweight' }
      ],
      exercise2: [
        { name: 'Konstantes Tempo (Moderates Cardio)', eq: 'Gerät/Outdoor' },
        { name: 'Jumping Jacks (Dauer)', eq: 'Bodyweight' },
        { name: 'High Knees', eq: 'Bodyweight' }
      ]
    }
  },
  'Active-Rest': [
    { name: 'Scapula Hang (Aushängen)', eq: 'Powertower' },
    { name: 'Tiefe Hocke', eq: 'Bodyweight' },
    { name: 'Arme und Beine ausschütteln', eq: 'Bodyweight' }
  ],
  'Cooldown': [
    { name: 'Brust öffnen am Tower', eq: 'Powertower' },
    { name: 'Cobra Pose', eq: 'Bodyweight' },
    { name: 'Child\'s Pose', eq: 'Bodyweight' },
    { name: 'Tiefe Bauchatmung (Rückenlage)', eq: 'Bodyweight' }
  ]
};

const INITIAL_CUSTOM_PLAN = {
  Montag: { isRest: false, intensity: 'Hart', duration: 60, targets: ['Upper-Body'] },
  Dienstag: { isRest: false, intensity: 'Leicht', duration: 30, targets: ['Laufen'] },
  Mittwoch: { isRest: true, intensity: 'Ruhe', duration: 0, targets: ['Mobilisierung'] },
  Donnerstag: { isRest: false, intensity: 'Hart', duration: 60, targets: ['Lower-Body'] },
  Freitag: { isRest: false, intensity: 'Leicht', duration: 30, targets: ['Radfahren'] },
  Samstag: { isRest: false, intensity: 'Hart', duration: 60, targets: ['Core'] },
  Sonntag: { isRest: true, intensity: 'Ruhe', duration: 0, targets: ['Stretching'] },
};

// --- KOMPONENTEN ---

function SidebarItem({ icon, label, view, currentView, setView }) {
  return (
    <button
      onClick={() => setView(view)}
      className={`flex items-center w-full px-4 py-3 mb-1 rounded-2xl transition-all duration-200 ${currentView === view
          ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-500 font-bold'
          : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-slate-800'
        }`}
    >
      {React.cloneElement(icon, { className: `w-5 h-5 mr-3 ${currentView === view ? 'text-orange-500' : ''}` })}
      <span>{label}</span>
    </button>
  );
}

function ExerciseCard({ exercise, isMain }) {
  const isTower = exercise.eq?.includes('Powertower');

  if (isMain) {
    return (
      <div className={`p-4 rounded-2xl border-2 animate-in fade-in zoom-in duration-300 ${isTower ? 'border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10'}`}>
        <div className="flex justify-between items-start">
          <span className="font-black text-lg text-slate-900 dark:text-white">{exercise.name}</span>
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ${isTower ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'}`}>
            {exercise.eq}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex justify-between items-center transition-all hover:border-orange-200">
      <span className="font-medium text-sm text-slate-700 dark:text-slate-300">{exercise.name}</span>
      <span className="text-[10px] font-bold text-gray-400 uppercase">{exercise.eq}</span>
    </div>
  );
}

// --- WORKOUT ENGINE ---
function ActiveWorkoutEngine({ workoutData, onFinish }) {
  const [isPaused, setIsPaused] = useState(false);
  const globalSecsRef = useRef(0);
  const phaseSecsRef = useRef(0);

  const [currentPhase, setCurrentPhase] = useState(null);
  const [tick, setTick] = useState(0); // Force re-render

  const targetSecs = (workoutData?.duration || 45) * 60;

  const generateNextPhase = useCallback((prevPhaseState) => {
    const prevType = prevPhaseState?.type;
    const targetIdx = prevPhaseState?.targetIndex || 0;
    const setIdx = prevPhaseState?.setIndex || 1;

    // Behandle Ruhetage (Stretching / Mobilisierung)
    if (workoutData.isRest) {
      const restTargets = workoutData.targets || [];
      if (restTargets.length === 0) return { type: 'done' };

      if (!prevType) {
        return {
          type: 'rest_activity',
          title: `Entspannung: ${restTargets[0]}`,
          duration: 300,
          targetIndex: 0,
          exercises: getRandomExercises(EXERCISE_DB[restTargets[0] === 'Mobilisierung' ? 'Mobilisierung' : 'Stretching-Specific']['General'] || EXERCISE_DB['Mobilisierung'], 4)
        };
      }

      if (prevType === 'rest_activity' && targetIdx + 1 < restTargets.length) {
        const nextTarget = restTargets[targetIdx + 1];
        return {
          type: 'rest_activity',
          title: `Entspannung: ${nextTarget}`,
          duration: 300,
          targetIndex: targetIdx + 1,
          exercises: getRandomExercises(EXERCISE_DB[nextTarget === 'Mobilisierung' ? 'Mobilisierung' : 'Stretching-Specific']['General'] || EXERCISE_DB['Mobilisierung'], 4)
        };
      }

      return { type: 'done' };
    }

    // Normales Training
    const targets = workoutData.targets && workoutData.targets.length > 0 ? workoutData.targets : ['Upper-Body'];
    const currentTarget = targets[targetIdx];
    const dbTarget = TARGETS.Cardio.includes(currentTarget) ? 'Cardio' : currentTarget;

    // Cooldown forcieren, wenn die Zeit um ist, aber erst nach Abschluss der aktuellen Main-Phase
    const isTimeUp = globalSecsRef.current >= targetSecs;

    if (prevType === 'cooldown') return { type: 'done' };

    if (!prevType) {
      return { type: 'warmup', title: 'Allgemeines Aufwärmen', duration: 120, targetIndex: 0, exercises: getRandomExercises(EXERCISE_DB['Warmup-General'], 3) };
    }

    if (prevType === 'warmup') {
      const pool = EXERCISE_DB['Stretching-Specific'][dbTarget] || EXERCISE_DB['Stretching-Specific']['General'];
      return { type: 'stretching', title: `Stretching: ${currentTarget}`, duration: 120, targetIndex: 0, exercises: getRandomExercises(pool, 3) };
    }

    if (prevType === 'stretching' || prevType === 'main') {
      let nextSetIdx = prevType === 'main' ? setIdx + 1 : 1;

      // Max 3 Sets pro Muskelgruppe, danach nächste Gruppe oder Cooldown
      if (nextSetIdx > 3 || (isTimeUp && prevType === 'main')) {
        const nextTargetIdx = targetIdx + 1;
        if (nextTargetIdx < targets.length && !isTimeUp) {
          const nextTarget = targets[nextTargetIdx];
          const nextDbTarget = TARGETS.Cardio.includes(nextTarget) ? 'Cardio' : nextTarget;
          const pool = EXERCISE_DB['Stretching-Specific'][nextDbTarget] || EXERCISE_DB['Stretching-Specific']['General'];
          return { type: 'stretching', title: `Stretching: ${nextTarget}`, duration: 120, targetIndex: nextTargetIdx, exercises: getRandomExercises(pool, 3) };
        } else {
          return { type: 'cooldown', title: 'Workout Komplett! Cooldown', duration: 30, exercises: getRandomExercises(EXERCISE_DB['Cooldown'], 3) };
        }
      }

      const strengthDB = EXERCISE_DB['Main-Sets'][dbTarget] || EXERCISE_DB['Main-Sets']['Upper-Body'];
      return {
        type: 'main',
        title: `Set ${nextSetIdx}: ${currentTarget}`,
        duration: 240,
        targetIndex: targetIdx,
        setIndex: nextSetIdx,
        slots: [
          { role: 'Übung 1', options: getRandomExercises(strengthDB.exercise1, 3) },
          { role: 'Übung 2', options: getRandomExercises(strengthDB.exercise2, 3) },
          { role: 'Aktive Pause', options: getRandomExercises(EXERCISE_DB['Active-Rest'], 3) }
        ]
      };
    }

    return { type: 'done' };
  }, [workoutData, targetSecs]);

  // Initialisierung
  useEffect(() => {
    if (workoutData && !currentPhase) {
      globalSecsRef.current = 0;
      const initial = generateNextPhase(null);
      setCurrentPhase(initial);
      phaseSecsRef.current = initial.duration;
      setTick(t => t + 1);

      if (initial.type === 'done') onFinish();
    }
  }, [workoutData, currentPhase, generateNextPhase, onFinish]);

  // Timer Interval
  useEffect(() => {
    if (isPaused || !currentPhase || currentPhase.type === 'done') return;

    const interval = setInterval(() => {
      globalSecsRef.current += 1;
      phaseSecsRef.current -= 1;

      if (phaseSecsRef.current <= 0) {
        const next = generateNextPhase(currentPhase);
        setCurrentPhase(next);
        if (next.type === 'done') {
          onFinish(); // Auto-Dashboard
        } else {
          phaseSecsRef.current = next.duration;
        }
      }
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, currentPhase, generateNextPhase, onFinish]);

  const handleSkipPhase = () => {
    globalSecsRef.current += phaseSecsRef.current; // Rechne restliche Zeit auf Global-Timer an
    const next = generateNextPhase(currentPhase);
    setCurrentPhase(next);
    if (next.type === 'done') {
      onFinish();
    } else {
      phaseSecsRef.current = next.duration;
      setTick(t => t + 1);
    }
  };

  const handleShuffle = () => {
    setCurrentPhase(prev => {
      const targets = workoutData.targets.length > 0 ? workoutData.targets : ['Upper-Body'];
      const currentTarget = targets[prev.targetIndex || 0];
      const dbTarget = TARGETS.Cardio.includes(currentTarget) ? 'Cardio' : currentTarget;

      if (prev.type === 'main') {
        const strengthDB = EXERCISE_DB['Main-Sets'][dbTarget] || EXERCISE_DB['Main-Sets']['Upper-Body'];
        return {
          ...prev,
          slots: [
            { role: 'Übung 1', options: getRandomExercises(strengthDB.exercise1, 3) },
            { role: 'Übung 2', options: getRandomExercises(strengthDB.exercise2, 3) },
            { role: 'Aktive Pause', options: getRandomExercises(EXERCISE_DB['Active-Rest'], 3) }
          ]
        };
      } else if (prev.type === 'stretching') {
        const pool = EXERCISE_DB['Stretching-Specific'][dbTarget] || EXERCISE_DB['Stretching-Specific']['General'];
        return { ...prev, exercises: getRandomExercises(pool, 3) };
      } else if (prev.type === 'warmup') {
        return { ...prev, exercises: getRandomExercises(EXERCISE_DB['Warmup-General'], 3) };
      } else if (prev.type === 'rest_activity') {
        const pool = currentTarget === 'Mobilisierung' ? EXERCISE_DB['Mobilisierung'] : (EXERCISE_DB['Stretching-Specific']['General'] || EXERCISE_DB['Mobilisierung']);
        return { ...prev, exercises: getRandomExercises(pool, 4) };
      }
      return prev;
    });
    setTick(t => t + 1);
  };

  if (!currentPhase) return null;

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-slate-800 flex justify-between items-center shadow-sm">
        <div>
          <span className="text-[10px] font-black uppercase text-gray-400 block tracking-widest">Globaler Timer</span>
          <span className="text-xl font-black dark:text-white font-mono">{formatTime(globalSecsRef.current)} / {workoutData.duration}:00</span>
        </div>
        <button onClick={() => setIsPaused(!isPaused)} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl">
          {isPaused ? <PlayCircle className="text-orange-500" /> : <PauseCircle />}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 text-center shadow-md relative overflow-hidden">
        <span className="relative z-10 px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-black uppercase tracking-wider mb-4 inline-block">
          {currentPhase.title}
        </span>
        <div className="text-7xl font-black dark:text-white font-mono tracking-tighter my-2">
          {formatTime(phaseSecsRef.current)}
        </div>
        {currentPhase.type === 'cooldown' && (
          <p className="text-sm text-gray-400 mt-2 font-bold animate-pulse">Entspanne dich... Auto-Ende in Kürze.</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {currentPhase.type === 'main' ? (
          currentPhase.slots.map((slot, i) => (
            <div key={`${currentPhase.title}-${i}`} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
              <h4 className="text-sm font-black text-gray-400 uppercase mb-3 flex items-center">
                <div className="w-1.5 h-4 bg-orange-500 rounded-full mr-2" /> {slot.role}
              </h4>
              <ExerciseCard exercise={slot.options[0]} isMain={true} />
              <details className="mt-3">
                <summary className="text-xs font-bold text-gray-400 cursor-pointer list-none py-2 hover:text-orange-500 transition-colors">
                  + 2 Alternativen
                </summary>
                <div className="space-y-2 pt-2">
                  <ExerciseCard exercise={slot.options[1]} isMain={false} />
                  <ExerciseCard exercise={slot.options[2]} isMain={false} />
                </div>
              </details>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <h4 className="text-sm font-black text-gray-400 uppercase mb-4 tracking-widest">Phase Übungen</h4>
            <div className="space-y-4">
              {currentPhase.exercises.map((ex, i) => (
                <ExerciseCard key={i} exercise={typeof ex === 'string' ? { name: ex, eq: 'Warmup' } : ex} isMain={i === 0} />
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center mt-4">
          <button onClick={handleShuffle} className="flex items-center text-sm font-bold text-gray-500 hover:text-orange-500 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
            <Shuffle className="w-4 h-4 mr-2" /> Übungen Shuffle
          </button>
        </div>
      </div>

      <button onClick={handleSkipPhase} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black flex items-center justify-center shadow-xl active:scale-95 transition-transform">
        {currentPhase.type === 'cooldown' ? 'Workout Beenden' : 'Nächste Phase'} <SkipForward className="ml-2 w-5 h-5" />
      </button>
    </div>
  );
}

// --- VIEWS ---

function DashboardView({ onStart, plan }) {
  const dayIndex = new Date().getDay();
  const todayName = DAYS[dayIndex === 0 ? 6 : dayIndex - 1];
  const workout = plan[todayName];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h2 className="text-4xl font-black mb-2 tracking-tight">Hallo Champion!</h2>
      <p className="text-gray-500 mb-8 font-medium">Bereit für dein Training?</p>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm mb-6">
        <span className="text-orange-500 font-black text-xs uppercase tracking-[0.2em] mb-2 block">Heute: {todayName}</span>
        <h3 className="text-3xl font-black mb-6">{workout.isRest ? 'Ruhetag' : 'Power Workout'}</h3>

        {workout.isRest ? (
          <div className="mb-8">
            <p className="text-gray-500 mb-4 font-bold">Heutige Entspannungs-Ziele:</p>
            <div className="flex space-x-2">
              {workout.targets.length > 0 ? workout.targets.map(t => (
                <span key={t} className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-lg text-sm font-bold">{t}</span>
              )) : <span className="text-gray-400 text-sm">Keine geplant.</span>}
            </div>
            {workout.targets.length > 0 && (
              <button onClick={() => onStart(workout)} className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center transition-all active:scale-95">
                <PlayCircle className="mr-2" /> ENTSPANNUNG STARTEN
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex space-x-6 mb-8 flex-wrap gap-y-3">
              <div className="flex items-center text-gray-400 font-bold"><Clock className="mr-2" size={18} /> {workout.duration}m</div>
              <div className="flex items-center text-gray-400 font-bold"><Flame className="mr-2" size={18} /> {workout.intensity}</div>
              <div className="flex items-center text-gray-400 font-bold"><Activity className="mr-2" size={18} /> {workout.targets.join(', ')}</div>
            </div>
            <button onClick={() => onStart(workout)} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-center transition-all active:scale-95">
              <PlayCircle className="mr-2" /> JETZT STARTEN
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CustomPlannerView({ plan, setPlan }) {
  const [expandedDay, setExpandedDay] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showDurationSliderDay, setShowDurationSliderDay] = useState(null);

  const updateDay = (day, field, value) => {
    setPlan(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const toggleTarget = (day, target) => {
    const currentTargets = plan[day].targets;
    let newTargets;
    if (currentTargets.includes(target)) {
      newTargets = currentTargets.filter(t => t !== target);
    } else {
      newTargets = [...currentTargets, target];
    }
    updateDay(day, 'targets', newTargets);
  };

  const generatePlan = (daysPerWeek, goal) => {
    const newPlan = {};
    DAYS.forEach(d => newPlan[d] = { isRest: true, intensity: 'Ruhe', duration: 0, targets: ['Stretching'] });

    const workDays = [];
    if (daysPerWeek === 1) workDays.push(2);
    else if (daysPerWeek === 2) workDays.push(1, 4);
    else if (daysPerWeek === 3) workDays.push(0, 2, 4);
    else if (daysPerWeek === 4) workDays.push(0, 1, 3, 5);
    else if (daysPerWeek === 5) workDays.push(0, 1, 3, 4, 5);
    else if (daysPerWeek === 6) workDays.push(0, 1, 2, 3, 4, 5);
    else workDays.push(0, 1, 2, 3, 4, 5, 6);

    let hardCount = 0;

    DAYS.forEach((day, idx) => {
      if (workDays.includes(idx)) {
        let intensity = 'Mittel';
        let duration = 45;
        let targets = [];

        if (hardCount < 3 && (goal === 'Strength' || goal === 'Mix')) {
          intensity = 'Hart';
          duration = 60;
          targets = [TARGETS.Strength[hardCount % TARGETS.Strength.length]];
          hardCount++;
        } else {
          intensity = 'Leicht';
          duration = 30;
          targets = [TARGETS.Cardio[Math.floor(Math.random() * TARGETS.Cardio.length)]];
        }

        newPlan[day] = { isRest: false, intensity, duration, targets };
      }
    });

    setPlan(newPlan);
    setShowGenerator(false);
  };

  return (
    <div className="pb-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-black">Wochenplaner</h2>
          <p className="text-gray-500 font-medium">Gestalte deinen Ablauf</p>
        </div>
        <button onClick={() => setShowGenerator(true)} className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-3 rounded-xl font-bold flex items-center hover:bg-orange-200 transition-colors">
          <Wand2 size={20} className="md:mr-2" /> <span className="hidden md:inline">Plan generieren</span>
        </button>
      </div>

      {showGenerator && (
        <div className="mb-8 p-6 bg-orange-50 dark:bg-slate-800 rounded-3xl border border-orange-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-xl flex items-center"><Wand2 className="mr-2 text-orange-500" /> Plan Assistent</h3>
            <button onClick={() => setShowGenerator(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Wir erstellen einen ausgewogenen Plan. Es werden maximal 3 harte Trainingstage eingeplant.</p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Tage pro Woche (1-7)</label>
              <input type="range" min="1" max="7" defaultValue="4" id="genDays" className="w-full accent-orange-500" onChange={(e) => document.getElementById('daysLabel').innerText = e.target.value + ' Tage'} />
              <div id="daysLabel" className="text-center font-bold mt-1">4 Tage</div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Fokus</label>
              <select id="genGoal" className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 font-bold">
                <option value="Mix">Mix (Kraft & Cardio)</option>
                <option value="Strength">Fokus Kraft</option>
                <option value="Cardio">Fokus Cardio</option>
              </select>
            </div>
            <button onClick={() => generatePlan(parseInt(document.getElementById('genDays').value), document.getElementById('genGoal').value)} className="w-full bg-orange-500 text-white font-black py-3 rounded-xl mt-2">
              Generieren
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {DAYS.map(day => {
          const isExpanded = expandedDay === day;
          const dayPlan = plan[day];

          return (
            <div key={day} className={`bg-white dark:bg-slate-900 rounded-2xl border ${isExpanded ? 'border-orange-500 shadow-md' : 'border-gray-100 dark:border-slate-800'} overflow-hidden transition-all duration-300`}>

              {/* Header */}
              <div
                onClick={() => setExpandedDay(isExpanded ? null : day)}
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${dayPlan.isRest ? 'bg-blue-400' : (dayPlan.intensity === 'Hart' ? 'bg-red-500' : 'bg-orange-500')}`} />
                  <span className="font-bold text-lg">{day}</span>
                </div>
                <div className="flex items-center space-x-3">
                  {!dayPlan.isRest && <span className="text-xs font-bold text-gray-400 hidden md:block">{dayPlan.targets.join(', ')}</span>}
                  <span className="text-sm font-bold bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-md">{dayPlan.isRest ? 'Ruhe' : `${dayPlan.duration}m`}</span>
                  {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </div>
              </div>

              {/* Editor Bereich */}
              {isExpanded && (
                <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 space-y-5 animate-in slide-in-from-top-2">

                  {/* Ruhe Toggle */}
                  <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-slate-700">
                    <span className="font-bold">Ist ein Ruhetag?</span>
                    <button
                      onClick={() => {
                        updateDay(day, 'isRest', !dayPlan.isRest);
                        if (!dayPlan.isRest) updateDay(day, 'targets', ['Stretching']); // Default Rest target
                        else updateDay(day, 'targets', ['Upper-Body']); // Default Active target
                      }}
                      className={`w-12 h-6 rounded-full transition-colors relative ${dayPlan.isRest ? 'bg-blue-500' : 'bg-gray-300 dark:bg-slate-600'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${dayPlan.isRest ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  {dayPlan.isRest ? (
                    // RUHETAG EDITOR
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Entspannungs-Optionen</label>
                      <div className="flex flex-wrap gap-2">
                        {TARGETS.Rest.map(target => (
                          <button
                            key={target}
                            onClick={() => toggleTarget(day, target)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${dayPlan.targets.includes(target)
                                ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50'
                                : 'bg-white text-gray-500 border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-400'
                              }`}
                          >
                            {target}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // NORMALER TRAININGSTAG EDITOR
                    <>
                      {/* Dauer Slider (Auf Klick) */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold uppercase text-gray-500">Dauer</label>
                          <button
                            onClick={() => setShowDurationSliderDay(showDurationSliderDay === day ? null : day)}
                            className="text-xs font-black text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-lg flex items-center hover:bg-orange-100 transition-colors"
                          >
                            <Edit3 size={14} className="mr-1" /> {dayPlan.duration} Minuten
                          </button>
                        </div>
                        {showDurationSliderDay === day && (
                          <input
                            type="range" min="5" max="180" step="5"
                            value={dayPlan.duration}
                            onChange={(e) => updateDay(day, 'duration', parseInt(e.target.value))}
                            className="w-full accent-orange-500 mt-2 animate-in fade-in"
                          />
                        )}
                      </div>

                      {/* Intensität */}
                      <div>
                        <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Intensität</label>
                        <div className="flex space-x-2">
                          {['Leicht', 'Mittel', 'Hart'].map(int => (
                            <button
                              key={int}
                              onClick={() => updateDay(day, 'intensity', int)}
                              className={`flex-1 py-2 rounded-xl font-bold text-sm transition-colors border ${dayPlan.intensity === int
                                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                                  : 'bg-white dark:bg-slate-800 text-gray-500 border-gray-200 dark:border-slate-700 hover:bg-gray-50'
                                }`}
                            >
                              {int}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Zielbereiche */}
                      <div>
                        <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Kombinierbare Bereiche</label>

                        <div className="mb-2">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Kraft</span>
                          <div className="flex flex-wrap gap-2">
                            {TARGETS.Strength.map(target => (
                              <button
                                key={target}
                                onClick={() => toggleTarget(day, target)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${dayPlan.targets.includes(target)
                                    ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/50'
                                    : 'bg-white text-gray-500 border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-400'
                                  }`}
                              >
                                {target}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Cardio</span>
                          <div className="flex flex-wrap gap-2">
                            {TARGETS.Cardio.map(target => (
                              <button
                                key={target}
                                onClick={() => toggleTarget(day, target)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${dayPlan.targets.includes(target)
                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50'
                                    : 'bg-white text-gray-500 border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-400'
                                  }`}
                              >
                                {target}
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>
                    </>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button onClick={() => setExpandedDay(null)} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl font-bold flex items-center text-sm">
                      <Save size={16} className="mr-2" /> Speichern
                    </button>
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

// --- MAIN APP ---
export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('fitplaner-theme') || 'dark');
  const [currentView, setCurrentView] = useState('dashboard');

  const [customPlan, setCustomPlan] = useState(() => {
    const saved = localStorage.getItem('fitplaner-plan');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return INITIAL_CUSTOM_PLAN;
  });

  const [activeWorkoutData, setActiveWorkoutData] = useState(null);

  useEffect(() => { localStorage.setItem('fitplaner-theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('fitplaner-plan', JSON.stringify(customPlan)); }, [customPlan]);

  const startWorkout = (dayPlan) => {
    setActiveWorkoutData(dayPlan);
    setCurrentView('workout');
  };

  const NavItem = ({ icon, label, view }) => (
    <button onClick={() => setCurrentView(view)} className={`flex flex-col items-center justify-center w-full py-3 ${currentView === view ? 'text-orange-500' : 'text-gray-400'}`}>
      {icon}
      <span className="text-[10px] font-bold uppercase mt-1">{label}</span>
    </button>
  );

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="h-screen w-full bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col md:flex-row overflow-hidden font-sans">

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 p-6 z-20 shadow-sm">
          <div className="flex items-center space-x-2 mb-10">
            <Activity className="text-orange-500 w-8 h-8" />
            <span className="text-2xl font-black tracking-tighter">FITPLANER</span>
          </div>
          <nav className="space-y-2">
            <SidebarItem icon={<Home />} label="Dashboard" view="dashboard" currentView={currentView} setView={setCurrentView} />
            <SidebarItem icon={<Calendar />} label="Mein Plan" view="custom" currentView={currentView} setView={setCurrentView} />
            <SidebarItem icon={<Dumbbell />} label="Übungen" view="prebuilt" currentView={currentView} setView={setCurrentView} />
          </nav>
          <div className="mt-auto pt-6 border-t border-gray-100 dark:border-slate-800">
            <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="flex items-center space-x-3 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              <span className="font-bold text-sm">{theme === 'dark' ? 'Heller Modus' : 'Dunkler Modus'}</span>
            </button>
          </div>
        </aside>

        {/* Mobile Header */}
        {currentView !== 'workout' && (
          <header className="md:hidden p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800 flex justify-between items-center sticky top-0 z-20">
            <div className="flex items-center space-x-2">
              <Activity className="text-orange-500 w-6 h-6" />
              <span className="font-black text-lg">FITPLANER</span>
            </div>
            <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full bg-gray-100 dark:bg-slate-800">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </header>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-10 pb-24 relative z-10 scroll-smooth">
          <div className="max-w-3xl mx-auto h-full">
            {currentView === 'dashboard' && <DashboardView onStart={startWorkout} plan={customPlan} />}
            {currentView === 'custom' && <CustomPlannerView plan={customPlan} setPlan={setCustomPlan} />}
            {currentView === 'prebuilt' && (
              <div className="text-center py-20 text-gray-500">
                <Dumbbell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-black mb-2">Übungs-Bibliothek</h2>
                <p>Wird in Kürze hinzugefügt.</p>
              </div>
            )}
            {currentView === 'workout' && <ActiveWorkoutEngine workoutData={activeWorkoutData} onFinish={() => setCurrentView('dashboard')} />}
          </div>
        </main>

        {/* Mobile Nav */}
        {currentView !== 'workout' && (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 flex justify-around pb-safe pt-2 z-30">
            <NavItem icon={<Home size={22} />} label="Home" view="dashboard" />
            <NavItem icon={<Calendar size={22} />} label="Planer" view="custom" />
            <NavItem icon={<Settings size={22} />} label="Profil" view="prebuilt" />
          </nav>
        )}
      </div>
    </div>
  );
}