import { Component } from '../../lib';

class AppMainPage extends Component {
  constructor(config) {
    super(config);
    this.inputs = null;
    this.isPlay = false;
    this.toEmpty = [];
    this.isRecord = false;
    this.recognition = null;
    this.throttle = false;
    this.removeThrottle = () => { this.throttle = false; };
    this.TIMEOUT = 500;
    this.meaningExampleNodes = null;
    this.audio = null;
    this.heardAs = null;
    this.correct = [];
    this.shownStats = false;
    this.gamesSlice = null;
  }

  events() {
    return {
      'click #word-original': 'wordSound',
      'click #control-buttons': 'controlButtons',
      'click .example-conversation': 'playMeaningExampleSound',
      'click #start-game': 'startGame',
      'click #results': 'showResults',
      'click #result-close': 'resultClose',
      'click #results-page': 'playReplay',
      'click #result-new-game': 'newGame',
      'click #games': 'gamesStats',
      'click #stats-close': 'closeGameStats',
      'click #stats-container': 'repeatGame',
      'click #win-close': 'winClose',
      'input #level-of-difficulty': 'switchGameDifficulty',
    };
  }

  setEmpty() {
    this.toEmpty.forEach(el => {
      el.innerHTML = '';
      el.value = '';
    });
    this.inputs.forEach(input => {
      input.parentNode.classList.remove('correct');
    });
    this.correct = null;
    this.correct = [];
  }

  setImg(url) {
    const imageContainer = document.getElementById('card-img');
    imageContainer.style.backgroundImage = `url(${url})`;
  }

  async getTranslate(word) {
    const url = `${'https://translate.yandex.net/api/v1.5/tr.json/translate?key='
    + 'trnsl.1.1.20200424T162457Z.6bdc9792bcee8e6e.b8a776b7e991945b8205fe900b176cafd6572e36&text='}${
      word
    }&lang=en-ru`;
    const data = await fetch(url);
    const result = await data.json();
    return result.text[0].toLowerCase();
  }

  playMeaningExampleSound({ target }) {
    const span = target.closest('span');

    if (!span || span.tagName !== 'SPAN') return;

    if (!this.meaningExampleNodes || this.isPlay) return;

    this.setRemoveWaitStyles(true);

    span.classList.add('on');

    this.span = span;

    this.isPlay = true;

    this.audio = new Audio(span.dataset.audio);

    const playSound = () => {
      this.audio.play();
    };

    const isEndedSound = () => {
      this.isPlay = false;
      this.setRemoveWaitStyles();
      span.classList.remove('on');
      this.audio.removeEventListener('loadeddata', playSound);
      this.audio.removeEventListener('ended', playSound);
      this.audio.remove();
    };

    this.audio.addEventListener('loadeddata', playSound);
    this.audio.addEventListener('ended', isEndedSound);
  }

