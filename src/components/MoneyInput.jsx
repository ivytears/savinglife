import { useState, useEffect } from "react";

export default function MoneyInput({
  value,
  onChange,
  placeholder,
  style: extraStyle,
  className,
}) {
  const [displayVal, setDisplayVal] = useState(() => {
    const n = parseFloat(value);
    return n ? n.toLocaleString("en-US") : "";
  });

  useEffect(() => {
    const n = parseFloat(value);
    const formatted = n ? n.toLocaleString("en-US") : "";
    if (
      formatted !== displayVal &&
      document.activeElement?.dataset?.moneyinput !== "true"
    ) {
      setDisplayVal(formatted);
    }
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value.replace(/,/g, "");
    if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
      const n = parseFloat(raw);
      if (raw === "" || raw === "." || raw.endsWith(".")) {
        setDisplayVal(raw);
        onChange(raw.replace(/\.$/, "") || "");
      } else if (!isNaN(n)) {
        const parts = raw.split(".");
        parts[0] = parseInt(parts[0]).toLocaleString("en-US");
        setDisplayVal(parts.join("."));
        onChange(String(n));
      }
    }
  };

  const handleBlur = () => {
    const n = parseFloat(value);
    setDisplayVal(n ? n.toLocaleString("en-US") : "");
  };

  return (
    <input
      data-moneyinput="true"
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      value={displayVal}
      onChange={handleChange}
      onBlur={handleBlur}
      style={extraStyle}
      className={className}
    />
  );
}
