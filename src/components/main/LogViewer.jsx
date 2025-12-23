import React, { useEffect, useRef } from 'react';

const LogViewer = ({ logs }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div style={{
            width: '100%',
            height: '150px',
            background: 'rgba(0,0,0,0.8)',
            borderTop: '2px solid #555',
            overflowY: 'auto',
            padding: '10px',
            textAlign: 'left',
            fontSize: '0.9rem',
            fontFamily: 'monospace',
            // Flex item, no absolute positioning
            flexShrink: 0,
        }}>
            {logs.length === 0 && <div style={{ color: '#666' }}>ログなし</div>}
            {logs.map((log, index) => (
                <div key={index} style={{ marginBottom: '4px', borderBottom: '1px solid #333' }}>
                    <span style={{ color: '#fec107', marginRight: '8px' }}>[System]</span>
                    {log}
                </div>
            ))}
            <div ref={bottomRef} />
        </div>
    );
};

export default LogViewer;
