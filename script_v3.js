const app = document.getElementById('app');
const yearSelect = document.getElementById('year-select');
const subjectSelect = document.getElementById('subject-select');
const questionBox = document.getElementById('question-box');
const backToMainBtn = document.getElementById('back-to-main');
const showAnswersBtn = document.getElementById('show-answers');
const navButtons = document.getElementById('nav-buttons');
const prevQuestionBtn = document.getElementById('prev-question');
const nextQuestionBtn = document.getElementById('next-question');
const allAnswersBox = document.getElementById('all-answers');

let currentYear = '';
let currentSubject = '';
let problems = [];
let currentQuestionIndex = 0;
let wrongAnswers = [];
let score = 0;

const subjects = {
  "mlaw": "민법 및 민사특별법",
  "gongron": "부동산학개론",
  "gongbeop": "부동산공법",
  "sebub": "부동산세법",
  "junggae": "부동산공시법 및 중개실무"
};

// 메인 화면
function showMain() {
  yearSelect.innerHTML = '';
  subjectSelect.innerHTML = '';
  questionBox.innerHTML = '';
  allAnswersBox.innerHTML = '';
  backToMainBtn.style.display = 'none';
  showAnswersBtn.style.display = 'none';
  navButtons.style.display = 'none';

  const years = [2024]; // ✅ 이제 2024년만 고정
  years.forEach(year => {
    const btn = document.createElement('button');
    btn.textContent = `${year}년도`;
    btn.className = 'year-btn';
    btn.onclick = () => showSubjects(year);
    yearSelect.appendChild(btn);
  });
}

// 과목 선택 화면
function showSubjects(year) {
  currentYear = year;
  yearSelect.innerHTML = '';
  subjectSelect.innerHTML = '';
  questionBox.innerHTML = '';
  allAnswersBox.innerHTML = '';

  Object.entries(subjects).forEach(([code, name]) => {
    const btn = document.createElement('button');
    btn.textContent = name;
    btn.className = 'subject-btn';
    btn.onclick = () => loadProblems(year, code);
    subjectSelect.appendChild(btn);
  });

  backToMainBtn.style.display = 'inline-block';
  showAnswersBtn.style.display = 'none';
  navButtons.style.display = 'none';
}

// 문제 로드
async function loadProblems(year, subjectCode) {
  try {
    const response = await fetch(`/gichul/problems/${year}_${subjectCode}_full.json`);
    if (!response.ok) throw new Error('문제 파일을 불러올 수 없습니다.');
    problems = await response.json();
    currentSubject = subjectCode;
    currentQuestionIndex = 0;
    wrongAnswers = [];
    score = 0;
    subjectSelect.innerHTML = '';
    showQuestion();
  } catch (error) {
    alert(error.message);
  }
}

// 문제 표시
function showQuestion() {
  if (currentQuestionIndex >= problems.length) {
    showResult();
    return;
  }

  const problem = problems[currentQuestionIndex];
  questionBox.innerHTML = `
    <div class="question">
      <h2>Q${currentQuestionIndex + 1}. ${problem.question}</h2>
      <div class="choices" id="choices-container"></div>
    </div>
  `;

  const choicesContainer = document.getElementById('choices-container');
  problem.choices.forEach((choice, idx) => {
    const btn = document.createElement('button');
    btn.textContent = `${idx + 1}. ${choice}`;
    btn.onclick = () => selectAnswer(idx + 1);
    choicesContainer.appendChild(btn);
  });

  backToMainBtn.style.display = 'inline-block';
  showAnswersBtn.style.display = 'inline-block';
  showAnswersBtn.textContent = "📝 오답노트 보기";
  navButtons.style.display = 'flex';
  allAnswersBox.style.display = 'none';
}

// 답변 선택
function selectAnswer(selected) {
  const problem = problems[currentQuestionIndex];
  const buttons = document.querySelectorAll('.choices button');
  buttons.forEach(btn => btn.disabled = true);

  if (selected === problem.answer) {
    score++;
  } else {
    wrongAnswers.push({
      question: problem.question,
      selected: selected,
      correct: problem.answer,
      explanation: problem.explanation,
      correctText: problem.choices[problem.answer - 1]
    });
  }

  buttons[selected - 1].classList.add(selected === problem.answer ? 'correct' : 'wrong');
  buttons[problem.answer - 1].classList.add('correct');
}

// 다음 문제
nextQuestionBtn.onclick = () => {
  currentQuestionIndex++;
  showQuestion();
};

// 이전 문제
prevQuestionBtn.onclick = () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    showQuestion();
  }
};

// 오답노트 보기
showAnswersBtn.onclick = () => {
  allAnswersBox.innerHTML = `
    <h2>📝 오답노트</h2>
    ${wrongAnswers.length === 0 ? '<p>모든 문제를 맞췄습니다! 🎉</p>' : ''}
    ${wrongAnswers.map((w, idx) => `
      <div class="wrong-answer">
        <h3>Q${idx + 1}. ${w.question}</h3>
        <p><b>내 답:</b> ${w.selected}번</p>
        <p><b>정답:</b> ${w.correct}번 (${w.correctText})</p>
        <p><b>해설:</b> ${w.explanation}</p>
      </div>
    `).join('')}
    <div class="final-score">최종 점수: ${score} / ${problems.length}</div>
  `;
  allAnswersBox.style.display = 'block';
  questionBox.innerHTML = '';
  navButtons.style.display = 'none';
  backToMainBtn.style.display = 'inline-block';
};

// 메인으로 가기
backToMainBtn.onclick = showMain;

// 시작
showMain();
