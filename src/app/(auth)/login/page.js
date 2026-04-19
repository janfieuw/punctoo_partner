export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
      }}
    >
      <form
        action="/api/auth/login"
        method="POST"
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          border: "1px solid #e5e2d8",
          borderRadius: "18px",
          padding: "24px",
          display: "grid",
          gap: "14px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "28px" }}>Punctoo Partner</h1>
        <p style={{ margin: 0, color: "#555" }}>Meld je aan als partner.</p>

        <label style={{ display: "grid", gap: "6px" }}>
          <span>E-mailadres</span>
          <input
            type="email"
            name="email"
            required
            style={{
              height: "44px",
              borderRadius: "10px",
              border: "1px solid #cfc8b6",
              padding: "0 12px",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: "6px" }}>
          <span>Wachtwoord</span>
          <input
            type="password"
            name="password"
            required
            style={{
              height: "44px",
              borderRadius: "10px",
              border: "1px solid #cfc8b6",
              padding: "0 12px",
            }}
          />
        </label>

        <button
          type="submit"
          style={{
            height: "46px",
            borderRadius: "12px",
            border: "1px solid #d8a900",
            background: "#efbe00",
            color: "#111",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Inloggen
        </button>
      </form>
    </main>
  );
}