  async speechRecord() {
    const outputWord = document.getElementById('text-translate');
    const cardImage = document.getElementById('card-img');

    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    this.recognition = new window.SpeechRecognition();
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 20;
    this.heardAs = document.getElementById('heard-as');

    this.toEmpty.push(this.heardAs);
    this.toEmpty.push(outputWord);

    const record = document.querySelector('.record');
    record.classList.add('record-wait');

    let result = {};

    this.recognition.addEventListener('result', e => {
      [...e.results].forEach(el => {
        if (el.isFinal) {
          [...el].forEach(key => {
            result[key.transcript.toLowerCase().split(' ')] = key.confidence;
          });
        }
      });
    });

    this.recognition.start();
    this.recognition.addEventListener('speechstart', () => {
      record.classList.add('record-on');
      record.classList.remove('record-wait');
    });

    let isRecognized = true;

    const currentGame = this.getLocalStorageCurrentGame();

    this.recognition.addEventListener('end', () => {
      if (!this.isRecord) return;

      outputWord.value = '';
      this.heardAs.innerHTML = '';
      const keys = Object.keys(result);
      let percent;

      this.inputs.forEach(input => {
        keys.forEach(str => {
          if (str === input.value) {
            if (this.correct.includes(str)) {
              isRecognized = false;
            } else {
              this.correct.push(str);
              currentGame.forEach(el => {
                if (el.word === str) {
                  el.done = 'ok';
                }
              });
              this.updateLocalStorage(currentGame);
              this.setLocalStorageCurrentGame(currentGame);
              cardImage.style.backgroundImage = `url(${input.parentNode.dataset.image})`;
              input.parentNode.classList.add('correct');
              percent = result[str] * 100;
              outputWord.value = `${input.value} (${percent ? parseInt(percent, 10) : '<5'})%`;
            }
          }
        });
      });

      if (isRecognized) {
        let tempKey = 0;
        let tempValue;
        for (const k in result) {
          const curPercent = result[k] * 100;
          if (curPercent > tempKey) {
            tempKey = curPercent;
            tempValue = k;
          }
        }

        outputWord.value = outputWord.value || 'not recognized';

        if (!percent || percent < tempKey) {
          this.heardAs.innerHTML = tempValue ? `heard as "${tempValue}" (${parseInt(tempKey, 10)})%` : '';
        }
      }

      isRecognized = true;
      result = null;
      result = {};

      this.recognition.start();

      record.classList.remove('record-on');
      record.classList.add('record-wait');
      if (this.correct.length === 10) {
        this.showResults();
      }
    });
  }

  winClose() {
    document.body.style.overflow = 'auto';
    const winPage = document.getElementById('win-page');
    winPage.classList.add('close');
    this.newGame();
  }

  async wordSound({ target }) {
    if (this.isPlay || this.isRecord) return;

    if (target.tagName !== 'INPUT') return;

    this.isPlay = true;

    const input = target.closest('label');
    const translate = document.getElementById('text-translate');
    const example = document.getElementById('text-example');
    const meaning = document.getElementById('text-meaning');

    this.meaningExampleNodes = [example, meaning];

    [example, meaning].forEach(el => {
      el.classList.add('active');
      if (el.classList.contains('text-example')) el.dataset.audio = input.dataset.audioExample;
      if (el.classList.contains('text-meaning')) el.dataset.audio = input.dataset.audioMeaning;
    });

    this.toEmpty = [translate, example, meaning];

    input.closest('label').classList.add('is-playing');
    this.setRemoveWaitStyles(true);
    this.changeExampleConversationIsContentStyles(true);

    this.setImg(input.dataset.image);

    const audio = new Audio(input.dataset.audio);

    const playSound = () => {
      audio.play();
    };

    const isEndedSound = () => {
      this.isPlay = false;
      input.closest('label').classList.remove('is-playing');
      this.setRemoveWaitStyles();
      audio.removeEventListener('loadeddata', playSound);
      audio.removeEventListener('ended', playSound);
      audio.remove();
    };
    audio.addEventListener('loadeddata', playSound);
    audio.addEventListener('ended', isEndedSound);

    translate.value = await this.getTranslate(input.dataset.word);
    example.innerHTML = input.dataset.textExample;
    meaning.innerHTML = input.dataset.textMeaning;
  }

