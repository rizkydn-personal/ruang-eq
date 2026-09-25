/** Account endpoints always return a JSON object, including successful deletes. */
export async function readApiResponse<T>(response: Response): Promise<T> {
  const fallback =
    response.status === 401
      ? "Sesi berakhir. Silakan masuk kembali."
      : response.status === 403
        ? "Akses tidak diizinkan. Silakan masuk kembali atau hubungi pengelola."
        : response.status === 429
          ? "Terlalu banyak permintaan. Coba lagi dalam satu menit."
          : response.status >= 500
            ? "Layanan penyimpanan sedang tidak tersedia. Coba lagi beberapa saat."
            : "Respons server tidak lengkap atau tidak valid. Silakan coba lagi.";
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error(fallback);
  }
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new Error(fallback);
  if (!response.ok) {
    const message = "error" in data ? data.error : undefined;
    throw new Error(
      typeof message === "string" && message.trim() ? message : fallback,
    );
  }
  return data as T;
}
