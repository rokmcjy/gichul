let problemsData = [];
let currentQuestionIndex = 0;
let selectedYear = '';
let selectedSubject = '';
let wrongAnswers = [];

const yearSelect = document.getElementById('year-select');
const subjectSelect = document.getElementById('subject-select');
const questionBox = document.getElementById('question-box');
const navButtons = document.getElementById('nav-buttons');
const allAnswersDiv = document.getElementById('all-answers');
const mainBtn = document.getElementById('back-to-main');
const wrongAnswersBtn = document.getElementById('show-answers');

function showYearSelect() {
  yearSelect.style.display = 'block';
  subjectSelect.style.display = 'none';
  questionBox.innerHTML = '';
  navButtons.style.display = 'none';
  allAnswersDiv.innerHTML = '';
  mainBtn.style.display = 'none';
  wrongAnswersBtn.style.display = 'none';
}

function showSubjectSelect(year) {
  selectedYear = year;
  yearSelect.style.display = 'none';
  subjectSelect.style.display = 'block';
  questionBox.innerHTML = '';
  navButtons.style.display = 'none';
  allAnswersDiv.innerHTML = '';
  mainBtn.style.display = 'none';
  wrongAnswersBtn.style.display = 'none';

  const subjects = [
    ['gakron', '부동산학개론'],
    ['mlaw', '민법 및 민사특별법'],
    ['gong', '부동산공법'],
    ['silmu', '부동산중개사법령 및 실무'],
    ['sisa', '부동산공시법']
  ];

  subjectSelect.innerHTML = subjects.map(([code, name]) => `
    <button onclick="loadProblems('${code}')">${name}</button>
  `).join('') + `<button onclick="showYearSelect()">메인으로 가기</button>`;
}

async function loadProblems(subject) {
  selectedSubject = subject;
  const url = `./problems/${selectedYear}_${subject}.json`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('문제 파일을 불러올 수 없습니다.');
    problemsData = await res.json();

    currentQuestionIndex = 0;
    wrongAnswers = [];

    showQuestion();
    navButtons.style.display = 'block';
    mainBtn.style.display = 'block';
    wrongAnswersBtn.style.display = 'block';
  } catch (e) {
    alert('문제 파일을 불러올 수 없습니다.');
    console.error(e);
  }
}

function showQuestion() {
  const q = problemsData[currentQuestionIndex];
  questionBox.innerHTML = `
    <h3>Q${currentQuestionIndex + 1}. ${q.question}</h3>
    ${q.choices.map((choice, i) => `
      <button class="choice-btn" onclick="checkAnswer(${i})">
        ${i + 1}. ${choice}
      </button>
    `).join('')}
    <div id="explanation" class="explanation" style="display:none;"></div>
  `;
}

function checkAnswer(choiceIndex) {
  const q = problemsData[currentQuestionIndex];
  const buttons = document.querySelectorAll('.choice-btn');
  const explanation = document.getElementById('explanation');

  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answer) btn.classList.add('correct');
    if (i === choiceIndex && choiceIndex !== q.answer) btn.classList.add('wrong');
  });

  if (choiceIndex !== q.answer) {
    wrongAnswers.push({
      question: q.question,
      yourAnswer: q.choices[choiceIndex],
      correctAnswer: q.choices[q.answer],
      explanation: q.explanation
    });
  }

  explanation.innerHTML = `<b>해설:</b> ${q.explanation}`;
  explanation.style.display = 'block';
}

document.getElementById('prev-question').onclick = () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    showQuestion();
  }
};

document.getElementById('next-question').onclick = () => {
  if (currentQuestionIndex < problemsData.length - 1) {
    currentQuestionIndex++;
    showQuestion();
  }
};

mainBtn.onclick = showYearSelect;

wrongAnswersBtn.onclick = () => {
  questionBox.innerHTML = '';
  navButtons.style.display = 'none';
  mainBtn.style.display = 'block';

  if (wrongAnswers.length === 0) {
    allAnswersDiv.innerHTML = '<h2>🎯모든 문제를 정답으로 맞혔습니다!</h2>';
    return;
  }

  allAnswersDiv.innerHTML = `
    <h2>📚 오답노트</h2>
    ${wrongAnswers.map((w, idx) => `
      <div>
        <h3>Q${idx + 1}. ${w.question}</h3>
        <p><b>당신의 답:</b> ${w.yourAnswer}</p>
        <p><b>정답:</b> ${w.correctAnswer}</p>
        <p><b>해설:</b> ${w.explanation}</p>
        <hr>
      </div>
    `).join('')}
  `;
};

showYearSelect();
