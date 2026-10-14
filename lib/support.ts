export interface SupportFields {
  name: string;
  email: string;
  subject: string;
  message: string;
}
export function validateSupport(body: unknown): SupportFields | null {
  if (!body || typeof body !== "object") return null;
  const input = body as Record<string, unknown>;
  const limits = { name: 100, email: 254, subject: 160, message: 5000 };
  const output = {} as SupportFields;
  for (const key of Object.keys(limits) as (keyof SupportFields)[]) {
    const value = input[key];
    if (
      typeof value !== "string" ||
      !value.trim() ||
      value.length > limits[key]
    )
      return null;
    output[key] = value.trim();
  }
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(output.email) ||
    /[\r\n]/.test(output.name + output.email + output.subject)
  )
    return null;
  return output;
}
export async function deliverSupport(
  fields: SupportFields,
  key: string,
  email: string,
  send: typeof fetch = fetch,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await send("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        access_key: key,
        name: fields.name,
        email: fields.email,
        subject: `Photo Booth Support: ${fields.subject}`,
        message: fields.message,
        to: email,
        from_name: "Photo Booth",
        reply_to: fields.email,
      }),
    });
    const result: unknown = await response.json();
    return (
      response.ok &&
      !!result &&
      typeof result === "object" &&
      "success" in result &&
      result.success === true
    );
  } finally {
    clearTimeout(timer);
  }
}
