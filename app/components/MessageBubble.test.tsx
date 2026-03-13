import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MessageBubble from "./MessageBubble";
import type { Message } from "~/types/chat";

describe("MessageBubble Component", () => {
  it("renders a user message aligned to the right", () => {
    const message: Message = { role: "user", content: "Hello assistant" };
    const { container } = render(<MessageBubble message={message} />);

    // Check text content
    expect(screen.getByText("Hello assistant")).toBeInTheDocument();

    // User messages do not have the AI avatar
    expect(screen.queryByText("AI")).not.toBeInTheDocument();

    // Outer flex div should be justify-end for user
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass("justify-end");
  });

  it("renders an assistant message aligned to the left with AI avatar", () => {
    const message: Message = { role: "assistant", content: "Hello user" };
    const { container } = render(<MessageBubble message={message} />);

    expect(screen.getByText("Hello user")).toBeInTheDocument();
    expect(screen.getByText("AI")).toBeInTheDocument();

    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass("justify-start");
  });

  it("parses and renders citation badges for DOC-XXX patterns", () => {
    const message: Message = {
      role: "assistant",
      content: "According to DOC-123 and DOC-456, you must reboot.",
    };
    render(<MessageBubble message={message} />);

    expect(screen.getByText("📄 DOC-123")).toBeInTheDocument();
    expect(screen.getByText("📄 DOC-456")).toBeInTheDocument();
  });

  it("does not render duplicate citation badges", () => {
    const message: Message = {
      role: "assistant",
      content: "DOC-999 is important. Again, see DOC-999.",
    };
    render(<MessageBubble message={message} />);

    const badges = screen.getAllByText("📄 DOC-999");
    expect(badges).toHaveLength(1);
  });

  it("does not render citations for user messages", () => {
    const message: Message = { role: "user", content: "What is DOC-001?" };
    render(<MessageBubble message={message} />);

    expect(screen.queryByText("📄 DOC-001")).not.toBeInTheDocument();
  });
});
