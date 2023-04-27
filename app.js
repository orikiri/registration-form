// ====== IMPORTS ====== //
import express from 'express'; // фреймворк для приложений 
import multer from 'multer'; // для обработки formData 
import mysql from 'mysql2'; // для работы с БД
import cookieParser from 'cookie-parser'; // для работы с куки
import { engine } from 'express-handlebars';
import { User } from './controllers/User.js';
import * as path from 'path';
import { Article } from './controllers/Article.js';


// ====== CONSTS ====== //
const __dirname = path.resolve();
const app = express(); // объект приложения
const urlencodedParser = express.urlencoded();
const connection = mysql.createConnection({ 
    host: 'localhost',
    user: 'root',
    database: 'node',
})

// ====== FUNCTIONS ====== //
function getIntRandom(min, max) {
    Math.floor( Math.random() * (max-min) + min )
}


app.engine( 'handlebars', engine() );
app.set('views', './views');
app.set('view engine', 'handlebars');
app.use(cookieParser('secret')); // use - метод, который вызывается каждый раз перед тем, как будет открыт маршрут
app.use(express.static(`${__dirname}/public`)); // static - метод (функция), используемая для определения КОРНЕВОЙ папки, в которой будут храниться файлы. Необходимо для того, чтобы потом легче указывать пути к файлам, например в main.handlebars мы указывали пути для styles.css и script.js


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
app.post('/registration', multer().fields([]), User.registration) 

// ====== СТРАНИЦА АВТОРИЗАЦИИ ====== // 
app.get('/auth', (req, res) => { 
    res.render('auth', {title: 'Авторизация'})
})
app.post('/auth', multer().fields([]), User.login);

// ====== СТРАНИЦА ДОБАВЛЕНИЯ СТАТЕЙ ====== //
app.get('/addArticle', (req, res) => {
    res.render('addArticle', 
    {title: 'Добавить статью'});
})

app.post('/addArticle', multer().any(), Article.addArticle)

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
 
app.listen(3000) // запуск сервера