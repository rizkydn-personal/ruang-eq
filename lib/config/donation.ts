import "server-only";
export function donationConfig() {
  return {
    bank:
      process.env.DONATION_BANK_NAME ||
      process.env.NEXT_PUBLIC_DONATION_BANK ||
      "",
    number:
      process.env.DONATION_ACCOUNT_NUMBER ||
      process.env.NEXT_PUBLIC_DONATION_ACCOUNT ||
      "",
    holder:
      process.env.DONATION_ACCOUNT_HOLDER ||
      process.env.NEXT_PUBLIC_DONATION_NAME ||
      "",
  };
}
