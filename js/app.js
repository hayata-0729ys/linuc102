// グローバル変数
let questions = [];
let currentQuestionIndex = 0;
let currentMode = null; // 'study' or 'exam'
let userAnswers = {};
let examTimer = null;
let examTimeLeft = 0;
const EXAM_TIME_LIMIT = 30 * 60; // 30分（秒）

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
    initializeStats();
});

// 問題データを読み込む
async function loadQuestions() {
    try {
        const response = await fetch('data/questions.json');
        questions = await response.json();
    } catch (error) {
        console.error('問題データの読み込みに失敗しました:', error);
        alert('問題データの読み込みに失敗しました。ページを再読み込みしてください。');
    }
}

// 成績データの初期化
function initializeStats() {
    if (!localStorage.getItem('linuc102_stats')) {
        localStorage.setItem('linuc102_stats', JSON.stringify({
            totalAttempts: 0,
            correctAnswers: 0,
            averageScore: 0,
            lastScores: []
        }));
    }
}

// ====== スクリーン遷移 ======

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function backToMenu() {
    showScreen('menuScreen');
    if (examTimer) {
        clearInterval(examTimer);
        examTimer = null;
    }
    currentQuestionIndex = 0;
    userAnswers = {};
}

// ====== 学習モード ======

function startStudyMode() {
    if (questions.length === 0) {
        alert('問題データが読み込まれていません。ページを再読み込みしてください。');
        return;
    }
    currentMode = 'study';
    currentQuestionIndex = 0;
    userAnswers = {};
    showScreen('studyScreen');
    displayQuestion('study');
}

function nextQuestion(mode) {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion(mode);
    }
}

function prevQuestion(mode) {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion(mode);
    }
}

function displayQuestion(mode) {
    const question = questions[currentQuestionIndex];
    const modePrefix = mode === 'study' ? 'study' : 'exam';

    // 問題番号と進捗
    document.getElementById(`${modePrefix}QuestionNum`).textContent = 
        `${currentQuestionIndex + 1}/${questions.length}`;
    
    // 進捗バー
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    document.getElementById(`${modePrefix}ProgressFill`).style.width = progress + '%';

    // 問題文
    document.getElementById(`${modePrefix}Question`).textContent = question.question;

    // 選択肢
    const optionsContainer = document.getElementById(`${modePrefix}Options`);
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.textContent = option;

        // 学習モードでは前の答えを記憶
        if (mode === 'study' && userAnswers[currentQuestionIndex] !== undefined) {
            if (index === userAnswers[currentQuestionIndex]) {
                optionDiv.classList.add('selected');
            }
            if (index === question.correctAnswer) {
                optionDiv.classList.add('correct');
            }
        }

        // 模擬試験では選択状態を記憶
        if (mode === 'exam' && userAnswers[currentQuestionIndex] !== undefined) {
            if (index === userAnswers[currentQuestionIndex]) {
                optionDiv.classList.add('selected');
            }
        }

        optionDiv.addEventListener('click', () => {
            selectAnswer(mode, index);
        });

        optionsContainer.appendChild(optionDiv);
    });

    // 説明文の表示（学習モードのみ）
    if (mode === 'study') {
        const explanationDiv = document.createElement('div');
        explanationDiv.style.marginTop = '1.5rem';
        explanationDiv.style.padding = '1rem';
        explanationDiv.style.background = '#f0f9ff';
        explanationDiv.style.borderLeft = '4px solid #0ea5e9';
        explanationDiv.style.borderRadius = '4px';
        
        const correctAnswer = questions[currentQuestionIndex].options[questions[currentQuestionIndex].correctAnswer];
        explanationDiv.innerHTML = `
            <strong>正解: ${correctAnswer}</strong><br>
            <p style="margin-top: 0.5rem; color: #1f2937;">${question.explanation}</p>
        `;
        
        optionsContainer.parentElement.appendChild(explanationDiv);
    }
}

function selectAnswer(mode, optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;

    // UIに反映
    const optionDivs = document.querySelectorAll(`#${mode}Options .option`);
    optionDivs.forEach((div, index) => {
        div.classList.remove('selected');
        if (index === optionIndex) {
            div.classList.add('selected');
        }
    });
}

// ====== 模擬試験モード ======

function startExamMode() {
    if (questions.length === 0) {
        alert('問題データが読み込まれていません。ページを再読み込みしてください。');
        return;
    }
    currentMode = 'exam';
    currentQuestionIndex = 0;
    userAnswers = {};
    examTimeLeft = EXAM_TIME_LIMIT;
    showScreen('examScreen');
    displayQuestion('exam');
    startExamTimer();
}

