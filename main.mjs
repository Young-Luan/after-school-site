const STORAGE_KEY = 'after-school-hub-v1';

const LESSONS = [
  { title: '微课1：自然拼读基础', duration: 8, topic: '英语单词' },
  { title: '微课2：一般现在时', duration: 10, topic: '语法' },
  { title: '微课3：高频词拼写', duration: 7, topic: '拼写' },
  { title: '微课4：阅读理解技巧', duration: 12, topic: '阅读' }
];

const DAILY_TASKS = [
  { id: 'word', label: '完成 15 个单词复习', minutes: 10 },
  { id: 'grammar', label: '完成 5 道语法题', minutes: 8 },
  { id: 'video', label: '观看 1 节微课', minutes: 12 }
];

const WORD_PAIRS = [
  ['apple', '苹果'],
  ['bridge', '桥'],
  ['quiet', '安静的'],
  ['travel', '旅行']
];

const GRAMMAR_QUESTIONS = [
  {
    q: 'She ___ to school every day.',
    options: ['go', 'goes', 'going'],
    answer: 1
  },
  {
    q: 'They ___ playing football now.',
    options: ['is', 'am', 'are'],
    answer: 2
  },
  {
    q: 'I have two ___.',
    options: ['book', 'books', 'bookes'],
    answer: 1
  }
];

const SPELLING_WORDS = [
  { hint: '意思：图书馆', word: 'library' },
  { hint: '意思：重要的', word: 'important' },
  { hint: '意思：漂亮的', word: 'beautiful' }
];

const CLASS_DEMO = {
  语音提高: {
    totalStudents: 26,
    checkedToday: 21,
    ranking: [
      { name: '林同学', streak: 19, minutes: 420 },
      { name: '周同学', streak: 15, minutes: 390 },
      { name: '陈同学', streak: 14, minutes: 360 },
      { name: '王同学', streak: 11, minutes: 325 },
      { name: '张同学', streak: 10, minutes: 308 }
    ],
    activities: [
      { name: '赵同学', event: '完成单词拼写 10 题', time: '18:40' },
      { name: '刘同学', event: '观看微课：一般现在时', time: '18:28' },
      { name: '家长-杨妈妈', event: '提交本周复盘反馈', time: '17:56' },
      { name: '吴同学', event: '完成语法练习并全对', time: '17:31' }
    ]
  },
  LG: {
    totalStudents: 32,
    checkedToday: 25,
    ranking: [
      { name: '黄同学', streak: 22, minutes: 510 },
      { name: '李同学', streak: 20, minutes: 488 },
      { name: '蒋同学', streak: 16, minutes: 430 },
      { name: '孙同学', streak: 15, minutes: 402 },
      { name: '何同学', streak: 13, minutes: 395 }
    ],
    activities: [
      { name: '唐同学', event: '完成单词配对闯关', time: '19:02' },
      { name: '家长-李爸爸', event: '确认今日打卡', time: '18:47' },
      { name: '冯同学', event: '完成微课并记录笔记', time: '18:35' },
      { name: '邓同学', event: '语法练习得分 4/5', time: '18:10' }
    ]
  }
};

const state = loadState();
let grammarIndex = 0;
let spellingIndex = 0;
let currentMatchSelection = null;
let currentClassName = Object.keys(CLASS_DEMO)[0];

const refs = {
  tabs: document.querySelectorAll('.tab'),
  panels: document.querySelectorAll('[data-panel]'),
  subtabs: document.querySelectorAll('.subtab'),
  practicePanels: {
    word: document.getElementById('practice-word'),
    grammar: document.getElementById('practice-grammar'),
    spelling: document.getElementById('practice-spelling')
  },
  streakDays: document.getElementById('streak-days'),
  totalMinutes: document.getElementById('total-minutes'),
  todayStatus: document.getElementById('today-status'),
  progressBar: document.getElementById('progress-bar'),
  progressText: document.getElementById('progress-text'),
  metricWord: document.getElementById('metric-word'),
  metricGrammar: document.getElementById('metric-grammar'),
  metricSpelling: document.getElementById('metric-spelling'),
  weekCheckin: document.getElementById('week-checkin'),
  classSelector: document.getElementById('class-selector'),
  classSummary: document.getElementById('class-summary'),
  rankList: document.getElementById('rank-list'),
  activityList: document.getElementById('activity-list'),
  taskList: document.getElementById('task-list'),
  checkinBtn: document.getElementById('checkin-btn'),
  resetTodayBtn: document.getElementById('reset-today-btn'),
  completeAllBtn: document.getElementById('complete-all-btn'),
  checkinMsg: document.getElementById('checkin-msg'),
  microList: document.getElementById('micro-list'),
  microMsg: document.getElementById('micro-msg'),
  matchBoard: document.getElementById('match-board'),
  matchMsg: document.getElementById('match-msg'),
  grammarQuestion: document.getElementById('grammar-question'),
  grammarOptions: document.getElementById('grammar-options'),
  grammarMsg: document.getElementById('grammar-msg'),
  nextGrammarBtn: document.getElementById('next-grammar-btn'),
  spellingHint: document.getElementById('spelling-hint'),
  spellingInput: document.getElementById('spelling-input'),
  spellingSubmit: document.getElementById('spelling-submit'),
  nextSpellingBtn: document.getElementById('next-spelling-btn'),
  spellingMsg: document.getElementById('spelling-msg')
};

