const express = require('express');

 const app = express();
 const { engine } = require('express-handlebars');
 const urlencodedParser = express.urlencoded();

 app.engine( 'handlebars', engine() );

 app.set('views', './views');
 app.set('view engine', 'handlebars');
 
 // use - метод, который вызывается каждый раз перед тем, как будет открыт маршрут
 app.use(express.static(`${__dirname}`)); // static - метод (функция), используемая для пределения папки, в которой будут храниться файлы
 
app.get('/registration', (req, res) => {
    res.render('registration', {title: "Регистрация"})
})
app.post('/registration', urlencodedParser , (req, res) => {
    console.log(req.body);
    res.send('ok');
})
app.get('/auth', (req, res) => {
    res.render('auth', {title: 'Авторизация'})
})
 app.get('/', (req, res) => {
     res.statusCode = 200;
     res.render('home', {title: "Главная страница", content: 'Hello World!'})
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
 

 
 
 
 