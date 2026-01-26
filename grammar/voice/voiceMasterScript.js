const sentences = [
  {
    active: "The teacher explains the lessons every day.",
    passive: [
      "The lessons are explained by the teacher every day.",
      "The lessons are explained every day by the teacher.",
      "The lessons are explained every day."
    ]
  },
  {
    active: "The workers are building a new bridge.",
    passive: [
      "A new bridge is being built by the workers.",
      "A new bridge is being built."
    ]
  },
  {
    active: "The students have completed the assignment.",
    passive: [
      "The assignment has been completed by the students.",
      "The assignment has been completed."
    ]
  },
  {
    active: "The chef was preparing the meal when the guests arrived.",
    passive: [
      "The meal was being prepared by the chef when the guests arrived.",
      "When the guests arrived, the meal was being prepared by the chef.",
      "When the guests arrived, the meal was being prepared."
    ]
  },
  {
    active: "The company had launched the product before the competition.",
    passive: [
      "The product had been launched by the company before the competition.",
      "The product had been launched before the competition."
    ]
  },
  {
    active: "The scientist will publish the research paper next month.",
    passive: [
      "The research paper will be published by the scientist next month.",
      "The research paper will be published next month by the scientist.",
      "The research paper will be published next month."
    ]
  },
  {
    active: "The team is going to present the project tomorrow.",
    passive: [
      "The project is going to be presented by the team tomorrow.",
      "The project is going to be presented tomorrow by the team.",
      "The project is going to be presented tomorrow."
    ]
  },
  {
    active: "The children have been playing the game for hours.",
    passive: [
      "The game has been being played by the children for hours.",
      "The game has been being played for hours by the children.",
      "The game has been being played for hours."
    ]
  },
  {
    active: "The gardener had watered the plants before it started raining.",
    passive: [
      "The plants had been watered by the gardener before it started raining.",
      "The plants had been watered before it started raining."
    ]
  },
  {
    active: "The committee will have finalized the decision by next week.",
    passive: [
      "The decision will have been finalized by the committee by next week.",
      "The decision will have been finalized by next week."
    ]
  }
];

let score = 0;
let isAnswerCorrectForCurrentQuestion = false;
let shuffledQuestions = []; // Array to store shuffled questions
let usedQuestions = []; // Array to track used questions

const sentenceElement = document.getElementById('sentence');
const answerInput = document.getElementById('answer-input');
const feedbackElement = document.getElementById('feedback');
const scoreElement = document.getElementById('score');
const nextButton = document.getElementById('next-btn');
const showAnswerButton = document.getElementById('show-answer-btn');

// Function to shuffle an array using the Fisher-Yates algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Function to load a random question
function loadRandomQuestion() {
  if (shuffledQuestions.length === 0) {
    // If all questions have been used, reshuffle and reset
    shuffledQuestions = shuffleArray([...sentences]);
    usedQuestions = [];
  }

  // Get the next question from the shuffled list
  const question = shuffledQuestions.pop();
  usedQuestions.push(question);

  // Display the question
  sentenceElement.textContent = question.active;
  answerInput.value = '';
  answerInput.style.color = 'red';
  feedbackElement.textContent = 'Your feedback here';
  feedbackElement.style.color = '#999';
  isAnswerCorrectForCurrentQuestion = false;
}

function showAnswer() {
  const currentQuestion = usedQuestions[usedQuestions.length - 1]; // Get the current question
  answerInput.value = currentQuestion.passive[0]; // Show the first correct answer
  answerInput.style.color = 'green';
}

function hideAnswer() {
  answerInput.value = '';
  answerInput.style.color = 'red';
}

function checkAnswer() {
  const currentQuestion = usedQuestions[usedQuestions.length - 1]; // Get the current question
  const userAnswer = answerInput.value.trim();
  const correctAnswers = currentQuestion.passive;

  // Check if the user's answer matches any of the correct answers
  const isCorrect = correctAnswers.some(correctAnswer => userAnswer === correctAnswer);

  if (isCorrect) {
    answerInput.style.color = 'green';
    feedbackElement.textContent = 'Correct!';
    feedbackElement.style.color = '#28a745';

    // Increment score only if the answer was not already correct for this question
    if (!isAnswerCorrectForCurrentQuestion) {
      score++;
      scoreElement.textContent = score;
      isAnswerCorrectForCurrentQuestion = true; // Mark the question as answered correctly
    }
  } else {
    answerInput.style.color = 'red';
    feedbackElement.textContent = 'Incorrect. Try again!';
    feedbackElement.style.color = '#dc3545';
  }
}

function loadNextQuestion() {
  if (shuffledQuestions.length > 0 || usedQuestions.length < sentences.length) {
    loadRandomQuestion();
  } else {
    alert('Quiz completed! Your final score is ' + score);
    resetQuiz();
  }
}

function resetQuiz() {
  score = 0;
  scoreElement.textContent = score;
  shuffledQuestions = shuffleArray([...sentences]); // Reshuffle questions
  usedQuestions = [];
  loadRandomQuestion();
}

// Show answer only while the mouse is pressed down
showAnswerButton.addEventListener('mousedown', showAnswer);
showAnswerButton.addEventListener('mouseup', hideAnswer);
showAnswerButton.addEventListener('mouseleave', hideAnswer);

answerInput.addEventListener('input', checkAnswer);

// Load the first question when the page loads
window.onload = () => {
  shuffledQuestions = shuffleArray([...sentences]); // Shuffle questions initially
  loadRandomQuestion();
};