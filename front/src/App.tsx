import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Router } from "./routes/router";
import { RequireAuth } from "./features/auth/components/AuthRequire";
import { Landing } from "./pages/Landing";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "./stores/store";
import { useEffect } from "react";
import { fetchMeThunk } from "./features/auth/slices/authSlice";
function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      dispatch(fetchMeThunk());
    }
  });
  return (
    <>
      <BrowserRouter>
        <Landing>
          {" "}
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
        </Landing>
      </BrowserRouter>
    </>
  );
}

export default App;
