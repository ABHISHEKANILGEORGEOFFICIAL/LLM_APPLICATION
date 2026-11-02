from typing import List, Dict, Any
import re

class DocumentChunker:
    @staticmethod
    def chunk_pages(
        pages: List[Dict[str, Any]],
        chunk_size_words: int = 200,
        chunk_overlap_words: int = 40
    ) -> List[Dict[str, Any]]:
        """
        Splits extracted pages into overlapping semantic chunks, preserving page references.
        Returns: [{"page_number": int, "content": str, "word_count": int, "char_count": int, "chunk_index": int}]
        """
        all_chunks = []
        global_chunk_idx = 0

        for page in pages:
            page_num = page["page_number"]
            text = page["text"]

            # Normalize whitespaces
            clean_text = re.sub(r'\s+', ' ', text).strip()
            words = clean_text.split()
            if not words:
                continue

            # If text is small, treat page as single chunk
            if len(words) <= chunk_size_words:
                all_chunks.append({
                    "chunk_index": global_chunk_idx,
                    "page_number": page_num,
                    "content": clean_text,
                    "word_count": len(words),
                    "char_count": len(clean_text)
                })
                global_chunk_idx += 1
                continue

            step = max(1, chunk_size_words - chunk_overlap_words)
            for i in range(0, len(words), step):
                chunk_slice = words[i:i + chunk_size_words]
                chunk_str = " ".join(chunk_slice)
                all_chunks.append({
                    "chunk_index": global_chunk_idx,
                    "page_number": page_num,
                    "content": chunk_str,
                    "word_count": len(chunk_slice),
                    "char_count": len(chunk_str)
                })
                global_chunk_idx += 1

                if i + chunk_size_words >= len(words):
                    break

        return all_chunks
