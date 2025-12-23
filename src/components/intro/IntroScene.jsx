import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { INTRO_DIALOGUES, LAB_SUFFIXES } from '../../data/dialogues';
import styles from './IntroScene.module.css';

const IntroScene = ({ namingMode = false }) => {
    const { actions, state } = useGame();
    const [step, setStep] = useState(0);
    const [inputName, setInputName] = useState('');
    const [inputSuffix, setInputSuffix] = useState(LAB_SUFFIXES[0]);

    // Adjust step based on external namingMode prop if we re-render or switch logic
    // But actually, we just follow the dialogue script.

    const currentLine = INTRO_DIALOGUES[step];

    const handleNext = () => {
        // If we are in naming mode, clicking shouldn't advance unless logic permits, but here logic is separate.
        if (state.phase === 'NAMING') return;

        if (step < INTRO_DIALOGUES.length - 1) {
            const nextStep = step + 1;
            setStep(nextStep);
            if (INTRO_DIALOGUES[nextStep].type === 'NAMING_PROMPT') {
                actions.setPhase('NAMING');
            }
        }
    };

    const handleSubmitName = () => {
        if (!inputName.trim()) return;
        actions.setLabName(inputName, inputSuffix);
        // Move to next phase logic
        // For now, let's just assume we go to MAIN_GAME
        actions.setPhase('MAIN_GAME');
    };

    return (
        <div className={styles.screen}>
            <div className={styles.background}>
                {/* Placeholder for Lab Background */}
            </div>

            <div className={styles.characterContainer}>
                {/* Placeholder for Shiori Character Art */}
                <div className={styles.characterPlaceholder}>
                    <span role="img" aria-label="shiori">👩‍🔬</span>
                    <p>佐伯 栞里</p>
                </div>
            </div>

            <div className={styles.dialogueBox} onClick={state.phase === 'INTRO' ? handleNext : undefined}>
                <div className={styles.speakerName}>{currentLine.speaker}</div>
                <div className={styles.messageText}>
                    {currentLine.text.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                            {line}
                            <br />
                        </React.Fragment>
                    ))}
                </div>
                {state.phase === 'INTRO' && (
                    <div className={styles.nextIndicator}>▼</div>
                )}
            </div>

            {state.phase === 'NAMING' && (
                <div className={styles.namingModal}>
                    <div className={styles.namingContent}>
                        <h3>研究室開設届</h3>
                        <p>【 研究室名 】</p>
                        <div className={styles.inputRow}>
                            <input
                                type="text"
                                className={styles.textInput}
                                placeholder="名称を入力"
                                value={inputName}
                                onChange={(e) => setInputName(e.target.value)}
                                maxLength={10}
                            />
                            <select
                                className={styles.selectInput}
                                value={inputSuffix}
                                onChange={(e) => setInputSuffix(e.target.value)}
                            >
                                {LAB_SUFFIXES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className={styles.preview}>
                            正式名称：{inputName ? inputName : '〇〇'}{inputSuffix}
                        </div>
                        <button
                            className={styles.submitButton}
                            onClick={handleSubmitName}
                            disabled={!inputName.trim()}
                        >
                            これで提出する
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntroScene;
