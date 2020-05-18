import { render } from "@testing-library/react";
import React from "react";
import Landing from "./Landing";

test("renders landing text", () => {
    const { getByText } = render(<Landing />);
    expect(getByText(/battman/i)).toBeInTheDocument();
    expect(getByText(/battle hangman./i)).toBeInTheDocument();
});
