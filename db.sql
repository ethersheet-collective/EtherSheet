CREATE DATABASE ethersheet;
USE ethersheet;
GRANT ALL ON ethersheet.* TO 'ethersheet'@'localhost' IDENTIFIED BY 'qo_.StMgsWtU%uT@)<_co6.+585f+K';
CREATE TABLE sheets (sheetid VARCHAR(40), sheetdata MEDIUMTEXT, PRIMARY KEY (sheetid));
CREATE TABLE users (token VARCHAR(255), color VARCHAR(7), nickname VARCHAR(255), PRIMARY KEY (token));
