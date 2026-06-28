# App iOS — como instalar + caminho do nativo

## ✅ O que está pronto: PWA (roda no iPhone hoje)

O lab virou um **app instalável** (PWA). No iPhone:

1. Abra o endereço do app no **Safari** (tem que ser Safari — o iOS só instala PWA por ele).
2. Toque em **Compartilhar** (o quadrado com a seta pra cima).
3. **Adicionar à Tela de Início** → **Adicionar**.
4. Pronto: vira um app com **ícone próprio**, abre em **tela cheia** (sem a barra do Safari) e **funciona offline** depois da 1ª visita.

### Requisitos de acesso
- O iPhone precisa **alcançar o servidor**. O container Docker já escuta `0.0.0.0:5173`, então em **rede local** dá pra acessar pelo **IP da máquina** (`http://<IP-do-PC>:5173`) — confirme que o firewall do Windows libera a porta 5173.
- ⚠️ O **service worker** (offline + instalação completa) só ativa em **HTTPS** ou **localhost**. Em `http://<IP>` na LAN o app abre e é instalável, mas o offline pode não registrar. Pra experiência completa fora de casa, faça um **deploy com HTTPS** (qualquer host estático + o BFF atrás de TLS).

### O que o PWA entrega (verificado)
- Manifest (`/manifest.webmanifest`) + meta tags iOS (`apple-mobile-web-app-capable`, status bar translúcida, `apple-touch-icon`) + `viewport-fit=cover`.
- **Service worker** (`/sw.js`): app shell + assets cacheados (offline real); `/api` é network-first (dado fresco, cai pro cache quando offline).
- Ícones do app (192/512 + apple-touch-icon 180) com o gradiente da marca.
- Layout mobile: top-bar com **hambúrguer → drawer** (menu lateral deslizante) + overlay; **safe-area** do notch e do home-indicator.

---

## 🍎 Caminho do app NATIVO (App Store / TestFlight) — precisa de você

Isto **não dá pra fazer nesta máquina Windows de forma autônoma**. A Apple exige:

1. **Mac com Xcode** — a Apple só compila iOS no macOS (ou um build na nuvem tipo EAS/CI macOS).
2. **Conta Apple Developer** (US$ 99/ano) — pra assinar e publicar.

Quando tiver os dois, o caminho mais rápido (**reusa este mesmo web app**, sem reescrever nada) é o **Capacitor**, que embrulha o app num WKWebView nativo:

```bash
cd frontend
npm i @capacitor/core @capacitor/cli @capacitor/ios
npx cap init "SD Lab" com.fmodesto.sdlab --web-dir=dist
npm run build
npx cap add ios        # roda NUM MAC (precisa de CocoaPods)
npx cap copy ios
npx cap open ios       # abre no Xcode → Run no device / Archive → App Store Connect
```

> ⚠️ Não adicionei o Capacitor ao `package.json` de propósito: instalar dep nova dessincroniza o `package-lock` e **quebra o `npm ci` do build Docker** (gotcha já documentado). Rode os comandos acima só quando for de fato fazer o nativo, num Mac.

Alternativa (app mais "nativo", porém **reescreve toda a UI** em componentes nativos): **Expo / React Native** + `eas build --platform ios` (build na nuvem — mas ainda pede login da sua conta Apple).

---

**Resumo honesto:** o app **utilizável no iPhone está entregue** (PWA instalável, offline, com cara de app). O **nativo da App Store** está a um **Mac + conta Apple Developer** de distância — o único bloqueio, e é um que só você pode destravar.
