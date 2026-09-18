import StaggeredMenu from "./StaggeredMenu";
import Logo from "../img/imagem.png";

const Navbar = () => {
  return (
    <StaggeredMenu
      position="left"
      items={[
        { label: "Home", ariaLabel: "Ir para a página inicial", link: "/" },
        { label: "Doações", ariaLabel: "Acessar doações", link: "/Doacao" },
        { label: "ONGs", ariaLabel: "Conhecer as ONGs", link: "/ong" },
        { label: "Sobre", ariaLabel: "Conhecer o Give Net", link: "/Sobre" },
        { label: "FAQ", ariaLabel: "Acessar perguntas frequentes", link: "/Faq" }
      ]}
      displaySocials={false}
      displayItemNumbering
      menuButtonColor="#e9d5ff"
      openMenuButtonColor="#d8b4fe"
      changeMenuColorOnOpen
      colors={["#1a0533", "#5227FF", "#7c3aed"]}
      logoUrl={Logo}
      accentColor="#5227FF"
    />
  );
};

export default Navbar;
