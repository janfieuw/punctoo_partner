export default function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        style={{
          height: "42px",
          padding: "0 14px",
          borderRadius: "10px",
          border: "1px solid #d6cfbf",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        Uitloggen
      </button>
    </form>
  );
}