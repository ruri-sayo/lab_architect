import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import LabScene from './LabScene';
import LogViewer from './LogViewer';

const MainGame = () => {
    const { state, actions } = useGame();

    const initialized = useRef(false);

    // Mock Data for Demo
    useEffect(() => {
        // Only add if empty and not initialized
        if (!initialized.current && state.students.length === 0) {
            initialized.current = true;
            actions.addStudent({ id: 1, name: '佐藤 B4', rank: 'B4' });
            actions.addStudent({ id: 2, name: '鈴木 M1', rank: 'M1' });
            actions.addStudent({ id: 3, name: '田中 M2', rank: 'M2' });
            actions.addStudent({ id: 4, name: '高橋 Dr', rank: 'D' });
        }
    }, []);

    const handleStartCommand = () => {
        // Transition to ACTION phase
        actions.setSubPhase('ACTION');

        // Generate Mock Action Queue
        const mockQueue = [
            { type: 'SUCCESS', studentId: 1, message: '装置の使い方が分かりました！' },
            { type: 'FAIL', studentId: 2, message: 'データがおかしいです...' },
            { type: 'BREAK', studentId: 3, message: 'すいません！遠心機が！' },
            { type: 'SUCCESS', studentId: 4, message: '完璧なデータだ。' },
        ];
        actions.setActionQueue(mockQueue);
    };

    const handleActionComplete = () => {
        // Transition to DECISION / NEXT MONTH
        actions.setSubPhase('DECISION');
        // For demo, just go to next month after a pause
        setTimeout(() => {
            actions.nextMonth(); // This resets to COMMAND
        }, 1000);
    };

    return (
        <div style={{
            color: '#f0f0f0',
            textAlign: 'center',
            background: '#222',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            // position: 'relative' // Removed
        }}>
            {/* Header Info */}
            <div style={{ padding: '20px', borderBottom: '1px solid #555' }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
                    {state.labName}{state.labSuffix}
                    <span style={{ fontSize: '1rem', marginLeft: '20px', color: '#aaa' }}>
                        (Rank: {state.labRank})
                    </span>
                </h1>
                <div style={{ marginTop: '10px' }}>
                    {state.year}年目 {state.month}月 | 資金: {state.resources.en.toLocaleString()} 圓 | Data: {state.resources.dataPt}
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, position: 'relative', overflowY: 'auto' }}>

                {/* Lab View Animation */}
                <LabScene
                    students={state.students}
                    actionEvents={state.subPhase === 'ACTION' ? state.actionQueue : []}
                    onActionComplete={handleActionComplete}
                />

                {/* Command Interface (Only in COMMAND phase) */}
                {state.subPhase === 'COMMAND' && (
                    <div style={{ padding: '20px' }}>
                        <h2>指令フェーズ</h2>
                        <p>学生に指示を出してください</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                onClick={handleStartCommand}
                                style={{
                                    padding: '10px 30px', background: '#fec107', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#333', fontWeight: 'bold'
                                }}
                            >
                                活動開始 (ターン終了)
                            </button>

                            <button
                                onClick={() => actions.commitFraud()}
                                style={{
                                    padding: '10px 30px', background: '#eee', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', color: '#333', fontWeight: 'bold'
                                }}
                            >
                                データ補正 (調整)
                            </button>
                        </div>
                    </div>
                )}

                {/* Decision/Yearly Interface placeholders */}
                {state.subPhase === 'DECISION' && (
                    <div style={{ padding: '20px', color: '#fec107' }}>
                        <h2>決裁中...</h2>
                    </div>
                )}

            </div>

            {/* Log Viewer */}
            <LogViewer logs={state.logs} />
        </div>
    );
};
export default MainGame;
