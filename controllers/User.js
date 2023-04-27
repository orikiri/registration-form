import mysql from 'mysql2';
import { config } from '../config.js';
import bcrypt from 'bcrypt'; // необходим для шифрования токена
const connection = mysql.createConnection({
     host: config.dbHost,
     user: config.dbUser,
     database: config.dbName,
     password: config.dbPass
});
const saltRounds = 10;

export class User{
     // *** static - ключевое слово, позволяющее методу не зависеть от объектов. В таком случае данный метод можно вызывать только у класса, у объекта этого сделать уже не получится. Если не пишем static, то вызывается у объектов, у класса вызвать будет невозможно
     static login(req, res){ 
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
                    }else {
                         res.json({result: 'error'})
          } 
        });
     }
     static registration(req, res) {
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
        });
     }
}