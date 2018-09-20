var seq = require('sequelize');
var config = require('../config');
var sequelize = new seq(
    config.targetdb.name, 
    config.targetdb.user,
    config.targetdb.password,
    {
        host: config.targetdb.host,
        dialect: config.targetdb.type,
        define: {
            timestamps: false //为模型添加 createdAt 和 updatedAt 两个时间戳字段（true or false）
        },
        pool: { //使用连接池连接，默认为true
            max: 80,
            min: 0,
            idle: 1000,
	    evict: 1000,
	    acquire: 200000
        },
    });

module.exports = sequelize;
