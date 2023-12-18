/* 
*   Global verfügbare Variablen
*/ 
var klartext;
var chiffre;
var encrypt;
var decrypt;
var shift;
var secret;
var vigenereSecret;
const alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
var vigenereArray = [];
var analyse;
var analyseResult;

var encryptionMethod = null;
var caesar;
var vigenere;
var rsa;

/* 
*   Definitionen für den Start des Programms ausführen  
*/
function setup() {
  noCanvas();

  klartext        = select("#klartext");             // Klartextfeld
  chiffre         = select("#chiffre");              // Chiffretextfeld
  shift           = select("#shift");                // Verschiebungseingabe (Schiebregler)
  secret          = select("#secret");               // Geheimer Schlüssel (Textbereich)
  caesar          = select("#caesar");               // Caesar-Verfahren gewählt
  vigenere        = select("#vigenere");             // Vigenere-Verfahren gewählt
  vigenereSecret  = select("#vigenereSecret");       // Geheinnis (key) für Vigenere
  rsa             = select("#rsa");                  // Rsa-Verfahren gewählt
  encrypt         = select("#encrypt");              // Button zum Verschluesseln
  decrypt         = select("#decrypt");              // Button zur Entschluesselung
  analyse         = select("#analyse");              // Button zur Cryptoanlyse
  analyseResult   = select("#analyseResult");        // Anzeigebereich der Analyse
  
  // Verbindung von Button und Funktion (Events an Buttons oder Input binden)
  caesar.mousePressed(handleCaesar);               // Verfahrenwahl
  vigenere.mousePressed(handleVigenere);           // Verfahrenwahl
  rsa.mousePressed(handleRsa);                     // Verfahrenwahl

  encrypt.mousePressed(handleEncrypt);              // Verschluesselungsvorgang
  decrypt.mousePressed(handleDecrypt);              // Entschluesselungsvorgang
  analyse.mousePressed(handleAnalyse);              // Analysevorgang
  shift.input(handleShift);                         // Live-Verschlüsselung und Analysevorgang
  secret.html(shift.value());                       // Zeige Standard-Wert an
  vigenereSecret.input(handleVigenereSecret);

  // vigenereArray mit den "richtigen Buchstaben" belegen
  for (let i = 0; i < alphabet.length; i++) {
    vigenereArray[i] = [];
    for (let j = 0; j < alphabet.length; j++) {
      vigenereArray[i][j] = alphabet[ (j+i) % alphabet.length ];
    }
  }
  console.log(vigenereArray);

}

const handleVigenereSecret = () => {
  console.log(vigenereSecret.value().toUpperCase());
};

const handleCaesar = () => {
  encryptionMethod = 'caesar';
  console.log(encryptionMethod);
};

const handleVigenere = () => {
  encryptionMethod = 'vigenere';
  console.log(encryptionMethod);
};

const handleRsa = () => {
  encryptionMethod = 'rsa';
  console.log(encryptionMethod);
};

/**
 * Ruft,  je nach globalen Wert eine Verschlüssellungsmethode auf und ändert den Inhalt (value) des chiffre Textarea-Feldes
 * 
 * @author Lutz Westphal
 */

const handleEncrypt = () => {
  switch (encryptionMethod) {
    case 'caesar':
      chiffre.value(translate( klartext.value().toUpperCase(), shift.value() ));    // Verschluesselung ausfuehren
      analyseResult.html('');
      break;
    case 'vigenere':
      chiffre.value( encryptVigenere( klartext.value().toUpperCase(), vigenereSecret.value().toUpperCase() ) );
      // chiffre.value(klartext.value().toUpperCase());
      break;

    default:
      break;
  }
};

/**
 * Ruft, je nach globalen Wert eine Verschlüssellungsmethode auf und ändert den Inhalt (value) des klartext Textarea-Feldes
 * 
 * @author Lutz Westphal
 * @author Theo Leuthardt
 */

