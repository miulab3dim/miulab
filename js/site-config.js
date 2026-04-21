window.MIU_BOX_CONFIG = Object.assign(
  {
    emailjs: {
      // Conta > Public Key
      publicKey: "YEZgJhZBdZVut6wpy",
      // Email Services > seu service_id
      serviceId: "service_0zt0pwi",
      // Email Templates > seu template_id
      templateId: "template_teozn5x"
    },
    mercadoPago: {
      paymentLinks: {
        // Cole aqui o link de pagamento/checkout do Mercado Pago para o plano Lite.
        lite: "https://mpago.li/2cUYPw1"
      }
    }
  },
  window.MIU_BOX_CONFIG || {}
);
