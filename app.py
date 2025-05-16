import streamlit as st
import pandas as pd
import json
import os
import hashlib
import base64
from PIL import Image
import io
import datetime
import requests
import html # Para st.session_state.html_escape
from dotenv import load_dotenv # Adicionado para carregar variáveis de ambiente

# Carregar variáveis de ambiente do arquivo .env (se existir)
load_dotenv()

# Configuração da página
st.set_page_config(
    page_title="LinkPortfolio",
    page_icon="🔗",
    layout="centered",
    initial_sidebar_state="collapsed"
)

# Função para carregar ou criar o arquivo de dados
def load_data():
    # Tenta carregar do Google Drive primeiro
    gdrive_url = os.getenv("GOOGLE_DRIVE_JSON_URL")
    if gdrive_url:
        try:
            # st.info(f"Tentando carregar dados do Google Drive: {gdrive_url}") # Para debug
            response = requests.get(gdrive_url, timeout=10) # Timeout de 10 segundos
            response.raise_for_status()  # Levanta um erro para códigos HTTP 4xx/5xx
            data = response.json()
            # st.success("Dados carregados com sucesso do Google Drive!") # Para debug
            
            # Opcional: Salvar uma cópia local ao carregar do GDrive pela primeira vez ou para cache
            # with open("links_data_gdrive_cache.json", "w", encoding="utf-8") as f:
            #    json.dump(data, f, ensure_ascii=False, indent=4)
            return data
        except requests.exceptions.RequestException as e:
            st.warning(f"Falha ao baixar dados do Google Drive ({e}). Usando fallback local.")
        except json.JSONDecodeError as e:
            st.warning(f"Falha ao decodificar JSON do Google Drive ({e}). Usando fallback local.")
        except Exception as e: # Outras exceções inesperadas
            st.warning(f"Erro inesperado ao carregar do Google Drive ({e}). Usando fallback local.")

    # Fallback: Carregar do arquivo local ou criar um novo
    # st.info("Usando arquivo local links_data.json.") # Para debug
    local_file_path = "links_data.json"
    if os.path.exists(local_file_path):
        try:
            with open(local_file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError:
            st.error(f"Arquivo local '{local_file_path}' está corrompido. Criando um novo com dados padrão.")
            # Se corrompido, força a criação de um novo
            os.remove(local_file_path) # Remove o arquivo corrompido
        except Exception as e:
            st.error(f"Erro ao ler arquivo local '{local_file_path}': {e}. Criando um novo com dados padrão.")
            if os.path.exists(local_file_path): # Tenta remover se ainda existe
                 try: os.remove(local_file_path)
                 except: pass

    # Se o arquivo não existe localmente (ou falhou ao carregar/estava corrompido), cria com dados padrão
    default_data = {
        "profile": {
            "name": "Seu Nome",
            "description": "Professor e Desenvolvedor",
            "image": None
        },
        "password": hashlib.sha256("admin123".encode()).hexdigest(),
        "links": []
    }
    try:
        with open(local_file_path, "w", encoding="utf-8") as f:
            json.dump(default_data, f, ensure_ascii=False, indent=4)
        # st.info(f"Arquivo local '{local_file_path}' criado com dados padrão.") # Para debug
    except Exception as e:
        st.error(f"Não foi possível criar o arquivo de dados local: {e}")
        # Retorna default_data em memória se não conseguir escrever no disco
    return default_data

# Função para salvar dados (permanece salvando localmente)
def save_data(data):
    try:
        with open("links_data.json", "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
    except Exception as e:
        st.error(f"Erro ao salvar dados localmente: {e}")


# Carregar CSS personalizado
def local_css():
    st.markdown("""
    <style>
    .link-card {
        background-color: #ffffff;
        border-radius: 10px;
        padding: 15px;
        text-align: center;
        margin-bottom: 15px;
        transition: transform 0.3s ease;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        display: block;
        text-decoration: none;
        color: inherit;
    }
    .link-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
    }
    .profile-pic {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #f0f0f0;
    }
    .icon-img {
        width: 24px;
        height: 24px;
        margin-right: 10px;
        vertical-align: middle;
    }
    .profile-info h1 {
        font-weight: 700;
        color: #333;
        margin-top: 0;
    }
    .profile-info p {
        color: #555;
        overflow-wrap: break-word;
        word-wrap: break-word;
        margin-bottom: 0;
    }
    .category-header {
        font-weight: 600;
        margin-top: 20px;
        margin-bottom: 10px;
        color: #333;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
    }
    .profile-container {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 30px;
    }
    .profile-pic-container {
        margin-right: 20px;
        flex-shrink: 0;
    }
    .default-pic {
        width: 150px;
        height: 150px;
        background-color: #f0f0f0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 50px;
        color: #999;
    }
    .profile-info {
        text-align: left;
        min-width: 0;
    }

    /* Estilos para ocultar header/footer do Streamlit e ajustar paddings */
    div[data-testid="stHeader"],
    div[data-testid="stToolbar"],
    div[data-testid="stDecoration"],
    div[data-testid="stStatusWidget"],
    #MainMenu {
        display: none !important;
        visibility: hidden !important;
    }
    footer[data-testid="stFooter"] {
        display: none !important;
        visibility: hidden !important;
    }
    .st-emotion-cache-1y4p8pa {
        padding-top: 1rem !important;
        padding-bottom: 5rem !important;
    }
    div[data-testid="stAppViewBlockContainer"] {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
    }
    div[data-testid="stVerticalBlock"] {
        gap: 0.5rem !important;
    }
    .element-container {
        margin-top: 0 !important;
        margin-bottom: 0.5rem !important;
    }
    </style>
    """, unsafe_allow_html=True)

# Converter imagem para base64
def image_to_base64(image):
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode()

# Página de login do admin
def admin_login():
    st.subheader("Login Administrativo")
    password = st.text_input("Senha", type="password", key="admin_password_input")

    if st.button("Entrar", key="admin_login_button"):
        if hashlib.sha256(password.encode()).hexdigest() == data["password"]:
            st.session_state["authenticated"] = True
            st.session_state["page"] = "admin"
            st.rerun()
        else:
            st.error("Senha incorreta!")

# Página de administração
def admin_page():
    st.title("Painel Administrativo")

    admin_option = st.sidebar.selectbox(
        "Menu",
        ["Perfil", "Gerenciar Links", "Alterar Senha", "Visualizar Site"]
    )

    if admin_option == "Perfil":
        st.header("Editar Perfil")
        # Usar .get com dicionário vazio como padrão para evitar erros se 'profile' não existir
        profile_data = data.get("profile", {})
        name = st.text_input("Nome", value=profile_data.get("name", ""))
        description = st.text_area("Descrição", value=profile_data.get("description", ""))
        profile_image_upload = st.file_uploader("Imagem de Perfil (Recomendado: 300x300 pixels)", type=["jpg", "jpeg", "png"])

        col1_img, _ = st.columns([1, 2]) # A segunda coluna não é usada explicitamente aqui
        with col1_img:
            current_image_b64 = profile_data.get("image")
            if current_image_b64:
                try:
                    img_bytes = base64.b64decode(current_image_b64)
                    st.image(img_bytes, caption="Imagem Atual", width=150)
                except Exception as e:
                    st.error(f"Erro ao carregar imagem atual: {e}")
                    st.markdown("<div class='default-pic' style='width:150px; height:150px; display:flex; align-items:center; justify-content:center; background-color:#f0f0f0; border-radius:50%; font-size:50px; color:#999;'><span>👤</span></div>", unsafe_allow_html=True)
            else:
                st.markdown("<div class='default-pic' style='width:150px; height:150px; display:flex; align-items:center; justify-content:center; background-color:#f0f0f0; border-radius:50%; font-size:50px; color:#999;'><span>👤</span></div>", unsafe_allow_html=True)


        if st.button("Salvar Perfil"):
            # Garante que 'profile' exista em 'data'
            if "profile" not in data or not isinstance(data["profile"], dict):
                data["profile"] = {}
            
            data["profile"]["name"] = name
            data["profile"]["description"] = description
            if profile_image_upload is not None:
                try:
                    image = Image.open(profile_image_upload)
                    image.thumbnail((300, 300))
                    data["profile"]["image"] = image_to_base64(image)
                except Exception as e:
                    st.error(f"Erro ao processar a nova imagem: {e}")
            save_data(data)
            st.success("Perfil atualizado com sucesso!")
            st.rerun()

    elif admin_option == "Gerenciar Links":
        st.header("Gerenciar Links")
        action = st.radio("Ação", ["Adicionar Novo Link", "Editar Links Existentes"])

        if "links" not in data or not isinstance(data["links"], list):
            data["links"] = [] # Garante que data["links"] seja uma lista

        if action == "Adicionar Novo Link":
            st.subheader("Adicionar Novo Link")
            with st.form("new_link_form", clear_on_submit=True):
                title = st.text_input("Título do Link")
                url = st.text_input("URL")
                icon = st.text_input("Ícone (URL ou nome Font Awesome)", help="Ex: fa-instagram ou URL para uma imagem")
                category = st.text_input("Categoria", value="Links Úteis",
                                         help="Agrupa links em categorias como 'Redes Sociais', 'Projetos', 'Contato'")
                submitted = st.form_submit_button("Adicionar Link")
                if submitted:
                    if title and url:
                        if not url.startswith(("http://", "https://")):
                            url = "https://" + url

                        new_id = int(datetime.datetime.now().timestamp() * 1000)
                        new_link = {
                            "id": new_id,
                            "title": title,
                            "url": url,
                            "icon": icon,
                            "category": category
                        }
                        data["links"].append(new_link)
                        save_data(data)
                        st.success(f"Link '{title}' adicionado com sucesso!")
                    else:
                        st.warning("Por favor, preencha o título e a URL.")

        else:
            st.subheader("Editar ou Remover Links")
            if not data["links"]:
                st.info("Nenhum link cadastrado.")
            else:
                for i, link_item in enumerate(list(data["links"])): # Usar list() para cópia segura
                    st.markdown(f"**{link_item.get('title','N/A')}** (*{link_item.get('category','N/A')}*)")
                    st.caption(link_item.get('url','N/A'))

                    col_edit, col_remove = st.columns(2)
                    link_id = link_item.get('id', f"no_id_{i}") # Fallback para ID
                    with col_edit:
                        if st.button("Editar", key=f"edit_{link_id}"):
                            st.session_state["editing_link_id"] = link_id
                            st.rerun()
                    with col_remove:
                        if st.button("Remover", key=f"remove_{link_id}"):
                            data["links"] = [l for l in data["links"] if l.get('id') != link_id]
                            save_data(data)
                            st.success("Link removido com sucesso!")
                            st.rerun()
                    st.markdown("---")

            if "editing_link_id" in st.session_state:
                link_id_to_edit = st.session_state["editing_link_id"]
                # Encontrar o link para editar
                link_to_edit = None
                link_index = -1
                for idx, lnk in enumerate(data["links"]):
                    if lnk.get("id") == link_id_to_edit:
                        link_to_edit = lnk
                        link_index = idx
                        break
                
                if link_to_edit is not None and link_index != -1:
                    st.subheader(f"Editando: {link_to_edit.get('title','N/A')}")
                    with st.form(key=f"edit_form_{link_id_to_edit}"):
                        edited_title = st.text_input("Título", value=link_to_edit.get("title",""), key=f"et_{link_id_to_edit}")
                        edited_url = st.text_input("URL", value=link_to_edit.get("url",""), key=f"eu_{link_id_to_edit}")
                        edited_icon = st.text_input("Ícone", value=link_to_edit.get("icon",""), key=f"ei_{link_id_to_edit}")
                        edited_category = st.text_input("Categoria", value=link_to_edit.get("category",""), key=f"ec_{link_id_to_edit}")

                        save_button = st.form_submit_button("Salvar Alterações")
                        cancel_button = st.form_submit_button("Cancelar")

                        if save_button:
                            if not edited_url.startswith(("http://", "https://")):
                                edited_url = "https://" + edited_url
                            
                            # Atualizar o dicionário diretamente na lista
                            data["links"][link_index]["title"] = edited_title
                            data["links"][link_index]["url"] = edited_url
                            data["links"][link_index]["icon"] = edited_icon
                            data["links"][link_index]["category"] = edited_category
                            
                            save_data(data)
                            st.success("Link atualizado com sucesso!")
                            del st.session_state["editing_link_id"]
                            st.rerun()
                        if cancel_button:
                            del st.session_state["editing_link_id"]
                            st.rerun()
                else: # Link não encontrado, limpar estado
                    if "editing_link_id" in st.session_state:
                        del st.session_state["editing_link_id"]
                        st.warning("Link para edição não encontrado. Tente novamente.")
                        st.rerun()


    elif admin_option == "Alterar Senha":
        st.header("Alterar Senha")
        # Garante que 'password' exista em 'data'
        if "password" not in data:
            data["password"] = hashlib.sha256("admin123".encode()).hexdigest() # Senha padrão se não existir

        current_password = st.text_input("Senha Atual", type="password")
        new_password = st.text_input("Nova Senha", type="password")
        confirm_password = st.text_input("Confirmar Nova Senha", type="password")

        if st.button("Alterar Senha"):
            if hashlib.sha256(current_password.encode()).hexdigest() != data.get("password"):
                st.error("Senha atual incorreta!")
            elif new_password != confirm_password:
                st.error("As senhas não coincidem!")
            elif len(new_password) < 6:
                st.warning("A senha deve ter pelo menos 6 caracteres.")
            else:
                data["password"] = hashlib.sha256(new_password.encode()).hexdigest()
                save_data(data)
                st.success("Senha alterada com sucesso!")

    elif admin_option == "Visualizar Site":
        st.session_state["page"] = "home"
        st.query_params.clear()
        st.rerun()

    if st.sidebar.button("Sair"):
        st.session_state["authenticated"] = False
        st.session_state["page"] = "home"
        st.query_params.clear()
        st.rerun()

# Renderizar ícone
def render_icon(icon_str):
    if not icon_str:
        return ""
    esc = st.session_state.html_escape
    if icon_str.startswith("fa-"):
        return f'<i class="fas {esc(icon_str)}" title="{esc(icon_str)}"></i>&nbsp;'
    elif icon_str.startswith(("http://", "https://")):
        return f'<img src="{esc(icon_str)}" class="icon-img" alt="ícone">&nbsp;'
    elif icon_str: # Se houver algo, mas não for FA nem URL, mostrar como texto simples
        return f'{esc(icon_str)}&nbsp;'
    return ""


# Página principal (exibição de links)
def home_page():
    profile = data.get("profile", {}) # Usar .get para segurança

    profile_name = profile.get("name", "Seu Nome")
    profile_description = profile.get("description", "Sua Descrição")
    profile_image_b64 = profile.get("image")

    esc = st.session_state.html_escape # Função de escape HTML

    profile_html_parts = [
        '<div class="profile-container">',
        '<div class="profile-pic-container">'
    ]
    if profile_image_b64:
        try:
            base64.b64decode(profile_image_b64) # Validação simples de base64
            profile_html_parts.append(f'<img src="data:image/png;base64,{profile_image_b64}" class="profile-pic" alt="Foto de perfil">')
        except Exception: # Se não for base64 válida ou outro erro, mostra default
            profile_html_parts.append('<div class="default-pic"><span>👤</span></div>')
    else:
        profile_html_parts.append('<div class="default-pic"><span>👤</span></div>')

    profile_html_parts.extend([
        '</div>', # Fim de profile-pic-container
        '<div class="profile-info">',
        f'<h1>{esc(profile_name)}</h1>',
        f'<p>{esc(profile_description)}</p>',
        '</div>', # Fim de profile-info
        '</div>'  # Fim de profile-container
    ])
    st.markdown("".join(profile_html_parts), unsafe_allow_html=True)


    # Garante que 'links' seja uma lista
    page_links = data.get("links", [])
    if not isinstance(page_links, list):
        page_links = []

    if not page_links:
        st.info("Nenhum link adicionado ainda. Entre no painel administrativo para adicionar links.")
    else:
        categories = {}
        for link_item in page_links:
            if not isinstance(link_item, dict): continue # Pula links malformados
            category = link_item.get("category", "Outros")
            if category not in categories:
                categories[category] = []
            categories[category].append(link_item)

        for category_name, links_in_category in categories.items():
            st.markdown(f"<h3 class='category-header'>{esc(category_name)}</h3>", unsafe_allow_html=True)

            num_links = len(links_in_category)
            # Ajuste para usar st.columns(2) sempre que houver links, para consistência
            # Ou st.columns(1) se for preferível para um único link na categoria
            cols = st.columns(2 if num_links > 0 else 1)


            for i, link_item in enumerate(links_in_category):
                # Distribui os links entre as colunas
                current_col_index = i % 2
                with cols[current_col_index]:
                    icon_html = render_icon(link_item.get("icon", ""))
                    link_title = esc(link_item.get("title", "Link"))
                    link_url = link_item.get("url", "#")

                    st.markdown(f"""
                    <a href="{esc(link_url)}" target="_blank" class="link-card">
                        {icon_html}{link_title}
                    </a>
                    """, unsafe_allow_html=True)
    
    # Botão Admin na página principal
    if st.button("Admin", key="home_admin_btn"):
        st.session_state["page"] = "admin_login"
        st.query_params["admin"] = "true" # Adiciona query param ao clicar
        st.rerun()

# --- Inicialização e Controle de Fluxo ---
if "html_escape" not in st.session_state:
    st.session_state.html_escape = html.escape

data = load_data() # Carrega os dados (do GDrive ou local)

if "page" not in st.session_state:
    if st.query_params.get("admin") == "true":
        st.session_state["page"] = "admin_login"
    else:
        st.session_state["page"] = "home"

if "authenticated" not in st.session_state:
    st.session_state["authenticated"] = False

local_css() # Aplica CSS

current_page = st.session_state.get("page", "home")

if current_page == "admin_login":
    if st.session_state.get("authenticated"):
        st.session_state["page"] = "admin" # Se já autenticado, vai para admin
        st.rerun()
    else:
        admin_login()
elif current_page == "admin" and st.session_state.get("authenticated"):
    admin_page()
else: # Inclui "home" ou qualquer estado inválido/não autenticado para admin
    if current_page != "home": # Se estava tentando acessar admin sem auth, volta pra home
        st.session_state["page"] = "home"
        if "admin" in st.query_params: # Limpa query param se estava tentando acessar admin e falhou
           del st.query_params["admin"]
        st.rerun()
    home_page()


# --- Rodapé Customizado ---
def get_public_ip():
    try:
        response = requests.get('https://api.ipify.org', timeout=3)
        response.raise_for_status()
        return response.text
    except requests.exceptions.RequestException:
        return "IP indisponível"

def obter_data_formatada():
    try:
        agora = datetime.datetime.now()
        dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]
        dia_semana = dias[agora.weekday()]
        return f"{dia_semana}, {agora.strftime('%d/%m/%Y às %H:%M:%S')}"
    except Exception:
        return "Data/hora indisponível"

ip_publico = get_public_ip()
data_hora = obter_data_formatada()
esc = st.session_state.html_escape

footer_html = f"""
<div style="position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background-color: #ffffff;
            color: #333333;
            text-align: center;
            padding: 8px 0;
            font-size: 14px;
            border-top: 1px solid #eee;
            z-index: 1000;
            box-shadow: 0 -2px 5px rgba(0,0,0,0.05);
            ">
    💻 IP: {esc(ip_publico)} &nbsp;&nbsp;|&nbsp;&nbsp; ⏰ {esc(data_hora)}
</div>
"""
st.markdown(footer_html, unsafe_allow_html=True)

st.markdown("""
<div style="text-align:center; margin-top:30px; margin-bottom: 70px; /* Espaço para o rodapé fixo */ padding:10px; color:#555; font-size:14px;">
    <hr style="border-top: 1px solid #eee; margin-bottom: 10px;">
    🔗 <strong>LinkPortfolio</strong> | Um web app para organizar seu portfólio c/ links,<br>
            contatos, aplicativos e projetos. Por <strong>Ary Ribeiro</strong>.
</div>
""", unsafe_allow_html=True)