init();

function init() {
  bindTabs();
  bindCheckin();
  bindPractice();
  bindClassBoard();
  renderTasks();
  renderDashboard();
  renderClassBoard();
  renderMicroLessons();
  resetMatchGame();
  renderGrammar();
  renderSpelling();
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeState(raw) {
  const today = todayKey();
  const safe = raw && typeof raw === 'object' ? raw : {};
  const checkin = safe.checkin && typeof safe.checkin === 'object' ? safe.checkin : {};
  const watchedLessons = Array.isArray(safe.watchedLessons) ? safe.watchedLessons : [];
  const checkinHistory = safe.checkinHistory && typeof safe.checkinHistory === 'object' ? safe.checkinHistory : {};

  if (checkin.date !== today) {
    checkin.date = today;
    checkin.tasksDone = [];
    checkin.checked = false;
  }

  return {
    totalMinutes: Number.isFinite(safe.totalMinutes) ? safe.totalMinutes : 0,
    streakDays: Number.isFinite(safe.streakDays) ? safe.streakDays : 0,
    lastCheckinDate: typeof safe.lastCheckinDate === 'string' ? safe.lastCheckinDate : '',
    grammarCorrect: Number.isFinite(safe.grammarCorrect) ? safe.grammarCorrect : 0,
    spellingCorrect: Number.isFinite(safe.spellingCorrect) ? safe.spellingCorrect : 0,
    wordPairsDone: Number.isFinite(safe.wordPairsDone) ? safe.wordPairsDone : 0,
    watchedLessons,
    checkinHistory,
    checkin
  };
}

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return normalizeState(raw);
  } catch {
    return normalizeState({});
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function bindTabs() {
  refs.tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      refs.tabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      const target = tab.dataset.tab;
      refs.panels.forEach((panel) => {
        panel.classList.toggle('hidden', panel.id !== target);
      });
    });
  });
}

function bindCheckin() {
  refs.taskList.addEventListener('change', (event) => {
    const checkbox = event.target.closest('input[type="checkbox"]');
    if (!checkbox) return;

    const taskId = checkbox.dataset.taskId;
    if (!taskId) return;

    const set = new Set(state.checkin.tasksDone);
    if (checkbox.checked) {
      set.add(taskId);
    } else {
      set.delete(taskId);
    }

    state.checkin.tasksDone = [...set];
    saveState();
    renderDashboard();
  });

  refs.checkinBtn.addEventListener('click', () => {
    if (state.checkin.checked) {
      setFeedback(refs.checkinMsg, '今天已打卡，继续保持。', 'ok');
      return;
    }

    const allDone = DAILY_TASKS.every((task) => state.checkin.tasksDone.includes(task.id));
    if (!allDone) {
      setFeedback(refs.checkinMsg, '请先完成全部今日任务。', 'bad');
      return;
    }

    const today = todayKey();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    state.checkin.checked = true;
    state.totalMinutes += DAILY_TASKS.reduce((acc, item) => acc + item.minutes, 0);

    if (state.lastCheckinDate === yesterdayKey) {
      state.streakDays += 1;
    } else if (state.lastCheckinDate !== today) {
      state.streakDays = 1;
    }

    state.lastCheckinDate = today;
    state.checkinHistory[today] = true;
    saveState();
    renderDashboard();
    setFeedback(refs.checkinMsg, '打卡成功，今天表现很棒。', 'ok');
  });

  refs.resetTodayBtn.addEventListener('click', () => {
    state.checkin.tasksDone = [];
    state.checkin.checked = false;
    saveState();
    renderTasks();
    renderDashboard();
    setFeedback(refs.checkinMsg, '已重置今日任务。', '');
  });

  refs.completeAllBtn.addEventListener('click', () => {
    if (state.checkin.checked) {
      setFeedback(refs.checkinMsg, '今天已打卡，无需一键完成。', 'ok');
      return;
    }
    state.checkin.tasksDone = DAILY_TASKS.map((task) => task.id);
    saveState();
    renderTasks();
    renderDashboard();
    setFeedback(refs.checkinMsg, '演示模式：已勾选全部今日任务。', 'ok');
  });
}