function startExamTimer() {
    updateTimerDisplay();
    examTimer = setInterval(() => {
        examTimeLeft--;
        updateTimerDisplay();

        if (examTimeLeft <= 0) {
            clearInterval(examTimer);
            submitExam();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(examTimeLeft / 60);
    const seconds = examTimeLeft % 60;
    const timerElement = document.getElementById('timeLeft');
    timerElement.textContent = String(minutes).padStart(2, '0');

    // 残り時間が少ない場合は警告
    if (examTimeLeft < 300) { // 5分以下
        document.getElementById('examTimer').classList.add('warning');
    } else {
        document.getElementById('examTimer').classList.remove('warning');
    }
}

function submitExam() {
    if (examTimer) {
        clearInterval(examTimer);
        examTimer = null;
    }

    // 成績計算
    let correctCount = 0;
    questions.forEach((question, index) => {
        if (userAnswers[index] === question.correctAnswer) {
            correctCount++;
        }
    });

    const percentage = Math.round((correctCount / questions.length) * 100);

    // 成績を保存
    saveExamScore(percentage, correctCount);

    // 結果表示
    showResult(correctCount, percentage);
}

// ====== 成績管理 ======

function saveExamScore(percentage, correctCount) {
    const stats = JSON.parse(localStorage.getItem('linuc102_stats'));
    stats.totalAttempts++;
    stats.correctAnswers += correctCount;
    stats.averageScore = Math.round((stats.correctAnswers / (stats.totalAttempts * questions.length)) * 100);
    stats.lastScores.push({
        date: new Date().toLocaleDateString('ja-JP'),
        percentage: percentage,
        correct: correctCount,
        total: questions.length
    });

    // 最新10件の記録を保持
    if (stats.lastScores.length > 10) {
        stats.lastScores = stats.lastScores.slice(-10);
    }

    localStorage.setItem('linuc102_stats', JSON.stringify(stats));
}

function showResult(correctCount, percentage) {
    showScreen('resultScreen');

    const resultTitle = document.getElementById('resultTitle');
    if (percentage >= 80) {
        resultTitle.textContent = '🎉 合格!';
        resultTitle.style.color = '#10b981';
    } else if (percentage >= 60) {
        resultTitle.textContent = '👍 もう少し';
        resultTitle.style.color = '#f59e0b';
    } else {
        resultTitle.textContent = '📖 もっと勉強しましょう';
        resultTitle.style.color = '#ef4444';
    }

    document.getElementById('scorePercentage').textContent = `${percentage}%`;
    document.getElementById('scoreText').textContent = `${correctCount}/${questions.length}`;

    // 詳細結果
    const resultDetails = document.getElementById('resultDetails');
    resultDetails.innerHTML = '<h3>間違えた問題:</h3>';

    let incorrectQuestions = [];
    questions.forEach((question, index) => {
        if (userAnswers[index] !== question.correctAnswer) {
            incorrectQuestions.push({
                number: index + 1,
                question: question.question,
                yourAnswer: question.options[userAnswers[index]] || '未回答',
                correctAnswer: question.options[question.correctAnswer]
            });
        }
    });

    if (incorrectQuestions.length === 0) {
        resultDetails.innerHTML += '<p>完璧です!すべて正解しました!</p>';
    } else {
        incorrectQuestions.forEach(item => {
            resultDetails.innerHTML += `
                <div style="background: #fef2f2; padding: 1rem; margin: 1rem 0; border-radius: 8px; border-left: 4px solid #ef4444;">
                    <strong>問題${item.number}: ${item.question}</strong><br>
                    <span style="color: #ef4444;">あなたの回答: ${item.yourAnswer}</span><br>
                    <span style="color: #10b981;">正解: ${item.correctAnswer}</span>
                </div>
            `;
        });
    }
}

function showStats() {
    showScreen('statsScreen');

    const stats = JSON.parse(localStorage.getItem('linuc102_stats'));
    const statsContent = document.getElementById('statsContent');

    if (stats.totalAttempts === 0) {
        statsContent.innerHTML = '<p>まだ試験を受けていません。</p>';
        return;
    }

    let html = `
        <div class="stat-item">
            <span class="stat-label">試験回数</span>
            <span class="stat-value">${stats.totalAttempts}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">平均正答率</span>
            <span class="stat-value">${stats.averageScore}%</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">正解数</span>
            <span class="stat-value">${stats.correctAnswers}</span>
        </div>
    `;

    if (stats.lastScores.length > 0) {
        html += '<h3 style="margin-top: 1.5rem; margin-bottom: 1rem;">最近の試験結果:</h3>';
        stats.lastScores.slice().reverse().forEach((score, index) => {
            html += `
                <div class="stat-item">
                    <span class="stat-label">${score.date}</span>
                    <span class="stat-value">${score.percentage}% (${score.correct}/${score.total})</span>
                </div>
            `;
        });
    }

    statsContent.innerHTML = html;
}
