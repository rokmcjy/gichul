let problemsData = {};
let selectedYear = null;
let selectedSubject = null;
let currentProblems = [];
let currentIndex = 0;
let wrongAnswers = [];
let correctCount = 0;

const app = document.getElementById('app');

function resetState() {
  selectedYear = null;
  selectedSubject = null;
  currentProblems = [];
  currentIndex = 0;
  wrongAnswers = [];
  correctCount = 0;
}

function createButton(text, onClick) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.onclick = onClick;
  return btn;
}

function loadProblems(year, subject) {
  const fileName = `problems/${year}_${subject}.json`;
  fetch(fileName)
    .then(response => {
      if (!response.ok) throw new Error('문제 파일을 불러올 수 없습니다.');
      return response.json();
    })
    .then(data => {
      currentProblems = data;
      currentIndex = 0;
      correctCount = 0;
      wrongAnswers = [];
      showQuestion();
    })
    .catch(error => {
      alert(error.message);
    });
}

function showYears() {
  resetState();
  app.innerHTML = '<h1>공인중개사 문제풀이</h1>';
  const yearSelect = document.createElement('div');
  yearSelect.id = 'year-select';
  
  const availableYears = Object.keys(problemsData);
  availableYears.forEach(year => {
    const btn = createButton(`${year}년도`, () => showSubjects(year));
    yearSelect.appendChild(btn);
  });

  app.appendChild(yearSelect);
}

function showSubjects(year) {
  selectedYear = year;
  app.innerHTML = '<h1>공인중개사 문제풀이</h1>';
  const subjectSelect = document.createElement('div');
  subjectSelect.id = 'subject-select';

  const subjects = problemsData[year];
  subjects.forEach(subject => {
    const btn = createButton(subject.name, () => {
      selectedSubject = subject.code;
      loadProblems(year, selectedSubject);
    });
    subjectSelect.appendChild(btn);
  });

  const mainBtn = createButton('메인으로 가기', showYears);
  subjectSelect.appendChild(mainBtn);

  app.appendChild(subjectSelect);
}

function showQuestion() {
  if (currentIndex >= currentProblems.length) {
    showResultSummary();
    return;
  }

  const currentProblem = currentProblems[currentIndex];
  app.innerHTML = `
    <h1>공인중개사 문제풀이</h1>
    <div id="question-box">
      <h2>Q${currentIndex + 1}. ${currentProblem.question}</h2>
    </div>
    <div id="buttons">
      <button id="main-menu">메인으로 가기</button>
      <button id="show-wrong-note">?? 오답노트 보기</button>
    </div>
    <div id="nav-buttons">
      <button id="prev-question">이전 문제</button>
      <button id="next-question">다음 문제</button>
    </div>
  `;

  const questionBox = document.getElementById('question-box');

  currentProblem.choices.forEach((choice, i) => {
    const btn = createButton(`${i + 1}. ${choice}`, () => {
      handleAnswer(btn, i, currentProblem.answer);
    });
    questionBox.appendChild(btn);
  });

  document.getElementById('main-menu').onclick = showYears;
  document.getElementById('show-wrong-note').onclick = showWrongNote;
  document.getElementById('prev-question').onclick = prevQuestion;
  document.getElementById('next-question').onclick = nextQuestion;
}

function handleAnswer(btn, selectedIndex, answerIndex) {
  const buttons = document.querySelectorAll('#question-box button');
  buttons.forEach(button => button.disabled = true);

  buttons[answerIndex].classList.add('correct');

  if (selectedIndex !== answerIndex) {
    btn.classList.add('incorrect');
    wrongAnswers.push({
      question: currentProblems[currentIndex].question,
      selected: selectedIndex,
      correct: answerIndex,
      explanation: currentProblems[currentIndex].explanation
    });
  } else {
    correctCount++;
  }
}

function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    showQuestion();
  }
}

function nextQuestion() {
  if (currentIndex < currentProblems.length - 1) {
    currentIndex++;
    showQuestion();
  }
}

function showWrongNote() {
  app.innerHTML = '<h1>?? 오답노트</h1>';
  
  if (wrongAnswers.length === 0) {
    app.innerHTML += '<p>오답이 없습니다! ??</p>';
  } else {
    wrongAnswers.forEach((item, idx) => {
      const div = document.createElement('div');
      div.innerHTML = `
        <h3>Q${idx + 1}. ${item.question}</h3>
        <p><strong>선택한 답:</strong> ${item.selected + 1}번</p>
        <p><strong>정답:</strong> ${item.correct + 1}번 (${currentProblems[item.correct].choices[item.correct]})</p>
        <p><strong>해설:</strong> ${item.explanation}</p>
      `;
      app.appendChild(div);
    });
  }

  const mainBtn = createButton('메인으로 가기', showYears);
  app.appendChild(mainBtn);
}

function showResultSummary() {
  app.innerHTML = `
    <h1>문제풀이 완료</h1>
    <h2>정답 개수: ${correctCount} / ${currentProblems.length}</h2>
  `;

  const mainBtn = createButton('메인으로 가기', showYears);
  const wrongNoteBtn = createButton('?? 오답노트 보기', showWrongNote);

  app.appendChild(mainBtn);
  app.appendChild(wrongNoteBtn);
}

// 문제 데이터 정의
problemsData = {
  "2024": [
    { code: "gakron", name: "부동산학개론" },
    { code: "mlaw", name: "민법 및 민사특별법" },
    { code: "gong", name: "부동산공법" },
    { code: "sa", name: "공인중개사법령 및 실무" },
    { code: "si", name: "부동산공시법" },
    { code: "se", name: "부동산세법" }
  ],
  "2023": [
    { code: "gakron", name: "부동산학개론" },
    { code: "mlaw", name: "민법 및 민사특별법" },
    { code: "gong", name: "부동산공법" },
    { code: "sa", name: "공인중개사법령 및 실무" },
    { code: "si", name: "부동산공시법" },
    { code: "se", name: "부동산세법" }
  ]
  // 2022, 2021, 2020도 비슷하게 추가 가능
};

showYears();
