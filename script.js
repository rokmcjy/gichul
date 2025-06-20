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
let correctAnswers = 0; // 맞은 문제 개수
let selectedYear = '';
let selectedSubject = '';

function showYearSelect() {
  yearSelect.innerHTML = `
    <h2>연도 선택</h2>
    <button onclick="selectYear('2024')">2024년도</button>
    <button onclick="selectYear('2023')">2023년도</button>
    <button onclick="selectYear('2022')">2022년도</button>
    <button onclick="selectYear('2021')">2021년도</button>
    <button onclick="selectYear('2020')">2020년도</button>
    <button onclick="selectYear('2019')">2019년도</button>
    <button onclick="selectYear('2018')">2018년도</button>
    <button onclick="selectYear('2017')">2017년도</button>
    <button onclick="selectYear('2016')">2016년도</button>
    <button onclick="selectYear('2015')">2015년도</button>
    <button onclick="selectYear('2014')">2014년도</button>
    <div class="button-row">
      <button onclick="showSavedWrongAnswers()">저장된 오답노트 보기</button>
    </div>
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
    <h3>1차 시험</h3>
    <button onclick="selectSubject('relaw')">부동산학개론(부동산감정평가론 포함)</button>
    <button onclick="selectSubject('civil')">민법 및 민사특별법(계약법, 물권법 중심)</button>
    <h3>2차 시험</h3>
    <button onclick="selectSubject('publiclaw')">부동산공법(국토계획법, 건축법 등)</button>
    <button onclick="selectSubject('brokerlaw')">부동산중개사법령 및 중개실무</button>
    <button onclick="selectSubject('regntax')">부동산공시법령 및 부동산세법</button>
    <div class="button-row">
      <button onclick="showYearSelect()">메인으로 가기</button>
    </div>
  `;
  questionBox.innerHTML = '';
  navButtons.style.display = 'none';
  allAnswersDiv.innerHTML = '';
}

async function selectSubject(subject) {
  selectedSubject = subject;
  try {
    console.log(`파일 로드 시도: problems/${selectedYear}_${subject}.json`);
    
    const res = await fetch(`problems/${selectedYear}_${subject}.json`);
    
    if (!res.ok) {
      throw new Error(`HTTP 오류! 상태: ${res.status}`);
    }
    
    const data = await res.json();
    currentQuestions = data;
    currentIndex = 0;
    wrongAnswers = [];
    correctAnswers = 0; // 맞은 문제 개수 초기화
    showQuestion();
  } catch (error) {
    console.error('문제를 불러오는데 실패했습니다:', error);
    questionBox.innerHTML = `
      <h2>문제를 불러오는데 실패했습니다</h2>
      <p>요청한 ${selectedYear}년도 ${getSubjectName(subject)} 문제를 찾을 수 없습니다.</p>
      <p>에러 메시지: ${error.message}</p>
      <div class="button-row">
        <button onclick="showSubjectSelect()">돌아가기</button>
      </div>
    `;
    navButtons.style.display = 'none';
  }
}

