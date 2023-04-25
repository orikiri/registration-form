const express = require('express');
const app = express();
const multer = require('multer');
const mysql = require('mysql2');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt'); 
const HTMLParser = require('node-html-parser');
const fs = require('fs');
 
const saltRounds = 10;
const { engine } = require('express-handlebars');
const urlencodedParser = express.urlencoded();
const connection = mysql.createConnection({
host: 'localhost',
user: 'root',
database: 'node',
})

function getIntRandom(min, max) {
Math.floor( Math.random() * (max-min) + min )
}

app.engine( 'handlebars', engine() );
app.set('views', './views');
app.set('view engine', 'handlebars');
app.use(cookieParser('secret'));

 
// use - метод, который вызывается каждый раз перед тем, как будет открыт маршрут
app.use(express.static(`${__dirname}`)); // static - метод (функция), используемая для определения папки, в которой будут храниться файлы

// ====== ГЛАВНАЯ СТРАНИЦА ====== //
app.get('/', (req, res) => {
res.statusCode = 200;

res.render('home', 
    {title: "Главная страница", 
    content: "Hello world!",
    auth: req.cookies.token })
})

 // ====== СТРАНИЦА РЕГИСТРАЦИИ ===== //
app.get('/registration', (req, res) => {
    res.render('registration', {title: "Регистрация"})
})
app.post('/registration', multer().fields([]), (req, res) => {
    console.log(req.body);
    // создаем константы для удобной работы с одинаковым названием со столбцами в скл. То, что после body - это name в input в форме! то есть мы заходим в хэндлбар, смотрим, как там называется инпут и записываем его сюда
    const login = req.body.email.toLowerCase();
    const pass = req.body.password;
    const name = req.body.name;
    const lastname = req.body.surname;
    // запрос к БД //
    // выбираем метод execute и в параметре вставляем команду insert (язык SQL)
    connection.execute(
        "SELECT id FROM `users` WHERE login = ?",
        [login],
        (err, resultSet) => {
            if (resultSet.length) {
                res.json({
                    result: 'error'
                })
            } else {
                connection.execute(
                    "INSERT INTO `users`(`login`, `pass`, `name`, `last_name`) VALUES (?, ?, ?, ?)", 
                    [login, pass, name, lastname,],);
                res.json({
                    result: 'success'
                });
            }
        }
    )

}) 

// ====== СТРАНИЦА АВТОРИЗАЦИИ ====== // 
app.get('/auth', (req, res) => { 
    res.render('auth', {title: 'Авторизация'})
})
app.post('/auth', multer().fields([]), (req, res) => {
    console.log(req.body);
    const login = req.body.login;
    const pass = req.body.password;
    // execute - асинхронный и выполняется отельно
    // следовательно, жсон нужно вызвать внутри колбэк функции, поскольку сервер может еще не ответить, а клиент получит ответ, что пароль верный и все хорошо
    connection.execute(
        "SELECT * FROM `users` WHERE login = ? AND pass  = ? ",
        [login, pass], 
        (err, resultSet) => {
            if (resultSet.length) {
                const user = resultSet[0];
                const token = bcrypt.hashSync((Date.now() + getIntRandom(10, 100)).toString(), saltRounds);
                connection.execute(
                    "UPDATE `users` SET token = ? WHERE id = ? ",
                    [token, user.id]
                    );
                res.cookie('token', token);
                res.json({result: 'success'});
            } else {
                res.json({result: 'error'})
            } 
        }
    )
})

// ====== СТРАНИЦА ДОБАВЛЕНИЯ СТАТЕЙ ====== //
app.get('/addArticle', (req, res) => {
    res.render('addArticle', 
    {title: 'Добавить статью'});
})

app.post('/addArticle', multer().any(), (req, res) => {
    const title = req.body.title;
    const author = req.body.author;
    const date = new Date().toLocaleString();
    const content = req.body.content; //content form 'formData.append('CONTENT', ...)
    const document = HTMLParser.parse(content); 
    const imgs = document.querySelectorAll('img'); // необходимо для тех случаев, если в статье будет более 1 картинки
    if (imgs) {
        imgs.forEach(img => {
            let src = img.getAttribute('src');
            let base64 = src.split(',')[1];
            let extension = src.split(',')[0].split('/')[1].split(';')[0];
            let fileName = Date.now() + '.' + extension;
            fs.writeFile('/public/userFiles/' + fileName, base64, 'base64', (err) => {
                console.log(err);
            })
            img.setAttribute('src', '/public/userFiles/' + fileName);
        }
        )}

    connection.execute('INSERT INTO `articles` (title, content, author, date) VALUES (?, ?, ?, ?)',
    [title, document.toString(), author, date])
    res.json({
        result: 'success'
    })
})

// ====== ОТОБРАЖЕНИЕ СТАТЕЙ ====== //

app.get('/getArticles', (req, res) => {
    connection.execute(
        "SELECT * FROM `articles`", 
        (err, resultSet) => {
            res.json(resultSet);
        }
    )
})

// ====== ОТОБРАЖЕНИЕ ВЫБРАННОЙ СТАТЬИ ====== //

app.get('/blog/:articleId', (req, res) => {
    const articleId = req.params.articleId;
    connection.execute(
        'SELECT * FROM `articles` WHERE id = ?', 
        [articleId],
        (err, resultSet) => {
            const article = resultSet[0];
            res.render('article', 
            {
                title: article.title,
                content: article.content,
                author: article.author
            })
        })
})



 // app.get('/about', (req, res) => {
 //     res.statusCode = 200;
 //     res.setHeader('Content-type', 'text/plain');
 //     res.send('About Page');
 // })
//  app.get('/handlerFeedBack', (req, res) => {
//      console.log(req.query); // query - содержит данные, полученные из форм. Query работает только с методом GET.
//      res.send(req.query) // вывод на экран (обычно так не делают:) )
//  })

 app.post('/handlerFeedBack', urlencodedParser, (req, res) => {
     console.log(req.body); // body - работает с методом POST
     res.send(req.body);
 })
 app.get('*', (req, res) => { // * - это любой URL. В данном случае сначала проверится '/', '/about', и если это ни то, ни другое, то будет выполняться callback на остальные url.
     res.statusCode = 404;
     res.send('Not found');
 })
 
 app.listen(3000)
 

 
 
 
 