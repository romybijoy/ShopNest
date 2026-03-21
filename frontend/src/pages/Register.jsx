import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Zap } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    role: "CUSTOMER",
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
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
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
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
            Create account
          </h1>
          <p style={{ color: "var(--text2)", fontSize: 14 }}>
            Join ShopNest today
          </p>
        </div>

        <div className="card">
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={form.fullName}
                onChange={set("fullName")}
                required
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  placeholder="johndoe"
                  value={form.username}
                  onChange={set("username")}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select value={form.role} onChange={set("role")}>
                  <option value="CUSTOMER">Customer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={set("email")}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={set("password")}
                required
                minLength={6}
              />
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
                "Create Account"
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
            Already have an account?{" "}
            <Link
              to="/login"
              style={{ color: "var(--accent)", fontWeight: 600 }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
