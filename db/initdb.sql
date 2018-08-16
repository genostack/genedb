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
  band varchar(32) not null
);
