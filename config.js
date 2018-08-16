const config = {
  srcdb:{
    'HGNC': 'http://rest.genenames.org/fetch/status/Approved',
    'entrez': 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&retmode=json&id=',
    'ensembl': 'https://rest.ensembl.org/lookup/symbol/homo_sapiens/'
  },
  targetdb: {
    host: 'localhost',
    port: 5432,
    name: 'genedb',
    user: 'postgres',
    password: 'postgres',
    type: 'postgres'
  }
};

module.exports = config;
