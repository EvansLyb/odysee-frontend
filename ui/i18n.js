// @flow
import { isLocalStorageAvailable } from 'util/storage';

const isProduction = process.env.NODE_ENV === 'production';
let knownMessages = null;
const localStorageAvailable = isLocalStorageAvailable();

window.i18n_messages = window.i18n_messages || {};

/*
 I dislike the below code (and note that it ships all the way to the distributed app),
 but this seems better than silently having this limitation and future devs not knowing.
 */
function saveMessageWeb(message) {
  if (!isProduction && knownMessages === null) {
    console.log('Note that i18n messages are not saved in web dev mode.'); // eslint-disable-line
    knownMessages = {};
  }
}

function removeContextMetadata(message) {
  // Example string entries with context-metadata:
  //   "About --[About section in Help Page]--": "About",
  //   "About --[tab title in Channel Page]--": "About",
  const CONTEXT_BEGIN = '--[';
  const CONTEXT_FINAL = ']--';

  // If the resolved string still contains the context-metadata, then it's one of the following:
  // 1. In development mode, where 'en.json' in the server hasn't been updated with the string yet.
  // 2. Translator made a mistake of not ignoring the context string.
  // In either case, we'll revert to the English version.

  const begin = message.lastIndexOf(CONTEXT_BEGIN);
  if (begin > 0 && message.endsWith(CONTEXT_FINAL)) {
    // Strip away context:
    message = message.substring(0, begin);
    // No trailing spaces should be allowed in the string database anyway, because that is hard to translate
    // (can't see in Transifex; might not make sense in other languages; etc.).
    // With that, we can add a space before the context-metadata to make it neat, and trim both cases here:
    message = message.trimEnd();
  }

  return message;
}

export function __(message: string, tokens: { [string]: string }) {
  if (!message) {
    return '';
  }

  const language = localStorageAvailable
    ? window.localStorage.getItem('language') || 'en'
    : window.navigator.language.slice(0, 2) || 'en';

  if (!isProduction) {
    saveMessageWeb(message);
  }

  let translatedMessage = window.i18n_messages[language] ? window.i18n_messages[language][message] || message : message;
  translatedMessage = removeContextMetadata(translatedMessage);

  if (!tokens) {
    return translatedMessage;
  }

  return translatedMessage.replace(/%([^%]+)%/g, ($1, $2) => {
    return tokens.hasOwnProperty($2) ? tokens[$2] : $2;
  });
}
