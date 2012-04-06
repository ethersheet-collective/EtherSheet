CREATE DATABASE ethersheet;
GRANT ALL ON ethersheet.* TO 'ethersheet'@'localhost' IDENTIFIED BY 'ethersheet';
CREATE TABLE sheets (sheetid VARCHAR(40), sheetdata MEDIUMTEXT, PRIMARY KEY (sheetid));
