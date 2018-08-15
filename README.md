# genedb
一个中文基因概述数据库
一　安装
1.该工具依赖nodejs　请先安装nodejs https://nodejs.org
2.安装依赖包:
npm install
3.根据自己的数据库选择安装:
//postgresql
$ npm install --save pg pg-hstore
//mysql
$ npm install --save mysql2
//sqlite3
$ npm install --save sqlite3
//其他 如MSSQL
$ npm install --save tedious
4.初始化数据库
根据db/initdb.sql初始化数据库　本工具默认是postgresql，其他数据库未测试

二　配置
config.js中根据实际情况配置数据库

三　执行
npm start
由于HGNC中列出的基因名称较多，该执行会比经长，耐性等待

四　工具基本原理
通过API访问HGNC、NCBI数据库，获取基因信息，并利用Google 翻译将其翻译为中文。
