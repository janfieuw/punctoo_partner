"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LeadForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  function formatVatInput(input) {
    let value = String(input || "").replace(/\D/g, "").slice(0, 10);

    if (!value) return "";

    if (value.length <= 1) return value;
    if (value.length <= 4) return `${value[0]}.${value.slice(1)}`;
    if (value.length <= 7) return `${value[0]}.${value.slice(1, 4)}.${value.slice(4)}`;

    return `${value[0]}.${value.slice(1, 4)}.${value.slice(4, 7)}.${value.slice(7, 10)}`;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    const payload = {
      companyName,
      vatNumber,
      contactName,
      contactEmail,
    };

    try {
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

      setCompanyName("");
      setVatNumber("");
      setContactName("");
      setContactEmail("");

      router.refresh();
    } catch (err) {
      setError("Er is iets fout gelopen.");
    } finally {
      setLoading(false);
    }
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

      <input
        name="companyName"
        placeholder="Onderneming"
        required
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        style={inputStyle}
      />

      <input
        name="vatNumber"
        placeholder="0.123.456.789"
        required
        value={vatNumber}
        onChange={(e) => setVatNumber(formatVatInput(e.target.value))}
        style={inputStyle}
      />

      <input
        name="contactName"
        placeholder="Contactpersoon"
        value={contactName}
        onChange={(e) => setContactName(e.target.value)}
        style={inputStyle}
      />

      <input
        name="contactEmail"
        placeholder="E-mailadres"
        type="email"
        value={contactEmail}
        onChange={(e) => setContactEmail(e.target.value)}
        style={inputStyle}
      />

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