const translate = require('google-translate-api-cn');
const fetch = require('node-fetch');
const MWbot = require('mwbot');
const genes = require('./model/genes.js');
const snp = require('./model/snp.js');
const genotype = require('./model/genotypes.js');
const seq = require('./model/seq.js');
//option 1:translate wiki data to json.The structure is too complicated.
//var wtf = require('wtf_wikipedia');

//option 2:use xpath to tranverse html
//https://stackoverflow.com/questions/26421022/wikimedia-api-extract-json-or-xml-from-revision-wikitext-to-use-in-php
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;
//init snpedia
let snpedia = new MWbot();
snpedia.setApiUrl("https://bots.snpedia.com/api.php");
snpedia.setGlobalRequestOptions({
  json: true,
  headers: {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
  },
});

//https://bots.snpedia.com/api.php?action=parse&pageid=9994&prop=text&format=json
function getGenotypePage(pageid, title){
    console.log("getting genotype====================="+pageid);
    snpedia.request({
        action: 'parse',
        prop: 'text',
        pageid: pageid
    }).then(response=>{
	//get content 
        var wikitext = response['parse']['text']['*'];
        var doc = new dom().parseFromString(wikitext);

	var genotypes = {};        
	var snpname = xpath.select("//td[contains(.,'of')]/following-sibling::td[1]//text()", doc);
	if (snpname.length > 0){
            genotypes.name = snpname[0].nodeValue;
	}
	else {
	    //may be no of
	    genotypes.name = title.replace(/\(.*\)/, '');
	}
        var magnitude= xpath.select("//td[contains(.,'Magnitude')]/following-sibling::td[1]//text()", doc);
	if (magnitude.length > 0){
            genotypes.magnitude = magnitude[0].nodeValue; 
	}
        var repute= xpath.select("//td[contains(.,'Repute')]/following-sibling::td[1]//text()", doc);
	if (repute.length > 0){
            genotypes.repute = repute[0].nodeValue; 
	}
        var pContent = xpath.select("//div/p[normalize-space()]", doc);
        var pContentAll = "";
        pContent.forEach(element => {
            if (element.textContent) {
		//combine all the paragraph together.
                pContentAll = pContentAll + element.textContent.replace(/(?:\r\n|\r|\n)/g," ").trim() + '<br/>';
            }
        });
        genotypes.summary = pContentAll;
	genotypes.pair = title.match(/\(.*\)/g)[0];
        genotype.create(genotypes).then(genotypedb=>{
	    snp.findOne({where:seq.where(seq.fn('lower',seq.col('rsid')), 
		                                genotypedb.name.toLowerCase())
	                })
		.then(snpfind=>{
                    if(snpfind){
		        genotypedb.update({snp_id:snpfind.id});
		}
	    });
	});	
    });
}

//get snp page of 'pageid'.snpedia returns data using pageid
function getSnpPage(pageid){
    console.log("getting SNP====================="+pageid);
    snpedia.request({
        action: 'parse',
        prop: 'text',
        pageid: pageid
    }).then(response=>{
        //create this snp anyway.snp like 'I1000001' has little info.we just insert it into database.
        var snpdb = {};
        snpdb.rsid = response['parse']['title'];

        //get content 
        var wikitext = response['parse']['text']['*'];
        var doc = new dom().parseFromString(wikitext);
        //get snp main content
        //var snpContent = xpath.select("//div/p/*[last()]/text()",doc)[0].nodeValue;
        var snpContent = xpath.select("//div/p[normalize-space()]", doc);
        var snpContentAll = "";
        snpContent.forEach(element => {
            if (element.textContent) {
		//combine all the paragraph together.
                snpContentAll = snpContentAll + element.textContent.replace(/(?:\r\n|\r|\n)/g," ").trim() + '<br/>';
            }
        });
        snpdb.description = snpContentAll;
        //get other info 
	var position = xpath.select("//td[contains(.,'Position')]/following-sibling::td[1]//text()", doc);
        //position may be empty 
        if (position.length != 0) {
            snpdb.position = position[0].nodeValue;
        }
        var alias = xpath.select("//td[contains(.,'alias')]/following-sibling::td[1]//text()", doc);
        if (alias.length != 0) {
            snpdb.alias = alias[0].nodeValue;
        }
        var orientation = xpath.select("//td[contains(.,'Orientation')]/following-sibling::td[1]//text()", doc);
        if (orientation.length != 0) {
            snpdb.orientation = orientation[0].nodeValue;
        }
        
	snp.create(snpdb).then(snps => {
            //snp may not have gene info
            var geneinfo = xpath.select("//td[contains(.,'Gene')]/following-sibling::td[1]//text()", doc);
            if (geneinfo.length != 0) {
                genes.findOne({ where: { symbol: geneinfo[0].nodeValue } }).then(genefind => {
                    if(genefind){
                        snps.update({ genes_id: genefind.id });
                    }
                });
            };
      });
    });
}

