let questions = [];
let currentQuestion = 0;
let userAnswers = {};
let flaggedQuestions = [];
let quizGraded = false;


document.addEventListener("DOMContentLoaded", () => {
    loadQuestions();
});

function loadQuestions() {
    fetch("questions.json")
        .then(response => response.json())
        .then(data => {
            questions = data;
            shuffleArray(questions);
            renderQuestionList();
            displayQuestion();
            document.getElementById("scoreDisplay").innerText = `Score: Not graded yet`;
        })
        .catch(error => console.error("Error loading questions:", error));
}

function startNewQuiz() {
    currentQuestion = 0;
    userAnswers = {};
    quizGraded = false;
    flaggedQuestions = [];
    setCookie("flaggedQuestions", JSON.stringify([]), 7);
    loadQuestions();
    document.getElementById("scoreDisplay").innerText = `Score: Not graded yet`;
}

function renderQuestionList() {
    const questionList = document.getElementById("questionList");
    questionList.innerHTML = "";
    questions.forEach((question, index) => {
        const listItem = document.createElement("li");
        listItem.innerText = `Question ${index + 1}`;
        if (flaggedQuestions.includes(index)) {
            listItem.innerText += " 🚩"; // Add flag emoji if flagged
        }
        listItem.className = flaggedQuestions.includes(index) ? "flagged" : "";
        if (currentQuestion == index) {
            listItem.style.fontWeight =  "bold";
        }
        if (quizGraded) {
            const isCorrect = userAnswers[index] === question.answer;
            listItem.style.color = isCorrect ? "green" : "red";
            listItem.innerText += isCorrect ? " ✅" : " ❌";
        }
        listItem.onclick = () => {
            currentQuestion = index;
            displayQuestion();
            renderQuestionList();
        };
        questionList.appendChild(listItem);
    });
}

function displayQuestion() {
    const questionElement = document.getElementById("question");
    const optionsForm = document.getElementById("optionsForm");

    questionElement.innerText = questions[currentQuestion].question;
    optionsForm.innerHTML = ""; // Clear previous options

    questions[currentQuestion].options.forEach((option, index) => {
        const optionContainer = document.createElement("div");
        const optionInput = document.createElement("input");
        optionInput.type = "radio";
        optionInput.name = "option";
        optionInput.value = option;
        optionInput.checked = userAnswers[currentQuestion] === option;

        optionInput.onclick = () => selectOption(option);
        
        const optionLabel = document.createElement("label");
        optionLabel.innerText = option;
        optionLabel.htmlFor = `option${index}`;

        if (quizGraded && option === questions[currentQuestion].answer) {
            optionLabel.style.color = "green";
            optionLabel.style.fontWeight = "bold"; // Optional: Bold the correct answer
        }


        optionContainer.appendChild(optionInput);
        optionContainer.appendChild(optionLabel);
        optionsForm.appendChild(optionContainer);
    });
}

function selectOption(selected) {
    userAnswers[currentQuestion] = selected;
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

function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        displayQuestion();
        renderQuestionList();
    }
}

function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        displayQuestion();
        renderQuestionList();
    }
}

function gradeQuiz() {
    let score = 0;
    questions.forEach((question, index) => {
        const isCorrect = userAnswers[index] === question.answer;
        if (isCorrect) score++;
    });

    // Calculate the percentage
    const percentage = ((score / questions.length) * 100).toFixed(2); // rounded to 2 decimal places

    // Update the score display with raw score and percentage
    document.getElementById("scoreDisplay").innerText = `Score: ${score} / ${questions.length} (${percentage}%)`;
    quizGraded = true;
    renderQuestionList();
    displayQuestion();
}

/*
function displayResults() {
    const questionList = document.getElementById("questionList");
    questionList.innerHTML = ""; // Clear current list

    questions.forEach((question, index) => {
        const listItem = document.createElement("li");
        listItem.innerText = `Question ${index + 1}`;
        
        // Add flag emoji if flagged
        if (flaggedQuestions.includes(index)) listItem.innerText += " 🚩";
        
        // Show correct or incorrect status
        const isCorrect = userAnswers[index] === question.answer;
        listItem.style.color = isCorrect ? "green" : "red";
        listItem.innerText += isCorrect ? " ✅" : " ❌";
        
        listItem.onclick = () => {
            currentQuestion = index;
            displayQuestion();
        };
        questionList.appendChild(listItem);
    });
}
*/
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
}
