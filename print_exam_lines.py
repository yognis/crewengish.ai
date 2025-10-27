from pathlib import Path
text = Path('src/app/exam/[sessionId]/page.tsx').read_text(encoding='utf-8')
lines = text.splitlines()
for i,line in enumerate(lines,1):
    if 120 <= i <= 210:
        print(f"{i}: {line}")
