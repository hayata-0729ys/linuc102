let answered = 0;
let correct = 0;

let currentQuestion = null;

let remainingQuestions = [];

initialize();

function initialize() {

    loadProgress();

    resetQuestionPool();

    document
        .getElementById("total")
        .textContent = questions.length;

    document
        .getElementById("nextBtn")
        .addEventListener(
            "click",
            nextQuestion
        );

    nextQuestion();
}

function resetQuestionPool() {

    remainingQuestions =
        [...questions];

}

function nextQuestion() {

    if (
        remainingQuestions.length === 0
    ) {

        alert(
            "全問題終了しました。最初から再開します。"
        );

        resetQuestionPool();
    }

    const randomIndex =
        Math.floor(
            Math.random()
            *
            remainingQuestions.length
        );

    currentQuestion =
        remainingQuestions.splice(
            randomIndex,
            1
        )[0];

    renderQuestion();
}

function renderQuestion() {

    const q =
        currentQuestion;

    document
        .getElementById("question")
        .textContent =
        q.question;

    document
        .getElementById("result")
        .innerHTML = "";

    document
        .getElementById("explanation")
        .innerHTML = "";

    const choicesDiv =
        document.getElementById(
            "choices"
        );

    choicesDiv.innerHTML = "";

    q.choices.forEach(
        (
            choice,
            index
        ) => {

            const btn =
                document.createElement(
                    "button"
                );

            btn.className =
                "choice";

            btn.textContent =
                choice;

            btn.onclick =
                () =>
                checkAnswer(
                    index
                );

            choicesDiv.appendChild(
                btn
            );
        }
    );
}

function checkAnswer(
    selected
) {

    const q =
        currentQuestion;

    const buttons =
        document.querySelectorAll(
            ".choice"
        );

    buttons.forEach(
        btn =>
        btn.disabled = true
    );

    answered++;

    if (
        selected === q.answer
    ) {

        correct++;

        buttons[selected]
            .classList
            .add(
                "correct"
            );

        document
            .getElementById(
                "result"
            )
            .innerHTML =
            "<h3>正解</h3>";

    } else {

        buttons[selected]
            .classList
            .add(
                "incorrect"
            );

        buttons[q.answer]
            .classList
            .add(
                "correct"
            );

        document
            .getElementById(
                "result"
            )
            .innerHTML =
            "<h3>不正解</h3>";
    }

    document
        .getElementById(
            "explanation"
        )
        .innerHTML =
        "<p>"
        +
        q.explanation
        +
        "</p>";

    updateStats();

    saveProgress();
}

function updateStats() {

    document
        .getElementById(
            "answered"
        )
        .textContent =
        answered;

    document
        .getElementById(
            "correct"
        )
        .textContent =
        correct;

    const rate =
        answered === 0
        ? 0
        : Math.round(
            correct
            /
            answered
            *
            100
        );

    document
        .getElementById(
            "rate"
        )
        .textContent =
        rate
        +
        "%";
}

function saveProgress() {

    localStorage.setItem(
        "linuc_progress",
        JSON.stringify({
            answered,
            correct
        })
    );
}

function loadProgress() {

    const data =
        localStorage.getItem(
            "linuc_progress"
        );

    if (!data)
        return;

    const progress =
        JSON.parse(data);

    answered =
        progress.answered || 0;

    correct =
        progress.correct || 0;

    updateStats();
}
