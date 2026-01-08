import type { ReactNode } from "react";

export function Container({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "0 16px",
      }}
    >
      {children}
    </div>
  );
}
