// script_v4.5.js

const app = document.getElementById('app');
const yearSelect = document.getElementById('year-select');
const subjectSelect = document.getElementById('subject-select');
const questionBox = document.getElementById('question-box');
const buttons = document.getElementById('buttons');
const navButtons = document.getElementById('nav-buttons');
const backToMainBtn = document.getElementById('back-to-main');
const showAnswersBtn = document.getElementById('show-answers');
const prevQuestionBtn = document.getElementById('prev-question');
const nextQuestionBtn = document.getElementById('next-question');
const allAnswersDiv = document.getElementById('all-answers');

let problemsData = [];
let currentYear = '';
let currentSubject = '';
let currentQuestionIndex = 0;
let score = 0;
let wrongAnswers = [];

async function loadProblems(year) {
  try {
    const response = await fetch(`problems/${year}.json`);
    if (!response.ok) throw new Error('문제 파일을 불러올 수 없습니다.');
    const data = await response.json();
    problemsData = data;
    showSubjectSelect();
  } catch (error) {
    console.error('fetch 오류 발생:', error);
    alert('문제를 불러올 수 없습니다.');
  }
}

function showYearSelect() {
  yearSelect.innerHTML = '';
  subjectSelect.innerHTML = '';
  questionBox.innerHTML = '';
  buttons.style.display = 'none';
  navButtons.style.display = 'none';
  allAnswersDiv.innerHTML = '';

  const availableYears = ['2020', '2021', '2022', '2023', '2024']; // 여기에 있는 연도만 표시
  availableYears.forEach(year => {
    const btn = document.createElement('button');
    btn.textContent = `${year}년도`;
    btn.onclick = () => {
      currentYear = year;
      loadProblems(year);
    };
    yearSelect.appendChild(btn);
  });
}

function showSubjectSelect() {
  yearSelect.innerHTML = '';
  subjectSelect.innerHTML = '';
  questionBox.innerHTML = '';
  buttons.style.display = 'none';
  navButtons.style.display = 'none';
  allAnswersDiv.innerHTML = '';

  const subjects = [...new Set(problemsData.map(p => p.subject))];
  subjects.forEach(subject => {
    const btn = document.createElement('button');
    btn.textContent = subject;
    btn.onclick = () => {
      currentSubject = subject;
      currentQuestionIndex = 0;
      score = 0;
      wrongAnswers = [];
      showQuestion();
    };
    subjectSelect.appendChild(btn);
  });

  backToMainBtn.style.display = 'inline-block';
  showAnswersBtn.textContent = '오답노트 보기';
  showAnswersBtn.style.display = 'inline-block';
}

function showQuestion() {
  const subjectProblems = problemsData.filter(p => p.subject === currentSubject);
  if (currentQuestionIndex >= subjectProblems.length) {
    showScore();
    return;
  }

  const problem = subjectProblems[currentQuestionIndex];
  questionBox.innerHTML = `
    <h2>Q${currentQuestionIndex + 1}. ${problem.question}</h2>
    ${problem.choices.map((choice, index) => `
      <button class="choice" onclick="checkAnswer(${index + 1})">${index + 1}. ${choice}</button>
    `).join('')}
    <div id="explanation" class="explanation"></div>
  `;

  buttons.style.display = 'block';
  navButtons.style.display = 'block';
}

function checkAnswer(selected) {
  const subjectProblems = problemsData.filter(p => p.subject === currentSubject);
  const problem = subjectProblems[currentQuestionIndex];
  const allChoices = document.querySelectorAll('.choice');
  allChoices.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx + 1 === problem.answer) {
      btn.classList.add('correct');
    } else if (idx + 1 === selected) {
      btn.classList.add('wrong');
    }
  });

  const explanationDiv = document.getElementById('explanation');
  explanationDiv.innerHTML = `<strong>해설:</strong> ${problem.explanation}`;

  if (selected === problem.answer) {
    score++;
  } else {
    wrongAnswers.push({
      number: currentQuestionIndex + 1,
      question: problem.question,
      correctAnswer: `${problem.answer}. ${problem.choices[problem.answer - 1]}`,
      explanation: problem.explanation
    });
  }
}

function showScore() {
  questionBox.innerHTML = `<h2>총점: ${score}점 / ${problemsData.filter(p => p.subject === currentSubject).length}점</h2>`;
  navButtons.style.display = 'none';
}

function showWrongAnswers() {
  if (wrongAnswers.length === 0) {
    allAnswersDiv.innerHTML = `<h3>오답노트</h3><p>모든 문제를 맞췄습니다!</p>`;
    return;
  }

  allAnswersDiv.innerHTML = `
    <h3>📚 오답노트</h3>
    ${wrongAnswers.map(wrong => `
      <div>
        <strong>Q${wrong.number}. ${wrong.question}</strong><br>
        정답: ${wrong.correctAnswer}<br>
        해설: ${wrong.explanation}
      </div><br>
    `).join('')}
  `;
  subjectSelect.innerHTML = '';
  questionBox.innerHTML = '';
  buttons.style.display = 'block';
  navButtons.style.display = 'none';
}

backToMainBtn.onclick = showYearSelect;
showAnswersBtn.onclick = showWrongAnswers;
prevQuestionBtn.onclick = () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    showQuestion();
  }
};
nextQuestionBtn.onclick = () => {
  const subjectProblems = problemsData.filter(p => p.subject === currentSubject);
  if (currentQuestionIndex < subjectProblems.length - 1) {
    currentQuestionIndex++;
    showQuestion();
  } else {
    showScore();
  }
};

// 최초 시작
showYearSelect();
