const app = document.getElementById('app');
const yearSelect = document.getElementById('year-select');
const subjectSelect = document.getElementById('subject-select');
const questionBox = document.getElementById('question-box');
const backToMainBtn = document.getElementById('back-to-main');
const showWrongAnswersBtn = document.getElementById('show-wrong-answers');
const navButtons = document.getElementById('nav-buttons');
const prevBtn = document.getElementById('prev-question');
const nextBtn = document.getElementById('next-question');
const allAnswersDiv = document.getElementById('all-answers');

const availableYears = ['2024']; // << 문제 데이터 있는 연도만 나열
const subjects = [
  { code: 'gakron', name: '부동산학개론' },
  { code: 'mlaw', name: '민법 및 민사특별법' },
  { code: 'gong', name: '부동산공법' },
  { code: 'sa', name: '부동산중개사법령 및 실무' },
  { code: 'si', name: '부동산공시법' }
];

let problemsData = [];
let currentQuestionIndex = 0;
let selectedYear = '';
let selectedSubject = '';
let wrongAnswers = [];

function showYearSelect() {
  yearSelect.innerHTML = '';
  subjectSelect.innerHTML = '';
  questionBox.innerHTML = '';
  allAnswersDiv.innerHTML = '';
  backToMainBtn.style.display = 'none';
  showWrongAnswersBtn.style.display = 'none';
  navButtons.style.display = 'none';

  availableYears.forEach(year => {
    const btn = document.createElement('button');
    btn.textContent = `${year}년도`;
    btn.onclick = () => showSubjectSelect(year);
    yearSelect.appendChild(btn);
  });
}

function showSubjectSelect(year) {
  selectedYear = year;
  yearSelect.innerHTML = '';
  subjectSelect.innerHTML = '';

  subjects.forEach(subj => {
    const btn = document.createElement('button');
    btn.textContent = subj.name;
    btn.onclick = () => loadProblems(year, subj.code);
    subjectSelect.appendChild(btn);
  });

  const backBtn = document.createElement('button');
  backBtn.textContent = '메인으로 가기';
  backBtn.onclick = showYearSelect;
  subjectSelect.appendChild(backBtn);
}

async function loadProblems(year, subjectCode) {
  selectedSubject = subjectCode;
  try {
    const res = await fetch(`problems/${year}_${subjectCode}.json`);
    if (!res.ok) throw new Error('문제 파일을 불러올 수 없습니다.');
    problemsData = await res.json();
    currentQuestionIndex = 0;
    wrongAnswers = [];
    showQuestion();
    backToMainBtn.style.display = 'inline-block';
    showWrongAnswersBtn.style.display = 'inline-block';
    navButtons.style.display = 'flex';
  } catch (error) {
    alert(error.message);
  }
}

function showQuestion() {
  if (!problemsData.length) return;

  const q = problemsData[currentQuestionIndex];
  questionBox.innerHTML = `
    <h2>Q${currentQuestionIndex + 1}. ${q.question}</h2>
    ${q.choices.map((choice, idx) => `
      <button class="choice" onclick="selectAnswer(${idx + 1})">${idx + 1}. ${choice}</button>
    `).join('')}
    <div class="explanation" style="display:none;"></div>
  `;
}

function selectAnswer(selected) {
  const q = problemsData[currentQuestionIndex];
  const choiceBtns = document.querySelectorAll('.choice');
  choiceBtns.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx + 1 === q.answer) {
      btn.classList.add('correct');
    }
    if (idx + 1 === selected && idx + 1 !== q.answer) {
      btn.classList.add('incorrect');
    }
  });

  if (selected !== q.answer) {
    wrongAnswers.push({
      question: q.question,
      yourAnswer: selected,
      correctAnswer: `${q.answer}. ${q.choices[q.answer - 1]}`,
      explanation: q.explanation
    });
  }

  document.querySelector('.explanation').style.display = 'block';
  document.querySelector('.explanation').innerHTML = `<b>해설:</b> ${q.explanation}`;
}

prevBtn.onclick = () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    showQuestion();
  }
};

nextBtn.onclick = () => {
  if (currentQuestionIndex < problemsData.length - 1) {
    currentQuestionIndex++;
    showQuestion();
  }
};

backToMainBtn.onclick = showYearSelect;

showWrongAnswersBtn.onclick = () => {
  yearSelect.innerHTML = '';
  subjectSelect.innerHTML = '';
  questionBox.innerHTML = '';
  navButtons.style.display = 'none';

  if (wrongAnswers.length === 0) {
    allAnswersDiv.innerHTML = `<h2>모든 문제를 정답으로 맞혔습니다! 🎉</h2>`;
    return;
  }

  allAnswersDiv.innerHTML = `<h2>🧾 오답노트</h2>` +
    wrongAnswers.map((w, idx) => `
      <div>
        <h3>Q${idx + 1}. ${w.question}</h3>
        <p><b>당신의 답:</b> ${w.yourAnswer}번</p>
        <p><b>정답:</b> ${w.correctAnswer}</p>
        <p><b>해설:</b> ${w.explanation}</p>
      </div>
      <hr/>
    `).join('');
};

showYearSelect();