const handleDecrypt = () => {
  klartext.value("");
  switch (encryptionMethod) {
    case 'caesar':
      klartext.value(translate( chiffre.value().toUpperCase(), -shift.value() ));    // Entschluesselung ausfuehren
      break;
    case 'vigenere':
      klartext.value(decryptVigenere( chiffre.value().toUpperCase(), vigenereSecret.value().toUpperCase() ));
      break;

    default:
      break;
  }
  
  
};

const handleShift = () => {
  secret.html(shift.value());
  if( chiffre.value() && klartext.value() ) chiffre.value(translate( klartext.value().toUpperCase(), shift.value() ));

  const myResult = letsAnalyse( chiffre.value(), shift.value() );
  chiffre.value().length>0 && analyseResult.html(showAnalyse( myResult.result, myResult.n));
};

const handleAnalyse = () => {
  const myResult = letsAnalyse(chiffre.value(), shift.value());
  chiffre.value().length>0 && analyseResult.html(showAnalyse( myResult.result, myResult.n));
};



/**
 * Verschiebe Chiffre, d.h. jeder Buchstabe eines Textes wird um eine 
 * bestimmte Anzahl von Buchstaben verschoben. Wird zum Ver- und Entschlüsselung benutzt!
 * 
 * @author Theo Leuthardt
 * @author Lutz Westphal
 * @param {string} text - Der zu verschlüsselnde Text.
 * @param {number} verschiebung - Die Anzahl der Buchstaben, um die verschoben wird (+ oder - möglich).
 * 
 * @see {@link https://de.wikipedia.org/wiki/Caesar-Verschlüsselung|Caesar-Verschlüsselung}
 * 
 * @returns {string} newText -Der um number verschobener Text.
 */

const translate = (text, key) => { 
  let newText   = '';
  let zp        = 0;
  let textLen   = text.length;
  let alphaLen  = alphabet.length;

  for (let i = 0; i < textLen; i++) {
    zp = alphabet.indexOf(text[i]);
    if( zp>=0 ) newText += alphabet[(zp + key + alphaLen) % alphaLen];
    else        newText += text[i];
  }
  return newText;
}

/**
 * Vigenere Chiffre Encrypt, 
 * es wird im Prinzip genauso vorgegangen, wie bei Caesar (Verschiebechiffre), also um eine bestimmte Zalhl (Key) verschoben.
 * Allerdings werden entsprechend der Position des Schlüsselbuchstabens die Verschiebung jeweils geändert.
 * Daher werden gleiche Buchstaben anders verlüsselt und damit eine statistische Analyse deutlich erschwert.
 * 
 * 
 * @author Lutz Westphal
 * @param {string} text - Der zu verschlüsselnde Text.
 * @param {string} key - Der geheime Schlüssel  
 * 
 * @see {@link https://de.wikipedia.org/wiki/Vigen%C3%A8re-Chiffre#|Vigenere-Verschlüsselung}
 * @see {@link https://www.cryptool.org/de/cto/vigenere|Vigenere-Verschlüsselung (Crypt-Tool-Online)}
 * 
 * @returns {string} chiffre - Der mit dem privaten (geheimen) Schlüssel codierte Chiffre als Text
 */

const encryptVigenere = (text, key) => { 
  let chiffre   = '';
  let i, j      = 0;
  let zp, kp    = 0;
  let textLen   = text.length;
  let keyLen    = key.length;
  let alphaLen  = alphabet.length;
  
  if( key ) {
    for (i = 0; i < textLen; i++) {
      zp = alphabet.indexOf(text[i]);
      if( zp>=0 ) {
        kp = alphabet.indexOf(key[j]);
        chiffre += alphabet[(zp + kp) % alphaLen];
        j = (j+1) % keyLen;
      } else chiffre += text[i];
    }
  }
  return chiffre;
}

