import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Zap, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.username}!`);
      navigate(user.role === "ADMIN" ? "/admin" : from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 70px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background:
          "radial-gradient(ellipse 60% 50% at 50% 0%,rgba(108,99,255,0.15) 0%,transparent 70%)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: "var(--accent)",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Zap size={28} color="#fff" fill="#fff" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ color: "var(--text2)", fontSize: 14 }}>
            Sign in to your ShopNest account
          </p>
        </div>

        <div className="card">
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
          >
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={(e) =>
                  setForm((f) => ({ ...f, username: e.target.value }))
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  required
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    color: "var(--text3)",
                  }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
              style={{ marginTop: 4, padding: "12px 0" }}
            >
              {loading ? (
                <span
                  className="spinner"
                  style={{ width: 18, height: 18, borderWidth: 2 }}
                />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div
            style={{
              textAlign: "center",
              marginTop: 20,
              fontSize: 14,
              color: "var(--text2)",
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{ color: "var(--accent)", fontWeight: 600 }}
            >
              Sign up
            </Link>
          </div>

          {/* Demo credentials */}
          <div
            style={{
              marginTop: 20,
              padding: 14,
              background: "var(--bg3)",
              borderRadius: "var(--radius-sm)",
              fontSize: 13,
            }}
          >
            <div
              style={{
                color: "var(--text2)",
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              Demo Credentials
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <span>
                👤 <b>admin</b> / admin123
              </span>
              <span>
                🛍 <b>customer</b> / customer123
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
