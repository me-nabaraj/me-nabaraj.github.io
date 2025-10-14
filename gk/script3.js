const questions = [
  {
    question: "Who scored the fastest century in ODI cricket?",
    options: ["Corey Anderson", "Shahid Afridi", "Brian Lara", "AB De Villiers"],
    answer: "AB De Villiers"
  },
  {
    question: "What does ICAO stand for?",
    options: ["International Civil Aviation Organization", "Internation Civil Agricultural Organization", "Indian Corporation of Agriculture Organization", "Institute of Company of Accounts Organization"],
    answer: "International Civil Aviation Organization"
  },

  {
    question: "How many members are there in House of Representative in Nepal?",
    options: ["165", "601", "275", "59"],
    answer: "275"
  },
  {
    question: "What is the full form of HTML?",
    options: ["Hypertext Markup Language", "Higher Technology Machine Language", "High Tech Machanical Load", "Hypertext Machine Language"],
    answer: "Hypertext Markup Language"
  },
  {
    question: "Which country's flag is shown here?",
    options: ["The United States", "The United Kingdom", "Japan", "Canada"],
    answer: "Canada",
    flagImage: "canadaFlag.jpg"
  },
{
    question: "Who invented the mobile phone?",
    options: ["Graham Bell", "Martin Cooper", "Galileo Galilei", "Antonio Meucci"],
    answer: "Martin Cooper"
  },
  {
    question: "In which country does Mt. Kilimanjaro lie?",
    options: ["Uganda", "Mozambique", "Kenya", "Tanzania"],
    answer: "Tanzania"
  },
  {
    question: "Who is the present president of the USA?",
    options: ["Donald Trump", "Barak Obama", "Kamala Harris", "J.D. Vance"],
    answer: "Donald Trump"
  },
  {
    question: "Which among the following radiations carries maximum energy?",
    options: ["Ultraviolet Rays", "Infrared Rays", "X-rays", "Gamma Rays"],
    answer: "Gamma Rays"
  },
  {
    question: "Fuel for jet planes consists of purified......",
    options: ["Kerosene", "Petrol", "Diesel", "Gasoline"],
    answer: "Kerosene"
  },
  {
    question: 'Who said "Child is the father of Man?"',
    options: ["John Keats", "Lord Byron", "William Shakespeare", "William Wordsworth"],
    answer: "William Wordsworth"
  },
  {
    question: "Who wrote the Nepali novel 'Firfire'?",
    options: ["Bhimnidhi Tiwari", "Krishna Dharawasi", "Narayan Wagle", "Buddhi Sagar"],
    answer: "Buddhi Sagar"
  },
  {
    question: "What is the full form of SEE?",
    options: [
      "Student's Education Examination",
      "School Entrance Examination",
      "Secondary Education Examination",
      "School Education Examination"
    ],
    answer: "Secondary Education Examination"
  },
  {
    question: "Who is the youngest person to climb Mt. Everest?",
    options: ["Pasang Lhamu Sherpa", "Jordan Romero", "Malavath Purna", "Temba Tsheri"],
    answer: "Jordan Romero"
  },
  {
    question: "How many districts are there in Koshi Province?",
    options: ["12 districts", "13 districts", "14 districts", "15 districts"],
    answer: "14 districts"
  },
  {
    question: "Which temple is this?",
    options: [
      "Pathivara Temple",
      "Pashupatinath Temple",
      "Manakamana Temple",
      "Krishna Temple"
    ],
    answer: "Manakamana Temple",
    flagImage: "manakamana.jpg"
  },

  {
    question: "Who is the present prime minister of Nepal?",
    options: [
      "Sher Bahadur Deuba",
      "Khadga Prasad Oli",
      "Puspa Kamal Dahal",
      "Sushila Karki"
    ],
    answer: "Sushila Karki"
  },
  {
    question: "Who is the present president of Nepal?",
    options: [
      "Dr. Ramvaran Yadav",
      "Sher Bahadur Deuba",
      "Ramchandra Paudel",
      "Vidya Devi Bhandari"
    ],
    answer: "Ramchandra Paudel"
  },
  {
    question: "In which district does the temple of Halesi Mahadev lie?",
    options: [
      "Panchthar district",
      "Ramechhap district",
      "Sankhuwasava district",
      "Khotang district"
    ],
    answer: "Khotang district"
  },
  {
    question: "Who is the chief minister of Lumbini Province?",
    options: [
      "Dilli Bahadur Chaudhary",
      "Shankar Poudel",
      "Chet Narayan Acharya",
      "Kul Bahadur KC"
    ],
    answer: "Chet Narayan Acharya"
  },
  {
    question: "Who won the golden ball in FIFA World Cup 2022?",
    options: [
      "Harry Kane",
      "Christiano Ronaldo",
      "Kylian Mbappe",
      "Lionel Messi"
    ],
    answer: "Lionel Messi"
  },
  {
    question: "Which is the capital city of Finland?",
    options: [
      "Warsaw",
      "Helsinki",
      "Amsterdam",
      "Copenhagen"
    ],
    answer: "Helsinki"
  },
  {
    question: "Who was the father of Hindu legend Parshuram?",
    options: [
      "Rishi Jamadagni",
      "Rishi Bharadwaj",
      "Rishi Vishwamitra",
      "Rishi Vashistha"
    ],
    answer: "Rishi Jamadagni"
  },
  {
    question: "Who is the founder of Google?",
    options: [
      "Mark Zuckerberg",
      "Sundar Pichai",
      "Larry Page",
      "Jan Koum"
    ],
    answer: "Larry Page"
  },

  {
    question: "Which country's flag is this?",
    options: [
      "The United States",
      "The United Kingdom",
      "Japan",
      "Russia"
    ],
    answer: "Russia",
    flagImage: "russia.jpg"
  },

  {
    question: "Who is the present education minister of Nepal?",
    options: [
      "Giriraj Mani Pokhrel",
      "Chitralekha Yadav",
      "Mahavir Pun",
      "Vidya Bhattarai"
    ],
    answer: "Mahavir Pun"
  },
  {
    question: "Which is the capital city of Karnali province?",
    options: [
      "Surkhet",
      "Birendranagar",
      "Dhangadhi",
      "none of these"
    ],
    answer: "Birendranagar"
  },
  {
    question: "Which is the largest district of Nepal?",
    options: [
      "Kathmandu",
      "Surkhet",
      "Humla",
      "Dolpa"
    ],
    answer: "Dolpa"
  },
  {
    question: "Which is the largest national park of Nepal?",
    options: [
      "Rara National Park",
      "Chitwan National Park",
      "Sagarmatha National Park",
      "She-phoksundo National Park"
    ],
    answer: "She-phoksundo National Park"
  },
  {
    question: "What portion of the world is occupied by Nepal?",
    options: [
      "0.03 percent",
      "0.3 percent",
      "0.33 percent",
      "3.0 percent"
    ],
    answer: "0.03 percent"
  },
  {
    question: "What does entomology study about?",
    options: [
      "Behaviour of human beings",
      "Insects",
      "Formation of rocks",
      "Wild animals"
    ],
    answer: "Insects"
  },
  {
    question: "For which of the following disciplines Nobel Prize is awarded?",
    options: [
      "Physics and chemistry",
      "Physiology and medicine",
      "Literature, peace and economics",
      "All of these"
    ],
    answer: "All of these"
  },
  {
    question: "Each year World Red Cross Day is celebrated on .....",
    options: [
      "February 8",
      "March 8",
      "March 18",
      "May 8"
    ],
    answer: "May 8"
  },
  {
    question: "Which mountain is 8,586 meters high?",
    options: [
      "Mt. Cho Oyu",
      "Mt. Kanchanjungha",
      "Mt. Makalu",
      "Mt. Lhotse"
    ],
    answer: "Mt. Kanchanjungha"
  },
  {
    question: "Which district does not lie in Lumbini Province?",
    options: [
      "Tanahu",
      "Banke",
      "Arghakhanchi",
      "Rupandehi"
    ],
    answer: "Tanahu"
  },
  {
    question: "When was Sugauli treaty signed?",
    options: [
      "2 February 1818",
      "15 March 1980",
      "12 December 1815",
      "2 December 1815"
    ],
    answer: "2 December 1815"
  },
  {
    question: "In which district does Dhorpatan Hunting Reserve not lie?",
    options: [
      "Baglung",
      "Myagdi",
      "Rukum",
      "Dolpa"
    ],
    answer: "Dolpa"
  },
  {
    question: "Which international game among these is played only in Nepal?",
    options: [
      "Volleyball",
      "Air Hockey",
      "Mountain Biking",
      "Elephant Polo"
    ],
    answer: "Elephant Polo"
  },
  {
    question: "Which country's flag is this?",
    options: [
      "Bolivia",
      "Pakistan",
      "Argentina",
      "Brazil"
    ],
    answer: "Brazil",
    flagImage: "brazil.png"
  },
  {
    question: "Which of the following grasslands lie in North America?",
    options: [
      "Pampas",
      "Savannas",
      "Prairies",
      "Steppes"
    ],
    answer: "Prairies"
  }, 
{
    question: "Who is shown in the picture?",
    options: [
      "Donald Trump",
      "Vladimir Putin",
      "Volodymyr Zelenskyy",
      "Justin Trudeau"
    ],
    answer: "Volodymyr Zelenskyy",
    flagImage: "zelensky.jpg"
  },
{
    question: "Who is this actress?",
    options: [
      "Ananya Pandey",
      "Janhvi Kapoor",
      "Rashmika Mandanna",
      "Sara Ali Khan"
    ],
    answer: "Ananya Pandey",
    flagImage: "ananya.jpg"
  },
  {
    question: "Who is this politician?",
    options: [
      "Manish Jha",
      "Ravi Lamichhane",
      "Gagan Thapa",
      "Biswo Prakash"
    ],
    answer: "Ravi Lamichhane",
    flagImage: "ravi.png"
  },
{
    question: "What is the name of this singer?",
    options: [
      "Alka Yagnik",
      "Neha Kakkar",
      "Sunidhi Chauhan",
      "Shreya Ghosal"
    ],
    answer: "Shreya Ghosal",
    flagImage: "shreya.jpg"
  },
{
    question: "This is the logo of......",
    options: [
      "ChatGPT",
      "Deepseek",
      "Claude",
      "Gemini"
    ],
    answer: "Deepseek",
    flagImage: "deepseek.png"
  },
  {
    question: "Who is the mother of Lord Krishna?",
    options: [
      "Koushlya",
      "Yashoda",
      "Devaki",
      "Kunti"
    ],
    answer: "Devaki"
  },
 {
    question: "What is the name of this bird?",
    options: [
      "Himalayan Lophophorus",
      "Himalayan Bluetail",
      "Himalayan Vulture",
      "Himalayan Kalij"
    ],
    answer: "Himalayan Lophophorus",
    flagImage: "daafe.png"
  },
  {
    question: "Which one is used for frontend web development?",
    options: [
      "JavaScript",
      "MySQL",
      "C++",
      "PHP"
    ],
    answer: "JavaScript"
  },
{
    question: "What's the name of this hollywood actor?",
    options: [
      "Chris Pratt",
      "Leonardo Dicaprio",
      "Tom Cruise",
      "Christian Bale"
    ],
    answer: "Chris Pratt",
    flagImage: "chris.jpg"
  },
{
    question: "Which mountain is this?",
    options: [
      "Mount Everest",
      "Mount Kanchanjungha",
      "Mount Machhapuchhre",
      "Mount Annapurna"
    ],
    answer: "Mount Machhapuchhre",
    flagImage: "fishtail.jpg"
  }
];

