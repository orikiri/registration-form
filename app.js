const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt'); 
 
 const saltRounds = 10;
 const { engine } = require('express-handlebars');
 const urlencodedParser = express.urlencoded();
 const app = express();
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
 app.use(express.static(`${__dirname}`)); // static - метод (функция), используемая для определения папки, в которой будут хр аниться файлы
 

 // ====== Регистрация ===== //
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
    // ПРОВЕРИТЬ СУЩЕСТВУЮЩЕГО ПОЛЬЗОВАТЕЛЯ 
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
// ====== Авторизация ====== // 
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

// ====== ГЛАВНАЯ СТРАНИЦА ====== //
 app.get('/', (req, res) => {
     res.statusCode = 200;

     res.render('home', 
        {title: "Главная страница", 
        content: 'Hello World!',
        auth: req.cookies.token })
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
//  app.get('*', (req, res) => { // * - это любой URL. В данном случае сначала проверится '/', '/about', и если это ни то, ни другое, то будет выполняться callback на остальные url.
//      res.statusCode = 404;
//      res.send('Not found');
//  })
 
 app.listen(3000)
 

 
 
 
 