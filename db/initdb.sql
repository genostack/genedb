create database genedb;
create table chromosome (
  id   serial primary key,
  name varchar(10) not null,
  genes int not null,
  bps   int not null,
  description text not null)  
);

create table genes (
  id serial primary key,
  symbol varchar(255) not null,
  name text not null,
  abstract text not null,
  description text not null,
  location varchar(10) not null,
  region_start int not null,
  region_end int not null,
  band varchar(50) not null
);

create table snp (
  id serial primary key,
  rsid int not null,
  description text,
  genes_id int
);

create table genotypes (
  id serial primary key,
  pair varchar(10),
  orientation varchar(10),
  magnitude int,
  repute varchar(10),
  summary text,
  snp_id int
);
