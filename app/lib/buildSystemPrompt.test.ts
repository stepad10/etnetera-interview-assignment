import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "./buildSystemPrompt";
import type { KnowledgeBase } from "~/types/knowledge";

const mockKb: KnowledgeBase = {
  knowledge_base: [
    {
      id: "DOC-999",
      topic: "Test Topic",
      content: "This is a test content block.",
      status: "current",
      tags: [],
      last_updated: "2025-01-01",
    },
  ],
  experts: [
    {
      name: "Test Setup",
      handle: "@test_handle",
      skills: ["testing"],
      availability: "available",
    },
    {
      name: "Null Handle Expert",
      handle: null,
      skills: ["edge"],
      availability: "on_leave",
    },
  ],
};

describe("System Prompt Builder", () => {
  it("should include all 9 rules from the technical spec", () => {
    const prompt = buildSystemPrompt(mockKb);

    // Check a few critical rules are present (naive check)
    expect(prompt).toContain("1. ONLY use the provided knowledge base");
    expect(prompt).toContain("9. When recommending an expert");
    expect(prompt).toContain("ONLY use the provided knowledge base");
  });

  it("should serialize knowledge documents correctly", () => {
    const prompt = buildSystemPrompt(mockKb);
    expect(prompt).toContain(
      "[DOC-999] Topic: Test Topic | Status: current | Last updated: 2025-01-01\nContent: This is a test content block.",
    );
  });

  it("should format normal experts with their handle", () => {
    const prompt = buildSystemPrompt(mockKb);
    expect(prompt).toContain(
      "Name: Test Setup | Handle: @test_handle | Skills: testing | Availability: available",
    );
  });

  it('should handle null expert handles without leaking the word "null"', () => {
    const prompt = buildSystemPrompt(mockKb);
    expect(prompt).toContain(
      "Name: Null Handle Expert | Handle: no handle — contact via team lead | Skills: edge | Availability: on_leave",
    );
    expect(prompt).not.toContain("Handle: @null");
  });
});