let currentQuestionIndex = 0;
let score = 0;
let userName = "";

// Shuffle function for questions and options
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
// Load sound files from HTML
const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');

document.getElementById("start-button").addEventListener("click", startGame);
document.getElementById("next-button").addEventListener("click", loadNextQuestion);
document.getElementById("restart-button").addEventListener("click", restartGame);

function startGame() {
  userName = prompt("Please enter your name:");
  if (userName) {
    shuffleArray(questions); // Shuffle questions before starting
    document.getElementById("user-name").innerText = userName;
    document.getElementById("instruction").style.display = "none";
    document.getElementById("game-section").style.display = "block";
    loadNextQuestion();
  }
}

function loadNextQuestion() {
  if (currentQuestionIndex >= questions.length) {
    showCongratulations();
    return;
  }

  const currentQuestion = questions[currentQuestionIndex];
  document.getElementById("question-text").innerText = currentQuestion.question;
  document.getElementById("question-number").innerText = `Question: ${currentQuestionIndex + 1}`;
  document.getElementById("next-button").disabled = true;

  // Show flag image if available
  if (currentQuestion.flagImage) {
    document.getElementById("flag-image-container").style.display = "block";
    document.getElementById("flag-image").src = currentQuestion.flagImage;
  } else {
    document.getElementById("flag-image-container").style.display = "none";
  }

  // Shuffle options before displaying
  const shuffledOptions = [...currentQuestion.options];
  shuffleArray(shuffledOptions);

  const optionsContainer = document.getElementById("options-container");
  optionsContainer.innerHTML = "";
  shuffledOptions.forEach(option => {
    const button = document.createElement("button");
    button.innerText = option;
    button.addEventListener("click", () => checkAnswer(option, button));
    optionsContainer.appendChild(button);
  });
}

function checkAnswer(selectedOption, button) {
  const correctAnswer = questions[currentQuestionIndex].answer;

  // Disable all options after selection
  document.querySelectorAll("#options-container button").forEach(btn => btn.disabled = true);

  if (selectedOption === correctAnswer) {
    score++;
    button.classList.add("correct");
    correctSound.play(); // Play correct sound
  } else {
    score--;
    button.classList.add("incorrect");
    wrongSound.play(); // Play wrong sound
  }

  document.getElementById("score").innerText = score;
  document.getElementById("next-button").disabled = false;
  currentQuestionIndex++;
}

function showCongratulations() {
  const finalMessage = score >= 0 ? `Congratulations! Your score is: ${score}` : `Better luck next time! Your score is: ${score}`;
  document.getElementById("final-message").innerText = finalMessage;
  document.getElementById("game-section").style.display = "none";
  document.getElementById("congratulations").style.display = "block";
}

function restartGame() {
  currentQuestionIndex = 0;
  score = 0;
  document.getElementById("score").innerText = score;
  document.getElementById("congratulations").style.display = "none";
  document.getElementById("instruction").style.display = "block";
}

