import sqlite3
from config import db, db_path

class User(db.Model):
    __tablename__ = 'user'
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    clinical_appe = db.Column(db.Integer, nullable=False, default=0)
    academic_appe = db.Column(db.Integer, nullable=False, default=0)
    total_appe = db.Column(db.Float, nullable=False, default=0.0)
    research_electives = db.Column(db.Integer, nullable=False, default=0)
    proctoring = db.Column(db.Float, nullable=False, default=0.0)
    grading = db.Column(db.Integer, nullable=False, default=0)

    service_id = db.relationship('Course', backref='user', lazy=True)

class Course(db.Model):
    __tablename__ = 'course'
    course_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    course_name = db.Column(db.String(100), nullable=False)
    enroll = db.Column(db.String(2), nullable=False, default= 'N')
    didactic_credit = db.Column(db.Float, nullable=False, default=0)
    lab_credit = db.Column(db.Float, nullable=False, default=0)
    coordinator = db.Column(db.String(2), nullable=False, default='N')
    clinical_lead = db.Column(db.String(2), nullable=False, default= 'N')
    lecture_total = db.Column(db.Integer, nullable=False, default=0)
    lab_total = db.Column(db.Float, nullable=False, default=0)
    lecture_faculty = db.Column(db.Integer, nullable=False, default=0)
    lab_design = db.Column(db.Float, nullable=False, default=0)
    lab_proctor = db.Column(db.Float, nullable=False, default=0)
    total = db.Column(db.Float, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)

class UpdateRequest(db.Model):
    __tablename__ = 'update_request'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.course_id'), nullable=True)
    enroll = db.Column(db.String(2))
    coordinator = db.Column(db.String(2))
    clinical_lead = db.Column(db.String(3))
    clinical_appe = db.Column(db.Integer)
    academic_appe = db.Column(db.Integer)
    lecture_faculty = db.Column(db.Integer)
    lab_design = db.Column(db.Float)
    lab_proctor = db.Column(db.Float)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
class DatabaseHandler:
    def __init__(self, db_name=None):
        if db_name is None:
            db_name = db_path
        self.conn = sqlite3.connect(db_name)
        self.cursor = self.conn.cursor()
        self.setup_status_table()

    def setup_status_table(self):
        self.cursor.execute('''CREATE TABLE IF NOT EXISTS setup_status (
                                id INTEGER PRIMARY KEY, 
                                setup_done BOOLEAN)''')
        self.conn.commit()

    def create_table(self, table_name, create_statement):
        self.cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}';")
        if not self.cursor.fetchone():
            self.cursor.execute(create_statement)
            print(f"{table_name} table created.")

    def setup_database(self):
        self.cursor.execute("SELECT setup_done FROM setup_status WHERE id = 1")
        setup_status = self.cursor.fetchone()

        if setup_status and setup_status[0]:
            print("Database setup has already been completed.")
            return
        
        tables = [
            ("user", """CREATE TABLE IF NOT EXISTS user(
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                clinical_appe INTERGER NOT NULL,
                academic_appe INTERGER NOT NULL,
                total_appe DOUBLE NOT NULL,
                research_electives INTERGER NOT NULL,
                proctoring DOUBLE NOT NULL,
                grading INTERGER NOT NULL)"""),
            ("course", """CREATE TABLE IF NOT EXISTS course(
                course_id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_name TEXT NOT NULL,
                enroll TEXT NOT NULL,
                didactic_credit DOUBLE NOT NULL,
                lab_credit DOUBLE NOT NULL,
                coordinator TEXT NOT NULL,
                clinical_lead TEXT NOT NULL,
                lecture_total INTEGER NOT NULL,
                lab_total DOUBLE NOT NULL,
                lecture_faculty INTEGER NOT NULL,
                lab_design DOUBLE NOT NULL,
                lab_proctor DOUBLE NOT NULL,
                total DOUBLE NOT NULL,
                user_id INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user(user_id))"""),
            ("update_request", """CREATE TABLE IF NOT EXISTS update_request(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                course_id INTEGER,
                enroll TEXT,
                coordinator TEXT,
                clinical_lead TEXT,
                clinical_appe INTEGER,
                academic_appe INTEGER,
                lecture_faculty INTEGER,
                lab_design DOUBLE,
                lab_proctor DOUBLE,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES user(user_id),
                FOREIGN KEY (course_id) REFERENCES course(course_id))""")
        ]

        for table_name, create_statement in tables:
            self.create_table(table_name, create_statement)

        self.cursor.execute("INSERT OR REPLACE INTO setup_status (id, setup_done) VALUES (1, TRUE)")
        self.conn.commit()
        self.close()
        print("Database setup completed successfully.")

    def close(self):
        self.conn.close()