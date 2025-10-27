from pathlib import Path
text = Path('src/app/exam/start/page.tsx').read_text(encoding='utf-8')
start = text.index('const startExam')
end = text.index('const infoItems')
print(text[start:end])
