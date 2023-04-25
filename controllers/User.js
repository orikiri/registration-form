import mysql from 'mysql2'
import { config } from '../config'
const connection = mysql.createConnection({
     host: config.dbHost,
     user: config.dbUser,
     database: config.dbName,
     password: config.dbPass
});

export class User{
    
}