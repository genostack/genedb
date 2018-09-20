var seq = require('./seq.js');
var Sequelize = require('sequelize');
var chromosome = require('./chromosome.js');
var genes = seq.define('genes', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    symbol: {
      type: Sequelize.STRING(255),
    },
    name: {
      type: Sequelize.TEXT,
    },
    abstract:{
      type: Sequelize.TEXT,
    },
    description:{
      type: Sequelize.TEXT,
    },
    location:{
      type:Sequelize.STRING(10),
    },
    region_start: {
      type: Sequelize.INTEGER,
    },
    region_end: {
      type: Sequelize.INTEGER,
    },
    band:{
      type: Sequelize.STRING(50)
    }
 },
  {
    underscored: true,
    freezeTableName: true // Model tableName will be the same as the model name
  });

//genes.belongsTo(chromosome);
module.exports=genes;
