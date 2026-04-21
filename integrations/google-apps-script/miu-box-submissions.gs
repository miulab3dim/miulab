const MIU_BOX_SETTINGS = {
  // Use apenas o ID da planilha, sem a URL completa.
  // Exemplo: 1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890abcdEF
  SPREADSHEET_ID: "COLE_O_ID_DA_SUA_PLANILHA_AQUI",
  SHEET_NAME: "Assinaturas Miu Box",
  NOTIFICATION_EMAIL: "miulab3dim@gmail.com"
};

const MIU_BOX_HEADERS = [
  "Recebido em",
  "Nome completo",
  "CPF",
  "Data de nascimento",
  "Email",
  "Plano",
  "Preco do plano",
  "Estilo",
  "Descricao do estilo",
  "CEP",
  "Rua",
  "Numero",
  "Complemento",
  "Bairro",
  "Cidade",
  "Estado",
  "Endereco completo",
  "Observacoes"
];

function doGet() {
  return ContentService.createTextOutput("Miu Box endpoint ativo.");
}

function doPost(e) {
  try {
    const data = normalizePayload_(e);
    const sheet = getSheet_();
    ensureHeaders_(sheet);

    sheet.appendRow([
      data.submittedAt,
      data.fullName,
      data.cpf,
      data.birthDate,
      data.email,
      data.planName,
      data.planPrice,
      data.styleName,
      data.styleDescription,
      data.zipCode,
      data.street,
      data.number,
      data.complement,
      data.district,
      data.city,
      data.state,
      data.fullAddress,
      data.notes
    ]);

    sendNotificationEmail_(data);

    return buildTransportResponse_({
      source: "miu-box-form",
      ok: true,
      message: "Cadastro recebido com sucesso."
    });
  } catch (error) {
    return buildTransportResponse_({
      source: "miu-box-form",
      ok: false,
      message: error && error.message ? error.message : "Nao foi possivel salvar o cadastro."
    });
  }
}

function normalizePayload_(e) {
  const params = e && e.parameter ? e.parameter : {};

  return {
    submittedAt: valueOrDefault_(params.submittedAt, new Date().toISOString()),
    fullName: valueOrDefault_(params.fullName),
    cpf: valueOrDefault_(params.cpf),
    birthDate: valueOrDefault_(params.birthDate),
    email: valueOrDefault_(params.email),
    planName: valueOrDefault_(params.planName || params.planSelect),
    planPrice: valueOrDefault_(params.planPrice),
    styleName: valueOrDefault_(params.styleName || params.styleSelect),
    styleDescription: valueOrDefault_(params.styleDescription),
    zipCode: valueOrDefault_(params.zipCode),
    street: valueOrDefault_(params.street),
    number: valueOrDefault_(params.number),
    complement: valueOrDefault_(params.complement),
    district: valueOrDefault_(params.district),
    city: valueOrDefault_(params.city),
    state: valueOrDefault_(params.state),
    fullAddress: valueOrDefault_(params.fullAddress),
    notes: valueOrDefault_(params.notes)
  };
}

function getSheet_() {
  if (!MIU_BOX_SETTINGS.SPREADSHEET_ID || MIU_BOX_SETTINGS.SPREADSHEET_ID === "COLE_O_ID_DA_SUA_PLANILHA_AQUI") {
    throw new Error("Defina o ID da planilha em MIU_BOX_SETTINGS.SPREADSHEET_ID.");
  }

  const spreadsheet = SpreadsheetApp.openById(MIU_BOX_SETTINGS.SPREADSHEET_ID);
  const existingSheet = spreadsheet.getSheetByName(MIU_BOX_SETTINGS.SHEET_NAME);

  if (existingSheet) {
    return existingSheet;
  }

  return spreadsheet.insertSheet(MIU_BOX_SETTINGS.SHEET_NAME);
}

function ensureHeaders_(sheet) {
  const firstRow = sheet.getRange(1, 1, 1, MIU_BOX_HEADERS.length).getValues()[0];
  const hasHeaders = firstRow.some(Boolean);

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, MIU_BOX_HEADERS.length).setValues([MIU_BOX_HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function sendNotificationEmail_(data) {
  const recipient = MIU_BOX_SETTINGS.NOTIFICATION_EMAIL;

  if (!recipient) {
    return;
  }

  const subject = "Nova solicitacao de assinatura Miu Box - " + data.fullName;
  const body = [
    "Nova solicitacao de assinatura recebida no site da Miu Box.",
    "",
    "Nome completo: " + data.fullName,
    "CPF: " + data.cpf,
    "Data de nascimento: " + data.birthDate,
    "Email: " + data.email,
    "Plano: " + data.planName,
    "Preco do plano: " + data.planPrice,
    "Estilo: " + data.styleName,
    "Descricao do estilo: " + data.styleDescription,
    "CEP: " + data.zipCode,
    "Rua: " + data.street,
    "Numero: " + data.number,
    "Complemento: " + data.complement,
    "Bairro: " + data.district,
    "Cidade: " + data.city,
    "Estado: " + data.state,
    "Endereco completo: " + data.fullAddress,
    "Observacoes: " + data.notes
  ].join("\n");

  const options = {
    name: "Miu Box",
    replyTo: data.email || recipient
  };

  MailApp.sendEmail(recipient, subject, body, options);
}

function valueOrDefault_(value, fallback) {
  if (typeof value === "string") {
    return value.trim();
  }

  return fallback || "";
}

function buildTransportResponse_(payload) {
  const serializedPayload = JSON.stringify(payload).replace(/</g, "\\u003c");
  const html = [
    "<!DOCTYPE html>",
    "<html>",
    "<head><meta charset=\"UTF-8\"></head>",
    "<body>",
    "<script>",
    "window.top.postMessage(" + serializedPayload + ", \"*\");",
    "</script>",
    "</body>",
    "</html>"
  ].join("");

  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