//snpedia每次最多返回500项
var next = { 'cmcontinue': '', 'continue': '' };
var buffer = [];
function getGenotypes(next, callback){
    snpedia.request({
        action: 'query',
        list: 'categorymembers',
        cmtitle: 'Category:Is_a_genotype',
        cmlimit: '500',
        cmcontinue: next['cmcontinue'],
        continue: next['continue']
    })
    .then((response) => {
	console.log(buffer.length);
        buffer = buffer.concat(response['query']['categorymembers']);
        next = response['continue'];
        if (!response['continue']) {
	    console.log(buffer.length);
	    callback(buffer);
            return;
	}
        getGenotypes(next,callback);
    })
    .catch(err => {
      console.log(err);
    });
}

//获取所有的snp并添加到数据库　如果数据库中已有该数据则不添加
//如果需要更新　请使用更新接口
function getSnps(next,callback){
    snpedia.request({
        action: 'query',
        list: 'categorymembers',
        cmtitle: 'Category:Is_a_snp',
        cmlimit: '500',
        cmcontinue: next['cmcontinue'],
        continue: next['continue']
    })
    .then((response) => {
	console.log(buffer.length);
	buffer = buffer.concat(response['query']['categorymembers']);
        next = response['continue'];
        if (!response['continue']) {
	    console.log(buffer.length); 
	    callback(buffer);
            return;
	}
        getSnps(next,callback);
    })
    .catch(err => {
      console.log(err);
    });
}

//all command line function
function createSnps(){
    getSnps(next,function(pages){
	 snp.findAll().then(snpall=>{
                pages=pages.filter(snpinbuffer=>{
		    let save =  true;
                    for (let i = 0;i < snpall.length;i++){
                        if (snpall[i].rsid === snpinbuffer['title']) {
                            save = false;
                            break;
                        }
                    }
                    return save;
		});

                if(pages.length > 0){
		    pages.forEach(function(element,i){
                        setTimeout(getSnpPage.bind(null, element['pageid']), i * 500);
		    });
                }
	    });
    });
}

