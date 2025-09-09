import React from "react";

export default function Header({ children }) {
  return (
    <header className="w-full max-w-3xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <h1 className="text-xl sm:text-2xl">Go Board</h1>
      {children}
    </header>
  );
}
