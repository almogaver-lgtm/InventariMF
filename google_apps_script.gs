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
      const data = sheet.getRange(2, 1, numRows, 10).getValues(); // Columnes A-J

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
            incidencia:   row[9] === true || row[9] === "true" || row[9] === "VERITAT"
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

    if (data.action === "addUser")    return jsonResponse(addConfig(ss, 1, data.name));
    if (data.action === "addArticle") return jsonResponse(addConfig(ss, 2, data.name));

    // ──────────────────────────────────────────────────────────────
    // EDITAR REGISTRE EXISTENT
    // ──────────────────────────────────────────────────────────────
    if (data.action === "editEntry") {
      try {
        const sheet = ss.getSheetByName("LOG GLOBAL");
        if (!sheet) return jsonResponse({ status: "error", message: "Full LOG GLOBAL no trobat" });

        const lastRow = sheet.getLastRow();
        if (lastRow < 2) return jsonResponse({ status: "error", message: "Cap registre trobat" });

        const tsCol = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        let foundRow = -1;
        for (let i = 0; i < tsCol.length; i++) {
          const cellVal = tsCol[i][0] instanceof Date ? formatDate(tsCol[i][0]) : tsCol[i][0].toString();
          if (cellVal === data.originalTimestamp) {
            foundRow = i + 2;
            break;
          }
        }

        if (foundRow === -1) {
          return jsonResponse({ status: "error", message: "Registre no trobat amb timestamp: " + data.originalTimestamp });
        }

        const newTotal = (Number(data.boxes) || 0) * 6 + (Number(data.bottles) || 0);
        sheet.getRange(foundRow, 2).setValue(data.user     || "");
        sheet.getRange(foundRow, 3).setValue(data.article  || "");
        sheet.getRange(foundRow, 4).setValue(data.year     || "");
        sheet.getRange(foundRow, 5).setValue(data.location || "");
        sheet.getRange(foundRow, 6).setValue(Number(data.bottles) || 0);
        sheet.getRange(foundRow, 7).setValue(Number(data.boxes)   || 0);
        sheet.getRange(foundRow, 8).setValue(newTotal);
        sheet.getRange(foundRow, 10).setValue(data.incidencia ? "true" : "false");

        return jsonResponse({ status: "success", updatedRow: foundRow, newTotal });
      } catch (err) {
        return jsonResponse({ status: "error", message: "Error editant: " + err.toString() });
      }
    }

    // ──────────────────────────────────────────────────────────────
    // REGISTRE NORMAL + FOTO
    // ──────────────────────────────────────────────────────────────
    
    // 1. Intentem guardar la foto (si n'hi ha)
    let photoStatus = "no photo";
    if (data.image) {
      try {
        saveIncidentPhoto(data.image, data.article, data.timestamp, data.user);
        photoStatus = "saved";
      } catch (err) {
        photoStatus = "error: " + err.toString();
        Logger.log("Error saveIncidentPhoto: " + err.toString());
      }
    }

    // 2. Registrem les dades al full de càlcul
    try {
      const globalStatus = registerDataToSheet(ss, "LOG GLOBAL", data, false);
      const articleSheetName = data.article.toUpperCase().trim();
      const unitStatus = registerDataToSheet(ss, articleSheetName, data, true);

      return jsonResponse({ 
        status: "success", 
        photo: photoStatus,
        debug: { global: globalStatus, article: unitStatus }
      });
    } catch (err) {
      Logger.log("Error registerDataToSheet: " + err.toString());
      return jsonResponse({ status: "error", message: "Error registrant dades: " + err.toString() });
    }

  } catch (error) {
    Logger.log("doPost error fatal: " + error.toString());
    return jsonResponse({ status: "error", message: "Error fatal: " + error.toString() });
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────────────────────

function registerDataToSheet(ss, sheetName, data, updateTotals) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(["TIMESTAMP", "USUARI", "ARTICLE", "ANYADA", "UBICACIÓ", "AMPOLLES", "CAIXES", "TOTAL AMPOLLES", "FONT UBICACIÓ", "INCIDÈNCIA"]);
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
    data.locationSource || "App Mobil",
    data.incidencia ? "true" : "false"
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
  return "ok";
}

function saveIncidentPhoto(base64, article, time, user) {
  const folderId = "1IeXE8jeMDsIUIYC9PxxVZSLAe6bux8Yq";
  
  try {
    const folder = DriveApp.getFolderById(folderId);
    if (!folder) {
      Logger.log("Error: No es troba la carpeta amb ID: " + folderId);
      return;
    }

    const splitData = base64.split(",");
    if (splitData.length < 2) {
      Logger.log("Error: Format base64 de la imatge incorrecte");
      return;
    }

    const contentType = splitData[0].split(":")[1].split(";")[0];
    const bytes       = Utilities.base64Decode(splitData[1]);
    
    // Format: DD-MM-YYYY_HH-mm-ss_Usuari_Article.jpg
    const safeTime = (time || "").replace(/[/]/g, "-").replace(/[:]/g, "-").replace(/\s/g, "_");
    const safeUser = (user || "Anonim").replace(/\s/g, "_");
    const safeArticle = (article || "Producte").replace(/\s/g, "_");
    
    const fileName = `${safeTime}_${safeUser}_${safeArticle}.jpg`;
    const blob = Utilities.newBlob(bytes, contentType, fileName);
    folder.createFile(blob);
    Logger.log("✅ Foto guardada amb èxit: " + fileName);
  } catch (e) {
    Logger.log("❌ Error fatal guardant foto: " + e.toString());
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
