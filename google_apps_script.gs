// ========================================
// GOOGLE APPS SCRIPT - INVENTARI CELLER (v9 - LOG GLOBAL SINGLE SOURCE)
// ========================================

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
      const materialStock = {};
      
      const allSheets = ss.getSheets();
      const logSheet = allSheets.find(s => s.getName().trim().toUpperCase() === "LOG GLOBAL");
      const matSheet = allSheets.find(s => s.getName().trim().toUpperCase() === "MATERIA SECA");

      // Inicialitzem stock per a tots els articles configurats (VINS)
      articles.forEach(art => {
        stock[art] = { total: 0, celler: 0, pla: 0 };
      });
      if (logSheet) {
        const lastRow = logSheet.getLastRow();
        if (lastRow >= 2) {
          const data = logSheet.getRange(2, 1, lastRow - 1, 8).getValues(); // A-H
          data.forEach(row => {
            const art = row[2];
            const loc = (row[4] || "").toString().toLowerCase();
            const tot = Number(row[7]) || 0;

            if (stock[art]) {
              stock[art].total += tot;
              if (loc.includes("celler") || loc.includes("botiga")) stock[art].celler += tot;
              else if (loc.includes("pla")) stock[art].pla += tot;
            } else if (art) {
              stock[art] = { total: tot, celler: 0, pla: 0 };
              if (loc.includes("celler") || loc.includes("botiga")) stock[art].celler = tot;
              else if (loc.includes("pla")) stock[art].pla = tot;
            }
          });
        }
      }

      if (matSheet) {
        const lastRow = matSheet.getLastRow();
        if (lastRow >= 2) {
          const data = matSheet.getRange(2, 1, lastRow - 1, 10).getValues(); // Get more columns A-J
          data.forEach(row => {
            const art = row[2] ? row[2].toString().trim() : ""; // Column C
            const tot = Number(row[7]) || 0; // Column H (Total)
            if (art) {
              if (!materialStock[art]) materialStock[art] = { total: 0 };
              materialStock[art].total += tot;
            }
          });
        }
      }

      return jsonResponse({ 
        users, 
        articles, 
        stock, 
        materialStock, 
        debug: { 
          hasLogSheet: !!logSheet, 
          hasMatSheet: !!matSheet,
          matSheetName: matSheet ? matSheet.getName() : "None",
          matLastRow: matSheet ? matSheet.getLastRow() : 0 
        } 
      });
    }

    // ─── GET HISTORY ───────────────────────────────────────────────────────────
    if (action === "getHistory") {
      const sheets = ["LOG GLOBAL", "MATERIA SECA"];
      let allLogs = [];
      
      sheets.forEach(sName => {
        const sheet = ss.getSheetByName(sName);
        if (!sheet) return;
        const lastRow = sheet.getLastRow();
        if (lastRow < 2) return;
        const data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
        const logs = data
          .filter(row => row[0] !== "")
          .map(row => ({
            timestamp:      row[0] instanceof Date ? formatDate(row[0]) : row[0].toString(),
            user:           row[1] ? row[1].toString() : "",
            article:        row[2] ? row[2].toString() : "",
            year:           row[3] ? row[3].toString() : "",
            location:       row[4] ? row[4].toString() : "",
            bottles:        Number(row[5]) || 0,
            boxes:          Number(row[6]) || 0,
            totalBottles:   Number(row[7]) || 0,
            locationSource: row[8] ? row[8].toString() : "",
            incidenciaText: row[9] ? row[9].toString() : "",
            sheet:          sName
          }));
        allLogs = allLogs.concat(logs);
      });

      allLogs.sort((a, b) => {
        // Sort by timestamp descending
        // Simple string comparison since format is DD/MM/YYYY HH:mm:ss
        // Better convert back to comparable for sort
        const parseTS = (ts) => {
          const [d, t] = ts.split(" ");
          const [day, mon, yr] = d.split("/");
          return `${yr}${mon}${day}${t}`;
        };
        return parseTS(b.timestamp).localeCompare(parseTS(a.timestamp));
      });

      return jsonResponse({ logs: allLogs });
    }

    // ─── GET STOCK BY VINTAGE ─────────────────────────────────────────────────
    if (action === "getStockByVintage") {
      const article = e.parameter.article;
      if (!article) return jsonResponse({ error: "Falta paràmetre 'article'" });

      const logSheet = ss.getSheetByName("LOG GLOBAL");
      const vintagesMap = {};

      if (logSheet) {
        const lastRow = logSheet.getLastRow();
        if (lastRow >= 2) {
          const data = logSheet.getRange(2, 3, lastRow - 1, 8).getValues(); // C-J (Col 3-10)
          data.forEach(row => {
            // row[0] (Col C) = Article
            // row[1] (Col D) = Anyada
            // row[5] (Col H) = Total
            // row[7] (Col J) = Incidència
            if (row[0] === article) {
              const year = row[1] || "Sense anyada";
              if (!vintagesMap[year]) vintagesMap[year] = { year: year, total: 0, hasIncidents: false };
              vintagesMap[year].total += (Number(row[5]) || 0);
              if (row[7] && row[7] !== "") vintagesMap[year].hasIncidents = true;
            }
          });
        }
      }

      const vintages = Object.keys(vintagesMap).map(k => vintagesMap[k]);
      return jsonResponse({ article, vintages });
    }

    return jsonResponse({ error: "Acció desconeguda: " + action });

  } catch (error) {
    return jsonResponse({ error: error.toString() });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.action === "addUser")    return jsonResponse(addConfig(ss, 1, data.name));
    if (data.action === "addArticle") return jsonResponse(addConfig(ss, 2, data.name));

    const targetSheetName = (data.sheet || "LOG GLOBAL").trim();
    const logSheet = ss.getSheetByName(targetSheetName) || createLogGlobal(ss, targetSheetName);

    // ─── ELIMINAR ──────────────────────────────────────────────────────────────
    if (data.action === "deleteEntry") {
      const sheets = ["LOG GLOBAL", "MATERIA SECA"];
      for (let sName of sheets) {
        const s = ss.getSheetByName(sName);
        if (!s) continue;
        const lastRow = s.getLastRow();
        if (lastRow < 2) continue;
        const tsCol = s.getRange(2, 1, lastRow - 1, 1).getValues();
        for (let i = 0; i < tsCol.length; i++) {
          const cellVal = tsCol[i][0] instanceof Date ? formatDate(tsCol[i][0]) : tsCol[i][0].toString();
          if (cellVal === data.originalTimestamp) {
            s.deleteRow(i + 2);
            return jsonResponse({ status: "success" });
          }
        }
      }
      return jsonResponse({ status: "error", message: "No trobat" });
    }

    // ─── EDITAR ───────────────────────────────────────────────────────────────
    if (data.action === "editEntry") {
      const sheets = ["LOG GLOBAL", "MATERIA SECA"];
      for (let sName of sheets) {
        const s = ss.getSheetByName(sName);
        if (!s) continue;
        const lastRow = s.getLastRow();
        if (lastRow < 2) continue;
        const tsCol = s.getRange(2, 1, lastRow - 1, 1).getValues();
        for (let i = 0; i < tsCol.length; i++) {
          const cellVal = tsCol[i][0] instanceof Date ? formatDate(tsCol[i][0]) : tsCol[i][0].toString();
          if (cellVal === data.originalTimestamp) {
            const row = i + 2;
            const newTotal = (Number(data.boxes) || 0) * 6 + (Number(data.bottles) || 0);
            s.getRange(row, 2).setValue(data.user);
            s.getRange(row, 3).setValue(data.article);
            s.getRange(row, 4).setValue(data.year);
            s.getRange(row, 5).setValue(data.location);
            s.getRange(row, 6).setValue(data.bottles);
            s.getRange(row, 7).setValue(data.boxes);
            s.getRange(row, 8).setValue(newTotal);
            s.getRange(row, 10).setValue(data.incidenciaText || (data.incidencia ? "SÍ" : ""));
            return jsonResponse({ status: "success" });
          }
        }
      }
      return jsonResponse({ status: "error", message: "No trobat" });
    }

    // ─── REGISTRE NOU ─────────────────────────────────────────────────────────
    let photoStatus = "no photo";
    if (data.image) {
      photoStatus = saveIncidentPhoto(data.image, data.article, data.timestamp, data.user);
    }

    const row = [
      data.timestamp || formatDate(new Date()),
      data.user || "",
      data.article || "",
      data.year || "",
      data.location || "",
      Number(data.bottles) || 0,
      Number(data.boxes) || 0,
      Number(data.totalBottles) || 0,
      data.locationSource || "App Mobil v2",
      data.incidenciaText || (data.incidencia ? "SÍ" : "")
    ];
    logSheet.appendRow(row);

    return jsonResponse({ status: "success", photo: photoStatus });

  } catch (error) {
    return jsonResponse({ status: "error", message: error.toString() });
  }
}

