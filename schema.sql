-- 1. Profile Table
CREATE TABLE IF NOT EXISTS profile (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    headline VARCHAR(255) NOT NULL,
    bio TEXT NOT NULL,
    github_username VARCHAR(100) NOT NULL,
    linkedin_url VARCHAR(255),
    location VARCHAR(100),
    email VARCHAR(100)
);

-- 2. Certifications Table
CREATE TABLE IF NOT EXISTS certifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    issuer VARCHAR(100) NOT NULL,
    issue_date VARCHAR(50),
    credential_url VARCHAR(255)
);

-- 3. Feedback / Testimonials Table
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(100) NOT NULL,
    designation VARCHAR(150),
    message TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Messages / Connect Table
CREATE TABLE IF NOT EXISTS connect_messages (
    id SERIAL PRIMARY KEY,
    sender_name VARCHAR(100) NOT NULL,
    sender_email VARCHAR(100) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Real Profile Data
INSERT INTO profile (name, headline, bio, github_username, linkedin_url, location, email)
VALUES (
    'Shashank Singh Bisht',
    'Senior Android & AI Application Developer',
    'Specializing in native mobile application development, Kotlin, Jetpack Compose, MVVM architectures, and AI agent integration with over 6 years of engineering experience.',
    'MrShashankBisht', 
    'https://www.linkedin.com/in/mr-shashankbisht/',
    'New Delhi, India',
    'contact@shashankbisht.dev'
);

INSERT INTO certifications (title, issuer, issue_date, credential_url)
VALUES 
('AWS Certified Solutions Architect', 'Amazon Web Services', '2025', 'https://aws.amazon.com'),
('PostgreSQL Professional Developer', 'Postgres Guild', '2025', 'https://postgresql.org'),
('Creativity Challenge-3', 'IGNOU', '2020', '');

INSERT INTO feedback (client_name, designation, message, rating)
VALUES 
('Engineering Lead', 'Wakencode Technologies', 'Delivered exceptional architectural solutions with Jetpack Compose and local AI toolchains.', 5),
('Product Manager', 'SiteRecon', 'Outstanding performance optimizing high-scale native mobile features and mapping logic.', 5);


-- Alter existing table or create with source_url
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS source_url VARCHAR(255);

-- (If recreating the table):
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(100) NOT NULL,
    designation VARCHAR(150),
    message TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    source_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed with clickable source links
INSERT INTO feedback (client_name, designation, message, rating, source_url)
VALUES 
('Engineering Lead', 'Wakencode Technologies', 'Delivered exceptional architectural solutions with Jetpack Compose and local AI toolchains.', 5, 'https://www.linkedin.com/in/mr-shashankbisht/'),
('Product Manager', 'SiteRecon', 'Outstanding performance optimizing high-scale native mobile features and mapping logic.', 5, 'https://www.linkedin.com/in/mr-shashankbisht/');


\c portfolio_db;

-- 1. Experiences Table (Job Journey)
CREATE TABLE IF NOT EXISTS experiences (
    id SERIAL PRIMARY KEY,
    role VARCHAR(150) NOT NULL,
    company VARCHAR(150) NOT NULL,
    location VARCHAR(100),
    period VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    skills_used TEXT,
    order_index INT DEFAULT 0
);

-- 2. Featured Projects Table (Corporate Apps, Systems & AI Projects)
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Mobile App', 'AI System', 'Corporate'
    description TEXT NOT NULL,
    technologies VARCHAR(255) NOT NULL,
    live_url VARCHAR(255),
    github_url VARCHAR(255)
);

