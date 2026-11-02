import os
from typing import List, Dict, Any
from pathlib import Path
import pymupdf  # PyMuPDF
import docx
from pptx import Presentation

class TextExtractor:
    @staticmethod
    def extract(file_path: str, file_type: str) -> List[Dict[str, Any]]:
        """
        Extracts text from a document while preserving page/slide boundaries.
        Returns a list of dicts: [{"page_number": int, "text": str}]
        """
        file_path_str = str(file_path)
        if file_type == "pdf":
            return TextExtractor._extract_pdf(file_path_str)
        elif file_type == "docx":
            return TextExtractor._extract_docx(file_path_str)
        elif file_type == "pptx":
            return TextExtractor._extract_pptx(file_path_str)
        elif file_type == "txt":
            return TextExtractor._extract_txt(file_path_str)
        else:
            raise ValueError(f"Unsupported file format: {file_type}")

    @staticmethod
    def _extract_pdf(file_path: str) -> List[Dict[str, Any]]:
        pages = []
        doc = pymupdf.open(file_path)
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            text = page.get_text()
            if text and text.strip():
                pages.append({
                    "page_number": page_idx + 1,
                    "text": text.strip()
                })
        doc.close()
        return pages

    @staticmethod
    def _extract_docx(file_path: str) -> List[Dict[str, Any]]:
        doc = docx.Document(file_path)
        # Approximate pages by paragraph grouping (every ~400 words)
        pages = []
        current_page_text = []
        word_count = 0
        page_num = 1

        for p in doc.paragraphs:
            text = p.text.strip()
            if not text:
                continue
            words = len(text.split())
            if word_count + words > 450 and current_page_text:
                pages.append({
                    "page_number": page_num,
                    "text": "\n".join(current_page_text)
                })
                page_num += 1
                current_page_text = [text]
                word_count = words
            else:
                current_page_text.append(text)
                word_count += words

        if current_page_text:
            pages.append({
                "page_number": page_num,
                "text": "\n".join(current_page_text)
            })
        return pages

    @staticmethod
    def _extract_pptx(file_path: str) -> List[Dict[str, Any]]:
        prs = Presentation(file_path)
        pages = []
        for idx, slide in enumerate(prs.slides):
            slide_texts = []
            for shape in slide.shapes:
                if hasattr(shape, "text") and shape.text.strip():
                    slide_texts.append(shape.text.strip())
            full_text = "\n".join(slide_texts)
            if full_text.strip():
                pages.append({
                    "page_number": idx + 1,
                    "text": full_text.strip()
                })
        return pages

    @staticmethod
    def _extract_txt(file_path: str) -> List[Dict[str, Any]]:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        
        # Split txt into ~500 word sections representing logical pages
        words = content.split()
        if not words:
            return []
        
        chunk_words = 450
        pages = []
        page_num = 1
        for i in range(0, len(words), chunk_words):
            page_text = " ".join(words[i:i + chunk_words])
            pages.append({
                "page_number": page_num,
                "text": page_text
            })
            page_num += 1
        return pages
