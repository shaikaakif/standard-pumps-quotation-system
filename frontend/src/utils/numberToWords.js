/**
 * Converts a numerical amount into Indian currency words representation.
 * Example: 28500 -> "Rupees Twenty-Eight Thousand Five Hundred Only"
 * 
 * Supports the Indian numbering format (Crore, Lakh, Thousand, Hundred).
 */

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen"
];

const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
];

function convertBelowThousand(n) {
  let str = "";
  if (n >= 100) {
    str += ONES[Math.floor(n / 100)] + " Hundred ";
    n %= 100;
  }
  if (n > 0) {
    if (n < 20) {
      str += ONES[n] + " ";
    } else {
      str += TENS[Math.floor(n / 10)] + " ";
      if (n % 10 > 0) {
        str += ONES[n % 10] + " ";
      }
    }
  }
  return str.trim();
}

export function numberToIndianWords(amount) {
  if (amount == null || isNaN(amount) || amount === 0) {
    return "Rupees Zero Only";
  }

  const rounded = Math.round(Number(amount) * 100) / 100;
  const integerPart = Math.floor(rounded);
  const decimalPart = Math.round((rounded - integerPart) * 100);

  if (integerPart === 0 && decimalPart === 0) {
    return "Rupees Zero Only";
  }

  let words = "";

  const crore = Math.floor(integerPart / 10000000);
  let remainder = integerPart % 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder %= 100000;

  const thousand = Math.floor(remainder / 1000);
  remainder %= 1000;

  const hundreds = remainder;

  if (crore > 0) {
    words += convertBelowThousand(crore) + " Crore ";
  }
  if (lakh > 0) {
    words += convertBelowThousand(lakh) + " Lakh ";
  }
  if (thousand > 0) {
    words += convertBelowThousand(thousand) + " Thousand ";
  }
  if (hundreds > 0) {
    words += convertBelowThousand(hundreds) + " ";
  }

  words = words.trim();
  let result = words ? `Rupees ${words}` : "Rupees";

  if (decimalPart > 0) {
    const paiseWords = convertBelowThousand(decimalPart);
    result += ` and ${paiseWords} Paise`;
  }

  return `${result} Only`;
}

export default numberToIndianWords;
