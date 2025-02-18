import { useEffect } from "react";

import Kanban from "./components/Kanban";
function App() {
  useEffect(() => {
    const handleTouchMove = (e) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <>
      <Kanban />
    </>
  );
}

export default App;
