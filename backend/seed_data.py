from app.database.connection import SessionLocal, Base, engine
from app.services.document_processor import DocumentProcessor
from pathlib import Path

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()
base_dir = Path(__file__).resolve().parent

pdf_path = base_dir / "uploads" / "sample_renewable_energy.pdf"
docx_path = base_dir / "uploads" / "sample_nlp_research.docx"

if pdf_path.exists():
    with open(pdf_path, "rb") as f:
        res1 = DocumentProcessor.process_document("sample_renewable_energy.pdf", f.read(), db)
        print("Indexed PDF:", res1["document"].original_name, "Chunks:", res1["document"].chunk_count)

if docx_path.exists():
    with open(docx_path, "rb") as f:
        res2 = DocumentProcessor.process_document("sample_nlp_research.docx", f.read(), db)
        print("Indexed DOCX:", res2["document"].original_name, "Chunks:", res2["document"].chunk_count)

db.close()
