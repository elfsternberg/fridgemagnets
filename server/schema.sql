BEGIN;
CREATE TABLE tweets (
    address CHAR(42) NOT NULL,
    tweet TEXT NOT NULL,
    entered DATETIME NOT NULL
);
COMMIT;
