/**
 * Create the spinner container div
 */
export const createSpinner = () => {
  const spinner = document.createElement('div');
  spinner.className = 'jg-spinner';

  // Create the three span elements
  for (let i = 0; i < 3; i++) {
    const span = document.createElement('span');
    spinner.appendChild(span);
  }

  return spinner;
};

/**
 * Shuffles an array using the Fisher-Yates shuffle algorithm.
 *
 * @param array - The array to shuffle.
 * @returns The shuffled array.
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  let i: number, j: number, temp: T;

  for (i = array.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
};

/**
 * Checks that it is a valid number. If a string is passed, it is converted
 * to a number.
 *
 * @param settingContainer - The object that contains the setting (to allow
 * the conversion).
 * @param settingName - The setting name.
 * @throws Will throw an error if the value is not a valid number.
 */
export const checkOrConvertNumber = (
  settingContainer: Record<string, unknown>,
  settingName: string
): void => {
  const value = settingContainer[settingName];

  if (typeof value === 'string') {
    settingContainer[settingName] = parseFloat(value);
  }

  if (typeof settingContainer[settingName] === 'number') {
    if (isNaN(settingContainer[settingName])) {
      throw new Error(`Invalid number for ${settingName}`);
    }
  } else {
    throw new Error(`${settingName} must be a number`);
  }
};
