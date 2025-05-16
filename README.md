# LinkPortfolio 🔗

LinkPortfolio é uma aplicação web simples e elegante, construída em Python e Streamlit, que permite aos usuários criar e gerenciar uma página de portfólio pessoal com seus links importantes, informações de perfil e contatos. Possui um painel administrativo para fácil customização.

## ✨ Funcionalidades

**Página Pública:**
* Exibição do perfil do usuário: foto, nome e descrição.
* Listagem de links customizáveis, agrupados por categorias.
* Layout responsivo com links exibidos em colunas.
* Rodapé personalizado com informações do aplicativo e do desenvolvedor.
* Rodapé adicional opcional exibindo IP público e data/hora atual.

**Painel Administrativo:**
* Protegido por senha.
* **Gerenciamento de Perfil:**
    * Editar nome e descrição.
    * Fazer upload de imagem de perfil (redimensionada para otimização).
* **Gerenciamento de Links:**
    * Adicionar novos links com título, URL, ícone (Font Awesome ou URL de imagem) e categoria.
    * Editar links existentes.
    * Remover links.
* **Segurança:**
    * Alterar senha do painel administrativo.
* **Navegação:**
    * Botão para visualizar o site público.
    * Botão para sair do painel administrativo.

**Gerenciamento de Dados:**
* Os dados da aplicação (perfil, links, senha) são armazenados em um arquivo `links_data.json`.
* Suporte para carregar o arquivo `links_data.json` a partir de um link direto do Google Drive (configurável via variável de ambiente/secrets), com fallback para um arquivo local.
* As alterações feitas no painel administrativo são salvas no arquivo `links_data.json` local. *Nota: Em ambientes de nuvem com sistema de arquivos efêmero (como o Streamlit Community Cloud), as alterações salvas localmente podem ser perdidas após reinícios do app, a menos que o arquivo seja persistido externamente ou o app seja configurado para salvar de volta na nuvem (funcionalidade não implementada atualmente).*

## 🛠️ Tecnologias Utilizadas

* **Python 3.x**
* **Streamlit:** Framework principal para a interface do usuário.
* **Pandas:** Utilizado para manipulação de dados (embora o uso direto no código atual seja mínimo, pode ter sido usado em versões anteriores ou para futuras extensões).
* **Pillow (PIL):** Para processamento de imagem (upload e redimensionamento).
* **Requests:** Para fazer requisições HTTP (ex: carregar JSON do Google Drive, obter IP público).
* **python-dotenv:** Para gerenciar variáveis de ambiente localmente.

## ⚙️ Configuração e Instalação

### Pré-requisitos
* Python 3.7 ou superior.
* `pip` (gerenciador de pacotes Python).

### Passos

1.  **Clone o Repositório (Opcional):**
    Se você estiver gerenciando este projeto com Git:
    ```bash
    git clone <url-do-seu-repositorio>
    cd LinkPortfolio
    ```

2.  **Crie um Ambiente Virtual (Recomendado):**
    ```bash
    python -m venv venv
    ```
    Ative o ambiente virtual:
    * No Windows:
        ```bash
        .\venv\Scripts\activate
        ```
    * No macOS/Linux:
        ```bash
        source venv/bin/activate
        ```

3.  **Instale as Dependências:**
    Com o ambiente virtual ativado, instale as bibliotecas necessárias:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure as Variáveis de Ambiente (Opcional - para Google Drive):**
    Para carregar os dados de um arquivo `links_data.json` hospedado no Google Drive, crie um arquivo chamado `.env` na raiz do projeto e adicione a seguinte linha:
    ```env
    GOOGLE_DRIVE_JSON_URL="SEU_LINK_DIRETO_DE_DOWNLOAD_DO_GOOGLE_DRIVE_AQUI"
    ```
    * **Importante:** O link do Google Drive deve ser um link de **download direto**. Se o seu link de compartilhamento é `https://drive.google.com/file/d/ID_DO_ARQUIVO/view?usp=sharing`, converta-o para `https://drive.google.com/uc?export=download&id=ID_DO_ARQUIVO`.
    * Certifique-se de que as permissões de compartilhamento do arquivo no Google Drive estejam configuradas para "Qualquer pessoa com o link pode ver".
    * Se `GOOGLE_DRIVE_JSON_URL` não for definido, o app usará/criará um arquivo `links_data.json` local na raiz do projeto.

## 🚀 Executando a Aplicação

Com o ambiente virtual ativado e as dependências instaladas, execute o Streamlit:
```bash
streamlit run app.py