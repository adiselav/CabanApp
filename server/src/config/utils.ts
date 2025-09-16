export const isValidEmail = (email: string): boolean => {
  const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return regex.test(email);
};

export const isValidTelefon = (telefon: string): boolean => {
  const regex = /^(\+4)?0?7[0-9]{8}$/;
  return regex.test(telefon);
};
