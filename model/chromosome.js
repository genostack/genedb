var seq = require('./seq.js');
var Sequelize = require('sequelize');
var chromosome = seq.define('chromosome', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name:{
      type: Sequelize.STRING(10),
    },
    genes:{
      type: Sequelize.INTEGER,
    },
    bps:{
      type: Sequelize.INTEGER,
    },
    description: {
      type: Sequelize.TEXT,
    },
 },
  {
    underscored: true,
    freezeTableName: true // Model tableName will be the same as the model name
  });

//seq.sync();
module.exports=chromosome;
