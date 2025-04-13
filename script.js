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

// 시험 연도 리스트
const availableYears = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014'];

// 과목 리스트 (실제 공인중개사 시험 과목 구성)
const subjects = {
  '1st': [
    { id: 'relaw', name: '부동산학개론(부동산감정평가론 포함)' },
    { id: 'civil', name: '민법 및 민사특별법(계약법, 물권법 중심)' }
  ],
  '2nd': [
    { id: 'publiclaw', name: '부동산공법(국토계획법, 건축법 등)' },
    { id: 'brokerlaw', name: '부동산중개사법령 및 중개실무' },
    { id: 'regntax', name: '부동산공시법령 및 부동산세법' }
  ]
};

// 메인 연도 선택 화면 표시
function showYearSelect() {
  yearSelect.innerHTML = `
    <h2>연도 선택</h2>
    ${availableYears.map(year => `
      <button onclick="selectYear('${year}')">${year}년도</button>
    `).join('')}
  `;
  subjectSelect.innerHTML = '';
  questionBox.innerHTML = '';
  navButtons.style.display = 'none';
  allAnswersDiv.innerHTML = '';
}

// 연도 선택시 실행
function selectYear(year) {
  selectedYear = year;
  yearSelect.innerHTML = `<h2>선택한 연도: ${year}년</h2>`;
  showExamSelect();
}

// 시험 유형 선택 화면 표시 (1차/2차)
function showExamSelect() {
  subjectSelect.innerHTML = `
    <h2>시험 유형 선택</h2>
    <button onclick="showSubjectSelect('1st')">1차 시험</button>
    <button onclick="showSubjectSelect('2nd')">2차 시험</button>
  `;
  questionBox.innerHTML = '';
  navButtons.style.display = 'none';
  allAnswersDiv.innerHTML = '';
}

// 과목 선택 화면 표시
function showSubjectSelect(examType) {
  const subjectList = subjects[examType];
  
  subjectSelect.innerHTML = `
    <h2>과목 선택</h2>
    ${subjectList.map(subject => `
      <button onclick="selectSubject('${subject.id}')">${subject.name}</button>
    `).join('')}
    <button onclick="showYearSelect()" class="back-button">뒤로 가기</button>
  `;
  
  questionBox.innerHTML = '';
  navButtons.style.display = 'none';
  allAnswersDiv.innerHTML = '';
}

// 과목 선택시 문제 불러오기
async function selectSubject(subject) {
  selectedSubject = subject;
  const subjectName = [...subjects['1st'], ...subjects['2nd']]
    .find(s => s.id === subject).name;
  
  try {
    // 문제 데이터 파일 가져오기
    const res = await fetch(`problems/${selectedYear}_${subject}.json`);
    
    if (!res.ok) {
      throw new Error(`문제 데이터를 불러올 수 없습니다 (${res.status})`);
    }
    
    const data = await res.json();
    currentQuestions = data;
    currentIndex = 0;
    wrongAnswers = [];
    
    // 문제 표시
    showQuestion();
    
    // 상단에 선택된 정보 표시
    subjectSelect.innerHTML = `
      <h2>${selectedYear}년 ${subjectName}</h2>
      <p>총 ${currentQuestions.length}문제</p>
    `;
  } catch (error) {
    console.error('Error loading questions:', error);
    questionBox.innerHTML = `
      <div class="error">
        <h2>문제 데이터를 불러올 수 없습니다</h2>
        <p>${error.message}</p>
        <button onclick="showYearSelect()">메인으로 돌아가기</button>
      </div>
    `;
  }
}

// 현재 문제 표시
function showQuestion() {
  if (currentQuestions.length === 0) {
    questionBox.innerHTML = '<p>문제가 없습니다.</p>';
    return;
  }
  
  const q = currentQuestions[currentIndex];
  questionBox.innerHTML = `
    <h2>Q${currentIndex + 1}. ${q.question}</h2>
    <div class="choices">
      ${q.choices.map((choice, idx) => `
        <button onclick="checkAnswer(${idx})">${idx + 1}. ${choice}</button>
      `).join('')}
    </div>
    <div id="explanation" style="display:none;"></div>
    <div class="progress">문제 ${currentIndex + 1} / ${currentQuestions.length}</div>
  `;
  
  navButtons.style.display = 'block';
  
  // 이전/다음 버튼
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = false;
}

// 선택한 답변 확인
function checkAnswer(choiceIdx) {
  const q = currentQuestions[currentIndex];
  const buttons = questionBox.querySelectorAll('.choices button');
  
  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answer) btn.classList.add('correct');
    if (i === choiceIdx && choiceIdx !== q.answer) btn.classList.add('wrong');
  });
  
  // 오답 기록
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
  
  // 해설 표시
  const explanation = document.getElementById('explanation');
  explanation.innerHTML = `<b>해설:</b> ${q.explanation}`;
  explanation.style.display = 'block';
}

// 이전 문제 버튼
prevBtn.onclick = () => {
  if (currentIndex > 0) {
    currentIndex--;
    showQuestion();
  }
};

// 다음 문제 버튼
nextBtn.onclick = () => {
  if (currentIndex < currentQuestions.length - 1) {
    currentIndex++;
    showQuestion();
  } else {
    // 마지막 문제면 결과 표시
    showResults();
  }
};

// 메인으로 돌아가기 버튼
backToMainBtn.onclick = showYearSelect;

// 오답노트 보기 버튼
showAnswersBtn.onclick = showWrongAnswers;

// 결과 화면 표시
function showResults() {
  questionBox.innerHTML = `
    <h2>테스트 완료!</h2>
    <p>총 ${currentQuestions.length}문제 중 ${currentQuestions.length - wrongAnswers.length}개 정답</p>
    <p>정답률: ${Math.round((currentQuestions.length - wrongAnswers.length) / currentQuestions.length * 100)}%</p>
    <div class="button-row" style="margin-top: 20px;">
      <button onclick="showYearSelect()">다른 시험 선택</button>
      <button onclick="showWrongAnswers()">오답노트 보기</button>
    </div>
  `;
  
  navButtons.style.display = 'none';
}

// 오답노트 표시
function showWrongAnswers() {
  questionBox.innerHTML = '';
  navButtons.style.display = 'none';
  allAnswersDiv.innerHTML = '';
  
  if (wrongAnswers.length === 0) {
    allAnswersDiv.innerHTML = `
      <h2>🎉 모든 문제를 정답으로 맞혔습니다!</h2>
      <button onclick="showYearSelect()">메인으로 돌아가기</button>
    `;
    return;
  }
  
  allAnswersDiv.innerHTML = `
    <h2>📚 오답노트 (${wrongAnswers.length}문제)</h2>
    ${wrongAnswers.map((w, idx) => `
      <div>
        <h3>Q${idx + 1}. ${w.question}</h3>
        <p><b>당신의 답:</b> (${w.yourAnswerNumber}번) ${w.yourAnswer}</p>
        <p><b>정답:</b> (${w.correctAnswerNumber}번) ${w.correctAnswer}</p>
        <p><b>해설:</b> ${w.explanation}</p>
      </div>
      <hr/>
    `).join('')}
    <button onclick="showYearSelect()">메인으로 돌아가기</button>
  `;
}

// 앱 시작
showYearSelect();