function showQuestion() {
  const q = currentQuestions[currentIndex];
  questionBox.innerHTML = `
    <h2>Q${currentIndex + 1}. ${q.question}</h2>
    ${q.choices.map((choice, idx) => `
      <button onclick="checkAnswer(${idx})">${idx + 1}. ${choice}</button>
    `).join('')}
    <div id="explanation" style="display:none;"></div>
    <div class="progress">문제 ${currentIndex + 1} / ${currentQuestions.length}</div>
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
  if (choiceIdx === q.answer) {
    correctAnswers++; // 정답인 경우 맞은 문제 개수 증가
  } else {
    wrongAnswers.push({
      questionNumber: q.number || (currentIndex + 1), // 실제 문제 번호 저장
      subject: selectedSubject,
      year: selectedYear,
      question: q.question,
      yourAnswerNumber: choiceIdx + 1,
      yourAnswer: q.choices[choiceIdx],
      correctAnswerNumber: q.answer + 1,
      correctAnswer: q.choices[q.answer],
      explanation: q.explanation,
      date: new Date().toISOString()
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

function saveWrongAnswers() {
  if (wrongAnswers.length === 0) {
    alert('저장할 오답이 없습니다.');
    return;
  }
  
  // 기존 저장된 오답노트 불러오기
  let savedAnswers = JSON.parse(localStorage.getItem('wrongAnswers')) || [];
  
  // 오늘 날짜와 과목 정보를 포함한 오답노트 식별자 생성
  const today = new Date().toISOString().split('T')[0];
  // 고유 ID 생성 (현재 시간의 타임스탬프 사용)
  const timestamp = new Date().getTime();
  const noteId = `${today}_${selectedYear}_${selectedSubject}_${timestamp}`;
  
  // 새로운 오답 추가
  const newNote = {
    id: noteId,
    year: selectedYear,
    subject: selectedSubject,
    date: today,
    timestamp: timestamp, // 저장 시간 기록
    totalQuestions: currentQuestions.length,
    correctAnswers: correctAnswers,
    wrongAnswers: wrongAnswers
  };
  
  // 새 노트 추가
  savedAnswers.push(newNote);
  
  // 로컬 스토리지에 저장
  localStorage.setItem('wrongAnswers', JSON.stringify(savedAnswers));
  alert('오답노트가 저장되었습니다.');
}

function showWrongAnswers() {
  questionBox.innerHTML = '';
  navButtons.style.display = 'none';
  allAnswersDiv.innerHTML = '';
  
  if (wrongAnswers.length === 0) {
    allAnswersDiv.innerHTML = `
      <h2>🎉 문제 결과</h2>
      <p class="stats-summary"><b>총 ${currentQuestions.length}문제 중 ${correctAnswers}문제 정답, ${currentQuestions.length - correctAnswers}문제 오답</b></p>
      <h3>모든 문제를 정답으로 맞혔습니다!</h3>
      <div class="button-row">
        <button onclick="showYearSelect()">메인으로 가기</button>
      </div>
    `;
    return;
  }
  
  allAnswersDiv.innerHTML = `
    <h2>📚 오답노트</h2>
    <p class="stats-summary"><b>총 ${currentQuestions.length}문제 중 ${correctAnswers}문제 정답, ${wrongAnswers.length}문제 오답</b></p>
    ${wrongAnswers.map((w) => `
      <div>
        <h3>${w.questionNumber}번. ${w.question}</h3>
        <p><b>당신의 답:</b> (${w.yourAnswerNumber}번) ${w.yourAnswer}</p>
        <p><b>정답:</b> (${w.correctAnswerNumber}번) ${w.correctAnswer}</p>
        <p><b>해설:</b> ${w.explanation}</p>
      </div>
      <hr/>
    `).join('')}
    <div class="button-row">
      <button onclick="saveWrongAnswers()">오답노트 저장하기</button>
      <button onclick="exportWrongAnswersAsText()">텍스트 파일로 저장</button>
    </div>
    <div class="button-row">
      <button onclick="showYearSelect()">메인으로 가기</button>
    </div>
  `;
}

function showSavedWrongAnswers() {
  const savedAnswers = JSON.parse(localStorage.getItem('wrongAnswers')) || [];
  
  if (savedAnswers.length === 0) {
    alert('저장된 오답노트가 없습니다.');
    return;
  }
  
  // 저장된 노트를 날짜와 시간 순으로 정렬 (최신순)
  savedAnswers.sort((a, b) => {
    return b.timestamp - a.timestamp;
  });
  
  yearSelect.innerHTML = '';
  subjectSelect.innerHTML = '';
  questionBox.innerHTML = '';
  navButtons.style.display = 'none';
  
  allAnswersDiv.innerHTML = `
    <h2>📋 저장된 오답노트 목록</h2>
    <div class="saved-notes-list">
      ${savedAnswers.map((note, idx) => {
        let subjectName;
        switch(note.subject) {
          case 'relaw': subjectName = '부동산학개론'; break;
          case 'civil': subjectName = '민법 및 민사특별법'; break;
          case 'publiclaw': subjectName = '부동산공법'; break;
          case 'brokerlaw': subjectName = '부동산중개사법령'; break;
          case 'regntax': subjectName = '부동산공시법령 및 세법'; break;
          default: subjectName = note.subject;
        }
        
        // 저장 시간 표시 추가
        const saveTime = note.timestamp ? new Date(note.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
        
        return `
          <div class="saved-note-item">
            <div class="note-info">
              <span><b>${note.date} ${saveTime}</b></span>
              <span>${note.year}년 ${subjectName}</span>
              <span>정답: ${note.correctAnswers} / 오답: ${note.wrongAnswers.length}</span>
            </div>
            <div class="note-actions">
              <button onclick="viewSavedNote(${idx})">보기</button>
              <button onclick="exportSavedNoteAsText(${idx})">텍스트 저장</button>
              <button onclick="deleteSavedNote(${idx})">삭제</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
    <div class="button-row">
      <button onclick="exportAllSavedNotesAsText()">모든 오답노트 텍스트 저장</button>
    </div>
    <div class="button-row">
      <button onclick="showYearSelect()">메인으로 가기</button>
    </div>
  `;
}

function viewSavedNote(index) {
  const savedAnswers = JSON.parse(localStorage.getItem('wrongAnswers')) || [];
  if (index >= savedAnswers.length) {
    alert('해당 오답노트를 찾을 수 없습니다.');
    return;
  }
  
  const note = savedAnswers[index];
  const wrongAnswersList = note.wrongAnswers;
  
  // 저장 시간 표시 추가
  const saveTime = note.timestamp ? new Date(note.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
  
  allAnswersDiv.innerHTML = `
    <h2>📚 저장된 오답노트</h2>
    <p class="note-info">${note.date} ${saveTime} - ${note.year}년 ${getSubjectName(note.subject)}</p>
    <p class="stats-summary"><b>총 ${note.totalQuestions}문제 중 ${note.correctAnswers}문제 정답, ${wrongAnswersList.length}문제 오답</b></p>
    ${wrongAnswersList.map((w) => `
      <div>
        <h3>${w.questionNumber || 'Q'}번. ${w.question}</h3>
        <p><b>당신의 답:</b> (${w.yourAnswerNumber}번) ${w.yourAnswer}</p>
        <p><b>정답:</b> (${w.correctAnswerNumber}번) ${w.correctAnswer}</p>
        <p><b>해설:</b> ${w.explanation}</p>
      </div>
      <hr/>
    `).join('')}
    <div class="button-row">
      <button onclick="exportSavedNoteAsText(${index})">텍스트 파일로 저장</button>
      <button onclick="showSavedWrongAnswers()">목록으로 돌아가기</button>
    </div>
    <div class="button-row">
      <button onclick="showYearSelect()">메인으로 가기</button>
    </div>
  `;
}

function deleteSavedNote(index) {
  if (!confirm('이 오답노트를 삭제하시겠습니까?')) {
    return;
  }
  
  const savedAnswers = JSON.parse(localStorage.getItem('wrongAnswers')) || [];
  if (index >= savedAnswers.length) {
    alert('해당 오답노트를 찾을 수 없습니다.');
    return;
  }
  
  savedAnswers.splice(index, 1);
  localStorage.setItem('wrongAnswers', JSON.stringify(savedAnswers));
  alert('오답노트가 삭제되었습니다.');
  showSavedWrongAnswers();
}

function getSubjectName(subjectCode) {
  switch(subjectCode) {
    case 'relaw': return '부동산학개론';
    case 'civil': return '민법 및 민사특별법';
    case 'publiclaw': return '부동산공법';
    case 'brokerlaw': return '부동산중개사법령';
    case 'regntax': return '부동산공시법령 및 세법';
    default: return subjectCode;
  }
}

// 텍스트 파일로 현재 오답노트 내보내기
function exportWrongAnswersAsText() {
  if (wrongAnswers.length === 0) {
    alert('저장할 오답이 없습니다.');
    return;
  }
  
  const today = new Date().toISOString().split('T')[0];
  const filename = `오답노트_${today}_${selectedYear}_${getSubjectName(selectedSubject)}.txt`;
  
  let textContent = `===== 공인중개사 오답노트 =====\n\n`;
  textContent += `날짜: ${today}\n`;
  textContent += `과목: ${selectedYear}년 ${getSubjectName(selectedSubject)}\n`;
  textContent += `결과: 총 ${currentQuestions.length}문제 중 ${correctAnswers}문제 정답, ${wrongAnswers.length}문제 오답\n\n`;
  textContent += `-----------------------------------\n\n`;
  
  wrongAnswers.forEach((w) => {
    textContent += `${w.questionNumber}번. ${w.question}\n`;
    textContent += `당신의 답: (${w.yourAnswerNumber}번) ${w.yourAnswer}\n`;
    textContent += `정답: (${w.correctAnswerNumber}번) ${w.correctAnswer}\n`;
    textContent += `해설: ${w.explanation}\n\n`;
    textContent += `-----------------------------------\n\n`;
  });
  
  downloadTextFile(textContent, filename);
}

// 저장된 오답노트를 텍스트 파일로 내보내기
function exportSavedNoteAsText(index) {
  const savedAnswers = JSON.parse(localStorage.getItem('wrongAnswers')) || [];
  if (index >= savedAnswers.length) {
    alert('해당 오답노트를 찾을 수 없습니다.');
    return;
  }
  
  const note = savedAnswers[index];
  const wrongAnswersList = note.wrongAnswers;
  
  // 저장 시간 표시 추가
  const saveTime = note.timestamp ? new Date(note.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
  const filename = `오답노트_${note.date}_${note.year}_${getSubjectName(note.subject)}.txt`;
  
  let textContent = `===== 공인중개사 오답노트 =====\n\n`;
  textContent += `날짜: ${note.date} ${saveTime}\n`;
  textContent += `과목: ${note.year}년 ${getSubjectName(note.subject)}\n`;
  textContent += `결과: 총 ${note.totalQuestions}문제 중 ${note.correctAnswers}문제 정답, ${wrongAnswersList.length}문제 오답\n\n`;
  textContent += `-----------------------------------\n\n`;
  
  wrongAnswersList.forEach((w) => {
    textContent += `${w.questionNumber || 'Q'}번. ${w.question}\n`;
    textContent += `당신의 답: (${w.yourAnswerNumber}번) ${w.yourAnswer}\n`;
    textContent += `정답: (${w.correctAnswerNumber}번) ${w.correctAnswer}\n`;
    textContent += `해설: ${w.explanation}\n\n`;
    textContent += `-----------------------------------\n\n`;
  });
  
  downloadTextFile(textContent, filename);
}

// 모든 저장된 오답노트를 하나의 텍스트 파일로 내보내기
function exportAllSavedNotesAsText() {
  const savedAnswers = JSON.parse(localStorage.getItem('wrongAnswers')) || [];
  
  if (savedAnswers.length === 0) {
    alert('저장된 오답노트가 없습니다.');
    return;
  }
  
  const today = new Date().toISOString().split('T')[0];
  const filename = `모든_오답노트_${today}.txt`;
  
  let textContent = `===== 공인중개사 오답노트 모음 =====\n\n`;
  textContent += `내보낸 날짜: ${today}\n`;
  textContent += `총 오답노트 수: ${savedAnswers.length}개\n\n`;
  
  // 저장된 노트를 날짜와 시간 순으로 정렬 (최신순)
  savedAnswers.sort((a, b) => {
    return b.timestamp - a.timestamp;
  });
  
  savedAnswers.forEach((note, noteIndex) => {
    const saveTime = note.timestamp ? new Date(note.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
    
    textContent += `\n\n===============================\n`;
    textContent += `오답노트 #${noteIndex + 1}\n`;
    textContent += `===============================\n\n`;
    
    textContent += `날짜: ${note.date} ${saveTime}\n`;
    textContent += `과목: ${note.year}년 ${getSubjectName(note.subject)}\n`;
    textContent += `결과: 총 ${note.totalQuestions}문제 중 ${note.correctAnswers}문제 정답, ${note.wrongAnswers.length}문제 오답\n\n`;
    textContent += `-----------------------------------\n\n`;
    
    note.wrongAnswers.forEach((w) => {
      textContent += `${w.questionNumber || 'Q'}번. ${w.question}\n`;
      textContent += `당신의 답: (${w.yourAnswerNumber}번) ${w.yourAnswer}\n`;
      textContent += `정답: (${w.correctAnswerNumber}번) ${w.correctAnswer}\n`;
      textContent += `해설: ${w.explanation}\n\n`;
      textContent += `-----------------------------------\n\n`;
    });
  });
  
  downloadTextFile(textContent, filename);
}

// 텍스트 파일 다운로드 기능
function downloadTextFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 브라우저의 콘솔에 경로 정보 로깅
console.log('현재 페이지 URL:', window.location.href);
console.log('현재 페이지 경로:', window.location.pathname);

showYearSelect();