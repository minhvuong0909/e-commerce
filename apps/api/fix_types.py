import os, glob, re

api_dir = r'd:\back_end\K19-MERN\allOfProject-js\e-commerce\apps\api\src'

for filepath in glob.glob(os.path.join(api_dir, 'controllers', '*.ts')):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = re.sub(r'req\.params(?!\s*as\s+any)', r'(req.params as any)', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

users_svc = os.path.join(api_dir, 'services', 'users.services.ts')
with open(users_svc, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('as string }', 'as any }')
content = content.replace('as string\n      }', 'as any\n      }')

with open(users_svc, 'w', encoding='utf-8') as f:
    f.write(content)
