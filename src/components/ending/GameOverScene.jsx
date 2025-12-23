import React from 'react';
import styles from './GameOverScene.module.css';

const GameOverScene = ({ state }) => {
    const { labName, labSuffix, labRank, flags } = state;
    const { fraudCount, gameOverReason, isGameOver } = flags;

    // --- Title Generation Logic ---
    let fraudPrefix = '';
    if (fraudCount >= 10) fraudPrefix = '虚構の';
    else if (fraudCount >= 4) fraudPrefix = '虚飾の';
    else if (fraudCount >= 1) fraudPrefix = '不正の';

    const rankPrefixes = {
        S: '伝説的な',
        A: '名門の',
        B: '新進気鋭の',
        C: '発展途上の',
        D: '未熟な',
        F: '未成熟な',
    };
    const rankPrefix = rankPrefixes[labRank] || '謎の';

    // If Game Over, maybe title is different? 
    // Spec says Title is for "Clear". But let's apply it generally or use a simplified one for Game Over.
    // "Clear" means 10 years passed. Game Over means arrested/bankrupt.
    // If Game Over, logic might be "志半ばで潰えた [LabName]"

    const fullTitle = `${fraudPrefix}${rankPrefix} ${labName}${labSuffix}`;

    // --- Visual & Text Logic ---
    let visualType = 'clean'; // clean, dark, white, torn
    let shareText = '';
    let message = '';

    if (isGameOver) {
        visualType = 'torn';
        shareText = `研究室が閉鎖されました……。私の経営した【${labName}${labSuffix}】は、志半ばで潰えました。次はもっとうまく……。 #LabArchitect`;
        message = gameOverReason === 'ARREST_INTERNAL' ? '内部告発により逮捕' :
            gameOverReason === 'ARREST_AUDIT' ? '外部査察により発覚' :
                '資金枯渇により破産';
    } else {
        // Game Clear (10 Years)
        if (fraudCount === 0) {
            visualType = 'clean';
            shareText = `10年の任期を完遂しました！私の経営した【${labName}${labSuffix}】は《${fullTitle}》として歴史に刻まれます。最高の10年間でした！ #LabArchitect`;
            message = '任期満了：素晴らしい成果でした！';
        } else if (fraudCount >= 10) {
            visualType = 'white';
            shareText = `……私は、なんてことを。私の経営した【${labName}${labSuffix}】は《${fullTitle}》になりました。……これが、私の望んだ真理だったのでしょうか。 #LabArchitect`;
            message = '任期満了：……何も残らなかった。';
        } else {
            visualType = 'dark'; // Fraud 1-9
            shareText = `……私は、なんてことを。私の経営した【${labName}${labSuffix}】は《${fullTitle}》になりました。……これが、私の望んだ真理だったのでしょうか。 #LabArchitect`;
            message = '任期満了：代償は大きかった。';
        }
    }

    const handleShare = () => {
        const url = "https://example.com/lab_architect"; // Placeholder URL
        const text = shareText + "\n" + url;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(twitterUrl, '_blank');
    };

    return (
        <div className={`${styles.container} ${styles[visualType]}`}>
            <div className={styles.paper}>
                <h1 className={styles.title}>{isGameOver ? 'GAME OVER' : 'Congratulations'}</h1>

                <div className={styles.resultTitle}>
                    {isGameOver ? labName + labSuffix : fullTitle}
                </div>

                <p className={styles.message}>{message}</p>

                {/* Yosegaki Visuals */}
                <div className={styles.yosegakiArea}>
                    {visualType === 'clean' && (
                        <>
                            <span className={styles.note1}>先生ありがとう！</span>
                            <span className={styles.note2}>最高でした！</span>
                            <span className={styles.note3}>博士とれました</span>
                            <span className={styles.note4}>飲み会またやりましょ！</span>
                        </>
                    )}
                    {visualType === 'dark' && (
                        <>
                            <span className={styles.noteDark1}>疲れた...</span>
                            <span className={styles.noteDark2}>データ大丈夫かな</span>
                        </>
                    )}
                    {visualType === 'white' && (
                        <div className={styles.whiteText}>{labName}{labSuffix} 一同</div>
                    )}
                    {visualType === 'torn' && (
                        <div className={styles.tornText}>（破かれたメモが散乱している...）</div>
                    )}
                </div>

                <button className={styles.shareButton} onClick={handleShare}>
                    𝕏 で共有する
                </button>

                {/* Debug: Restart Button (since we don't have full flow) */}
                <button
                    className={styles.restartButton}
                    onClick={() => window.location.reload()}
                >
                    タイトルへ戻る
                </button>
            </div>
        </div>
    );
};

export default GameOverScene;
