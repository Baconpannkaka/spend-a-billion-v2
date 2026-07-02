import { ProductPlaceholder } from "@/components/product-placeholder";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("product placeholder", () => {
  it("renderar produktnamn och id", () => {
    render(<ProductPlaceholder product={{ id: "everyday-1", mode: "everyday", slug: "mobil", name: "Mobil", categoryId: "mobil", categoryLabel: "Mobil", subcategoryId: "smartphones", subcategoryLabel: "Smartphones", priceSek: 100, shortDescription: "", description: "", facts: [], tags: [] }} />);
    expect(screen.getByText("Mobil")).toBeInTheDocument();
    expect(screen.getByText(/everyday-1/)).toBeInTheDocument();
  });
});
