var seq = require('./seq.js');
var Sequelize = require('sequelize');
var snps = require('./snp.js');
var genotypes = seq.define('genotypes', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    pair: {
      type: Sequelize.TEXT,
    },
    magnitude:{
      type: Sequelize.FLOAT,
    },
    repute:{
      type: Sequelize.STRING(10),
    },
    summary:{
      type:Sequelize.TEXT,
    },
    snp_id: {
      type: Sequelize.INTEGER,
    },
    name: {
      type: Sequelize.STRING(50),
    }
 },
  {
    underscored: true,
    freezeTableName: true // Model tableName will be the same as the model name
  });

genotypes.belongsTo(snps);
module.exports=genotypes;