  stopSound() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio = null;
    this.isPlay = false;
  }

  removeStylesMeaningExamples() {
    this.meaningExampleNodes.forEach(el => {
      el.classList.remove('active');
    });
    this.meaningExampleNodes = null;
  }

  controlButtons({ target }) {
    const resetRecord = () => {
      this.recognition.stop();
      this.recognition = null;
      this.isRecord = false;
    };

    if (target.name === 'restart') {
      this.newGame();
    }

    if (target.name === 'speak') {
      this.changeExampleConversationIsContentStyles();
      this.recordOf();
      this.setEmpty();

      if (this.audio) {
        this.setRemoveWaitStyles();
        this.stopSound();
      }

      if (this.meaningExampleNodes) this.removeStylesMeaningExamples();

      if (this.throttle) return;

      this.throttle = true;

      setTimeout(this.removeThrottle, this.TIMEOUT);

      if (this.isRecord) {
        target.value = 'start speak';
        resetRecord();
      } else {
        target.value = 'stop speaking and restart';
        this.isRecord = true;
        this.speechRecord();
      }
    }
  }

  recordOf() {
    const record = document.querySelector('.record');
    record.classList.remove('record-wait');
    record.classList.remove('record-on');
  }

  async setWordsAndImages() {
    const radioButtons = document.querySelectorAll('#level-of-difficulty input');
    const inputs = document.querySelectorAll('#word-original input');

    this.inputs = inputs;

    let pageCount = 0;

    if (radioButtons) pageCount = [...radioButtons].find(node => node.checked).value;

    const groupCount = Math.floor(Math.random() * 29);
    const response = await fetch(`https://api-rslang.herokuapp.com/words?page=${groupCount}&group=${pageCount}`);
    let json = await response.json();

    json.sort(() => Math.random() - 0.5);
    if (this.gamesSlice) json = this.gamesSlice;
    this.gamesSlice = null;
    const toLocalStorage = json.slice(0, 10);
    toLocalStorage.push(new Date());
    this.setLocalStorage(toLocalStorage);
    this.setLocalStorageCurrentGame(toLocalStorage);

    inputs.forEach((node, i) => {
      const label = node.parentNode;
      const outData = json[i];
      node.value = outData.word.toLowerCase();
      label.querySelector('span').innerText = outData.transcription;
      Object.keys(outData).forEach(key => {
        label.dataset[key] = outData[key];
      });
    });
  }

  setRemoveWaitStyles(set) {
    const exampleConversation = document.querySelector('.example-conversation');
    const wordOriginal = document.getElementById('word-original');

    if (set) {
      wordOriginal.classList.add('no-sound');
      exampleConversation.classList.add('is-playing');
    } else {
      if (this.span) this.span.classList.remove('on');
      wordOriginal.classList.remove('no-sound');
      exampleConversation.classList.remove('is-playing');
    }
  }

  changeExampleConversationIsContentStyles(set) {
    const exampleConversation = document.querySelector('.example-conversation');
    if (set) {
      exampleConversation.classList.add('show-content');
    } else {
      exampleConversation.classList.remove('show-content');
    }
  }

  startGame() {
    const startPage = document.getElementById('start-page');
    startPage.classList.add('close');
    document.body.style.overflow = 'visible';
    setTimeout(() => {
      startPage.style.display = 'none';
      startPage.classList.remove('close');
    }, 350);
  }

  setLocalStorage(array) {
    const json = localStorage.getItem('games');
    const collect = [];
    if (json) {
      collect.push(...JSON.parse(json));
    }
    collect.push(array);
    localStorage.setItem('games', JSON.stringify(collect));
  }

  updateLocalStorage(game) {
    const json = localStorage.getItem('games');
    const collect = JSON.parse(json);
    collect.splice(-1, 1, game);
    localStorage.setItem('games', JSON.stringify(collect));
  }

  getLocalStorage() {
    const json = localStorage.getItem('games');
    return JSON.parse(json);
  }

  setLocalStorageCurrentGame(array) {
    localStorage.setItem('current-game', JSON.stringify(array));
  }

  getLocalStorageCurrentGame() {
    const json = localStorage.getItem('current-game');
    return JSON.parse(json);
  }

  pauseRecord() {
    if (this.audio) {
      this.setRemoveWaitStyles();
      this.stopSound();
    }
    if (this.isRecord) {
      this.recognition.stop();
      this.recognition = null;
      this.isRecord = false;
      this.shownStats = true;
    }
  }

  async showResults() {
    this.pauseRecord();
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';

    const dontKnowCount = document.getElementById('dont-know-count');
    const iKnowCount = document.getElementById('i-know-count');
    dontKnowCount.innerHTML = 0;
    iKnowCount.innerHTML = 0;
    const getSpan = async element => {
      const translate = await this.getTranslate(element.word);
      return `
      <span class="replay" data-audio="${element.audio}">
        ${element.word} ${element.transcription}
        ${translate}
      </span>
    `;
    };

    const resultsPage = document.getElementById('results-page');
    const dontKnow = document.getElementById('dont-know');
    const iKnow = document.getElementById('i-know');
    const currentGame = this.getLocalStorageCurrentGame();
    dontKnow.innerHTML = '';
    iKnow.innerHTML = '';
    resultsPage.style.display = 'flex';
    resultsPage.classList.remove('close');

    const setNode = async node => {
      const string = await getSpan(node);
      if (!node.word) return;
      if (node.done) {
        const count = parseInt(iKnowCount.innerHTML, 10);
        iKnow.insertAdjacentHTML('beforeend', string);
        iKnowCount.innerHTML = count + 1;
      } else {
        const count = parseInt(dontKnowCount.innerHTML, 10);
        dontKnow.insertAdjacentHTML('beforeend', string);
        dontKnowCount.innerHTML = count + 1;
      }
    };

    currentGame.forEach(setNode);
  }

  resumePause() {
    if (this.shownStats) {
      this.isRecord = true;
      this.speechRecord();
      this.shownStats = false;
    }
  }

  resultClose() {
    document.body.style.overflow = 'auto';
    this.resumePause();
    const resultsPage = document.getElementById('results-page');
    resultsPage.classList.add('close');
  }

  playReplay({ target }) {
    if (target.classList.contains('replay')) {
      const audio = new Audio(target.dataset.audio);
      audio.play();
    }
  }

  newGame() {
    const resultsPage = document.getElementById('results-page');
    resultsPage.classList.add('close');
    const cardImage = document.getElementById('card-img');
    cardImage.style.backgroundImage = `url(${this.startImageUrl})`;

    document.getElementById('speech').value = 'start speak';
    this.changeExampleConversationIsContentStyles();
    this.recordOf();

    if (this.audio) {
      this.setRemoveWaitStyles();
      this.stopSound();
    }

    if (this.meaningExampleNodes) this.removeStylesMeaningExamples();
    this.setWordsAndImages();
    this.setEmpty();

    if (this.isRecord) {
      this.recognition.stop();
      this.recognition = null;
      this.isRecord = false;
    }
  }

  gamesStats() {
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';
    this.pauseRecord();
    const gamesStats = document.getElementById('games-stats');
    const statsContainer = document.getElementById('stats-container');
    const games = this.getLocalStorage();
    this.gamesSlice = games.slice(-20);
    statsContainer.innerHTML = '';
    this.gamesSlice.forEach((game, i) => {
      const words = game.map(el => (el.word ? el.word : '')).slice(0, -1).join(', ');
      let win = 0;
      game.forEach(g => {
        if (g.done) win++;
      });
      statsContainer.insertAdjacentHTML('beforeend', `
        <span data-idx="${i}"><b>${new Date(game[10]).toLocaleString('ru')}:</b> <i>${words}</i> - <b>(${win}/10)</b></span>
      `);
    });
    gamesStats.classList.remove('close');
  }

  repeatGame({ target }) {
    const span = target.closest('span');
    if (!span || !span.dataset.idx) return;
    this.gamesSlice = this.gamesSlice[span.dataset.idx].slice(0, -1);
    this.newGame();
    const gamesStats = document.getElementById('games-stats');
    gamesStats.classList.add('close');
  }

  closeGameStats() {
    document.body.style.overflow = 'auto';
    this.resumePause();
    const gamesStats = document.getElementById('games-stats');
    gamesStats.classList.add('close');
    this.gamesSlice = null;
  }

  switchGameDifficulty() {
    this.newGame();
  }

  async onLoad() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.body.style.opacity = '1';
      }, 250);
    });
    const cardImage = document.getElementById('card-img');
    this.startImageUrl = getComputedStyle(cardImage).backgroundImage.slice(5, -2);
    this.startImageUrl = this.startImageUrl.replace(/^http:\/\/[^/]+\//g, '');
    await this.setWordsAndImages();
  }
}

export const appMainPage = new AppMainPage({
  selector: '#main-page',
  template: require('../pages/html/main-page.html'),
});
