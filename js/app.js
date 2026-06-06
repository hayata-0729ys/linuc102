// グローバル変数
let questions = [];
let allQuestions = []; // 全問題を保持
let currentQuestionIndex = 0;
let currentMode = null; // 'study' or 'exam'
let userAnswers = {};
let examTimer = null;
let examTimeLeft = 0;
let selectedCategory = null; // 選択された分野
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
        allQuestions = await response.json();
        questions = allQuestions;
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

// ====== カテゴリー管理 ======

function getCategories() {
    // 全問題からカテゴリーを抽出
    const categories = {};
    allQuestions.forEach(q => {
        const cat = q.category || '全体';
        if (!categories[cat]) {
            categories[cat] = 0;
        }
        categories[cat]++;
    });
    return categories;
}

function filterQuestionsByCategory(category) {
    if (category === '全体' || category === null) {
        return allQuestions;
    }
    return allQuestions.filter(q => (q.category || '全体') === category);
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
    selectedCategory = null;
}

// ====== 学習モード ======

function startStudyMode() {
    if (allQuestions.length === 0) {
        alert('問題データが読み込まれていません。ページを再読み込みしてください。');
        return;
    }
    
    // カテゴリー選択画面を表示
    const categories = getCategories();
    showScreen('categoryScreen');
    displayCategories(categories, 'study');
}

function startExamMode() {
    if (allQuestions.length === 0) {
        alert('問題データが読み込まれていません。ページを再読み込みしてください。');
        return;
    }
    
    // カテゴリー選択画面を表示
    const categories = getCategories();
    showScreen('categoryScreen');
    displayCategories(categories, 'exam');
}

function displayCategories(categories, mode) {
    const categoryContent = document.getElementById('categoryContent');
    categoryContent.innerHTML = '';
    
    const title = document.createElement('h2');
    title.textContent = mode === 'study' ? '学習する分野を選択' : '試験の分野を選択';
    categoryContent.appendChild(title);
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'category-buttons';
    
    // 全体ボタン
    const allBtn = document.createElement('button');
    allBtn.className = 'btn btn-category';
    allBtn.textContent = `📚 全体 (${Object.values(categories).reduce((a, b) => a + b, 0)}問)`;
    allBtn.onclick = () => startWithCategory('全体', mode);
    buttonContainer.appendChild(allBtn);
    
    // カテゴリーごとのボタン
    Object.entries(categories).forEach(([category, count]) => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-category';
        btn.textContent = `📖 ${category} (${count}問)`;
        btn.onclick = () => startWithCategory(category, mode);
        buttonContainer.appendChild(btn);
    });
    
    categoryContent.appendChild(buttonContainer);
}

function startWithCategory(category, mode) {
    selectedCategory = category;
    questions = filterQuestionsByCategory(category);
    currentQuestionIndex = 0;
    userAnswers = {};
    
    if (mode === 'study') {
        currentMode = 'study';
        showScreen('studyScreen');
        displayQuestion('study');
    } else {
        currentMode = 'exam';
        examTimeLeft = EXAM_TIME_LIMIT;
        showScreen('examScreen');
        displayQuestion('exam');
        startExamTimer();
    }
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
    if (document.getElementById(`${modePrefix}ProgressFill`)) {
        document.getElementById(`${modePrefix}ProgressFill`).style.width = progress + '%';
    }

    // 問題文
    document.getElementById(`${modePrefix}Question`).textContent = question.question;

    // 選択肢
    const optionsContainer = document.getElementById(`${modePrefix}Options`);
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.textContent = option;

        // 前の答えを記憶していれば選択状態を復元
        if (userAnswers[currentQuestionIndex] !== undefined) {
            if (index === userAnswers[currentQuestionIndex]) {
                optionDiv.classList.add('selected');
                // 学習モードでは正解を表示
                if (mode === 'study' && index === question.correctAnswer) {
                    optionDiv.classList.add('correct');
                }
            }
        }

        optionDiv.addEventListener('click', () => {
            selectAnswer(mode, index);
        });

        optionsContainer.appendChild(optionDiv);
    });

    // 説明文の表示（学習モードのみ、選択肢を選んだ場合）
    if (mode === 'study' && userAnswers[currentQuestionIndex] !== undefined) {
        displayExplanation(mode, question);
    }
}

function displayExplanation(mode, question) {
    const optionsContainer = document.getElementById(`${mode}Options`);
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'explanation';
    explanationDiv.style.marginTop = '1.5rem';
    explanationDiv.style.padding = '1rem';
    explanationDiv.style.background = '#f0f9ff';
    explanationDiv.style.borderLeft = '4px solid #0ea5e9';
    explanationDiv.style.borderRadius = '4px';
    
    const correctAnswer = question.options[question.correctAnswer];
    const userAnswer = question.options[userAnswers[currentQuestionIndex]];
    const isCorrect = userAnswers[currentQuestionIndex] === question.correctAnswer;
    
    explanationDiv.innerHTML = `
        <strong style="${isCorrect ? 'color: #10b981;' : 'color: #ef4444;'}">
            ${isCorrect ? '✓ 正解！' : '✗ 不正解'}
        </strong><br>
        <strong>正解: ${correctAnswer}</strong><br>
        ${!isCorrect ? `<span style="color: #ef4444;">あなたの回答: ${userAnswer}</span><br>` : ''}
        <p style="margin-top: 0.5rem; color: #1f2937;">${question.explanation}</p>
    `;
    
    optionsContainer.parentElement.appendChild(explanationDiv);
}

function selectAnswer(mode, optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;

    // UIに反映
    const optionDivs = document.querySelectorAll(`#${mode}Options .option`);
    optionDivs.forEach((div, index) => {
        div.classList.remove('selected', 'correct', 'wrong');
        if (index === optionIndex) {
            div.classList.add('selected');
            // 学習モードで正解/不正解を表示
            if (mode === 'study') {
                const question = questions[currentQuestionIndex];
                if (index === question.correctAnswer) {
                    div.classList.add('correct');
                } else {
                    div.classList.add('wrong');
                }
            }
        }
    });
    
    // 学習モード時に説明を表示
    if (mode === 'study') {
        // 既存の説明を削除
        const optionsContainer = document.getElementById(`${mode}Options`);
        const oldExplanation = optionsContainer.parentElement.querySelector('.explanation');
        if (oldExplanation) {
            oldExplanation.remove();
        }
        
        // 新しい説明を追加
        const question = questions[currentQuestionIndex];
        displayExplanation(mode, question);
    }
}

// ====== 模擬試験モード ======

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
    timerElement.textContent = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');

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
        total: questions.length,
        category: selectedCategory || '全体'
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
                    <span class="stat-label">${score.date}${score.category ? ' (' + score.category + ')' : ''}</span>
                    <span class="stat-value">${score.percentage}% (${score.correct}/${score.total})</span>
                </div>
            `;
        });
    }

    statsContent.innerHTML = html;
}
