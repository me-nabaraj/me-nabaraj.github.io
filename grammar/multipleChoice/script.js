 
// Load sound files from HTML
const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');

let score = 0;
        function resetQuiz() {
            score = 0;
            document.getElementById('score').textContent = `Score: ${score}`;
            document.querySelectorAll('#quiz span').forEach(span => {
                span.querySelectorAll('button').forEach(button => {
                    button.disabled = false;
                    button.classList.remove('correct', 'incorrect');
                });
            });
        }

        document.querySelectorAll('#quiz span').forEach(span => {
            const answer = span.dataset.answer;
            span.querySelectorAll('button').forEach(button => {
                button.addEventListener('click', () => {
                    if (button.textContent.trim() === answer) {
                        button.classList.add('correct');
	     correctSound.play(); // Play correct sound
                        score++;
                    } else {
                        button.classList.add('incorrect');
	     wrongSound.play(); // Play wrong sound
                    }
                    span.querySelectorAll('button').forEach(btn => btn.disabled = true);
                    document.getElementById('score').textContent = `Score: ${score}`;
                });
            });
        });

        document.getElementById('reset').addEventListener('click', resetQuiz);