const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const quizzes = require('./data/quizzes');
const { renderHome, renderQuizPage, renderResultPage } = require('./views/render');

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(express.static(path.join(__dirname, 'public')));

function findQuiz(id) {
  return quizzes.find((q) => q.id === id);
}

app.get('/', (req, res) => {
  res.send(renderHome(quizzes));
});

app.get('/q/:id', (req, res) => {
  const quiz = findQuiz(req.params.id);
  if (!quiz) return res.redirect('/');
  res.send(renderQuizPage(quiz));
});

app.get('/q/:id/r/:resultKey', (req, res) => {
  const quiz = findQuiz(req.params.id);
  if (!quiz || !quiz.results[req.params.resultKey]) return res.redirect('/');
  res.send(renderResultPage(quiz, req.params.resultKey));
});

// 알 수 없는 경로는 홈으로
app.get('*', (req, res) => {
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`요즘테스트 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
