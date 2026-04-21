const MIU_BOX_SETTINGS = {
  // Opcional: mantenha o placeholder se nao for usar este campo.
  SPREADSHEET_ID: "COLE_O_ID_DA_SUA_PLANILHA_AQUI",
  SHEET_NAME: "Assinaturas Miu Box",
  NOTIFICATION_EMAIL: "miulab3dim@gmail.com",

  // Os campos abaixo foram mantidos apenas como referencia tecnica.
  // O fluxo principal atual envia o cadastro por e-mail e a equipe finaliza a box por contato direto.

  // URL publica do site para onde o cliente volta depois do checkout.
  // Exemplo: https://seuusuario.github.io/miulab/
  SITE_URL: "COLE_A_URL_PUBLICA_DO_SITE_AQUI",

  // Credencial privada do Mercado Pago. Mantenha apenas no Apps Script.
  MERCADO_PAGO_ACCESS_TOKEN: "TEST-7699327766122765-031809-8e7ec21c55ef8b9db072047d8a6c8a3e-261487913",

  // Configuracao do fechamento do pagamento.
  CHECKOUT_INSTALLMENTS: 12,
  FREIGHT_AMOUNT: 0,

  // Valores base usados no calculo:
  // valor mensal da box * 12, com frete incluso e fechamento parcelado em 12x.
  MERCADO_PAGO_PLANS: {
    lite: {
      title: "Miu Box Lite",
      monthly_box_price: 65.8
    }
  }
};

const MIU_BOX_HEADERS = [
  "Submission ID",
  "Recebido em",
  "Nome completo",
  "CPF",
  "Data de nascimento",
  "Email",
  "Plano",
  "Chave do plano",
  "Preco exibido no site",
  "Valor mensal da box",
  "Valor anual das boxes",
  "Frete incluso no plano",
  "Valor total do fechamento",
  "Valor da parcela em 12x",
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
  "Observacoes",
  "Mercado Pago preference ID",
  "Mercado Pago checkout URL",
  "Mercado Pago payment ID",
  "Status do pagamento",
  "Detalhe do pagamento",
  "Ultima atualizacao do pagamento"
];

const MIU_BOX_COLUMNS = {
  submissionId: 1,
  submittedAt: 2,
  fullName: 3,
  cpf: 4,
  birthDate: 5,
  email: 6,
  planName: 7,
  planKey: 8,
  planPriceLabel: 9,
  monthlyBoxPrice: 10,
  annualBoxesAmount: 11,
  freightAmount: 12,
  checkoutTotalAmount: 13,
  installmentAmount: 14,
  styleName: 15,
  styleDescription: 16,
  zipCode: 17,
  street: 18,
  number: 19,
  complement: 20,
  district: 21,
  city: 22,
  state: 23,
  fullAddress: 24,
  notes: 25,
  mercadoPagoPreferenceId: 26,
  mercadoPagoCheckoutUrl: 27,
  mercadoPagoPaymentId: 28,
  paymentStatus: 29,
  paymentStatusDetail: 30,
  paymentUpdatedAt: 31
};

function doGet(e) {
  if (e && e.parameter && e.parameter.health === "1") {
    return ContentService.createTextOutput("ok");
  }

  return ContentService.createTextOutput("Miu Box endpoint ativo.");
}

function doPost(e) {
  const webhookRequest = isMercadoPagoWebhook_(e);

  try {
    if (webhookRequest) {
      return handleMercadoPagoWebhook_(e);
    }

    return handleCheckoutFormPost_(e);
  } catch (error) {
    if (webhookRequest) {
      return ContentService.createTextOutput("error");
    }

    return buildTransportResponse_({
      source: "miu-box-form",
      ok: false,
      message: error && error.message ? error.message : "Nao foi possivel processar o cadastro agora."
    });
  }
}

function handleCheckoutFormPost_(e) {
  const data = normalizePayload_(e);
  const sheetContext = getSheetContext_();
  const sheet = sheetContext.sheet;
  let rowNumber = 0;

  if (sheet) {
    ensureHeaders_(sheet);
    rowNumber = appendSubmissionRow_(sheet, data);
  }

  const paymentStatus = "novo_assinante";
  const paymentDetail =
    "Cadastro enviado por e-mail. A equipe deve entrar em contato para entender os tipos de produtos desejados e dar continuidade ao pagamento no cartao em 12x.";

  if (sheet && rowNumber) {
    updateSubmissionPaymentFields_(sheet, rowNumber, {
      mercadoPagoPreferenceId: "",
      mercadoPagoCheckoutUrl: "",
      paymentStatus: paymentStatus,
      paymentStatusDetail: paymentDetail,
      paymentUpdatedAt: new Date().toISOString()
    });
  }

  sendNotificationEmail_(data);

  return buildTransportResponse_({
    source: "miu-box-form",
    ok: true,
    deliveredByEmail: true,
    message:
      "Cadastro enviado com sucesso! Nossa equipe vai entrar em contato para entender os produtos que voce gostaria de receber e seguir com o pagamento no cartao em 12x."
  });
}

