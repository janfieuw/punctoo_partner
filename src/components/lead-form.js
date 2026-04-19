"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LeadForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(event.currentTarget);

    const payload = {
      companyName: formData.get("companyName"),
      vatNumber: formData.get("vatNumber"),
      contactName: formData.get("contactName"),
      contactEmail: formData.get("contactEmail"),
      note: formData.get("note"),
    };

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Er is iets fout gelopen.");
      setLoading(false);
      return;
    }

    setSuccess("Lead toegevoegd.");
    event.currentTarget.reset();
    setLoading(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#fff",
        border: "1px solid #e7e2d5",
        borderRadius: "18px",
        padding: "18px",
        display: "grid",
        gap: "12px",
      }}
    >
      <h2 style={{ margin: 0 }}>Nieuwe lead</h2>

      <input name="companyName" placeholder="Onderneming" required style={inputStyle} />
      <input name="vatNumber" placeholder="Onderningsnummer" required style={inputStyle} />
      <input name="contactName" placeholder="Contactpersoon" style={inputStyle} />
      <input name="contactEmail" placeholder="E-mailadres" type="email" style={inputStyle} />
      <textarea name="note" placeholder="Notitie" rows={4} style={{ ...inputStyle, height: "auto", padding: "12px" }} />

      {error ? <div style={{ color: "#b42318" }}>{error}</div> : null}
      {success ? <div style={{ color: "#067647" }}>{success}</div> : null}

      <button
        type="submit"
        disabled={loading}
        style={{
          height: "44px",
          borderRadius: "12px",
          border: "1px solid #d8a900",
          background: "#efbe00",
          color: "#111",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {loading ? "Bezig..." : "Lead toevoegen"}
      </button>
    </form>
  );
}

const inputStyle = {
  height: "44px",
  borderRadius: "10px",
  border: "1px solid #cfc8b6",
  padding: "0 12px",
};