function bindPractice() {
  refs.subtabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      refs.subtabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      const target = tab.dataset.practice;

      Object.entries(refs.practicePanels).forEach(([key, panel]) => {
        panel.classList.toggle('hidden', key !== target);
      });
    });
  });

  refs.nextGrammarBtn.addEventListener('click', () => {
    grammarIndex = (grammarIndex + 1) % GRAMMAR_QUESTIONS.length;
    renderGrammar();
  });

  refs.spellingSubmit.addEventListener('click', () => {
    const answer = refs.spellingInput.value.trim().toLowerCase();
    const word = SPELLING_WORDS[spellingIndex].word;

    if (!answer) {
      setFeedback(refs.spellingMsg, '请输入后再提交。', 'bad');
      return;
    }

    if (answer === word) {
      state.spellingCorrect += 1;
      saveState();
      setFeedback(refs.spellingMsg, '拼写正确。', 'ok');
      renderDashboard();
    } else {
      setFeedback(refs.spellingMsg, `不正确，正确答案是 ${word}。`, 'bad');
    }
  });

  refs.nextSpellingBtn.addEventListener('click', () => {
    spellingIndex = (spellingIndex + 1) % SPELLING_WORDS.length;
    refs.spellingInput.value = '';
    renderSpelling();
  });
}

function bindClassBoard() {
  refs.classSelector.innerHTML = Object.keys(CLASS_DEMO)
    .map((className) => `<option value="${className}">${className}</option>`)
    .join('');

  refs.classSelector.value = currentClassName;
  refs.classSelector.addEventListener('change', () => {
    currentClassName = refs.classSelector.value;
    renderClassBoard();
  });
}

function renderDashboard() {
  refs.streakDays.textContent = String(state.streakDays);
  refs.totalMinutes.textContent = String(state.totalMinutes);
  refs.todayStatus.textContent = state.checkin.checked ? '已打卡' : '未打卡';
  refs.metricWord.textContent = String(state.wordPairsDone);
  refs.metricGrammar.textContent = String(state.grammarCorrect);
  refs.metricSpelling.textContent = String(state.spellingCorrect);

  const done = state.checkin.tasksDone.length;
  const percent = Math.round((done / DAILY_TASKS.length) * 100);
  refs.progressBar.style.width = `${percent}%`;
  refs.progressText.textContent = `今日任务完成度 ${percent}%`;
  renderWeekCheckin();
}

function renderWeekCheckin() {
  const days = [];
  const now = new Date();
  const labels = ['日', '一', '二', '三', '四', '五', '六'];

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const done = Boolean(state.checkinHistory[key]) || (key === todayKey() && state.checkin.checked);
    days.push({ day: labels[date.getDay()], done });
  }

  refs.weekCheckin.innerHTML = days
    .map((item) => {
      return `<div class="day-pill ${item.done ? 'done' : ''}"><b>周${item.day}</b><span>${item.done ? '已打卡' : '未打卡'}</span></div>`;
    })
    .join('');
}

function renderClassBoard() {
  const data = CLASS_DEMO[currentClassName];
  refs.classSummary.textContent = `${currentClassName} 今日打卡 ${data.checkedToday}/${data.totalStudents} 人，打卡率 ${Math.round(
    (data.checkedToday / data.totalStudents) * 100
  )}%`;

  refs.rankList.innerHTML = data.ranking
    .map((item, index) => {
      return `
        <article class="rank-item">
          <span class="name">#${index + 1} ${item.name}</span>
          <span class="meta">连续 ${item.streak} 天 | ${item.minutes} 分钟</span>
        </article>
      `;
    })
    .join('');

  refs.activityList.innerHTML = data.activities
    .map((item) => {
      return `
        <article class="activity-item">
          <span class="name">${item.name}</span>
          <span class="meta">${item.event} · ${item.time}</span>
        </article>
      `;
    })
    .join('');
}

function renderTasks() {
  refs.taskList.innerHTML = DAILY_TASKS.map((task) => {
    const checked = state.checkin.tasksDone.includes(task.id) ? 'checked' : '';
    return `
      <label class="task-item">
        <input type="checkbox" data-task-id="${task.id}" ${checked} />
        <span>${task.label}（约 ${task.minutes} 分钟）</span>
      </label>
    `;
  }).join('');
}

