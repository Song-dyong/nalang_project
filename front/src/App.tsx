import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Router } from "./routes/router";
import { RequireAuth } from "./features/auth/components/AuthRequire";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "./stores/store";
import { useEffect } from "react";
import { fetchMeThunk } from "./features/auth/slices/authSlice";
import { Landing } from "./layout/Landing";
function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      dispatch(fetchMeThunk());
    }
  });

  const isAuthenticated = () => {
    return !!localStorage.getItem("access_token");
  };
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />}>
            <Route
              index
              element={
                isAuthenticated() ? (
                  <Navigate to="/home" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            {Router.map((route) => (
              <Route
                key={route.id}
                path={route.path}
                element={
                  route.requireAuth ? (
                    <RequireAuth>
                      <route.element />
                    </RequireAuth>
                  ) : (
                    <route.element />
                  )
                }
              />
            ))}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
