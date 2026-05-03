# Daily Diet em React Native

Aplicativo React Native em JavaScript inspirado: listagem de refeicoes, cadastro, edicao, exclusao, resumo estatistico e telas de feedback.

## Como rodar

```bash
npm install
npm start
```

Se o app não abrir no celular, tente:

```bash
npx expo start --tunnel
```


Depois, abra no Expo Go pelo QR Code ou use:

```bash
npm run android
npm run ios
```

## Estrutura

- `App.js`: codigo completo do app, componentes, estilos e dados iniciais.
- `package.json`: dependencias e scripts do Expo.
- `app.json` e `babel.config.js`: configuracao basica do Expo.

O app usa estado local em memoria. Ao reiniciar o aplicativo, os dados voltam para os exemplos iniciais.
