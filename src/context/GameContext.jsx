import React, { createContext, useContext, useReducer } from 'react';

const GameContext = createContext();

// 初期ステート
const initialState = {
  phase: 'INTRO', // INTRO, NAMING, MAIN_GAME
  subPhase: 'COMMAND', // COMMAND, ACTION, DECISION, YEARLY (only in April)
  year: 1,
  month: 4,
  labName: '',
  labSuffix: '研究室',
  resources: {
    en: 5000,
    dataPt: 0,
    specialPt: 0,
  },
  settings: {
    soundVolume: 0.5,
  },
  flags: {
    isStartupPeriod: true,
    tutorialStep: 0,
    fraudCount: 0, // 不正回数 (Misconduct Counter)
    isGameOver: false,
    gameOverReason: null, // 'BANKRUPTCY', 'ARREST', 'EMPTY'
  },
  labRank: 'F',
  logs: [],
  students: [],
  actionQueue: [],
};

// ユニット設定 (Config)
const UNIT_CONFIG = {
  B4: { ap: 3, successRate: 0.8 },
  M1: { ap: 4, successRate: 0.9 },
  M2: { ap: 5, successRate: 0.95 },
  D: { ap: 8, successRate: 1.0 }, // Ph.D candidates
  PhD: { ap: 10, successRate: 1.2, costRate: 0.05 }, // Higher success rate (bonus)
};

// アクションタイプ
const ACTIONS = {
  SET_PHASE: 'SET_PHASE',
  SET_SUB_PHASE: 'SET_SUB_PHASE',
  SET_LAB_NAME: 'SET_LAB_NAME',
  NEXT_MONTH: 'NEXT_MONTH',
  UPDATE_RESOURCES: 'UPDATE_RESOURCES',
  ADD_LOG: 'ADD_LOG',
  ADD_STUDENT: 'ADD_STUDENT',
  SET_ACTION_QUEUE: 'SET_ACTION_QUEUE',
  COMMIT_FRAUD: 'COMMIT_FRAUD',
  GAME_OVER: 'GAME_OVER',
};

