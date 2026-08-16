import Logo from '../img/imagem.png'

function Header(){

    return(
        <header>
            <div>
                <img src={Logo} title='Logo Pizzaria' />
            </div>
                <nav>
                    <a href="/home" className="abas">Home</a>
                    <span className="separador">|</span>
                  

                    <a href="/Produto" className="abas">Produto</a>
                    <span className="separador">|</span>

                 <a href="/TCC" className="abas">Nutricionistas</a>
                    <span className="separador">|</span>

                    
                 <a href="/usuario" className="abas">Usuario</a>
                    <span className="separador">|</span>

                <a href="/categoria" className="abas">Categoria</a>
                <span className="separador">|</span>




                </nav>
            
        </header>

    );
}
export default Header