-- Seed Career Journey
INSERT INTO experiences (role, company, location, period, description, skills_used, order_index)
VALUES 
(
    'Senior Android & AI Application Developer',
    'Wakencode Technologies',
    'New Delhi, India',
    'June 2024 - Present',
    'Architecting high-scale native Android solutions using Jetpack Compose, Clean Architecture, and integrating local AI agent pipelines, Qwen LLMs via LiteLLM/Ollama, and AWS cloud backends.',
    'Kotlin, Jetpack Compose, MVVM, LiteLLM, Ollama, Coroutines, AWS',
    1
),
(
    'Android Developer',
    'SiteRecon',
    'New Delhi, India',
    'April 2022 - August 2023',
    'Engineered map-intensive native Android workflows, offline-first Room databases, high-precision geospatial feature tracking, and optimized rendering pipelines.',
    'Android SDK, Room DB, Mapping APIs, Kotlin, Retrofit',
    2
),
(
    'Software Engineer (Android)',
    'Oodles Technologies',
    'Gurugram, India',
    'December 2020 - April 2022',
    'Built enterprise Android client apps, RESTful integrations, background synchronization services, and multi-module architectures.',
    'Java, Kotlin, Architecture Components, REST APIs, Git',
    3
),
(
    'Associate Android Developer',
    'MobisoK Labs',
    'New Delhi, India',
    'September 2019 - December 2020',
    'Developed core UI layouts, custom views, SQLite database helpers, and integrated third-party payment & authentication SDKs.',
    'Java, Android XML, SQLite, Third-party SDKs',
    4
);

-- Seed Featured Projects (AI & Mobile Systems)
INSERT INTO projects (title, category, description, technologies, live_url, github_url)
VALUES 
(
    'Voice Biometric & AI Agent System',
    'AI System',
    'Multi-agent voice biometrics pipeline with local Whisper speech recognition, PostgreSQL voice embedding storage, and autonomous LLM task execution.',
    'Python, Faster-Whisper, PostgreSQL, LiteLLM, Ollama',
    '',
    'https://github.com/MrShashankBisht'
),
(
    'Enterprise Field Automation & Mapping Suite',
    'Corporate App',
    'Geospatial asset management and site measurement Android client with offline caching, high-resolution rendering, and real-time cloud sync.',
    'Kotlin, Jetpack Compose, Room DB, Coroutines, AWS S3',
    '',
    'https://github.com/MrShashankBisht'
),
(
    'AI-Powered Android Agent Engine',
    'Mobile App',
    'On-device and local LLM client engine using Kotlin Multiplatform, LiteLLM proxy orchestration, and streaming UI responses.',
    'Kotlin, Compose Multiplatform, REST, Docker',
    '',
    'https://github.com/MrShashankBisht'
);

\c portfolio_db;

-- 1. Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'Core'
);

-- Seed Skills into DB
INSERT INTO skills (name, category) VALUES
('Kotlin / Java', 'Mobile'),
('Jetpack Compose', 'Mobile'),
('Android SDK / NDK', 'Mobile'),
('MVVM & Clean Architecture', 'Architecture'),
('Coroutines & Flow', 'Mobile'),
('Room DB & PostgreSQL', 'Database'),
('AI Agents & LiteLLM', 'AI/ML'),
('Ollama & Local LLMs', 'AI/ML'),
('AWS (Lambda, S3, DynamoDB)', 'Cloud'),
('Docker & Nginx', 'DevOps'),
('Retrofit & REST APIs', 'Networking');


\c portfolio_db;

-- Education Table
CREATE TABLE IF NOT EXISTS education (
    id SERIAL PRIMARY KEY,
    degree VARCHAR(150) NOT NULL,
    institution VARCHAR(200) NOT NULL,
    period VARCHAR(100) NOT NULL,
    description TEXT,
    order_index INT DEFAULT 0
);

-- Seed Academic Journey
INSERT INTO education (degree, institution, period, description, order_index)
VALUES 
(
    'MSc in International Hospitality, Events & Tourism Management',
    'Oxford Brookes University',
    '2024 - 2026',
    'Postgraduate specialization focusing on international management, digital communications, and consumer engagement strategies.',
    1
),
(
    'Postgraduate Degree in Computer Applications (MCA / PGDCA)',
    'Delhi, India',
    '2018 - 2021',
    'Advanced core curriculum in algorithms, database management systems, data structures, and software engineering.',
    2
),
(
    'Bachelor of Arts (BA)',
    'Delhi University',
    '2015 - 2018',
    'Comprehensive coursework in Economics, English, and Political Science.',
    3
);
