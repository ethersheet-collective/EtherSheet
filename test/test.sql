CREATE DATABASE ethersheet;
USE ethersheet;
CREATE TABLE sheets (sheetid VARCHAR(40), sheetdata MEDIUMTEXT, PRIMARY KEY (sheetid));
CREATE TABLE users (user_id VARCHAR(255), color VARCHAR(7), nickname VARCHAR(255), PRIMARY KEY (user_id));
