// lib/withRetry.ts

export async function withRetry<T>(fn: () => Promise<T>, retries = 1): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const isConnectionError =
      err?.message?.includes("Server has closed the connection") ||
      err?.message?.includes("Connection terminated") ||
      err?.code === "P1017";

    if (isConnectionError && retries > 0) {
      console.warn("اتصال قديم اكتشف، بعيد المحاولة...");
      return withRetry(fn, retries - 1);
    }
    throw err;
  }
}