function isMercadoPagoWebhook_(e) {
  const params = e && e.parameter ? e.parameter : {};
  const queryType = valueOrDefault_(params.type);
  const queryDataId = valueOrDefault_(params["data.id"]);
  const payload = parseRequestJson_(e);
  const payloadType = payload && typeof payload.type === "string" ? payload.type : "";
  const payloadDataId = payload && payload.data && payload.data.id ? String(payload.data.id) : "";

  return Boolean((queryType && queryDataId) || (payloadType && payloadDataId));
}

function handleMercadoPagoWebhook_(e) {
  const params = e && e.parameter ? e.parameter : {};
  const payload = parseRequestJson_(e);
  const type = valueOrDefault_(params.type, payload && payload.type ? String(payload.type) : "");
  const dataId = valueOrDefault_(
    params["data.id"],
    payload && payload.data && payload.data.id ? String(payload.data.id) : ""
  );

  if (!type || !dataId) {
    return ContentService.createTextOutput("ignored");
  }

  if (type !== "payment") {
    return ContentService.createTextOutput("ignored");
  }

  const payment = getMercadoPagoPayment_(dataId);
  const externalReference = payment && payment.external_reference ? String(payment.external_reference) : "";

  if (!externalReference) {
    return ContentService.createTextOutput("missing_reference");
  }

  const sheetContext = getSheetContext_();
  const sheet = sheetContext.sheet;

  if (!sheet) {
    return ContentService.createTextOutput("ok");
  }

  ensureHeaders_(sheet);
  const rowNumber = findRowBySubmissionId_(sheet, externalReference);

  if (!rowNumber) {
    return ContentService.createTextOutput("row_not_found");
  }

  updateSubmissionPaymentFields_(sheet, rowNumber, {
    mercadoPagoPaymentId: payment && payment.id ? String(payment.id) : "",
    paymentStatus: valueOrDefault_(payment.status, "payment_received"),
    paymentStatusDetail: valueOrDefault_(payment.status_detail, payload && payload.action ? payload.action : "payment.updated"),
    paymentUpdatedAt: valueOrDefault_(payment.date_last_updated, new Date().toISOString())
  });

  return ContentService.createTextOutput("ok");
}

