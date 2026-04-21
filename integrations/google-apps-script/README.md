# Integracao por E-mail com EmailJS

Arquivos desta pasta:

- `miu-box-submissions.gs`: integracao legada por Google Apps Script.

Passo a passo:

1. Crie uma conta no [EmailJS](https://www.emailjs.com/docs/).
2. No painel do EmailJS, conecte um servico de e-mail e crie um template.
3. Copie sua `Public Key`, `service_id` e `template_id`.
4. Abra [js/site-config.js](/e:/GitHub/miulab/js/site-config.js:1) e preencha:
   - `emailjs.publicKey`
   - `emailjs.serviceId`
   - `emailjs.templateId`
   - `mercadoPago.paymentLinks.lite`
   - `mercadoPago.paymentLinks.pro`
   - `mercadoPago.paymentLinks.ultra`
5. Ajuste o template do EmailJS para usar as variaveis enviadas pelo site, como:
   - `email_subject`
   - `full_name`
   - `email`
   - `plan_name`
   - `plan_price`
   - `style_name`
   - `style_description`
   - `full_address`
   - `notes`
   - `message`
6. Teste o envio pelo formulario do site.

Observacoes:

- O site agora envia automaticamente pelo SDK oficial do EmailJS no navegador.
- O assunto do e-mail usa apenas o nome do plano e o design escolhido.
- Depois do cadastro enviado com sucesso, o site redireciona a pessoa para o link de pagamento do Mercado Pago configurado para o plano selecionado.
- A integracao por Google Apps Script permanece nesta pasta apenas como referencia legada.
- A busca de CEP no site usa ViaCEP: https://viacep.com.br/
