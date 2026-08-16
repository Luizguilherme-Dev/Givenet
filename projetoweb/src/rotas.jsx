// npm install react-router-dom
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import do menu (Navbar)
import Navbar from "./pages/Header/Navbar";
import BotaoVoltar from "./components/BotaoVoltar";

// Imports das páginas
import Homet from "./pages/Home/Home";

import Home from "./pages/Home/home_api";
import Login from "./pages/Login/Login";
import Cadastro from "./pages/Cadastro/Cadastro";

import Doacao from "./pages/Doacao/Doacao";
import ConfirmarDoacao from "./pages/Doacao/ConfirmarDoacao";
import Ong from "./pages/Ong/Ong";
import Sobre from "./pages/Sobre/Sobre";
import Faq from "./pages/Faq/Faq";
import Perfil from "./pages/Perfil/Perfil";

function RoutesApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Homet />} />
          <Route path="/home" element={<Homet />} />

          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/home_api" element={<Home />} />

          <Route path="/Doacao" element={<RotaPrivada><Doacao /></RotaPrivada>} />
          <Route path="/confirmar-doacao" element={<RotaAdmin><ConfirmarDoacao /></RotaAdmin>} />
          <Route path="/ong" element={<Ong />} />
          <Route path="/Sobre" element={<Sobre />} />
          <Route path="/Faq" element={<Faq />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Layout padrão com o menu fixo em todas as páginas
function Layout() {
  return (
    <>
      <Navbar />
      <BotaoVoltar />
      <main>
        <Outlet />
      </main>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        style={{ top: "58px", zIndex: 9999 }}
      />
    </>
  );
}

function RotaAdmin({ children }) {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  const isAdmin = usuarioLogado?.role === "ADMIN";
  if (!isAdmin) {
    toast.warning("⚠️ Acesso restrito a administradores.", { position: "top-center", toastId: "admin-negado" });
    return <Navigate to="/" replace />;
  }
  return children;
}

function RotaPrivada({ children }) {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuarioLogado?.id) {
    toast.warning("⚠️ Você precisa estar logado para registrar uma doação.", {
      position: "top-center",
      toastId: "acesso-negado",
    });
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default RoutesApp;