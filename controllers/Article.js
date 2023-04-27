import HTMLParser from 'node-html-parser';
import fs from 'fs';

export class Article {
    static addArticle(req, res) {
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
                img.setAttribute('src', '/userFiles/' + fileName);
            })}
        connection.execute(
            'INSERT INTO `articles` (title, content, author, date) VALUES (?, ?, ?, ?)',
            [title, document.toString(), author, date])
        res.json({
            result: 'success'
        })
    }
}