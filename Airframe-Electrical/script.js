let questions = [];
let currentQuestion = 0;
let score = 0;
let flaggedQuestions = [];

document.addEventListener("DOMContentLoaded", () => {
    loadQuestions();
});

function loadQuestions() {
    fetch("questions.json")
        .then(response => response.json())
        .then(data => {
            questions = data;
            shuffleArray(questions);  // Shuffle questions when loaded
            renderQuestionList();
            displayQuestion();
            document.getElementById("scoreDisplay").innerText = `Score: ${score}`;
        })
        .catch(error => console.error("Error loading questions:", error));
}

function startNewQuiz() {
    // Reset state
    currentQuestion = 0;
    score = 0;
    flaggedQuestions = [];

    // Clear cookies
    setCookie("quizScore", 0, 7);
    setCookie("flaggedQuestions", JSON.stringify([]), 7);

    // Reload and reshuffle questions
    loadQuestions();
    document.getElementById("scoreDisplay").innerText = `Score: ${score}`;
    document.getElementById("quizContainer").innerHTML = `
        <h1>Quiz</h1>
        <button onclick="startNewQuiz()">Start New Quiz</button>
        <p id="question"></p>
        <div id="options"></div>
        <button onclick="submitAnswer()">Submit Answer</button>
        <button onclick="toggleFlag()">Flag/Unflag</button>
        <p id="scoreDisplay"></p>
    `;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function renderQuestionList() {
    const questionList = document.getElementById("questionList");
    questionList.innerHTML = "";
    questions.forEach((_, index) => {
        const listItem = document.createElement("li");
        listItem.innerText = `Question ${index + 1}`;
        listItem.className = flaggedQuestions.includes(index) ? "flagged" : "";
        listItem.onclick = () => {
            currentQuestion = index;
            displayQuestion();
        };
        questionList.appendChild(listItem);
    });
}

function displayQuestion() {
    if (currentQuestion >= questions.length) {
        document.getElementById("quizContainer").innerHTML = `<h2>Quiz Complete!</h2><p>Final Score: ${score}</p>`;
        setCookie("quizScore", score, 7);
        return;
    }
    
    const questionElement = document.getElementById("question");
    const optionsContainer = document.getElementById("options");

    questionElement.innerText = questions[currentQuestion].question;
    optionsContainer.innerHTML = "";

    questions[currentQuestion].options.forEach(option => {
        const optionButton = document.createElement("button");
        optionButton.innerText = option;
        optionButton.onclick = () => selectOption(option);
        optionsContainer.appendChild(optionButton);
    });
}

function selectOption(selected) {
    if (selected === questions[currentQuestion].answer) {
        score++;
    }
    currentQuestion++;
    setCookie("quizScore", score, 7);
    renderQuestionList();
    displayQuestion();
}

function toggleFlag() {
    const questionIndex = currentQuestion;
    if (flaggedQuestions.includes(questionIndex)) {
        flaggedQuestions = flaggedQuestions.filter(q => q !== questionIndex);
    } else {
        flaggedQuestions.push(questionIndex);
    }
    setCookie("flaggedQuestions", JSON.stringify(flaggedQuestions), 7);
    renderQuestionList();
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
}

function getCookie(name) {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') cookie = cookie.substring(1);
        if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length, cookie.length);
    }
    return null;
}
