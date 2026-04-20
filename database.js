const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'premier_league.db');
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
const dbMode = isVercel ? sqlite3.OPEN_READONLY : (sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

// Initialize in-memory/file database
const db = new sqlite3.Database(dbPath, dbMode, (err) => {
    if (err) {
        console.error('Error opening database ', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        if (!isVercel) {
            db.serialize(() => {
                db.run(`CREATE TABLE IF NOT EXISTS nations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                code TEXT NOT NULL
            )`);
            
            db.run(`CREATE TABLE IF NOT EXISTS players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                position TEXT NOT NULL,
                appearances INTEGER DEFAULT 0,
                goals INTEGER DEFAULT 0,
                assists INTEGER DEFAULT 0,
                clean_sheets INTEGER DEFAULT 0,
                win_rate REAL DEFAULT 0,
                nation_id INTEGER,
                image_url TEXT,
                FOREIGN KEY(nation_id) REFERENCES nations(id)
            )`);

            // Seed initial data if empty
            db.get("SELECT count(*) as count FROM nations", (err, row) => {
                if (row && row.count === 0) {
                    seedDatabase();
                }
            });
        });
        }
    }
});

function seedDatabase() {
    console.log("Seeding Database with sample Premier League data...");
    
    // Insert Nations
    const nations = [
        ['대한민국', 'KR'],
        ['노르웨이', 'NO'],
        ['벨기에', 'BE'],
        ['이집트', 'EG'],
        ['잉글랜드', 'GB-ENG'],
        ['네덜란드', 'NL']
    ];

    const insertNationData = db.prepare(`INSERT INTO nations (name, code) VALUES (?, ?)`);
    nations.forEach(n => insertNationData.run(n));
    insertNationData.finalize();

    setTimeout(() => {
        const players = [
            // [Name, Position, Apps, Goals, Assists, CleanSheets, WinRate, Nation(Index), img]
            ['손흥민', '공격수', 300, 120, 60, 0, 52.3, 1, 'https://resources.premierleague.com/premierleague/photos/players/250x250/p85971.png'],
            ['엘링 홀란드', '공격수', 65, 63, 13, 0, 75.1, 2, 'https://resources.premierleague.com/premierleague/photos/players/250x250/p223094.png'],
            ['마르틴 외데고르', '미드필더', 120, 31, 23, 0, 64.2, 2, 'https://resources.premierleague.com/premierleague/photos/players/250x250/p184029.png'],
            ['케빈 데 브라위너', '미드필더', 260, 68, 112, 0, 68.5, 3, 'https://resources.premierleague.com/premierleague/photos/players/250x250/p61366.png'],
            ['모하메드 살라', '공격수', 260, 157, 69, 0, 61.8, 4, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mohamed_Salah_2018.jpg/500px-Mohamed_Salah_2018.jpg'],
            ['부카요 사카', '공격수', 170, 47, 40, 0, 58.2, 5, 'https://resources.premierleague.com/premierleague/photos/players/250x250/p223340.png'],
            ['버질 반 다이크', '수비수', 261, 21, 6, 110, 65.5, 6, 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/20160604_AUT_NED_8876_%28cropped%29.jpg/500px-20160604_AUT_NED_8876_%28cropped%29.jpg']
        ];
        
        const insertPlayer = db.prepare(`INSERT INTO players (name, position, appearances, goals, assists, clean_sheets, win_rate, nation_id, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        players.forEach(p => insertPlayer.run(p));
        insertPlayer.finalize();
        console.log("Database Seeded Successfully.");
    }, 1000);
}

module.exports = db;
