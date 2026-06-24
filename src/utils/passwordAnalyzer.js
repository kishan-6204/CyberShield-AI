const COMMON_PASSWORDS = ['password', '123456', 'qwerty', 'admin', 'welcome', 'letmein'];

const strengthLevels = [
  { min: 0, max: 39, label: 'Weak', color: 'bg-rose-400', textColor: 'text-rose-200' },
  { min: 40, max: 59, label: 'Fair', color: 'bg-amber-400', textColor: 'text-amber-200' },
  { min: 60, max: 79, label: 'Good', color: 'bg-sky-400', textColor: 'text-sky-200' },
  { min: 80, max: 100, label: 'Strong', color: 'bg-emerald-400', textColor: 'text-emerald-200' },
];

function getStrengthLevel(score) {
  return strengthLevels.find((level) => score >= level.min && score <= level.max) ?? strengthLevels[0];
}

export function analyzePassword(password = '') {
  const normalizedPassword = password.trim().toLowerCase();
  const checks = {
    hasEightCharacters: password.length >= 8,
    hasTwelveCharacters: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialCharacter: /[^A-Za-z0-9]/.test(password),
    isCommonPassword: COMMON_PASSWORDS.includes(normalizedPassword),
  };

  let score = 0;

  if (checks.hasEightCharacters) score += 20;
  if (checks.hasUppercase) score += 20;
  if (checks.hasLowercase) score += 20;
  if (checks.hasNumber) score += 20;
  if (checks.hasSpecialCharacter) score += 20;

  if (checks.isCommonPassword) {
    score = Math.min(score, 20);
  }

  const suggestions = [];

  if (!checks.hasEightCharacters) suggestions.push('Use at least 8 characters.');
  if (!checks.hasTwelveCharacters) suggestions.push('Use longer passwords with 12 or more characters for stronger protection.');
  if (!checks.hasUppercase) suggestions.push('Add uppercase letters.');
  if (!checks.hasLowercase) suggestions.push('Add lowercase letters.');
  if (!checks.hasNumber) suggestions.push('Add numbers.');
  if (!checks.hasSpecialCharacter) suggestions.push('Add special characters.');
  if (checks.isCommonPassword) suggestions.push('Avoid common passwords that attackers guess first.');
  if (password && suggestions.length === 0) suggestions.push('Excellent password structure. Store it securely in a password manager.');

  const strength = getStrengthLevel(score);

  return {
    score,
    strength,
    checks,
    suggestions,
    commonPasswords: COMMON_PASSWORDS,
  };
}
