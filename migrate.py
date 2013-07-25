#!/usr/bin/python
import MySQLdb

db = MySQLdb.connect(host='localhost',
                     user='root',
                     passwd='ethersheet',
                     db='ethersheet')
cur = db.cursor()
cur.execute('SELECT `key` FROM store where `key` LIKE "%:cells"');
for row in cur.fetchall():
    sheet_name = row[0][:-6]
    sql = "INSERT INTO store (`key`,`value`) VALUES ('" + sheet_name + ":sheet_collection', '[\"" + sheet_name + "\"]');"
    print sql