function createLogGlobal(ss, name) {
  const sheetName = name || "LOG GLOBAL";
  const s = ss.insertSheet(sheetName);
  s.appendRow(["TIMESTAMP", "USUARI", "ARTICLE", "ANYADA", "UBICACIÓ", "AMPOLLES", "CAIXES", "TOTAL AMPOLLES", "FONT UBICACIÓ", "INCIDÈNCIA"]);
  s.getRange("1:1").setFontWeight("bold").setBackground("#f3f3f3");
  s.setFrozenRows(1);
  return s;
}

function saveIncidentPhoto(base64, article, time, user) {
  const folderId = "1IeXE8jeMDsIUIYC9PxxVZSLAe6bux8Yq";
  try {
    const folder = DriveApp.getFolderById(folderId);
    const splitData = base64.split(",");
    const contentType = splitData[0].split(":")[1].split(";")[0];
    const bytes = Utilities.base64Decode(splitData[1]);
    const safeTime = (time || "").replace(/[/]/g, "-").replace(/[:]/g, "-").replace(/\s/g, "_");
    const fileName = `${safeTime}_${user}_${article}.jpg`;
    const file = folder.createFile(Utilities.newBlob(bytes, contentType, fileName));
    return "saved: " + file.getName();
  } catch (e) { return "error: " + e.toString(); }
}

function addConfig(ss, col, value) {
  let sheet = ss.getSheetByName("CONFIG");
  if (!sheet) {
    sheet = ss.insertSheet("CONFIG");
    sheet.appendRow(["USUARIS", "ARTICLES"]);
  }
  sheet.getRange(sheet.getLastRow() + 1, col).setValue(value);
  return { status: "success" };
}

function getColumnValues(ss, sheetName, col) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, col, lastRow - 1, 1).getValues().map(r => r[0]).filter(v => v);
}

function formatDate(d) {
  const pad = n => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
