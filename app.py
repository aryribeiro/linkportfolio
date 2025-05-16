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

# Configuração da página
st.set_page_config(
    page_title="LinkPortfolio",
    page_icon="🔗",
    layout="centered",
    initial_sidebar_state="collapsed"
)

# Função para carregar ou criar o arquivo de dados
def load_data():
    if os.path.exists("links_data.json"):
        try:
            with open("links_data.json", "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError:
            pass

    default_data = {
        "profile": {
            "name": "Seu Nome",
            "description": "Professor e Desenvolvedor",
            "image": None
        },
        "password": hashlib.sha256("admin123".encode()).hexdigest(),
        "links": []
    }
    with open("links_data.json", "w", encoding="utf-8") as f:
        json.dump(default_data, f, ensure_ascii=False, indent=4)
    return default_data

# Função para salvar dados
def save_data(data):
    with open("links_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

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
        margin-top: 0; /* Evitar margem superior no h1 que possa desalinhá-lo */
    }
    .profile-info p {
        color: #555;
        overflow-wrap: break-word; /* Quebra palavras longas para evitar overflow */
        word-wrap: break-word; /* Compatibilidade com navegadores mais antigos */
        margin-bottom: 0; /* Evitar margem inferior no p */
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
        align-items: center; /* Alinha verticalmente a imagem e o bloco de texto */
        justify-content: center;
        margin-bottom: 30px;
    }
    .profile-pic-container {
        margin-right: 20px;
        flex-shrink: 0; /* Impede que o container da imagem encolha */
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
        min-width: 0; /* Permite que o item flex encolha corretamente e o texto quebre */
        /* flex-grow: 1; /* Opcional: Faz com que o texto ocupe o espaço restante */
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
    .st-emotion-cache-1y4p8pa { /* Este seletor pode mudar com versões do Streamlit */
        padding-top: 1rem !important;
        padding-bottom: 5rem !important; /* Espaço para rodapé fixo */
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
        profile = data["profile"]
        name = st.text_input("Nome", value=profile.get("name", ""))
        description = st.text_area("Descrição", value=profile.get("description", ""))
        profile_image = st.file_uploader("Imagem de Perfil (Recomendado: 300x300 pixels)", type=["jpg", "jpeg", "png"])

        col1_img, col2_info = st.columns([1, 2])
        with col1_img:
            if profile.get("image"):
                try:
                    img_bytes = base64.b64decode(profile["image"])
                    st.image(img_bytes, caption="Imagem Atual", width=150)
                except Exception as e:
                    st.error(f"Erro ao carregar imagem: {e}")
                    st.markdown("<div class='default-pic' style='width:150px; height:150px; display:flex; align-items:center; justify-content:center; background-color:#f0f0f0; border-radius:50%; font-size:50px; color:#999;'><span>👤</span></div>", unsafe_allow_html=True)
            else:
                st.markdown("<div class='default-pic' style='width:150px; height:150px; display:flex; align-items:center; justify-content:center; background-color:#f0f0f0; border-radius:50%; font-size:50px; color:#999;'><span>👤</span></div>", unsafe_allow_html=True)


        if st.button("Salvar Perfil"):
            data["profile"]["name"] = name
            data["profile"]["description"] = description
            if profile_image is not None:
                try:
                    image = Image.open(profile_image)
                    image.thumbnail((300, 300))
                    data["profile"]["image"] = image_to_base64(image)
                except Exception as e:
                    st.error(f"Erro ao processar a imagem: {e}")
            save_data(data)
            st.success("Perfil atualizado com sucesso!")
            st.rerun()

    elif admin_option == "Gerenciar Links":
        st.header("Gerenciar Links")
        action = st.radio("Ação", ["Adicionar Novo Link", "Editar Links Existentes"])

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
                for i, link_item in enumerate(list(data["links"])):
                    st.markdown(f"**{link_item['title']}** (*{link_item['category']}*)")
                    st.caption(link_item['url'])

                    col_edit, col_remove = st.columns(2)
                    with col_edit:
                        if st.button("Editar", key=f"edit_{link_item['id']}"):
                            st.session_state["editing_link_id"] = link_item['id']
                            st.rerun()
                    with col_remove:
                        if st.button("Remover", key=f"remove_{link_item['id']}"):
                            data["links"] = [l for l in data["links"] if l['id'] != link_item['id']]
                            save_data(data)
                            st.success("Link removido com sucesso!")
                            st.rerun()
                    st.markdown("---")

            if "editing_link_id" in st.session_state:
                link_id_to_edit = st.session_state["editing_link_id"]
                link_to_edit = next((link for link in data["links"] if link["id"] == link_id_to_edit), None)

                if link_to_edit:
                    st.subheader(f"Editando: {link_to_edit['title']}")
                    with st.form(key=f"edit_form_{link_id_to_edit}"):
                        edited_title = st.text_input("Título", value=link_to_edit["title"], key=f"et_{link_id_to_edit}")
                        edited_url = st.text_input("URL", value=link_to_edit["url"], key=f"eu_{link_id_to_edit}")
                        edited_icon = st.text_input("Ícone", value=link_to_edit["icon"], key=f"ei_{link_id_to_edit}")
                        edited_category = st.text_input("Categoria", value=link_to_edit["category"], key=f"ec_{link_id_to_edit}")

                        save_button = st.form_submit_button("Salvar Alterações")
                        cancel_button = st.form_submit_button("Cancelar")

                        if save_button:
                            if not edited_url.startswith(("http://", "https://")):
                                edited_url = "https://" + edited_url

                            link_to_edit["title"] = edited_title
                            link_to_edit["url"] = edited_url
                            link_to_edit["icon"] = edited_icon
                            link_to_edit["category"] = edited_category
                            save_data(data)
                            st.success("Link atualizado com sucesso!")
                            del st.session_state["editing_link_id"]
                            st.rerun()
                        if cancel_button:
                            del st.session_state["editing_link_id"]
                            st.rerun()

    elif admin_option == "Alterar Senha":
        st.header("Alterar Senha")
        current_password = st.text_input("Senha Atual", type="password")
        new_password = st.text_input("Nova Senha", type="password")
        confirm_password = st.text_input("Confirmar Nova Senha", type="password")

        if st.button("Alterar Senha"):
            if hashlib.sha256(current_password.encode()).hexdigest() != data["password"]:
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
    elif icon_str:
        return f'{esc(icon_str)}&nbsp;'
    return ""


# Página principal (exibição de links)
def home_page():
    profile = data.get("profile", {})

    profile_name = profile.get("name", "Seu Nome")
    profile_description = profile.get("description", "Sua Descrição")
    profile_image_b64 = profile.get("image")

    esc = st.session_state.html_escape

    profile_html_parts = [
        '<div class="profile-container">',
        '<div class="profile-pic-container">'
    ]
    if profile_image_b64:
        try:
            base64.b64decode(profile_image_b64)
            profile_html_parts.append(f'<img src="data:image/png;base64,{profile_image_b64}" class="profile-pic" alt="Foto de perfil">')
        except Exception:
            profile_html_parts.append('<div class="default-pic"><span>👤</span></div>')
    else:
        profile_html_parts.append('<div class="default-pic"><span>👤</span></div>')

    profile_html_parts.extend([
        '</div>',
        '<div class="profile-info">',
        f'<h1>{esc(profile_name)}</h1>',
        f'<p>{esc(profile_description)}</p>',
        '</div>',
        '</div>'
    ])
    st.markdown("".join(profile_html_parts), unsafe_allow_html=True)


    if not data.get("links"):
        st.info("Nenhum link adicionado ainda. Entre no painel administrativo para adicionar links.")
    else:
        categories = {}
        for link_item in data["links"]:
            category = link_item.get("category", "Outros")
            if category not in categories:
                categories[category] = []
            categories[category].append(link_item)

        for category_name, links_in_category in categories.items():
            st.markdown(f"<h3 class='category-header'>{esc(category_name)}</h3>", unsafe_allow_html=True)

            num_links = len(links_in_category)
            cols = st.columns(2) if num_links >= 1 else st.columns(1)

            for i, link_item in enumerate(links_in_category):
                current_col = cols[i % 2]
                with current_col:
                    icon_html = render_icon(link_item.get("icon", ""))
                    link_title = esc(link_item.get("title", "Link"))
                    link_url = link_item.get("url", "#")

                    st.markdown(f"""
                    <a href="{link_url}" target="_blank" class="link-card">
                        {icon_html}{link_title}
                    </a>
                    """, unsafe_allow_html=True)

    if st.button("Admin", key="home_admin_btn"):
        st.session_state["page"] = "admin_login"
        st.query_params["admin"] = "true"
        st.rerun()

# --- Inicialização e Controle de Fluxo ---
if "html_escape" not in st.session_state:
    st.session_state.html_escape = html.escape

data = load_data()

if "page" not in st.session_state:
    if st.query_params.get("admin") == "true":
        st.session_state["page"] = "admin_login"
    else:
        st.session_state["page"] = "home"

if "authenticated" not in st.session_state:
    st.session_state["authenticated"] = False

local_css()

current_page = st.session_state.get("page", "home")

if current_page == "admin_login":
    if st.session_state.get("authenticated"):
        st.session_state["page"] = "admin"
        st.rerun()
    else:
        admin_login()
elif current_page == "admin" and st.session_state.get("authenticated"):
    admin_page()
else:
    if current_page != "home":
        st.session_state["page"] = "home"
        if "admin" in st.query_params:
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
<div style="text-align:center; margin-top:30px; margin-bottom: 70px; padding:10px; color:#555; font-size:14px;">
    <hr style="border-top: 1px solid #eee; margin-bottom: 10px;">
    🔗 <strong>LinkPortfolio</strong> | Um web app para organizar seu portfólio c/ links,<br>
            contatos, aplicativos e projetos. Por <strong>Ary Ribeiro</strong>.
</div>
""", unsafe_allow_html=True)