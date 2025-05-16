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
            with open("links_data.json", "r", encoding="utf-8") as f: # Especifica encoding
                return json.load(f)
        except json.JSONDecodeError: # Se o JSON estiver corrompido, cria um novo
            pass # Cai para o bloco 'else' abaixo para criar um novo arquivo

    # Se o arquivo não existe ou está corrompido, cria um com dados padrão
    default_data = {
        "profile": {
            "name": "Seu Nome",
            "description": "Professor e Desenvolvedor",
            "image": None
        },
        "password": hashlib.sha256("admin123".encode()).hexdigest(),  # senha padrão: admin123
        "links": []
    }
    with open("links_data.json", "w", encoding="utf-8") as f: # Especifica encoding
        json.dump(default_data, f, ensure_ascii=False, indent=4) # Adiciona ensure_ascii e indent para melhor formatação
    return default_data

# Função para salvar dados
def save_data(data):
    with open("links_data.json", "w", encoding="utf-8") as f: # Especifica encoding
        json.dump(data, f, ensure_ascii=False, indent=4) # Adiciona ensure_ascii e indent

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
    .st-emotion-cache-16txtl3 h1,
    .st-emotion-cache-q8sbsg h1 {
        font-weight: 700;
        color: #333;
    }
    .st-emotion-cache-16txtl3 p,
    .st-emotion-cache-q8sbsg p {
        color: #555;
    }
    footer {
        /* Esta regra pode ser sobrescrita pelo CSS mais específico abaixo, o que é bom */
        /* visibility: hidden; */
    }
    .category-header {
        font-weight: 600;
        margin-top: 20px;
        margin-bottom: 10px;
        color: #333;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
    }
    /* Novos estilos para o layout do perfil */
    .profile-container {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 30px;
        flex-wrap: wrap; /* Para melhor responsividade em telas pequenas */
    }
    .profile-pic-container {
        margin-right: 20px;
        margin-bottom: 10px; /* Espaçamento se quebrar linha */
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
    }

    /* Estilos para ocultar header/footer do Streamlit e ajustar paddings */
    /* É importante testar se estes seletores continuam válidos em novas versões do Streamlit */
    div[data-testid="stHeader"],
    div[data-testid="stToolbar"],
    div[data-testid="stDecoration"],
    div[data-testid="stStatusWidget"],
    #MainMenu {
        display: none !important;
        visibility: hidden !important;
    }
    /* O footer padrão do Streamlit */
    footer[data-testid="stFooter"] {
        display: none !important;
        visibility: hidden !important;
    }
    /* Ajustes de padding para remover espaços extras */
    .st-emotion-cache-1y4p8pa { /* Seletor para o container principal do app */
        padding-top: 1rem !important; /* Ajuste conforme necessário */
        padding-bottom: 5rem !important; /* Deixa espaço para o rodapé customizado fixo */
    }
    div[data-testid="stAppViewBlockContainer"] {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
    }
    div[data-testid="stVerticalBlock"] {
        gap: 0.5rem !important; /* Ajuste o espaçamento entre elementos se necessário */
    }
    .element-container {
        margin-top: 0 !important;
        margin-bottom: 0.5rem !important; /* Leve margem inferior para elementos */
    }
    </style>
    """, unsafe_allow_html=True)

# Converter imagem para base64
def image_to_base64(image):
    buffered = io.BytesIO()
    image.save(buffered, format="PNG") # Salvar como PNG para manter transparência, se houver
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
                    st.markdown("<div class='default-pic'><span>👤</span></div>", unsafe_allow_html=True)
            else:
                st.markdown("<div class='default-pic'><span>👤</span></div>", unsafe_allow_html=True)


        if st.button("Salvar Perfil"):
            data["profile"]["name"] = name
            data["profile"]["description"] = description
            if profile_image is not None:
                try:
                    image = Image.open(profile_image)
                    image.thumbnail((300, 300)) # Mantém proporção e limita a 300x300
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
                        
                        # Usar timestamp para ID único para evitar problemas com len() após remoção
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
                        st.rerun() # Rerun para limpar o form e atualizar a lista
                    else:
                        st.warning("Por favor, preencha o título e a URL.")

        else:  # Editar links existentes
            st.subheader("Editar ou Remover Links")
            if not data["links"]:
                st.info("Nenhum link cadastrado.")
            else:
                # Criar uma cópia para iterar e modificar com segurança
                for i, link in enumerate(list(data["links"])):
                    st.markdown(f"**{link['title']}** (*{link['category']}*)")
                    st.caption(link['url'])
                    
                    col_edit, col_remove = st.columns(2)
                    with col_edit:
                        if st.button("Editar", key=f"edit_{link['id']}"):
                            st.session_state["editing_link_id"] = link['id']
                            st.rerun()
                    with col_remove:
                        if st.button("Remover", key=f"remove_{link['id']}"):
                            data["links"] = [l for l in data["links"] if l['id'] != link['id']]
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
                        edited_title = st.text_input("Título", value=link_to_edit["title"], key=f"edit_title_{link_id_to_edit}")
                        edited_url = st.text_input("URL", value=link_to_edit["url"], key=f"edit_url_{link_id_to_edit}")
                        edited_icon = st.text_input("Ícone", value=link_to_edit["icon"], key=f"edit_icon_{link_id_to_edit}")
                        edited_category = st.text_input("Categoria", value=link_to_edit["category"], key=f"edit_category_{link_id_to_edit}")
                        
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
        st.rerun()

    if st.sidebar.button("Sair"):
        st.session_state["authenticated"] = False
        st.session_state["page"] = "home"
        # Limpar query params se existirem ao sair do admin
        if 'admin' in st.query_params:
            st.query_params.clear()
        st.rerun()

# Renderizar ícone (Font Awesome ou URL)
def render_icon(icon_str):
    if not icon_str:
        return ""
    if icon_str.startswith("fa-"): # Assume Font Awesome
        # Necessário carregar Font Awesome no <head> da página, o que o Streamlit não permite nativamente de forma fácil.
        # Alternativa: Usar st.markdown com HTML ou um componente que suporte ícones.
        # Por simplicidade, se for FontAwesome, exibiremos o nome ou um placeholder.
        # Para que funcione de fato, você precisaria adicionar o link do FontAwesome no HTML template do Streamlit (complexo)
        # ou usar uma URL de imagem para o ícone.
        return f'<i class="fas {icon_str}" title="{icon_str}"></i> ' # Adiciona espaço
    elif icon_str.startswith(("http://", "https://")):
        return f'<img src="{icon_str}" class="icon-img" alt="ícone"> ' # Adiciona espaço
    else:
        return "▫️ " # Placeholder se não for URL nem 'fa-' reconhecido, com espaço

# Página principal (exibição de links)
def home_page():
    profile = data.get("profile", {}) # Usar .get para segurança

    # Seção do perfil
    profile_name = profile.get("name", "Seu Nome")
    profile_description = profile.get("description", "Sua Descrição")
    profile_image_b64 = profile.get("image")

    profile_html_parts = [
        '<div class="profile-container">',
        '<div class="profile-pic-container">'
    ]
    if profile_image_b64:
        try:
            # Validar se é uma string base64 válida (opcional, mas bom para robustez)
            base64.b64decode(profile_image_b64)
            profile_html_parts.append(f'<img src="data:image/png;base64,{profile_image_b64}" class="profile-pic" alt="Foto de perfil">')
        except Exception: # Se não for base64 válida, mostra default
            profile_html_parts.append('<div class="default-pic"><span>👤</span></div>')
    else:
        profile_html_parts.append('<div class="default-pic"><span>👤</span></div>')

    profile_html_parts.extend([
        '</div>',
        '<div class="profile-info">',
        f'<h1>{st.session_state.get("html_escape", lambda x: x)(profile_name)}</h1>', # Exemplo de escape se necessário
        f'<p>{st.session_state.get("html_escape", lambda x: x)(profile_description)}</p>',
        '</div>',
        '</div>'
    ])
    st.markdown("".join(profile_html_parts), unsafe_allow_html=True)


    if not data.get("links"):
        st.info("Nenhum link adicionado ainda. Entre no painel administrativo para adicionar links.")
    else:
        categories = {}
        for link in data["links"]:
            category = link.get("category", "Outros") # .get para segurança
            if category not in categories:
                categories[category] = []
            categories[category].append(link)

        for category_name, links_in_category in categories.items():
            st.markdown(f"<h3 class='category-header'>{st.session_state.get('html_escape', lambda x: x)(category_name)}</h3>", unsafe_allow_html=True)

            # Criar colunas dinamicamente, até 2 por linha
            num_links = len(links_in_category)
            cols = st.columns(2) if num_links > 1 else st.columns(1)
            
            for i, link in enumerate(links_in_category):
                with cols[i % 2 if num_links > 1 else 0]:
                    icon_html = render_icon(link.get("icon", ""))
                    link_title = st.session_state.get('html_escape', lambda x: x)(link.get("title", "Link"))
                    link_url = link.get("url", "#")
                    
                    st.markdown(f"""
                    <a href="{link_url}" target="_blank" class="link-card">
                        {icon_html}{link_title}
                    </a>
                    """, unsafe_allow_html=True)
    
    # Botão Admin na página principal (opcional, pode ser só via URL)
    if st.button("Admin", key="home_admin_btn"):
        st.session_state["page"] = "admin_login"
        st.query_params.from_dict({"admin": ["true"]}) # Adiciona query param ao clicar
        st.rerun()

# --- Inicialização e Controle de Fluxo ---
if "html_escape" not in st.session_state: # Adiciona uma função de escape simples para exemplo
    import html
    st.session_state.html_escape = html.escape


# Carregar dados no início
data = load_data()

# Configurar sessão (após carregar dados, caso afete estado inicial)
if "page" not in st.session_state:
    # Verificar query params para direcionamento inicial
    if st.query_params.get("admin") == ["true"]:
        st.session_state["page"] = "admin_login"
    else:
        st.session_state["page"] = "home"

if "authenticated" not in st.session_state:
    st.session_state["authenticated"] = False

# Aplicar CSS personalizado
local_css()

# Controle de navegação
current_page = st.session_state.get("page", "home")

if current_page == "admin_login":
    admin_login()
elif current_page == "admin" and st.session_state.get("authenticated"):
    admin_page()
else: # Inclui "home" ou qualquer estado inválido/não autenticado para admin
    if current_page != "home": # Se estava tentando acessar admin sem auth, volta pra home
        st.session_state["page"] = "home"
        # Limpar query params se estava tentando acessar admin e falhou
        if 'admin' in st.query_params:
            st.query_params.clear()
        st.rerun() # Garante que home_page() seja chamada com estado limpo
    home_page()


# --- Rodapé Customizado ---
# Função para obter o IP público (com timeout e tratamento de erro)
def get_public_ip():
    try:
        response = requests.get('https://api.ipify.org', timeout=2) # Timeout menor
        response.raise_for_status() # Verifica erros HTTP
        return response.text
    except requests.exceptions.RequestException:
        return "IP indisponível"

# Função para obter data e hora formatadas
def obter_data_formatada():
    try:
        agora = datetime.datetime.now()
        # Formatando dias da semana e meses em português (exemplo simples)
        dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]
        dia_semana = dias[agora.weekday()]
        return f"{dia_semana}, {agora.strftime('%d/%m/%Y às %H:%M:%S')}"
    except Exception:
        return "Data/hora indisponível"

# Montar e exibir o rodapé
ip_publico = get_public_ip()
data_hora = obter_data_formatada()

footer_html = f"""
<div style="position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background-color: #ffffff; /* Mesma cor de fundo do app */
            color: #333333; /* Cor do texto do app */
            text-align: center;
            padding: 8px 0; /* Ajuste o padding vertical */
            font-size: 14px; /* Tamanho de fonte menor */
            border-top: 1px solid #eee; /* Linha sutil no topo */
            z-index: 1000; /* Para garantir que fique sobre outros elementos */
            box-shadow: 0 -2px 5px rgba(0,0,0,0.05); /* Sombra sutil */
            ">
    💻 IP: {ip_publico} &nbsp;&nbsp;|&nbsp;&nbsp; ⏰ {data_hora}
</div>
"""
st.markdown(footer_html, unsafe_allow_html=True)

# Rodapé do LinkPortfolio (aparecerá acima do rodapé de IP/Data)
st.markdown("""
<div style="text-align:center; margin-top:30px; margin-bottom: 70px; /* Espaço para o rodapé fixo */ padding:10px; color:#555; font-size:14px;">
    <hr style="border-top: 1px solid #eee; margin-bottom: 10px;">
    🔗 <strong>LinkPortfolio</strong> | Um web app para organizar seu portfólio c/ links,<br>
            contatos, aplicativos e projetos. Por <strong>Ary Ribeiro</strong>.
</div>
""", unsafe_allow_html=True)