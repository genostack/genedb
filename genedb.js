const commander = require('commander');
const {createSnps, createGenotypes, translateSnps, translateGenotypes} = require('./snpedia');

commander
    .version('1.0.0')
    .description('Create different genetic databases locally.');

commander
    .command('createsnps')
    .description('Create snps from snpedia if not exist.')
    .action(()=>{
	createSnps();
    });

commander
    .command('creategenotypes')
    .description('Create all genotypes of a snp')
    .action(()=>{
        createGenotypes();
    });

commander
    .command('translatesnps')
    .description('Translate snps into Chinese')
    .action(()=>{
	translateSnps();
    });

commander
    .command('translategenotypes')
    .description('Translate genotypes into Chinese')
    .action(()=>{
        translateGenotypes();
    });

commander.parse(process.argv);
