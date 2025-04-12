const yearSelect = document.getElementById('year-select');
const subjectSelect = document.getElementById('subject-select');
const questionBox = document.getElementById('question-box');
const navButtons = document.getElementById('buttons');
const backToMainBtn = document.getElementById('back-to-main');
const showAnswersBtn = document.getElementById('show-answers');
const allAnswersDiv = document.getElementById('all-answers');
const prevBtn = document.getElementById('prev-question');
const nextBtn = document.getElementById('next-question');

let currentQuestions = [];
let currentIndex = 0;
let wrongAnswers = [];
let selectedYear = '';
let selectedSubject = '';

function showYearSelect() {
  yearSelect.innerHTML = `
    <h2>연도 선택</h2>
    <button onclick="selectYear('2024')">2024년도</button>
  `;
  subjectSelect.innerHTML = '';
  questionBox.innerHTML = '';
  navButtons.style.display = 'none';
  allAnswersDiv.innerHTML = '';
}

function selectYear(year) {
  selectedYear = year;
  yearSelect.innerHTML = '';
  showSubjectSelect();
}

function showSubjectSelect() {
  subjectSelect.innerHTML = `
    <h2>과목 선택</h2>
    <button onclick="selectSubject('mlaw')">민법 및 민사특별법</button>
  `;
  questionBox.innerHTML = '';
  navButtons.style.display = 'none';
  allAnswersDiv.innerHTML = '';
}

async function selectSubject(subject) {
  selectedSubject = subject;
  const res = await fetch(`problems/${selectedYear}_${subject}.json`);
  const data = await res.json();
  currentQuestions = data;
  currentIndex = 0;
  wrongAnswers = [];
  showQuestion();
}

function showQuestion() {
  const q = currentQuestions[currentIndex];
  questionBox.innerHTML = `
    <h2>Q${currentIndex + 1}. ${q.question}</h2>
    ${q.choices.map((choice, idx) => `
      <button onclick="checkAnswer(${idx})">${idx + 1}. ${choice}</button>
    `).join('')}
    <div id="explanation" style="display:none;"></div>
  `;
  subjectSelect.innerHTML = '';
  navButtons.style.display = 'block';
}

function checkAnswer(choiceIdx) {
  const q = currentQuestions[currentIndex];
  const buttons = questionBox.querySelectorAll('button');
  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answer) btn.classList.add('correct');
    if (i === choiceIdx && choiceIdx !== q.answer) btn.classList.add('wrong');
  });

  if (choiceIdx !== q.answer) {
    wrongAnswers.push({
      question: q.question,
      yourAnswerNumber: choiceIdx + 1,
      yourAnswer: q.choices[choiceIdx],
      correctAnswerNumber: q.answer + 1,
      correctAnswer: q.choices[q.answer],
      explanation: q.explanation
    });
  }

  const explanation = document.getElementById('explanation');
  explanation.innerHTML = `<b>해설:</b> ${q.explanation}`;
  explanation.style.display = 'block';
}

prevBtn.onclick = () => {
  if (currentIndex > 0) {
    currentIndex--;
    showQuestion();
  }
};

nextBtn.onclick = () => {
  if (currentIndex < currentQuestions.length - 1) {
    currentIndex++;
    showQuestion();
  } else {
    showWrongAnswers();
  }
};

backToMainBtn.onclick = showYearSelect;

showAnswersBtn.onclick = showWrongAnswers;

function showWrongAnswers() {
  questionBox.innerHTML = '';
  navButtons.style.display = 'none';
  allAnswersDiv.innerHTML = '';

  if (wrongAnswers.length === 0) {
    allAnswersDiv.innerHTML = `<h2>🎉 모든 문제를 정답으로 맞혔습니다!</h2>`;
    return;
  }

  allAnswersDiv.innerHTML = `
    <h2>📚 오답노트</h2>
    ${wrongAnswers.map((w, idx) => `
      <div>
        <h3>Q${idx + 1}. ${w.question}</h3>
        <p><b>당신의 답:</b> (${w.yourAnswerNumber}번) ${w.yourAnswer}</p>
        <p><b>정답:</b> (${w.correctAnswerNumber}번) ${w.correctAnswer}</p>
        <p><b>해설:</b> ${w.explanation}</p>
      </div>
      <hr/>
    `).join('')}
  `;
}

showYearSelect();
