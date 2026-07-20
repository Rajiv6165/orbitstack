-- OrbitStack — PostgreSQL initialisation
-- Creates one database per microservice so each service has its own schema boundary.

CREATE DATABASE auth_db;
CREATE DATABASE catalog_db;
CREATE DATABASE order_db;
