// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/support/route";
import { deliverSupport, validateSupport } from "@/lib/support";
const fields = {
  name: "Test only",
  email: "test@example.com",
  subject: "Mock delivery",
  message: "Provider response test. No message is sent.",
};
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
describe("support validation and mocked delivery", () => {
  it.each([
    null,
    {},
    { ...fields, name: [] },
    { ...fields, email: "bad" },
    { ...fields, subject: "a\nb" },
    { ...fields, message: "x".repeat(5001) },
  ])("rejects malformed input %#", (input) =>
    expect(validateSupport(input)).toBeNull(),
  );
  it("trims valid fields", () =>
    expect(validateSupport({ ...fields, name: " Test only " })).toEqual(
      fields,
    ));
  it.each([true, false])(
    "uses the provider success flag %s",
    async (success) => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ success }), { status: 200 }),
        );
      expect(
        await deliverSupport(fields, "mock-key", "test@example.com", fetchMock),
      ).toBe(success);
      const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(payload.access_key).toBe("mock-key");
      expect(payload).not.toHaveProperty("photos");
    },
  );
  it("rejects provider non-JSON and network failures", async () => {
    await expect(
      deliverSupport(
        fields,
        "mock",
        "test@example.com",
        vi.fn().mockResolvedValue(new Response("invalid")),
      ),
    ).rejects.toThrow();
    await expect(
      deliverSupport(
        fields,
        "mock",
        "test@example.com",
        vi.fn().mockRejectedValue(new Error("offline")),
      ),
    ).rejects.toThrow("offline");
  });
  it("returns honest unconfigured status, without calling the provider", async () => {
    vi.stubEnv("WEB3FORMS_ACCESS_KEY", "");
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const response = await POST(
      new NextRequest("http://localhost/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      }),
    );
    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("rejects cross-origin requests and malformed JSON", async () => {
    expect(
      (
        await POST(
          new NextRequest("https://photobooth.tedyfazrin.com/api/support", {
            method: "POST",
            headers: {
              origin: "https://other.example",
              host: "photobooth.tedyfazrin.com",
              "Content-Type": "application/json",
            },
            body: "{}",
          }),
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await POST(
          new NextRequest("http://localhost/api/support", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "broken",
          }),
        )
      ).status,
    ).toBe(400);
  });
  it("returns provider failure instead of success", async () => {
    vi.stubEnv("WEB3FORMS_ACCESS_KEY", "mock");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false }), { status: 400 }),
    );
    const response = await POST(
      new NextRequest("http://localhost/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      }),
    );
    expect(response.status).toBe(502);
  });
});