//get snp page of 'pageid'.snpedia returns data using pageid
function updateSnpPage(pageid){
    console.log("getting SNP====================="+pageid);
    snpedia.request({
        action: 'parse',
        prop: 'text',
        pageid: pageid
    }).then(response=>{
        //create this snp anyway.snp like 'I1000001' has little info.we just insert it into database.
        var snpdb = {};
        snpdb.rsid = response['parse']['title'];

        //get content 
        var wikitext = response['parse']['text']['*'];
        var doc = new dom().parseFromString(wikitext);
        //get snp main content
        //var snpContent = xpath.select("//div/p/*[last()]/text()",doc)[0].nodeValue;
        var snpContent = xpath.select("//div/p[normalize-space()]", doc);
        var snpContentAll = "";
        snpContent.forEach(element => {
            if (element.textContent) {
		//combine all the paragraph together.
                snpContentAll = snpContentAll + element.textContent.replace(/(?:\r\n|\r|\n)/g," ").trim() + '<br/>';
            }
        });
        snpdb.description = snpContentAll;
        //get other info 
	var position = xpath.select("//td[contains(.,'Position')]/following-sibling::td[1]//text()", doc);
        //position may be empty 
        if (position.length != 0) {
            snpdb.position = position[0].nodeValue;
        }
        var alias = xpath.select("//td[contains(.,'alias')]/following-sibling::td[1]//text()", doc);
        if (alias.length != 0) {
            snpdb.alias = alias[0].nodeValue;
        }
        var orientation = xpath.select("//td[contains(.,'Orientation')]/following-sibling::td[1]//text()", doc);
        if (orientation.length != 0) {
            snpdb.orientation = orientation[0].nodeValue;
        }
        
	snp.update(snpdb).then(snps => {
            //snp may not have gene info
            var geneinfo = xpath.select("//td[contains(.,'Gene')]/following-sibling::td[1]//text()", doc);
            if (geneinfo.length != 0) {
                genes.findOne({ where: { symbol: geneinfo[0].nodeValue } }).then(genefind => {
                    if(genefind){
                        snps.update({ genes_id: genefind.id });
                    }
                });
            };
      });
    });
}


function updateSnps(){
    getSnps(next,function(pages){
         snp.findAll().then(snpall=>{
                pages=pages.filter(snpinbuffer=>{
                    let save =  true;
                    for (let i = 0;i < snpall.length;i++){
                        if (snpall[i].rsid === snpinbuffer['title']) {
                            save = false;
                            break;
                        }
                    }
                    return save;
                });

                if(pages.length > 0){
                    pages.forEach(function(element,i){
                        setTimeout(updateSnpPage.bind(null, element['pageid']), i * 500);
                    });
                }
            });
    });
}
function createGenotypes(){
       getGenotypes(next,function(pages){
         genotype.findAll().then(genotypeall=>{
                pages=pages.filter(genotypeinbuffer=>{
                    let save =  true;
                    for (var i = 0;i < genotypeall.length;i++){
                        if ((genotypeall[i].name.toLowerCase()+genotypeall[i].pair.toLowerCase()) === genotypeinbuffer['title'].toLowerCase()) {
                            save = false;
                            break;
                        }
                    }
                    return save;
                });

                if(pages.length > 0){
                    pages.forEach(function(element,i){
                        console.log(element['title']);
                        setTimeout(getGenotypePage.bind(null, element['pageid'], element['title']), i * 500);
                    });
                }
            });
    });
}

async function translatesnp(snpdb){
    console.log('translating '+snpdb.rsid);
    var res = await  translate(snpdb['description'], { from: 'en', to: 'zh-cn' });
    console.log('==========end======');
    snpdb.description = res.text;
    await snpdb.save();
}

//function translateSnps(){
//    snp.findAll().then(snps=>{
//	var count = 0;
//        snps.forEach(snpdb => {
//            if(snpdb.description){
//	       count++;
//               setTimeout(translatesnp.bind(null,snpdb), count * 1000);
//	    }
//	});
//    });
//}

function translateSnps(){
    snp.findAll().then(async function(snps){
        for (var snpdb of snps){
            if(snpdb.description){
		 await translatesnp(snpdb);
	    }
	}
    });
}

async function translategenotype(genotype){
    console.log('translating '+ genotype.name+genotype.pair);
    console.log(genotype['summary']);
    var res = await translate(genotype['summary'], {from:'en', to: 'zh-cn'});
    console.log('======end======');
    genotype.summay = res.text;
    await genotype.save();
}
function translateGenotypes(){
    genotype.findAll().then(genotypes => {
	var count = 0;
        genotypes.forEach(genotypedb => {
	    if(genotypedb.summary){
	        count++;
		setTimeout(translategenotype.bind(null,genotypedb), count * 1000);
	    }
	});
    });
}
module.exports={createSnps,createGenotypes, translateSnps, translateGenotypes};

