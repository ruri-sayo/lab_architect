import React, { useEffect, useState, useRef } from 'react';
import styles from './LabScene.module.css';
import { useGame } from '../../context/GameContext';

// Dummy student images
const STUDENT_IMAGES = {
    B4: 'https://placehold.co/64x64/png?text=B4', // Placeholder
    M1: 'https://placehold.co/64x64/png?text=M1',
    M2: 'https://placehold.co/64x64/png?text=M2',
    D: 'https://placehold.co/64x64/png?text=Dr',
};

const LabScene = ({ students = [], actionEvents = [], onActionComplete }) => {
    const [currentEvent, setCurrentEvent] = useState(null);
    const [activeStudents, setActiveStudents] = useState([]);
    const eventQueueRef = useRef([...actionEvents]);
    const processingRef = useRef(false);

    // Initial load
    useEffect(() => {
        // If no events, just show students idling (random walk or static)
        // For now, static placement
        if (students.length > 0) {
            setActiveStudents(students.map((s, i) => ({
                ...s,
                x: 20 + (i * 10) % 60, // Dummy position
                y: 30 + Math.floor(i / 6) * 20,
                isActing: false,
            })));
        }
    }, [students]);

    // Sync ref with props
    useEffect(() => {
        if (actionEvents.length > 0) {
            eventQueueRef.current = [...actionEvents];
        }
    }, [actionEvents]);

    // Event Processor
    useEffect(() => {
        // If we have events and not processing, start.
        // We check actionEvents.length in dependency to restart.
        if (processingRef.current || actionEvents.length === 0) return;

        const processNextEvent = () => {
            if (eventQueueRef.current.length === 0) {
                if (onActionComplete) onActionComplete();
                return;
            }

            processingRef.current = true;
            const event = eventQueueRef.current.shift();
            setCurrentEvent(event);

            // Animation duration (e.g., 2 seconds per event)
            setTimeout(() => {
                setCurrentEvent(null);
                processingRef.current = false;
                processNextEvent();
            }, 2000);
        };

        processNextEvent();
    }, [actionEvents, onActionComplete]);


    return (
        <div className={styles.labContainer}>
            <div className={styles.labBackground}>
                {/* Room Layout - Desks, Equipment */}
                <div className={styles.deskRow} style={{ top: '30%' }}></div>
                <div className={styles.deskRow} style={{ top: '60%' }}></div>
            </div>

            {/* Students */}
            {activeStudents.map((student) => {
                const isFocus = currentEvent && currentEvent.studentId === student.id;
                return (
                    <div
                        key={student.id}
                        className={`${styles.student} ${isFocus ? styles.studentFocus : ''}`}
                        style={{
                            left: `${student.x}%`,
                            top: `${student.y}%`,
                            transition: 'all 0.5s ease'
                        }}
                    >
                        <img
                            src={STUDENT_IMAGES[student.rank] || STUDENT_IMAGES.B4}
                            alt={student.name}
                            className={styles.studentSprite}
                        />
                        {isFocus && (
                            <div className={styles.speechBubble}>
                                {currentEvent.type === 'SUCCESS' && <span style={{ color: 'green' }}>成功!</span>}
                                {currentEvent.type === 'FAIL' && <span style={{ color: 'red' }}>失敗...</span>}
                                {currentEvent.type === 'BREAK' && <span style={{ color: 'purple' }}>破損!</span>}
                                <div className={styles.bubbleText}>{currentEvent.message}</div>
                            </div>
                        )}
                        <div className={styles.studentNameLabel}>{student.name}</div>
                    </div>
                );
            })}

            {/* Foreground UI - Skip Button */}
            {eventQueueRef.current.length > 0 && (
                <button
                    className={styles.skipButton}
                    onClick={() => {
                        // Clear queue and finish immediately
                        eventQueueRef.current = [];
                        setCurrentEvent(null);
                        if (onActionComplete) onActionComplete();
                    }}
                >
                    SKIP
                </button>
            )}
        </div>
    );
};

export default LabScene;