function normalizePayload_(e) {
  const params = e && e.parameter ? e.parameter : {};
  const submittedAt = valueOrDefault_(params.submittedAt, new Date().toISOString());
  const planKey = valueOrDefault_(params.planSelect, "lite").toLowerCase();
  const pricing = getCheckoutPricingForPlan_(planKey);

  return {
    submissionId: valueOrDefault_(params.submissionId, Utilities.getUuid()),
    submittedAt: submittedAt,
    fullName: valueOrDefault_(params.fullName),
    cpf: valueOrDefault_(params.cpf),
    birthDate: valueOrDefault_(params.birthDate),
    email: valueOrDefault_(params.email),
    planKey: planKey,
    planName: valueOrDefault_(params.planName || params.planSelect),
    planPriceLabel: valueOrDefault_(params.planPrice),
    monthlyBoxPrice: pricing.monthlyBoxPrice,
    annualBoxesAmount: pricing.annualBoxesAmount,
    freightAmount: pricing.freightAmount,
    checkoutTotalAmount: pricing.checkoutTotalAmount,
    installmentAmount: pricing.installmentAmount,
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

function getCheckoutPricingForPlan_(planKey) {
  const planConfig = getMercadoPagoPlanConfig_(planKey);
  const installments = Number(MIU_BOX_SETTINGS.CHECKOUT_INSTALLMENTS || 12);
  const freightAmount = Number(MIU_BOX_SETTINGS.FREIGHT_AMOUNT || 0);
  const monthlyBoxPrice = Number(planConfig.monthly_box_price);
  const annualBoxesAmount = monthlyBoxPrice * installments;
  const checkoutTotalAmount = annualBoxesAmount + freightAmount;
  const installmentAmount = checkoutTotalAmount / installments;

  return {
    monthlyBoxPrice: monthlyBoxPrice,
    annualBoxesAmount: annualBoxesAmount,
    freightAmount: freightAmount,
    checkoutTotalAmount: checkoutTotalAmount,
    installmentAmount: installmentAmount
  };
}

function getMercadoPagoPlanConfig_(planKey) {
  const planConfig =
    MIU_BOX_SETTINGS.MERCADO_PAGO_PLANS &&
    MIU_BOX_SETTINGS.MERCADO_PAGO_PLANS[planKey];

  if (!planConfig) {
    throw new Error("Plano nao configurado para o Mercado Pago: " + planKey + ".");
  }

  return planConfig;
}

function isSpreadsheetConfigured_() {
  return Boolean(
    MIU_BOX_SETTINGS.SPREADSHEET_ID &&
      MIU_BOX_SETTINGS.SPREADSHEET_ID !== "COLE_O_ID_DA_SUA_PLANILHA_AQUI"
  );
}

function getSheetContext_() {
  if (!isSpreadsheetConfigured_()) {
    return {
      sheet: null,
      error: ""
    };
  }

  try {
    const spreadsheet = SpreadsheetApp.openById(MIU_BOX_SETTINGS.SPREADSHEET_ID);
    const existingSheet = spreadsheet.getSheetByName(MIU_BOX_SETTINGS.SHEET_NAME);

    return {
      sheet: existingSheet || spreadsheet.insertSheet(MIU_BOX_SETTINGS.SHEET_NAME),
      error: ""
    };
  } catch (error) {
    return {
      sheet: null,
      error:
        error && error.message
          ? error.message
          : "Nao foi possivel acessar o armazenamento configurado."
    };
  }
}

function ensureHeaders_(sheet) {
  const currentHeaders = sheet.getRange(1, 1, 1, MIU_BOX_HEADERS.length).getValues()[0];
  const hasHeaders = currentHeaders.some(Boolean);
  const matches = MIU_BOX_HEADERS.every(function(header, index) {
    return currentHeaders[index] === header;
  });

  if (!hasHeaders || !matches) {
    sheet.getRange(1, 1, 1, MIU_BOX_HEADERS.length).setValues([MIU_BOX_HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function appendSubmissionRow_(sheet, data) {
  const row = buildSubmissionRow_(data, {});
  sheet.appendRow(row);
  return sheet.getLastRow();
}

function buildSubmissionRow_(data, paymentInfo) {
  const normalizedPaymentInfo = paymentInfo || {};

  return [
    data.submissionId,
    data.submittedAt,
    data.fullName,
    data.cpf,
    data.birthDate,
    data.email,
    data.planName,
    data.planKey,
    data.planPriceLabel,
    stringifyMoneyValue_(data.monthlyBoxPrice),
    stringifyMoneyValue_(data.annualBoxesAmount),
    stringifyMoneyValue_(data.freightAmount),
    stringifyMoneyValue_(data.checkoutTotalAmount),
    stringifyMoneyValue_(data.installmentAmount),
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
    data.notes,
    valueOrDefault_(normalizedPaymentInfo.mercadoPagoPreferenceId),
    valueOrDefault_(normalizedPaymentInfo.mercadoPagoCheckoutUrl),
    valueOrDefault_(normalizedPaymentInfo.mercadoPagoPaymentId),
    valueOrDefault_(normalizedPaymentInfo.paymentStatus, "cadastro_recebido"),
    valueOrDefault_(normalizedPaymentInfo.paymentStatusDetail, "Cadastro encaminhado por e-mail."),
    valueOrDefault_(normalizedPaymentInfo.paymentUpdatedAt)
  ];
}

function updateSubmissionPaymentFields_(sheet, rowNumber, paymentInfo) {
  const updates = paymentInfo || {};
  const range = sheet.getRange(rowNumber, 1, 1, MIU_BOX_HEADERS.length);
  const rowValues = range.getValues()[0];

  if (updates.mercadoPagoPreferenceId !== undefined) {
    rowValues[MIU_BOX_COLUMNS.mercadoPagoPreferenceId - 1] = valueOrDefault_(updates.mercadoPagoPreferenceId);
  }

  if (updates.mercadoPagoCheckoutUrl !== undefined) {
    rowValues[MIU_BOX_COLUMNS.mercadoPagoCheckoutUrl - 1] = valueOrDefault_(updates.mercadoPagoCheckoutUrl);
  }

  if (updates.mercadoPagoPaymentId !== undefined) {
    rowValues[MIU_BOX_COLUMNS.mercadoPagoPaymentId - 1] = valueOrDefault_(updates.mercadoPagoPaymentId);
  }

  if (updates.paymentStatus !== undefined) {
    rowValues[MIU_BOX_COLUMNS.paymentStatus - 1] = valueOrDefault_(updates.paymentStatus);
  }

  if (updates.paymentStatusDetail !== undefined) {
    rowValues[MIU_BOX_COLUMNS.paymentStatusDetail - 1] = valueOrDefault_(updates.paymentStatusDetail);
  }

  if (updates.paymentUpdatedAt !== undefined) {
    rowValues[MIU_BOX_COLUMNS.paymentUpdatedAt - 1] = valueOrDefault_(updates.paymentUpdatedAt);
  }

  range.setValues([rowValues]);
}

function findRowBySubmissionId_(sheet, submissionId) {
  if (!submissionId) {
    return 0;
  }

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return 0;
  }

  const values = sheet
    .getRange(2, MIU_BOX_COLUMNS.submissionId, lastRow - 1, 1)
    .getValues();

  for (var index = 0; index < values.length; index += 1) {
    if (String(values[index][0]) === String(submissionId)) {
      return index + 2;
    }
  }

  return 0;
}

function createMercadoPagoPreference_(data) {
  assertMercadoPagoConfigured_();

  const response = mercadoPagoRequest_("https://api.mercadopago.com/checkout/preferences", {
    method: "post",
    payload: {
      items: [
        {
          id: data.planKey,
          title: data.planName + " - fechamento anual",
          description:
            "Fechamento anual da " +
            data.planName +
            " com envio mensal da Miu Box e parcelamento em " +
            String(MIU_BOX_SETTINGS.CHECKOUT_INSTALLMENTS || 12) +
            "x.",
          quantity: 1,
          currency_id: "BRL",
          unit_price: Number(data.checkoutTotalAmount)
        }
      ],
      payer: buildMercadoPagoPayer_(data),
      payment_methods: {
        installments: Number(MIU_BOX_SETTINGS.CHECKOUT_INSTALLMENTS || 12),
        default_installments: Number(MIU_BOX_SETTINGS.CHECKOUT_INSTALLMENTS || 12)
      },
      back_urls: buildMercadoPagoBackUrls_(),
      notification_url: getWebAppUrl_(),
      auto_return: "approved",
      external_reference: data.submissionId
    }
  });

  if (!response.init_point) {
    throw new Error("O Mercado Pago nao retornou a URL de checkout.");
  }

  return {
    preferenceId: response.id ? String(response.id) : "",
    checkoutUrl: String(response.init_point)
  };
}

function buildMercadoPagoPayer_(data) {
  const payer = {
    email: data.email
  };
  const identity = buildMercadoPagoIdentification_(data.cpf);

  if (identity) {
    payer.identification = identity;
  }

  return payer;
}

function buildMercadoPagoIdentification_(cpf) {
  const digits = onlyDigits_(cpf);

  if (digits.length !== 11) {
    return null;
  }

  return {
    type: "CPF",
    number: digits
  };
}

function getMercadoPagoPayment_(paymentId) {
  assertMercadoPagoConfigured_();
  return mercadoPagoRequest_(
    "https://api.mercadopago.com/v1/payments/" + encodeURIComponent(paymentId),
    {
      method: "get"
    }
  );
}

function mercadoPagoRequest_(url, options) {
  assertMercadoPagoConfigured_();

  const requestOptions = options || {};
  const method = (requestOptions.method || "get").toLowerCase();
  const payload = requestOptions.payload;
  const fetchOptions = {
    method: method,
    muteHttpExceptions: true,
    contentType: "application/json",
    headers: {
      Authorization: "Bearer " + MIU_BOX_SETTINGS.MERCADO_PAGO_ACCESS_TOKEN
    }
  };

  if (payload !== undefined) {
    fetchOptions.payload = JSON.stringify(payload);
  }

  const response = UrlFetchApp.fetch(url, fetchOptions);
  const statusCode = response.getResponseCode();
  const text = response.getContentText();
  const json = text ? JSON.parse(text) : {};

  if (statusCode >= 400) {
    throw new Error(extractMercadoPagoErrorMessage_(json, statusCode));
  }

  return json;
}

function extractMercadoPagoErrorMessage_(responseJson, statusCode) {
  if (!responseJson) {
    return "Falha ao comunicar com o Mercado Pago. Codigo HTTP " + statusCode + ".";
  }

  if (typeof responseJson.message === "string" && responseJson.message) {
    return "Mercado Pago: " + responseJson.message;
  }

  if (
    Array.isArray(responseJson.cause) &&
    responseJson.cause.length &&
    typeof responseJson.cause[0].description === "string"
  ) {
    return "Mercado Pago: " + responseJson.cause[0].description;
  }

  return "Falha ao comunicar com o Mercado Pago. Codigo HTTP " + statusCode + ".";
}

function assertMercadoPagoConfigured_() {
  if (
    !MIU_BOX_SETTINGS.MERCADO_PAGO_ACCESS_TOKEN ||
    MIU_BOX_SETTINGS.MERCADO_PAGO_ACCESS_TOKEN === "COLE_O_ACCESS_TOKEN_DO_MERCADO_PAGO_AQUI"
  ) {
    throw new Error("Defina MERCADO_PAGO_ACCESS_TOKEN em MIU_BOX_SETTINGS.");
  }

  if (!MIU_BOX_SETTINGS.SITE_URL || MIU_BOX_SETTINGS.SITE_URL === "COLE_A_URL_PUBLICA_DO_SITE_AQUI") {
    throw new Error("Defina SITE_URL em MIU_BOX_SETTINGS.");
  }

  if (!getWebAppUrl_()) {
    throw new Error("Publique o Apps Script como Web App antes de criar pagamentos no Mercado Pago.");
  }
}

function getWebAppUrl_() {
  try {
    return valueOrDefault_(ScriptApp.getService().getUrl());
  } catch (error) {
    return "";
  }
}

function buildMercadoPagoBackUrls_() {
  return {
    success: buildSiteReturnUrl_("success"),
    pending: buildSiteReturnUrl_("pending"),
    failure: buildSiteReturnUrl_("failure")
  };
}

function buildSiteReturnUrl_(status) {
  const baseUrl = String(MIU_BOX_SETTINGS.SITE_URL || "").trim();

  if (!baseUrl) {
    throw new Error("Defina SITE_URL em MIU_BOX_SETTINGS.");
  }

  return appendHashFragment_(
    appendQueryParam_(appendQueryParam_(baseUrl, "checkout", "mercado-pago"), "payment_return", status),
    "cadastro"
  );
}

function appendQueryParam_(url, key, value) {
  const hashIndex = url.indexOf("#");
  const hash = hashIndex === -1 ? "" : url.slice(hashIndex);
  const baseUrl = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const separator = baseUrl.indexOf("?") === -1 ? "?" : "&";

  return baseUrl + separator + encodeURIComponent(key) + "=" + encodeURIComponent(value) + hash;
}

function appendHashFragment_(url, fragment) {
  if (!fragment || url.indexOf("#") !== -1) {
    return url;
  }

  return url + "#" + fragment;
}

function sendNotificationEmail_(data) {
  const recipient = MIU_BOX_SETTINGS.NOTIFICATION_EMAIL;

  if (!recipient) {
    return;
  }

  const subject =
    "NOVO ASSINANTE - " +
    data.fullName +
    (data.planName ? " - " + data.planName : "");
  const body = [
    "NOVO ASSINANTE recebido no site da Miu Box.",
    "",
    "Proximo passo: entrar em contato com a pessoa para entender os tipos de produtos desejados e seguir com o pagamento no cartao em 12x.",
    "",
    "Submission ID: " + data.submissionId,
    "Nome completo: " + data.fullName,
    "CPF: " + data.cpf,
    "Data de nascimento: " + data.birthDate,
    "Email: " + data.email,
    "Plano: " + data.planName,
    "Preco exibido no site: " + data.planPriceLabel,
    "Valor mensal da box: R$ " + stringifyMoneyValue_(data.monthlyBoxPrice),
    "Valor anual das boxes: R$ " + stringifyMoneyValue_(data.annualBoxesAmount),
    "Frete: incluso",
    "Valor total do fechamento com frete incluso: R$ " + stringifyMoneyValue_(data.checkoutTotalAmount),
    "Valor da parcela em 12x: R$ " + stringifyMoneyValue_(data.installmentAmount),
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
  ]
    .filter(Boolean)
    .join("\n");

  const options = {
    name: "Miu Box",
    replyTo: data.email || recipient
  };

  MailApp.sendEmail(recipient, subject, body, options);
}

function parseRequestJson_(e) {
  try {
    const contents =
      e &&
      e.postData &&
      typeof e.postData.contents === "string"
        ? e.postData.contents
        : "";

    if (!contents) {
      return null;
    }

    return JSON.parse(contents);
  } catch (error) {
    return null;
  }
}

function stringifyMoneyValue_(value) {
  var numberValue = Number(value);

  if (!isFinite(numberValue)) {
    return "";
  }

  return numberValue.toFixed(2).replace(".", ",");
}

function onlyDigits_(value) {
  return String(value || "").replace(/\D/g, "");
}

function valueOrDefault_(value, fallback) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" && isFinite(value)) {
    return String(value);
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
