const app = document.getElementById('app');
const yearSelect = document.getElementById('year-select');
const subjectSelect = document.getElementById('subject-select');
const questionBox = document.getElementById('question-box');
const navButtons = document.getElementById('nav-buttons');
const backToMainBtn = document.getElementById('back-to-main');
const showAnswersBtn = document.getElementById('show-answers');
const allAnswersDiv = document.getElementById('all-answers');
const prevQuestionBtn = document.getElementById('prev-question');
const nextQuestionBtn = document.getElementById('next-question');

let problemsData = {};
let selectedYear = '';
let selectedSubject = '';
let currentQuestions = [];
let currentQuestionIndex = 0;
let wrongAnswers = [];

async function loadProblems(year, subject) {
  try {
    const res = await fetch(`problems/${year}_${subject}.json`);
    if (!res.ok) throw new Error('문제 파일을 불러올 수 없습니다.');
    const data = await res.json();
    return data;
  } catch (error) {
    alert(error.message);
    return [];
  }
}

function showYearSelect() {
  yearSelect.innerHTML = `
    <h2>연도 선택</h2>
    <button onclick="selectYear('2020')">2020년도</button>
    <button onclick="selectYear('2021')">2021년도</button>
    <button onclick="selectYear('2022')">2022년도</button>
    <button onclick="selectYear('2023')">2023년도</button>
    <button onclick="selectYear('2024')">2024년도</button>
  `;
  subjectSelect.innerHTML = '';
  questionBox.innerHTML = '';
  navButtons.style.display = 'none';
  buttons.style.display = 'none';
  allAnswersDiv.innerHTML = '';
}

function selectYear(year) {
  selectedYear = year;
  showSubjectSelect();
}

function showSubjectSelect() {
  const subjects = [
    { id: 'gakron', name: '부동산학개론' },
    { id: 'mlaw', name: '민법 및 민사특별법' },
    { id: 'gong', name: '부동산공법' },
    { id: 'saup', name: '부동산중개사법령 및 실무' },
    { id: 'gongsisa', name: '부동산공시법' }
  ];

  subjectSelect.innerHTML = `<h2>과목 선택</h2>` + 
    subjects.map(subj => `<button onclick="selectSubject('${subj.id}')">${subj.name}</button>`).join('');

  yearSelect.innerHTML = '';
  questionBox.innerHTML = '';
  navButtons.style.display = 'none';
  buttons.style.display = 'none';
  allAnswersDiv.innerHTML = '';
}

async function selectSubject(subject) {
  selectedSubject = subject;
  problemsData = await loadProblems(selectedYear, selectedSubject);
  if (problemsData.length > 0) {
    currentQuestions = problemsData;
    currentQuestionIndex = 0;
    wrongAnswers = [];
    showQuestion();
  }
}

function showQuestion() {
  const q = currentQuestions[currentQuestionIndex];
  questionBox.innerHTML = `
    <h2>Q${currentQuestionIndex + 1}. ${q.question}</h2>
    ${q.choices.map((choice, idx) => `
      <button onclick="checkAnswer(${idx})">${idx + 1}. ${choice}</button>
    `).join('')}
    <div id="explanation" style="display:none;"></div>
  `;

  navButtons.style.display = 'block';
  buttons.style.display = 'block';
  subjectSelect.innerHTML = '';
  allAnswersDiv.innerHTML = '';

  backToMainBtn.onclick = showYearSelect;
  showAnswersBtn.onclick = showWrongAnswers;
}

function checkAnswer(idx) {
  const q = currentQuestions[currentQuestionIndex];
  const buttons = questionBox.querySelectorAll('button');

  buttons.forEach(btn => btn.disabled = true);

  if (idx === q.answer) {
    buttons[idx].classList.add('correct');
  } else {
    buttons[idx].classList.add('incorrect');
    buttons[q.answer].classList.add('correct');
    wrongAnswers.push({
      question: q.question,
      yourAnswer: q.choices[idx],
      correctAnswer: q.choices[q.answer],
      explanation: q.explanation
    });
  }

  const explanation = document.getElementById('explanation');
  explanation.innerHTML = `<b>해설:</b> ${q.explanation}`;
  explanation.style.display = 'block';
}

prevQuestionBtn.onclick = () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    showQuestion();
  }
};

nextQuestionBtn.onclick = () => {
  if (currentQuestionIndex < currentQuestions.length - 1) {
    currentQuestionIndex++;
    showQuestion();
  } else {
    showWrongAnswers();
  }
};

function showWrongAnswers() {
  yearSelect.innerHTML = '';
  subjectSelect.innerHTML = '';
  questionBox.innerHTML = '';
  navButtons.style.display = 'none';
  buttons.style.display = 'block';

  if (wrongAnswers.length === 0) {
    allAnswersDiv.innerHTML = '<h2>🎉 모든 문제를 정답으로 맞혔습니다!</h2>';
    return;
  }

  allAnswersDiv.innerHTML = '<h2>📚 오답노트</h2>' +
    wrongAnswers.map((w, idx) => `
      <div>
        <h3>Q${idx + 1}. ${w.question}</h3>
        <p><b>당신의 답:</b> ${w.yourAnswer}</p>
        <p><b>정답:</b> ${w.correctAnswer}</p>
        <p><b>해설:</b> ${w.explanation}</p>
      </div>
      <hr>
    `).join('');
}

// 앱 처음 시작
showYearSelect();
