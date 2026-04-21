# Integracao Google Sheets + Email

Arquivos desta pasta:

- `miu-box-submissions.gs`: script para publicar como Web App no Google Apps Script.

Passo a passo:

1. Crie uma planilha no Google Sheets para receber os cadastros.
2. Abra `Extensoes > Apps Script`.
3. Cole o conteudo de `miu-box-submissions.gs`.
4. Em `MIU_BOX_SETTINGS`, preencha:
   - `SPREADSHEET_ID` com o ID da planilha, ou seja, o trecho entre `/d/` e `/edit` na URL da planilha.
   - `NOTIFICATION_EMAIL` com o e-mail que deve receber os avisos.
     O arquivo j&aacute; est&aacute; com `miulab3dim@gmail.com` como padr&atilde;o.
5. Clique em `Implantar > Nova implantacao > Aplicativo da Web`.
6. Defina:
   - Executar como: `Voce`.
   - Quem tem acesso: `Qualquer pessoa`.
7. Copie a URL final do Web App.
8. Abra [js/site-config.js](/e:/GitHub/miulab/js/site-config.js:1) e cole a URL em `formEndpoint`.
9. Sempre que alterar o Apps Script, publique uma nova vers&atilde;o da implanta&ccedil;&atilde;o antes de testar o site de novo.

Observacoes:

- O site envia os campos do formulario por `POST` para esse endpoint.
- O Apps Script salva cada cadastro em uma linha da planilha, envia um e-mail para a equipe e devolve um `postMessage` para o site confirmar sucesso ou erro.
- A busca de CEP no site usa ViaCEP: https://viacep.com.br/
