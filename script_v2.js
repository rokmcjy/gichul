let problemsData = {};
let currentQuestions = [];
let currentIndex = 0;

async function loadProblems(year) {
  const res = await fetch(`problems/${year}.json`);
  problemsData = await res.json();
}

function renderSubjects() {
  const subjectDiv = document.getElementById('subject-select');
  subjectDiv.innerHTML = '';
  const subjects = [...new Set(problemsData.map(p => p.subject))];
  subjects.forEach(subject => {
    const btn = document.createElement('button');
    btn.innerText = subject;
    btn.onclick = () => startQuiz(subject);
    subjectDiv.appendChild(btn);
  });
}

function startQuiz(subject) {
  currentQuestions = problemsData.filter(p => p.subject === subject);
  currentIndex = 0;
  document.getElementById('year-select').style.display = 'none';
  document.getElementById('subject-select').style.display = 'none';
  document.getElementById('back-to-main').style.display = 'block';
  document.getElementById('show-answers').style.display = 'block';
  document.getElementById('nav-buttons').style.display = 'flex';
  document.getElementById('all-answers').innerHTML = '';
  renderQuestion();
}

function renderQuestion() {
  const questionBox = document.getElementById('question-box');
  if (currentIndex < 0) currentIndex = 0;
  if (currentIndex >= currentQuestions.length) {
    questionBox.innerHTML = "<h3>문제풀이 완료!</h3>";
    return;
  }
  const q = currentQuestions[currentIndex];
  const numbers = ["①", "②", "③", "④", "⑤"];

  questionBox.innerHTML = `
    <h3>Q${currentIndex + 1}. ${q.question}</h3>
    ${q.choices.map((choice, idx) => `
      <button class="choice-button" onclick="checkAnswer(${idx + 1}, ${q.answer}, this)" data-explanation="${q.explanation}">
        ${numbers[idx]} ${choice}
      </button>
    `).join('')}
    <div id="explanation-box" style="margin-top:15px; font-size:16px; color:#555;"></div>
  `;
}

function checkAnswer(selected, correct, button) {
  const buttons = document.querySelectorAll('.choice-button');

  buttons.forEach(btn => btn.disabled = true);

  if (selected === correct) {
    buttons[selected - 1].classList.add('correct');
  } else {
    buttons[selected - 1].classList.add('wrong');
    buttons[correct - 1].classList.add('correct');
  }

  setTimeout(() => {
    const explanationBox = document.getElementById('explanation-box');
    explanationBox.innerHTML = `<b>해설:</b> ${button.dataset.explanation}`;
  }, 50);
}

function showAllAnswers() {
  const answersDiv = document.getElementById('all-answers');
  answersDiv.innerHTML = currentQuestions.map((q, idx) => `
    ${idx + 1}번 문제 정답: ${q.answer}
  `).join('<br>');
}

function backToMain() {
  document.getElementById('year-select').style.display = 'block';
  document.getElementById('year-select').innerHTML = '';
  document.getElementById('subject-select').style.display = 'none';
  document.getElementById('subject-select').innerHTML = '';
  document.getElementById('question-box').innerHTML = '';
  document.getElementById('back-to-main').style.display = 'none';
  document.getElementById('show-answers').style.display = 'none';
  document.getElementById('nav-buttons').style.display = 'none';
  document.getElementById('all-answers').innerHTML = '';

  currentQuestions = [];
  currentIndex = 0;

  renderYearSelect();
}

function nextQuestion() {
  if (currentIndex < currentQuestions.length - 1) {
    currentIndex++;
    renderQuestion();
  }
}

function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
}

function renderYearSelect() {
  const yearDiv = document.getElementById('year-select');
  yearDiv.innerHTML = '';

  [2023, 2024].forEach(year => {
    const btn = document.createElement('button');
    btn.innerText = `${year}년도`;
    btn.onclick = async () => {
      await loadProblems(year);
      renderSubjects();
    };
    yearDiv.appendChild(btn);
  });
}

// ✅ DOMContentLoaded로 전체 묶음
document.addEventListener('DOMContentLoaded', () => {
  renderYearSelect();

  document.getElementById('show-answers').onclick = showAllAnswers;
  document.getElementById('back-to-main').onclick = backToMain;
  document.getElementById('next-question').onclick = nextQuestion;
  document.getElementById('prev-question').onclick = prevQuestion;
});
