var seq = require('./seq.js');
var Sequelize = require('sequelize');
var gene = require('./genes.js');
var snps = seq.define('snp', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    description:{
      type: Sequelize.TEXT,
    },
    rsid: {
      type: Sequelize.STRING(50),
    },
    alias: {
      type: Sequelize.STRING(50),
    },
    genes_id: {
      type: Sequelize.INTEGER,
    },
    position:{
      type: Sequelize.INTEGER
    },
    orientation:{
      type: Sequelize.STRING(10)
    }
 },
  {
    underscored: true,
    freezeTableName: true // Model tableName will be the same as the model name
  });

snps.belongsTo(gene,{foreignKey:'genes_id'});
module.exports=snps;
