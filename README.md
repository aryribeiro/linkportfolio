##LinkPortfolio

LinkPortfolio é um aplicativo web desenvolvido em Python e Streamlit, que permite criar e gerenciar uma página personalizada de links, ideal para **portfólios pessoais ou profissionais**. Ele exibe um perfil com nome, descrição e imagem, além de links organizados por categorias. O aplicativo inclui um painel administrativo protegido por senha para gerenciar o perfil e os links.

###Funcionalidades

Página Principal:
Exibe o perfil do usuário (nome, descrição e imagem).
Mostra links organizados por categorias em cartões clicáveis.
Inclui um botão "Admin" para acessar o painel administrativo.


Painel Administrativo:
Edição de perfil (nome, descrição e imagem).
Gerenciamento de links (adicionar, editar, remover).
Alteração de senha com validação.
Visualização do site como usuário final.


Segurança:
Senha armazenada como hash SHA-256.
Validações para campos obrigatórios e formato de URL.


Estilo:
Interface visualmente atraente com CSS personalizado.
Suporte a ícones Font Awesome ou URLs para links.



###Requisitos

Python 3.8 ou superior
Bibliotecas Python listadas em requirements.txt

###Instalação

Clone o repositório:
git clone https://github.com/aryribeiro/linkportfolio.git
cd linkportfolio


Crie um ambiente virtual (opcional, mas recomendado):
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows


Instale as dependências:
pip install -r requirements.txt


Execute o aplicativo:
streamlit run app.py

O aplicativo estará disponível em http://localhost:8501.


###Uso

Página Principal:
Acesse http://localhost:8501 para ver a página de links.
Clique no botão "Admin" para entrar no painel administrativo.


Painel Administrativo:
Use a senha padrão admin123 (recomenda-se alterá-la).
Edite o perfil, adicione/editar/remova links ou altere a senha.


Acesso Direto ao Admin:
Adicione ?admin=true à URL (ex.: http://localhost:8501/?admin=true) para ir diretamente ao login administrativo.



###Estrutura do Projeto
linkportfolio/
│
├── app.py              # Código principal do aplicativo
├── links_data.json     # Arquivo de dados (gerado automaticamente)
├── requirements.txt    # Dependências do projeto
└── README.md           # Documentação do projeto

###Detalhes do Código

app.py:
Configura o Streamlit com layout centrado e barra lateral recolhida.
Gerencia dados em links_data.json (perfil, links, senha).
Inclui funções para página principal, login e painel administrativo.
Aplica estilos CSS para cartões de links e perfil.


links_data.json:
Armazena o perfil (nome, descrição, imagem em base64), links (título, URL, ícone, categoria) e senha (hash SHA-256). Criado automaticamente com dados padrão na primeira execução.



###Personalização

Perfil: Edite nome, descrição e imagem no painel administrativo.
Links: Adicione links com título, URL, ícone (Font Awesome ou URL) e categoria.
Estilo: Modifique o CSS em local_css() para ajustar cores, fontes, etc.
Senha: Altere a senha padrão no painel administrativo.

####Possíveis Melhorias

Adicionar validação avançada para URLs.
Implementar limite de tentativas de login.
Melhorar responsividade para dispositivos móveis.
Adicionar suporte a temas (claro/escuro).

####Contribuição
Contribuições são bem-vindas! Para contribuir:

Faça um fork do repositório.
Crie uma branch para sua feature (git checkout -b feature/nova-funcionalidade).
Commit suas alterações (git commit -m 'Adiciona nova funcionalidade').
Push para a branch (git push origin feature/nova-funcionalidade).
Abra um Pull Request.

####Licença
Este projeto está licenciado sob a MIT License.
Contato
Para dúvidas ou sugestões fale comigo, **Ary Ribeiro**, pelo aryribeiro@gmail.com .

LinkPortfolio © 2025