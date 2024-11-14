let questions = [];
let currentQuestion = 0;
let userAnswers = {};
let flaggedQuestions = [];
let quizGraded = false;
let quizTitle = '';

// Adjusted function for handling dropdown selection
function loadSelectedJsonFile() {
    const dropdown = document.getElementById("quizDropdown");
    const selectedFile = dropdown.value;

    if (!selectedFile) return;

    quizTitle = dropdown.options[dropdown.selectedIndex].text; // Get quiz title from dropdown
    document.getElementById("title").innerText = quizTitle; // Update quiz title in the <h1>

    loadQuestions(selectedFile);
}

// Load and parse index.json, then populate dropdown
function loadIndex() {
    fetch("index.json")
        .then(response => response.json())
        .then(data => {
            const files = data.files;
            const dropdown = document.getElementById("quizDropdown");
            files.forEach(file => {
                const option = document.createElement("option");
                option.value = file.file;
                option.innerText = file.title;
                dropdown.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Error loading index.json:", error);
        });
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

function loadQuestions(file) {
	console.log (file);
    fetch(file)
        .then(response => response.json())
        .then(data => {
            questions = data;
            shuffleArray(questions);
			questions.forEach(question => {
                shuffleArray(question.options);
            });
            renderQuestionList();
            displayQuestion();
            document.getElementById("scoreDisplay").innerText = `Score: Not graded yet`;
        })
        .catch(error => {
            console.error("Error loading questions file:", error);
        });
}

/*function renderQuestionList() {
    const questionList = document.getElementById("questionList");
    questionList.innerHTML = "";
    questions.forEach((question, index) => {
        const listItem = document.createElement("li");
        listItem.innerText = `Question ${index + 1}`;
        if (flaggedQuestions.includes(index)) {
            listItem.innerText += " 🚩"; // Flag indicator
        }
        if (currentQuestion === index) {
            listItem.style.fontWeight = "bold";
        }
        listItem.onclick = () => {
            currentQuestion = index;
            displayQuestion();
            renderQuestionList();
        };
        questionList.appendChild(listItem);
    });
}*/

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
			console.log(quizGraded);
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
    const questionData = questions[currentQuestion];
    const questionElement = document.getElementById("question");
    const optionsForm = document.getElementById("optionsForm");

    questionElement.innerText = questionData.question;
    optionsForm.innerHTML = ""; // Clear previous options

    questionData.options.forEach(option => {
        const optionContainer = document.createElement("div");
        const optionInput = document.createElement("input");
        optionInput.type = "radio";
        optionInput.name = "option";
        optionInput.value = option;
        optionInput.checked = userAnswers[currentQuestion] === option;

        optionInput.onclick = () => selectOption(option);

        const optionLabel = document.createElement("label");
        optionLabel.innerText = option;
        optionContainer.appendChild(optionInput);
        optionContainer.appendChild(optionLabel);
        optionsForm.appendChild(optionContainer);
		
		        if (quizGraded && option === questions[currentQuestion].answer) {
            optionLabel.style.color = "green";
            optionLabel.style.fontWeight = "bold"; // Optional: Bold the correct answer
        }
    });
	
	
}

function selectOption(selected) {
    userAnswers[currentQuestion] = selected;
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

/*function gradeQuiz() {
    let score = 0;
    questions.forEach((question, index) => {
        const isCorrect = userAnswers[index] === question.answer;
        if (isCorrect) score++;
    });

    const percentage = ((score / questions.length) * 100).toFixed(2);
    document.getElementById("scoreDisplay").innerText = `Score: ${score} / ${questions.length} (${percentage}%)`;
    quizGraded = true;
    renderQuestionList();
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

// Load index.json and populate the dropdown when the page is ready
document.addEventListener("DOMContentLoaded", () => {
    loadIndex();
});
