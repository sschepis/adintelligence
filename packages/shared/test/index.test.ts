import { describe, it, expect } from "vitest";
import {
  MODELS, AspectRatioSchema, BrandProfileSchema, StreamEventSchema,
  ToolDefinitionSchema, GatewayError, ValidationError, RateLimitError,
  CreditsExhaustedError, ConcentrikError, extractJSON, safeParse,
} from "../src";

describe("@concentrik/shared", () => {
  it("exposes canonical model constants", () => {
    expect(MODELS.FAST).toBe("google/gemini-2.5-flash");
    expect(MODELS.PRO).toBe("google/gemini-2.5-pro");
    expect(MODELS.IMAGE_PRO).toBe("google/gemini-3-pro-image-preview");
  });

  it("validates aspect ratios", () => {
    expect(AspectRatioSchema.safeParse("9:16").success).toBe(true);
    expect(AspectRatioSchema.safeParse("3:2").success).toBe(false);
  });

  it("BrandProfileSchema requires name + url", () => {
    expect(BrandProfileSchema.safeParse({ name: "A", websiteUrl: "https://a.com" }).success).toBe(true);
    expect(BrandProfileSchema.safeParse({ name: "A" }).success).toBe(false);
  });

  it("StreamEvent and ToolDefinition schemas accept canonical shapes", () => {
    expect(StreamEventSchema.safeParse({ type: "stage", stage: "brief-parsed" }).success).toBe(true);
    expect(ToolDefinitionSchema.safeParse({ name: "t", description: "d", parameters: {} }).success).toBe(true);
  });

  it("error classes have stable codes and inheritance", () => {
    expect(new GatewayError("x", 500).code).toBe("GATEWAY_ERROR");
    expect(new RateLimitError().status).toBe(429);
    expect(new CreditsExhaustedError().status).toBe(402);
    expect(new ValidationError("x", []).code).toBe("VALIDATION_ERROR");
    expect(new GatewayError("x", 500)).toBeInstanceOf(ConcentrikError);
  });

  it("extractJSON handles fenced and bare JSON", () => {
    expect(extractJSON<{ a: number }>("```json\n{\"a\":1}\n```").a).toBe(1);
    expect(extractJSON<{ a: number }>("preamble {\"a\":2} trailing").a).toBe(2);
  });

  it("safeParse throws ValidationError on bad input", () => {
    expect(() => safeParse(AspectRatioSchema, "bad")).toThrow(ValidationError);
  });
});
