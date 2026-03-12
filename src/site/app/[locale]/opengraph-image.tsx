import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Instant Currency — Google Sheets Currency Converter";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const taglines: Record<string, string> = {
  en: "Convert currencies in Google Sheets with a single click",
  es: "Convierte divisas en Hojas de cálculo de Google con un solo clic",
  it: "Converti valute in Fogli Google con un solo clic",
  fr: "Convertissez les devises dans Google Sheets en un clic",
  de: "Währungen in Google Sheets mit einem Klick umrechnen",
  ja: "Google スプレッドシートでワンクリック通貨換算",
};

const rows = [
  { label: "Rent", original: "£1,250.00", converted: "$1,587.50" },
  { label: "Groceries", original: "¥45,000", converted: "$301.50" },
  { label: "Software", original: "€890.00", converted: "$1,130.40" },
  { label: "Travel", original: "$150.00", converted: "$150.00" },
];

function SpreadsheetRow({
  index,
  label,
  value,
  isConverted,
  isSelecting,
}: {
  index: number;
  label: string;
  value: string;
  isConverted: boolean;
  isSelecting: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        borderBottom: "1px solid #e2e8ed",
        background: isSelecting ? "#e8f0fe" : "white",
      }}
    >
      {/* Row number */}
      <div
        style={{
          width: "36px",
          padding: "10px 0",
          textAlign: "center",
          fontSize: "12px",
          color: "#8b95a1",
          background: "#f8fafb",
          borderRight: "1px solid #e2e8ed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {index}
      </div>
      {/* Label */}
      <div
        style={{
          flex: 1,
          padding: "10px 14px",
          fontSize: "14px",
          color: "#1a1a1a",
          borderRight: "1px solid #e2e8ed",
          display: "flex",
          alignItems: "center",
        }}
      >
        {label}
      </div>
      {/* Value */}
      <div
        style={{
          flex: 1,
          padding: "10px 14px",
          fontSize: "14px",
          fontFamily: "monospace",
          color: isConverted ? "#0d7c66" : "#1a1a1a",
          fontWeight: isConverted ? 600 : 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          border: isSelecting ? "2px solid #1a73e8" : "2px solid transparent",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tagline = taglines[locale] || taglines.en;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "linear-gradient(175deg, #0f3d33 0%, #14655a 35%, #1B9C85 70%, #3cc4a7 100%)",
          fontFamily: "system-ui, sans-serif",
          padding: "60px 80px",
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.04,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Left side: text */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            paddingRight: "60px",
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: 700,
                color: "white",
              }}
            >
              ic
            </div>
            <span
              style={{
                fontSize: "22px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
                letterSpacing: "0.02em",
              }}
            >
              Instant Currency
            </span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "44px",
              fontWeight: 700,
              color: "white",
              lineHeight: 1.2,
            }}
          >
            {tagline}
          </div>

          {/* Badge */}
          <div
            style={{
              marginTop: "32px",
              display: "flex",
              alignItems: "center",
              background: "rgba(255,255,255,0.12)",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "16px",
              fontWeight: 500,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            Free add-on for Google Sheets
          </div>
        </div>

        {/* Right side: mini spreadsheet */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "380px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {/* Window chrome */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 16px",
                background: "#f8fafb",
                borderBottom: "1px solid #e2e8ed",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#ff5f57",
                }}
              />
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#febc2e",
                }}
              />
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#28c840",
                }}
              />
              <span
                style={{
                  marginLeft: "12px",
                  fontSize: "11px",
                  color: "#8b95a1",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                }}
              >
                Expenses
              </span>
            </div>

            {/* Column headers */}
            <div
              style={{
                display: "flex",
                width: "100%",
                borderBottom: "1px solid #e2e8ed",
                background: "#f8fafb",
              }}
            >
              <div
                style={{
                  width: "36px",
                  padding: "6px 0",
                  borderRight: "1px solid #e2e8ed",
                  display: "flex",
                }}
              />
              <div
                style={{
                  flex: 1,
                  padding: "6px 0",
                  textAlign: "center",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#8b95a1",
                  borderRight: "1px solid #e2e8ed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                A
              </div>
              <div
                style={{
                  flex: 1,
                  padding: "6px 0",
                  textAlign: "center",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#8b95a1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                B
              </div>
            </div>

            {/* Rows: first 2 converted, 3rd selecting, 4th untouched */}
            <SpreadsheetRow
              index={1}
              label={rows[0].label}
              value={rows[0].converted}
              isConverted={true}
              isSelecting={false}
            />
            <SpreadsheetRow
              index={2}
              label={rows[1].label}
              value={rows[1].converted}
              isConverted={true}
              isSelecting={false}
            />
            <SpreadsheetRow
              index={3}
              label={rows[2].label}
              value={rows[2].original}
              isConverted={false}
              isSelecting={true}
            />
            <SpreadsheetRow
              index={4}
              label={rows[3].label}
              value={rows[3].original}
              isConverted={false}
              isSelecting={false}
            />

            {/* Status bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 16px",
                background: "#f8fafb",
              }}
            >
              <span style={{ fontSize: "11px", color: "#8b95a1" }}>
                → USD
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                {rows.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background:
                        i < 2 ? "#0d7c66" : i === 2 ? "#1a73e8" : "#d5dbe1",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
