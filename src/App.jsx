import { useState } from "react";
import RoutesApp from "./rotas";
import SplashScreen from "./components/SplashScreen";

function App() {
  const [splash, setSplash] = useState(() => !sessionStorage.getItem("visited"));

  const handleDone = () => {
    sessionStorage.setItem("visited", "1");
    setSplash(false);
  };

  return (
    <>
      {splash && <SplashScreen onDone={handleDone} />}
      <RoutesApp />
    </>
  );
}

export default App;