// Reducer
function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_PHASE:
      return { ...state, phase: action.payload };
    case ACTIONS.SET_SUB_PHASE:
      return { ...state, subPhase: action.payload };
    case ACTIONS.SET_LAB_NAME:
      return {
        ...state,
        labName: action.payload.name,
        labSuffix: action.payload.suffix
      };
    case ACTIONS.NEXT_MONTH:
      let nextMonth = state.month + 1;
      let nextYear = state.year;
      if (nextMonth > 12) nextMonth = 1;

      let isNewYear = false;
      let newResources = { ...state.resources };
      let newLogs = [...state.logs];
      let newStudents = [...state.students];

      // --- 倫理リスク判定 (Whistleblower & Audit) ---
      let gameOverEvent = null;

      // 1. 内部告発 (毎月)
      // 不正10回以上は「もみ消し」により内部告発リスク0%
      let whistleProb = Math.max(0, 5 + state.flags.fraudCount);
      if (state.flags.fraudCount >= 10) whistleProb = 0;
      else if (state.flags.fraudCount === 0) whistleProb = 0;

      // 内部告発判定
      if (Math.random() * 100 < whistleProb) {
        gameOverEvent = 'ARREST_INTERNAL';
        newLogs.push('【緊急】内部告発が発生しました！不正の証拠が学内に流出しています...');
      }

      // 年度更新 (3月 -> 4月)
      if (nextMonth === 4 && state.month === 3) {
        nextYear = state.year + 1;
        isNewYear = true;

        // --- 2. 外部査察 (年度更新時) ---
        // 上限 20%
        let auditProb = Math.min(20, 10 + state.flags.fraudCount);
        if (state.flags.fraudCount === 0) auditProb = 0;

        if (gameOverEvent === null && Math.random() * 100 < auditProb) {
          gameOverEvent = 'ARREST_AUDIT';
          newLogs.push('【緊急】文科省の抜き打ち査察が入りました！データの不整合を指摘されています...');
        }

        // 1. 予算の獲得 (簡易ロジック: 基本5000 + ランクボーナス)
        // TODO: スコアに基づく計算
        let annualBudget = 5000;
        if (state.labRank === 'S') annualBudget = 10000;
        else if (state.labRank === 'A') annualBudget = 8000;

        newLogs.push(`【年度更新】${nextYear}年度が始まりました。予算 ${annualBudget} 圓が支給されます。`);

        // 2. Ph.D 維持費の控除
        const phdCount = state.students.filter(s => s.rank === 'D' || s.rank === 'PhD').length;
        if (phdCount > 0) {
          const cost = Math.floor(annualBudget * UNIT_CONFIG.PhD.costRate * phdCount);
          annualBudget -= cost;
          newLogs.push(`Ph.D 維持費として ${cost} 圓が控除されました。`);
        }

        newResources.en += annualBudget;

        // 3. Sランク研究室の外部流入 (50%)
        if (state.labRank === 'S') {
          if (Math.random() > 0.5) {
            const isDoc = Math.random() > 0.5;
            const newRank = isDoc ? 'D' : 'M1';
            const newId = Date.now(); // Simple ID
            newStudents.push({
              id: newId,
              name: `外部生 ${newRank}`,
              rank: newRank,
              x: 50, y: 50 // Init pos
            });
            newLogs.push(`【朗報】Sランクの評判を聞きつけ、優秀な${newRank}学生が配属されました！`);
          }
        }
      }

      // ゲームオーバー判定があれば遷移
      if (gameOverEvent) {
        return {
          ...state,
          phase: 'GAME_OVER',
          flags: { ...state.flags, isGameOver: true, gameOverReason: gameOverEvent },
          logs: newLogs
        };
      }

      return {
        ...state,
        month: nextMonth,
        year: nextYear,
        resources: newResources,
        students: newStudents,
        logs: newLogs,
        subPhase: 'COMMAND',
      };
    case ACTIONS.UPDATE_RESOURCES:
      return {
        ...state,
        resources: { ...state.resources, ...action.payload }
      };
    case ACTIONS.ADD_LOG:
      return {
        ...state,
        logs: [...state.logs, action.payload]
      };
    case ACTIONS.ADD_STUDENT:
      return {
        ...state,
        students: [...state.students, action.payload]
      };
    case ACTIONS.SET_ACTION_QUEUE:
      return {
        ...state,
        actionQueue: action.payload
      };
    case ACTIONS.COMMIT_FRAUD:
      // 不正実行：Experiment Failure -> Fake Data (20pt)
      // 隠蔽工作: ログは婉曲的に表現
      const euphemisms = [
        '外れ値を除外し、データの整合性を高めました。',
        'パラメータを最適化し、理論値に近づけました。',
        'ノイズを除去し、傾向を明確にしました。',
        '解釈を見直し、期待される結果を導出しました。'
      ];
      const randomMsg = euphemisms[Math.floor(Math.random() * euphemisms.length)];

      return {
        ...state,
        resources: { ...state.resources, dataPt: state.resources.dataPt + 20 },
        flags: { ...state.flags, fraudCount: state.flags.fraudCount + 1 },
        logs: [...state.logs, `【データ補正】${randomMsg}(Data +20pt)`]
      };
    case ACTIONS.GAME_OVER:
      return {
        ...state,
        phase: 'GAME_OVER',
        flags: { ...state.flags, isGameOver: true, gameOverReason: action.payload }
      };
    default:
      return state;
  }
}

// Provider Component
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const value = {
    state,
    dispatch,
    actions: {
      setPhase: (phase) => dispatch({ type: ACTIONS.SET_PHASE, payload: phase }),
      setSubPhase: (subPhase) => dispatch({ type: ACTIONS.SET_SUB_PHASE, payload: subPhase }),
      setLabName: (name, suffix) => dispatch({ type: ACTIONS.SET_LAB_NAME, payload: { name, suffix } }),
      nextMonth: () => dispatch({ type: ACTIONS.NEXT_MONTH }),
      updateResources: (resources) => dispatch({ type: ACTIONS.UPDATE_RESOURCES, payload: resources }),
      addLog: (text) => dispatch({ type: ACTIONS.ADD_LOG, payload: text }),
      addStudent: (student) => dispatch({ type: ACTIONS.ADD_STUDENT, payload: student }),
      setActionQueue: (queue) => dispatch({ type: ACTIONS.SET_ACTION_QUEUE, payload: queue }),
      commitFraud: () => dispatch({ type: ACTIONS.COMMIT_FRAUD }),
      setGameOver: (reason) => dispatch({ type: ACTIONS.GAME_OVER, payload: reason }),
    }
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

// Custom Hook
export function useGame() {
  return useContext(GameContext);
}
