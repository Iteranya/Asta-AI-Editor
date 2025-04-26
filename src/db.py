from dataclasses import dataclass
import sqlite3

@dataclass
class Project:
    title: str|None = None
    slug:str|None = None
    description: int|None = None
    ai_notes:str|None = None
    markdown:str|None = None
    thumb:str|None = None
    metadata:str = "" # Stored Json from Metadata, contains json text with escaped string
    type:str = "default" # This is for Kali to process

class ProjectDB:
    def __init__(self, db_name="projects.db"):
        self.conn = sqlite3.connect(db_name)
        self.create_table()

    def create_table(self):
        self.conn.execute('''
            CREATE TABLE IF NOT EXISTS project (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                slug TEXT NOT NULL UNIQUE,
                description INTEGER,
                ai_notes TEXT,
                markdown TEXT,
                thumb TEXT,
                metadata TEXT,
                type TEXT DEFAULT 'default'
            )
        ''')
        self.conn.commit()

    def create(self, project: Project):
        sql = '''
            INSERT INTO project (title, slug, description, ai_notes, markdown, thumb, metadata, type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        '''
        self.conn.execute(sql, (project.title, project.slug, project.description, project.ai_notes, project.markdown, project.thumb, project.metadata, project.type))
        self.conn.commit()

    def get_by_slug(self, slug: str) -> Project | None:
        sql = 'SELECT title, slug, description, ai_notes, markdown, thumb, metadata, type FROM project WHERE slug = ?'
        cur = self.conn.execute(sql, (slug,))
        row = cur.fetchone()
        if row:
            return Project(*row)
        return None

    def update(self, slug: str, **kwargs):
        fields = ', '.join(f"{key}=?" for key in kwargs.keys())
        values = list(kwargs.values()) + [slug]
        sql = f'UPDATE project SET {fields} WHERE slug = ?'
        self.conn.execute(sql, values)
        self.conn.commit()

    def delete(self, slug: str):
        sql = 'DELETE FROM project WHERE slug = ?'
        self.conn.execute(sql, (slug,))
        self.conn.commit()

    def list_all(self) -> list[Project]:
        sql = 'SELECT title, slug, description, ai_notes, markdown, thumb, metadata, type FROM project'
        cur = self.conn.execute(sql)
        return [Project(*row) for row in cur.fetchall()]

    def close(self):
        self.conn.close()

def get_db():
    db = ProjectDB()
    try:
        yield db
    finally:
        db.close()