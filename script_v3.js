let problemsData = {};
let currentQuestions = [];
let currentIndex = 0;

// ✅ JSON 파일 절대경로 fetch
async function loadProblems(year) {
  const baseUrl = 'https://rokmcjy.github.io/gichul';  // 너 깃허브 주소
  try {
    const res = await fetch(`${baseUrl}/problems/${year}.json`);

    console.log('✅ fetch 응답 상태:', res.status);
    console.log('✅ fetch 응답 OK?:', res.ok);

    if (!res.ok) {
      throw new Error(`문제 파일을 불러올 수 없습니다: ${res.status}`);
    }

    problemsData = await res.json();
    console.log('✅ 불러온 problemsData:', problemsData);
  } catch (error) {
    console.error('❌ fetch 오류 발생:', error);
    problemsData = []; // 실패 시 빈 배열로 초기화
  }
}

// ✅ 과목 리스트 표시
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

  subjectDiv.style.display = 'block'; // 혹시 숨겨져 있던거 다시 보이게
}

// ✅ 과목 선택 → 문제풀이 시작
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

// ✅ 문제 하나 표시
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

// ✅ 정답 체크
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

// ✅ 전체 정답 보기
function showAllAnswers() {
  const answersDiv = document.getElementById('all-answers');
  answersDiv.innerHTML = currentQuestions.map((q, idx) => `
    ${idx + 1}번 문제 정답: ${q.answer}
  `).join('<br>');
}

// ✅ 메인화면으로 돌아가기
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

    // ✅ 버튼 클릭할 때 문제 불러오기
    btn.onclick = async () => {
      await loadProblems(year);
      renderSubjects();
    };

    yearDiv.appendChild(btn);
  });

  yearDiv.style.display = 'block';
}

// ✅ 문서 로딩 완료 후 실행
document.addEventListener('DOMContentLoaded', () => {
  renderYearSelect();

  document.getElementById('show-answers').onclick = showAllAnswers;
  document.getElementById('back-to-main').onclick = backToMain;
  document.getElementById('next-question').onclick = nextQuestion;
  document.getElementById('prev-question').onclick = prevQuestion;
});
