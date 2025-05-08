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
        with open("links_data.json", "r") as f:
            return json.load(f)
    else:
        default_data = {
            "profile": {
                "name": "Seu Nome",
                "description": "Professor e Desenvolvedor",
                "image": None
            },
            "password": hashlib.sha256("admin123".encode()).hexdigest(),  # senha padrão: admin123
            "links": []
        }
        with open("links_data.json", "w") as f:
            json.dump(default_data, f)
        return default_data

# Função para salvar dados
def save_data(data):
    with open("links_data.json", "w") as f:
        json.dump(data, f)

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
        visibility: hidden;
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
    }
    .profile-pic-container {
        margin-right: 20px;
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
    password = st.text_input("Senha", type="password")
    
    if st.button("Entrar"):
        if hashlib.sha256(password.encode()).hexdigest() == data["password"]:
            st.session_state["authenticated"] = True
            st.session_state["page"] = "admin"
            st.rerun()
        else:
            st.error("Senha incorreta!")

# Página de administração
def admin_page():
    st.title("Painel Administrativo")
    
    # Menu lateral para navegação no painel admin
    admin_option = st.sidebar.selectbox(
        "Menu", 
        ["Perfil", "Gerenciar Links", "Alterar Senha", "Visualizar Site"]
    )
    
    if admin_option == "Perfil":
        st.header("Editar Perfil")
        
        # Carregar perfil atual
        profile = data["profile"]
        
        # Campo para nome
        name = st.text_input("Nome", value=profile["name"])
        
        # Campo para descrição
        description = st.text_area("Descrição", value=profile["description"])
        
        # Upload de imagem
        profile_image = st.file_uploader("Imagem de Perfil (Recomendado: 300x300 pixels)", type=["jpg", "jpeg", "png"])
        
        col1, col2 = st.columns([1, 2])
        
        with col1:
            # Mostrar imagem atual se existir
            if profile["image"]:
                st.image(base64.b64decode(profile["image"]), caption="Imagem Atual", width=150)
        
        if st.button("Salvar Perfil"):
            # Atualizar dados do perfil
            data["profile"]["name"] = name
            data["profile"]["description"] = description
            
            # Processar nova imagem se foi enviada
            if profile_image is not None:
                image = Image.open(profile_image)
                # Redimensionar para garantir bom desempenho
                image = image.resize((300, 300))
                data["profile"]["image"] = image_to_base64(image)
            
            save_data(data)
            st.success("Perfil atualizado com sucesso!")
            st.rerun()
    
    elif admin_option == "Gerenciar Links":
        st.header("Gerenciar Links")
        
        # Opção para adicionar novo link ou editar existentes
        action = st.radio("Ação", ["Adicionar Novo Link", "Editar Links Existentes"])
        
        if action == "Adicionar Novo Link":
            st.subheader("Adicionar Novo Link")
            
            # Formulário para adicionar link
            title = st.text_input("Título do Link")
            url = st.text_input("URL")
            icon = st.text_input("Ícone (URL ou nome Font Awesome)", help="Ex: fa-instagram ou URL para uma imagem")
            category = st.text_input("Categoria", value="Redes Sociais", 
                                     help="Agrupa links em categorias como 'Redes Sociais', 'Aplicativos', 'Contato'")
            
            if st.button("Adicionar Link"):
                if title and url:
                    # Validar URL - verificar se tem http/https
                    if not url.startswith(("http://", "https://")):
                        url = "https://" + url
                    
                    # Adicionar novo link
                    new_link = {
                        "id": len(data["links"]) + 1,
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
        
        else:  # Editar links existentes
            st.subheader("Editar ou Remover Links")
            
            if not data["links"]:
                st.info("Nenhum link cadastrado.")
            else:
                # Organizar links por categoria
                df = pd.DataFrame(data["links"])
                
                for index, link in enumerate(data["links"]):
                    col1, col2, col3 = st.columns([3, 1, 1])
                    
                    with col1:
                        st.write(f"**{link['title']}** • *{link['category']}*")
                        st.caption(link['url'])
                    
                    with col2:
                        if st.button("Editar", key=f"edit_{index}"):
                            st.session_state["editing_link"] = index
                            st.rerun()
                    
                    with col3:
                        if st.button("Remover", key=f"remove_{index}"):
                            data["links"].pop(index)
                            save_data(data)
                            st.success("Link removido com sucesso!")
                            st.rerun()
                    
                    st.markdown("---")
            
            # Editar link selecionado
            if "editing_link" in st.session_state:
                index = st.session_state["editing_link"]
                link = data["links"][index]
                
                st.subheader(f"Editando: {link['title']}")
                
                edited_title = st.text_input("Título", value=link["title"], key="edit_title")
                edited_url = st.text_input("URL", value=link["url"], key="edit_url")
                edited_icon = st.text_input("Ícone", value=link["icon"], key="edit_icon")
                edited_category = st.text_input("Categoria", value=link["category"], key="edit_category")
                
                col1, col2 = st.columns(2)
                
                with col1:
                    if st.button("Salvar Alterações"):
                        data["links"][index]["title"] = edited_title
                        data["links"][index]["url"] = edited_url
                        data["links"][index]["icon"] = edited_icon
                        data["links"][index]["category"] = edited_category
                        
                        save_data(data)
                        st.success("Link atualizado com sucesso!")
                        
                        # Limpar estado de edição
                        del st.session_state["editing_link"]
                        st.rerun()
                
                with col2:
                    if st.button("Cancelar"):
                        del st.session_state["editing_link"]
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
    
    # Botão para sair
    if st.sidebar.button("Sair"):
        st.session_state["authenticated"] = False
        st.session_state["page"] = "home"
        st.rerun()

# Renderizar ícone (Font Awesome ou URL)
def render_icon(icon):
    if icon.startswith("fa-"):
        return f'<i class="fas {icon}"></i>'
    elif icon.startswith(("http://", "https://")):
        return f'<img src="{icon}" class="icon-img">'
    else:
        return ""  # Sem ícone

# Página principal (exibição de links)
def home_page():
    # Carregar dados do perfil
    profile = data["profile"]
    
    # Seção do perfil com layout flex
    profile_html = """
    <div class="profile-container">
        <div class="profile-pic-container">
    """
    if profile["image"]:
        profile_html += f'<img src="data:image/png;base64,{profile["image"]}" class="profile-pic">'
    else:
        profile_html += """
        <div class="default-pic">
            <span>👤</span>
        </div>
        """
    profile_html += """
        </div>
        <div class="profile-info">
            <h1>{}</h1>
            <p>{}</p>
        </div>
    </div>
    """.format(profile["name"], profile["description"])
    
    st.markdown(profile_html, unsafe_allow_html=True)
    
    # Seção de links
    if not data["links"]:
        st.info("Nenhum link adicionado ainda. Entre no painel administrativo para adicionar links.")
    else:
        # Organizar links por categoria
        categories = {}
        for link in data["links"]:
            category = link.get("category", "Outros")
            if category not in categories:
                categories[category] = []
            categories[category].append(link)
        
        for category, links in categories.items():
            st.markdown(f"<h3 class='category-header'>{category}</h3>", unsafe_allow_html=True)
            
            # Dividir links em duas listas: índices pares e ímpares
            col1_links = links[::2]
            col2_links = links[1::2]
            
            # Criar duas colunas para os links
            link_col1, link_col2 = st.columns(2)
            
            with link_col1:
                for link in col1_links:
                    icon_html = render_icon(link["icon"]) if "icon" in link and link["icon"] else ""
                    st.markdown(f"""
                    <a href="{link['url']}" target="_blank" class="link-card">
                        {icon_html} {link['title']}
                    </a>
                    """, unsafe_allow_html=True)
            
            with link_col2:
                for link in col2_links:
                    icon_html = render_icon(link["icon"]) if "icon" in link and link["icon"] else ""
                    st.markdown(f"""
                    <a href="{link['url']}" target="_blank" class="link-card">
                        {icon_html} {link['title']}
                    </a>
                    """, unsafe_allow_html=True)
    
    # Acesso ao admin
    if st.query_params.get("admin") == ["true"] or st.button("Admin", key="admin-btn"):
        st.session_state["page"] = "admin_login"
        # Limpar query param após uso
        qp = st.query_params.to_dict()
        if " " in qp:
            del qp["admin"]
            st.query_params.update(qp)
        st.rerun()

# Carregar dados
data = load_data()

# Configurar sessão
if "page" not in st.session_state:
    st.session_state["page"] = "home"

if "authenticated" not in st.session_state:
    st.session_state["authenticated"] = False

# Aplicar CSS personalizado
local_css()

# Controle de navegação
if st.session_state["page"] == "home":
    home_page()
elif st.session_state["page"] == "admin_login":
    admin_login()
elif st.session_state["page"] == "admin" and st.session_state["authenticated"]:
    admin_page()
else:
    st.session_state["page"] = "home"
    st.rerun()

# Rodapé
st.markdown("""
<hr>
<div style="text-align:center; margin-top:40px; padding:10px; color:#000000; font-size:16px;">
    🔗 <strong>LinkPortfolio</strong> | Um web app para organizar seu portfólio c/ links,<br>
            contatos, aplicativos e projetos. Por <strong>Ary Ribeiro</strong>.
</div>
""", unsafe_allow_html=True)

st.markdown("""
<style>
    .main {
        background-color: #ffffff;
        color: #333333;
    }
    .block-container {
        padding-top: 1rem;
        padding-bottom: 0rem;
    }
    /* Esconde completamente todos os elementos da barra padrão do Streamlit */
    header {display: none !important;}
    footer {display: none !important;}
    #MainMenu {display: none !important;}
    /* Remove qualquer espaço em branco adicional */
    div[data-testid="stAppViewBlockContainer"] {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
    }
    div[data-testid="stVerticalBlock"] {
        gap: 0 !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
    }
    /* Remove quaisquer margens extras */
    .element-container {
        margin-top: 0 !important;
        margin-bottom: 0 !important;
    }
</style>
""", unsafe_allow_html=True)

# Função para obter o IP público
def get_public_ip():
    try:
        response = requests.get('https://api.ipify.org', timeout=5)
        return response.text
    except:
        return "Não disponível"

# Função para obter data e hora formatadas em português
def obter_data_formatada():
    dias_semana = {
        0: "Segunda",
        1: "Terça",
        2: "Quarta",
        3: "Quinta",
        4: "Sexta",
        5: "Sábado",
        6: "Domingo"
    }
    
    agora = datetime.datetime.now()
    dia_semana = dias_semana.get(agora.weekday())
    data_formatada = agora.strftime("%d/%m/%Y às %H:%M:%S")
    return f"{dia_semana}, {data_formatada}"

# Obter IP e data formatada
ip_publico = get_public_ip()
data_hora = obter_data_formatada()

# Criar e exibir o rodapé
footer_html = f"""
<div style="position: fixed; 
            bottom: 0; 
            left: 0; 
            width: 100%; 
            background-color: #ffffff; 
            color: #000000; 
            text-align: center; 
            padding: 8px; 
            font-size: 16px; 
            border-top: 0px solid #cccccc; 
            z-index: 999;">
    💻 IP: {ip_publico}  —  ⏰ {data_hora}
</div>
"""
# É importante que esta seja uma das últimas linhas do seu script
st.markdown(footer_html, unsafe_allow_html=True)