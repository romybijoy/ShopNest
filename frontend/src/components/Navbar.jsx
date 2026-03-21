import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  LogOut,
  User,
  LayoutDashboard,
  Package,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav
      style={{
        background: "rgba(10,10,15,0.95)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(12px)",
        height: 70,
      }}
    >
      <div
        className="container flex items-center justify-between"
        style={{ height: "100%" }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "var(--accent)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <span
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            ShopNest
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link to="/products" className="btn btn-secondary btn-sm">
            Products
          </Link>

          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="btn btn-secondary btn-sm">
                  <LayoutDashboard size={15} /> Admin
                </Link>
              )}
              {!isAdmin && (
                <Link to="/orders" className="btn btn-secondary btn-sm">
                  <Package size={15} /> Orders
                </Link>
              )}

              {!isAdmin && (
                <Link
                  to="/cart"
                  className="btn btn-secondary btn-sm"
                  style={{ position: "relative" }}
                >
                  <ShoppingCart size={15} />
                  Cart
                  {totalItems > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        background: "var(--accent)",
                        color: "#fff",
                        borderRadius: "50%",
                        width: 18,
                        height: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--bg3)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "6px 12px",
                }}
              >
                <User size={14} color="var(--text2)" />
                <span style={{ fontSize: 13, color: "var(--text2)" }}>
                  {user.username}
                </span>
                <span
                  className="badge badge-info"
                  style={{ fontSize: 10, padding: "1px 6px" }}
                >
                  {user.role}
                </span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleLogout}
              >
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