/**
 * Vigenere Chiffre Decrypt, 
 * es wird im Prinzip genauso vorgegangen, wie bei Caesar (Verschiebechiffre), also um eine bestimmte Zalhl (Key) verschoben.
 * Allerdings werden entsprechend der Position des Schlüsselbuchstabens die Verschiebung jeweils geändert.
 * Daher werden gleiche Buchstaben anders verlüsselt und damit eine statistische Analyse deutlich erschwert.
 * 
 * 
 * @author Wir
 * @param {string} text - Der zu entschlüsselnde Text.
 * @param {string} key - Der geheimene Key (Schlüssel) zum entschlüsseln  
 * 
 * @see {@link https://de.wikipedia.org/wiki/Vigen%C3%A8re-Chiffre#|Vigenere-Verschlüsselung}
 * @see {@link https://www.cryptool.org/de/cto/vigenere|Vigenere-Verschlüsselung (Crypt-Tool-Online)}
 * 
 * @returns {string} klartext - Der mit dem privaten (geheimen) Schlüssel Klartext als Text
 */
 const decryptVigenere = (chiffre, key) => { 
  let plaintext   = '';
  let i, j      = 0;
  let zp, kp    = 0;
  let chiffreLen   = chiffre.length;
  let keyLen    = key.length;
  let alphaLen  = alphabet.length;

  if (key) {
    for (let i = 0; i < chiffreLen; i++) {
      zp = alphabet.indexOf(chiffre[i]);
      if (zp>=0) {
        kp = alphabet.indexOf(key[j]);
        plaintext += alphabet[(zp - kp + alphaLen) % alphaLen];
        j = (j+1) % keyLen;
      } else plaintext += chiffre[i];
    }
  }
  return plaintext;
}


/**
 * Analysieren des übergebenen Textes, d.h. es werden die absoluten 
 * Häufigkeit der Buchstaben gezählt.
 * 
 * @author Theo Leuthardt
 * @author Lutz Westphal
 * @param {string} text - Der zu analysierende Text als Paramter.
 * @see {@link https://jsdoc.app|JSDoc}
 * 
 * @returns {json} res - Array von absoluten Häufigkeit pro Buchstabe, Index 0 = A bis Index 25 = Z und n, die Gesamtanzahl
 */

 const letsAnalyse = (text) => {
  let statisticArray = [];
  for (let i = 0; i < alphabet.length; i++) statisticArray[i] = 0;

  if(text.length>0) {
    for( let i = 0; i < text.length; i++ ) {
      if( 'A' <= text[i] && 'Z' >= text[i] ) 
        for( let j = 0; j < alphabet.length; j++ ) if( text[i] == alphabet[j] ) statisticArray[j]++;
      else continue;
    }
    return( { result: statisticArray, n: text.length } );
  }

  return null;
};

/**
 * Erstellt einen HTML-String, der einen einfache Ausgabe der Sttistik enthält.
 * 
 * @author Lutz Westphal
 * @param {array} result        - Ergebnis der Analyse als Array der absoluten Häufigkeiten.
 * @param {number} quantity     - Gesamtlänge des zu analysierden Textes (Anzahl der Buchstaben).
 * 
 * @returns {string} HTML-Formatierter Text zur Ausgabe
 */

const showAnalyse = (result, quantity) => {
  let text  = "";
  const row = [ "", "", ""];

  for( let index=0; index<result.length; index++ ) {
    row[0] += "<th class='text-center'>"+ (index+1) +"</th>";
    row[1] += "<td class='text-center'>"+ alphabet[index] +"</td>";
    portion = result[index]>0 ? (result[index]/quantity*100).toPrecision(2) : "0";
    row[2] += "<td class='text-center'>"+portion+"</td>";    
  }

  text += "<h5>Häufigkeits-Analyse:</h5>";
  text += "<table class='table table-bordered table-sm table-hover text-center'>";
  text += "<caption>Tabelle der realtiven Häufigkeiten der Buchstaben des Chiffre</caption>";
  for( let i=0; i<row.length; i++ ) text += "<tr>" +row[i]+ "</tr>";
  text += "</table>";
  return text;
}