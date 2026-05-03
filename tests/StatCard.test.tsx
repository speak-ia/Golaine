import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Users } from "lucide-react";
import { StatCard } from "@shared/components/feedback/StatCard";

describe("StatCard", () => {
  it("affiche le libellé et la valeur", () => {
    render(
      <StatCard
        label="Contacts"
        value="42"
        icon={Users}
        iconColor="#000"
        iconBg="#eee"
      />
    );
    expect(screen.getByText("Contacts")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });
});
