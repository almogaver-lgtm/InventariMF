// ========================================
// GOOGLE APPS SCRIPT - INVENTARI CELLER (v8 - AMB HISTORIAL)
// ========================================

// Capçaleres CORS per permetre crides des de la webapp
function addCORSHeaders(response) {
  return response
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    // ─── GET CONFIG ────────────────────────────────────────────────────────────
    if (action === "getConfig") {
      const users    = getColumnValues(ss, "CONFIG", 1);
      const articles = getColumnValues(ss, "CONFIG", 2);
      const stock    = {};

      ss.getSheets().forEach(s => {
        const name = s.getName();
        if (name !== "LOG GLOBAL" && name !== "CONFIG") {
          stock[name] = {
            total:  Number(s.getRange("M1").getValue()) || 0,
            celler: Number(s.getRange("M2").getValue()) || 0,
            pla:    Number(s.getRange("M3").getValue()) || 0
          };
        }
      });

      return jsonResponse({ users, articles, stock });
    }

    // ─── GET HISTORY ───────────────────────────────────────────────────────────
    if (action === "getHistory") {
      const sheet = ss.getSheetByName("LOG GLOBAL");
      if (!sheet) return jsonResponse({ logs: [], error: "Full LOG GLOBAL no trobat" });

      const lastRow = sheet.getLastRow();
      if (lastRow < 2) return jsonResponse({ logs: [] });

      // Llegim totes les files de dades (des de fila 2 fins a l'última)
      const numRows = lastRow - 1;
      const data = sheet.getRange(2, 1, numRows, 9).getValues(); // Columnes A-I

      const logs = data
        .filter(row => row[0] !== "" && row[0] !== null) // Ignorem files buides
        .map(row => {
          // Columnes: A=TIMESTAMP, B=USUARI, C=ARTICLE, D=ANYADA,
          //           E=UBICACIÓ, F=AMPOLLES, G=CAIXES, H=TOTAL AMPOLLES, I=FONT UBICACIÓ
          const rawTimestamp = row[0];
          let timestamp;

          // Si el Sheet retorna un objecte Date, el formatem nosaltres
          if (rawTimestamp instanceof Date) {
            timestamp = formatDate(rawTimestamp);
          } else {
            timestamp = rawTimestamp.toString();
          }

          return {
            timestamp:    timestamp,
            user:         row[1] ? row[1].toString() : "",
            article:      row[2] ? row[2].toString() : "",
            year:         row[3] ? row[3].toString() : "",
            location:     row[4] ? row[4].toString() : "",
            bottles:      Number(row[5]) || 0,
            boxes:        Number(row[6]) || 0,
            totalBottles: Number(row[7]) || 0,
            incidencia:   false  // S'afegirà en futures versions si hi ha columna J
          };
        })
        .reverse(); // Ordre invers: el més recent primer

      return jsonResponse({ logs });
    }

    // ─── ACCIÓ DESCONEGUDA ─────────────────────────────────────────────────────
    return jsonResponse({ error: "Acció desconeguda: " + action });

  } catch (error) {
    Logger.log("doGet error: " + error.toString());
    return jsonResponse({ error: error.toString() });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss   = SpreadsheetApp.getActiveSpreadsheet();

    if (data.action === "addUser")    return addConfig(ss, 1, data.name);
    if (data.action === "addArticle") return addConfig(ss, 2, data.name);

    // GESTIÓ DE FOTOS D'INCIDÈNCIES
    if (data.image && data.incidencia) {
      saveIncidentPhoto(data.image, data.article, data.timestamp);
    }

    // REGISTRE NORMAL
    registerDataToSheet(ss, "LOG GLOBAL", data, false);

    const articleSheetName = data.article.toUpperCase().trim();
    registerDataToSheet(ss, articleSheetName, data, true);

    return jsonResponse({ status: "success" });

  } catch (error) {
    Logger.log("doPost error: " + error.toString());
    return jsonResponse({ status: "error", message: error.toString() });
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────────────────────

function registerDataToSheet(ss, sheetName, data, updateTotals) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(["TIMESTAMP", "USUARI", "ARTICLE", "ANYADA", "UBICACIÓ", "AMPOLLES", "CAIXES", "TOTAL AMPOLLES", "FONT UBICACIÓ"]);
    sheet.getRange("1:1").setFontWeight("bold").setBackground("#f3f3f3");
    sheet.setFrozenRows(1);
    sheet.getRange("L1:L3").setValues([["TOTAL ABSOLUT:"], ["CELLER/BOTIGA:"], ["EL PLA:"]]).setFontWeight("bold");
    sheet.getRange("M1:M3").setFontWeight("bold").setNumberFormat("#,##0").setValue(0);
  }

  // Timestamp: si ve de l'app és ja un string DD/MM/YYYY HH:mm:ss
  // Si no ve, el generem nosaltres en el mateix format
  const timestamp = data.timestamp || formatDate(new Date());

  const row = [
    timestamp,
    data.user         || "",
    data.article      || "",
    data.year         || "",
    data.location     || "",
    Number(data.bottles)      || 0,
    Number(data.boxes)        || 0,
    Number(data.totalBottles) || 0,
    data.locationSource || "App Mobil"
  ];
  sheet.appendRow(row);

  if (updateTotals) {
    const total = Number(data.totalBottles) || 0;
    const loc   = (data.location || "").toLowerCase();
    const m1    = sheet.getRange("M1");
    const m2    = sheet.getRange("M2");
    const m3    = sheet.getRange("M3");

    m1.setValue((Number(m1.getValue()) || 0) + total);
    if (loc.includes("celler") || loc.includes("botiga")) {
      m2.setValue((Number(m2.getValue()) || 0) + total);
    } else if (loc.includes("pla")) {
      m3.setValue((Number(m3.getValue()) || 0) + total);
    }
  }
}

function saveIncidentPhoto(base64, article, time) {
  const folderName = "Stock Incidències";
  const folders    = DriveApp.getFoldersByName(folderName);
  const folder     = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);

  try {
    const contentType = base64.split(",")[0].split(":")[1].split(";")[0];
    const bytes       = Utilities.base64Decode(base64.split(",")[1]);
    const safeName    = (article + "_" + (time || "").replace(/[/:\s]/g, "_")) + ".jpg";
    const blob        = Utilities.newBlob(bytes, contentType, safeName);
    folder.createFile(blob);
  } catch (e) {
    Logger.log("Error guardant foto: " + e.toString());
  }
}

function addConfig(ss, col, value) {
  let sheet = ss.getSheetByName("CONFIG");
  if (!sheet) {
    sheet = ss.insertSheet("CONFIG");
    sheet.appendRow(["USUARIS", "ARTICLES"]);
    sheet.getRange("1:1").setFontWeight("bold");
  }
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, col).setValue(value);
  return jsonResponse({ status: "success" });
}

function getColumnValues(ss, sheetName, col) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, col, lastRow - 1, 1).getValues()
              .map(r => r[0])
              .filter(v => v !== "" && v !== null && v !== undefined);
}

// Formata un objecte Date com a DD/MM/YYYY HH:mm:ss
function formatDate(d) {
  if (!(d instanceof Date) || isNaN(d)) return "";
  const pad = n => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// Retorna un JSON amb capçaleres correctes
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
