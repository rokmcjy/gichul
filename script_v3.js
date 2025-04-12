let problemsData = [];
let currentQuestions = [];
let currentIndex = 0;
let correctCount = 0; // ✅ 맞춘 문제 수 저장
let wrongQuestions = []; // ✅ 오답 저장

// ✅ 문제 데이터 불러오기 (캐시 무시)
async function loadProblems(year) {
  const baseUrl = 'https://rokmcjy.github.io/gichul';
  try {
    const res = await fetch(`${baseUrl}/problems/${year}.json`, {
      cache: "no-store"
    });

    console.log('✅ fetch 응답 상태:', res.status);
    console.log('✅ fetch 응답 OK?:', res.ok);

    if (!res.ok) {
      throw new Error(`문제 파일을 불러올 수 없습니다: ${res.status}`);
    }

    problemsData = await res.json();
    console.log('✅ 불러온 problemsData:', problemsData);
  } catch (error) {
    console.error('❌ fetch 오류 발생:', error);
    problemsData = [];
  }
}

// ✅ 과목 버튼 만들기
function renderSubjects() {
  const subjectDiv = document.getElementById('subject-select');
  subjectDiv.innerHTML = '';

  if (!problemsData.length) {
    subjectDiv.innerHTML = '<p style="color:red;">과목 데이터가 없습니다.</p>';
    return;
  }

  const subjects = [...new Set(problemsData.map(p => p.subject))];
  subjects.forEach(subject => {
    const btn = document.createElement('button');
    btn.innerText = subject;
    btn.onclick = () => startQuiz(subject);
    subjectDiv.appendChild(btn);
  });

  subjectDiv.style.display = 'block';
}

// ✅ 퀴즈 시작
function startQuiz(subject) {
  currentQuestions = problemsData.filter(p => p.subject === subject);
  currentIndex = 0;
  correctCount = 0;
  wrongQuestions = [];

  document.getElementById('year-select').style.display = 'none';
  document.getElementById('subject-select').style.display = 'none';
  document.getElementById('back-to-main').style.display = 'block';
  document.getElementById('nav-buttons').style.display = 'flex';
  document.getElementById('all-answers').innerHTML = '';

  renderQuestion();
}

// ✅ 문제 표시
function renderQuestion() {
  const questionBox = document.getElementById('question-box');
  if (currentIndex < 0) currentIndex = 0;
  if (currentIndex >= currentQuestions.length) {
    showResult();
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

// ✅ 정답 체크
function checkAnswer(selected, correct, button) {
  const buttons = document.querySelectorAll('.choice-button');
  buttons.forEach(btn => btn.disabled = true);

  if (selected === correct) {
    correctCount++;
    buttons[selected - 1].classList.add('correct');
  } else {
    wrongQuestions.push(currentQuestions[currentIndex]); // ✅ 오답 저장
    buttons[selected - 1].classList.add('wrong');
    buttons[correct - 1].classList.add('correct');
  }

  setTimeout(() => {
    const explanationBox = document.getElementById('explanation-box');
    explanationBox.innerHTML = `<b>해설:</b> ${button.dataset.explanation}`;
  }, 50);
}

// ✅ 최종 결과 보여주기 (점수 + 오답노트)
function showResult() {
  const questionBox = document.getElementById('question-box');
  questionBox.innerHTML = `
    <h2>🎯 문제풀이 완료!</h2>
    <p><b>맞춘 개수:</b> ${correctCount} / ${currentQuestions.length}</p>
    <button onclick="showWrongQuestions()">오답노트 보기</button>
  `;

  document.getElementById('nav-buttons').style.display = 'none';
}

// ✅ 오답노트 보여주기
function showWrongQuestions() {
  const questionBox = document.getElementById('question-box');

  if (wrongQuestions.length === 0) {
    questionBox.innerHTML = `<h3>오답이 없습니다! 완벽합니다 🎉</h3>`;
    return;
  }

  questionBox.innerHTML = `
    <h2>📚 오답노트</h2>
    ${wrongQuestions.map((q, idx) => `
      <div style="margin-bottom: 20px;">
        <b>Q${idx + 1}. ${q.question}</b><br>
        <i>정답: ${q.answer}번</i><br>
        <div style="margin-top: 5px; font-size: 14px; color: #555;">해설: ${q.explanation}</div>
      </div>
    `).join('')}
    <button onclick="backToMain()">메인으로 가기</button>
  `;
}

// ✅ 메인으로 돌아가기
function backToMain() {
  document.getElementById('year-select').style.display = 'block';
  document.getElementById('year-select').innerHTML = '';
  document.getElementById('subject-select').style.display = 'none';
  document.getElementById('subject-select').innerHTML = '';
  document.getElementById('question-box').innerHTML = '';
  document.getElementById('back-to-main').style.display = 'none';
  document.getElementById('nav-buttons').style.display = 'none';
  document.getElementById('all-answers').innerHTML = '';

  currentQuestions = [];
  currentIndex = 0;
  correctCount = 0;
  wrongQuestions = [];

  renderYearSelect();
}

// ✅ 다음 문제
function nextQuestion() {
  if (currentIndex < currentQuestions.length - 1) {
    currentIndex++;
    renderQuestion();
  }
}

// ✅ 이전 문제
function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
}

// ✅ 년도 버튼 생성
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

  yearDiv.style.display = 'block';
}

// ✅ 문서 로딩 완료 후 실행
window.addEventListener('DOMContentLoaded', () => {
  renderYearSelect();
  document.getElementById('back-to-main').onclick = backToMain;
  document.getElementById('next-question').onclick = nextQuestion;
  document.getElementById('prev-question').onclick = prevQuestion;
});
