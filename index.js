const translate = require('google-translate-api-cn');
var fetch = require('node-fetch');

const genes = require('./model/genes.js');
const config = require('./config');

function query(data,i){
    var gene = {};
    var entrez_id = data.response.docs[i].entrez_id;
    //get gene summary from entrez and translate it into Chinese
    fetch(config.srcdb.entrez + entrez_id, {headers:{'Accept': 'application/json'}})
           .then(res => res.json())
           .then(summary=> {
                console.log(summary);
                var summaryres = summary['result'][entrez_id];
                gene.symbol=summaryres['name'],
                gene.name=summaryres['description'],
                gene.description='',
                gene.location=summaryres['chromosome'],
                gene.region_start=summaryres['genomicinfo'][0]['chrstart'],
                gene.region_end=summaryres['genomicinfo'][0]['chrstop'],
                gene.band=summaryres['maplocation'];
                translate(summaryres['summary'], {from: 'en', to: 'zh-cn'})
                             .then(res => {  
                                     //save it to the local database
                                     gene.abstract=res.text;
                                     genes.create(gene);
                                  }).catch(err => {console.error(err);}); 
           })
           .catch(err =>console.error(err));  
}


//search hgnc for all the approved gene names
fetch(config.srcdb.HGNC,{headers:{'Accept': 'application/json'}})
    .then(res => res.json())
    .then(data => {
        for (var i = 0;i < data.response.numFound;i++){                     
          //delay 1s or server will block us.
          setTimeout(query.bind(null,data,i),1000*i);
        }  
      })
    .catch(err => console.error(err));
