import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Router } from "./routes/router";
import { RequireAuth } from "./features/auth/components/AuthRequire";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {Router.map((route) => (
            <Route
              key={route.id}
              path={route.path}
              element={
                route.requireAuth ? (
                  <RequireAuth>
                    <route.element></route.element>
                  </RequireAuth>
                ) : (
                  <route.element></route.element>
                )
              }
            />
          ))}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
