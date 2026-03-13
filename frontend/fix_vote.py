import re

with open('frontend/src/components/Vote.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove orphaned translation object within fetchUser  
# Match from 'navigation:' up to and including the old toggleLanguage function
pattern = r'navigation: "Navigation".*?dispatchEvent\(new CustomEvent\("languageChanged".*?\}\);\s*};'
cleaned = re.sub(pattern, '', content, flags=re.DOTALL)

# Also remove any stray closing braces from orphaned object
cleaned = re.sub(r'\s+};?(?=\s+useEffect\(\(\) => \{)', '', cleaned)

with open('frontend/src/components/Vote.jsx', 'w', encoding='utf-8') as f:
    f.write(cleaned)

print('Vote.jsx cleaned successfully')
