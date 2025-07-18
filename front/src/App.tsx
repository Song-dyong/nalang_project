import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { Router } from "./routes/router";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {Router.map((route) => (
            <Route
              key={route.id}
              path={route.path}
              element={<route.element />}
            />
          ))}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