function renderMicroLessons() {
  refs.microList.innerHTML = LESSONS.map((lesson) => {
    const watched = state.watchedLessons.includes(lesson.title);
    return `
      <article class="card lesson">
        <h3>${lesson.title}</h3>
        <p class="meta">主题：${lesson.topic} | 时长：${lesson.duration} 分钟</p>
        <button type="button" class="${watched ? 'is-watched' : ''}" data-watch="${lesson.title}">
          ${watched ? '已观看' : '标记为已观看'}
        </button>
      </article>
    `;
  }).join('');

  refs.microList.onclick = (event) => {
    const btn = event.target.closest('button[data-watch]');
    if (!btn) return;

    const title = btn.dataset.watch;
    if (!title) return;

    if (!state.watchedLessons.includes(title)) {
      state.watchedLessons.push(title);
    }
    state.checkin.tasksDone = Array.from(new Set([...state.checkin.tasksDone, 'video']));
    saveState();
    renderTasks();
    renderDashboard();
    renderMicroLessons();
    setFeedback(refs.microMsg, '已记录微课观看状态。', 'ok');
  };
}

function setFeedback(el, text, cls) {
  el.textContent = text;
  el.classList.remove('ok', 'bad');
  if (cls) {
    el.classList.add(cls);
  }
}

function resetMatchGame() {
  const english = WORD_PAIRS.map((item, index) => ({ id: `e-${index}`, pair: index, text: item[0] }));
  const chinese = WORD_PAIRS
    .map((item, index) => ({ id: `c-${index}`, pair: index, text: item[1] }))
    .sort(() => Math.random() - 0.5);

  const cards = [...english, ...chinese];
  refs.matchBoard.innerHTML = cards
    .map((card) => `<button class="match-item" type="button" data-id="${card.id}" data-pair="${card.pair}">${card.text}</button>`)
    .join('');

  let doneCount = 0;

  refs.matchBoard.onclick = (event) => {
    const item = event.target.closest('.match-item');
    if (!item || item.classList.contains('done')) return;

    if (!currentMatchSelection) {
      currentMatchSelection = item;
      item.classList.add('active');
      return;
    }

    if (currentMatchSelection === item) {
      currentMatchSelection.classList.remove('active');
      currentMatchSelection = null;
      return;
    }

    const samePair = currentMatchSelection.dataset.pair === item.dataset.pair;
    if (samePair) {
      currentMatchSelection.classList.remove('active');
      currentMatchSelection.classList.add('done');
      item.classList.add('done');
      doneCount += 1;
      setFeedback(refs.matchMsg, '配对正确。', 'ok');
      if (doneCount === WORD_PAIRS.length) {
        state.wordPairsDone += 1;
        state.checkin.tasksDone = Array.from(new Set([...state.checkin.tasksDone, 'word']));
        saveState();
        renderTasks();
        renderDashboard();
        setFeedback(refs.matchMsg, '全部配对完成。', 'ok');
      }
    } else {
      currentMatchSelection.classList.remove('active');
      setFeedback(refs.matchMsg, '配对不正确，再试一次。', 'bad');
    }

    currentMatchSelection = null;
  };
}

function renderGrammar() {
  const data = GRAMMAR_QUESTIONS[grammarIndex];
  refs.grammarQuestion.textContent = `题目：${data.q}`;
  refs.grammarOptions.innerHTML = data.options
    .map((option, index) => `<button class="option" type="button" data-index="${index}">${option}</button>`)
    .join('');
  refs.grammarMsg.textContent = '';

  refs.grammarOptions.onclick = (event) => {
    const btn = event.target.closest('button[data-index]');
    if (!btn) return;
    const selected = Number(btn.dataset.index);

    if (selected === data.answer) {
      state.grammarCorrect += 1;
      state.checkin.tasksDone = Array.from(new Set([...state.checkin.tasksDone, 'grammar']));
      saveState();
      renderTasks();
      renderDashboard();
      setFeedback(refs.grammarMsg, '回答正确。', 'ok');
    } else {
      setFeedback(refs.grammarMsg, `回答错误，正确答案是：${data.options[data.answer]}`, 'bad');
    }
  };
}

function renderSpelling() {
  refs.spellingHint.textContent = `请拼写：${SPELLING_WORDS[spellingIndex].hint}`;
  refs.spellingInput.value = '';
  refs.spellingMsg.textContent = '';
}
