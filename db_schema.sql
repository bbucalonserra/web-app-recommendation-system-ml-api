CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    last_name TEXT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_forms_completed INT NOT NULL,
    creation_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forms (
    username TEXT PRIMARY KEY,
    age INT,
    sex INT, -- 1: Male, 0: Female ("is_male")
    education INT, -- 1: Primary, 2: Secondary, 3: Bachelor, 4: Postgraduate
    has_children INT, -- 1: Yes, 0: No
    has_property INT, -- 1: Yes, 0: No
    has_car INT, -- 1: Yes, 0: No
    ever_loan INT, -- 1: Yes, 0: No
    loan_paid INT, -- 1: Yes, 0: No
    annual_salary INT, -- 1: <30k, 2: 30k-50k, etc.
    invested_amount INT -- 1: <1k, 2: 1k-10k, etc.
);