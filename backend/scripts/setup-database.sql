-- SQL Script to create database and user for VisaLink Africa
-- Run this as PostgreSQL superuser (postgres user)

-- Create database
CREATE DATABASE visalink_africa;

-- Create user
CREATE USER visalink_user WITH PASSWORD 'Teamwork@2019';

-- Grant all privileges on database to user
GRANT ALL PRIVILEGES ON DATABASE visalink_africa TO visalink_user;

-- Connect to the database and grant schema privileges
\c visalink_africa

-- Grant all privileges on schema
GRANT ALL ON SCHEMA public TO visalink_user;

-- Grant privileges on all existing tables (if any)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO visalink_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO visalink_user;

-- Grant privileges on future tables and sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO visalink_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO visalink_user;

-- Make user owner of database (optional, but ensures full control)
ALTER DATABASE visalink_africa OWNER TO visalink_user;
