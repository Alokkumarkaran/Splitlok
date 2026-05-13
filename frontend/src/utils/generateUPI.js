export const generateUPILink = (upiId, name, amount) => {
  const baseUrl = "upi://pay";
  const params = new URLSearchParams({
    pa: upiId,
    pn: name,
    am: amount.toString(),
    cu: "INR",
    tn: "FlatSync Settlement"
  });

  return `${baseUrl}?${params.toString()}`;
};