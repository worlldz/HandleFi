# HandleFi Temiz Kurulum Rehberi

Bu rehber sifirdan olusturulan yeni HandleFi kurulumu icindir. Onceki kontratlari, OAuth bilgilerini veya deployment'i kullanma.

## 1. Guvenlik temizligi

- Daha once paylasilan X Client Secret, access token ve refresh token degerlerini iptal et.
- HandleFi icin yeni OAuth 2.0 credentials olustur.
- Claim verifier icin yeni, sadece testnette kullanilan bos bir wallet olustur.
- Ana wallet private key'ini projeye ekleme.
- Kullanilmayan eski Circle API key'ini iptal et; HandleFi bu anahtari kullanmiyor.

## 2. Ortam dosyasi

`.env.example` dosyasini `.env.local` olarak kopyala. Degerleri yalnızca `.env.local` icine yaz.

```env
NEXT_PUBLIC_TIPS_CONTRACT=
NEXT_PUBLIC_HANDLEFI_X_HANDLE=handlefixx
VERIFIER_PRIVATE_KEY=
SESSION_SECRET=
X_CLIENT_ID=
X_CLIENT_SECRET=
X_CALLBACK_URL=http://localhost:3000/api/x/callback
```

## 3. Yeni HandleFiTips kontrati

1. `https://remix.ethereum.org/` adresini ac.
2. `contracts/HandleFiTips.sol` dosyasini Remix'e ekle.
3. Solidity `0.8.24` ile compile et.
4. `Injected Provider - MetaMask` ve Arc Testnet sec.
5. Constructor degerlerini sirayla gir:
   - `initialOwner`: kendi test wallet adresin
   - `initialVerifier`: yeni verifier wallet adresi
   - `usdc`: `0x3600000000000000000000000000000000000000`
   - `eurc`: `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a`
6. Deploy et ve yeni adresi `NEXT_PUBLIC_TIPS_CONTRACT` olarak kaydet.
7. Kontrati `https://testnet.arcscan.app/` uzerinde `HandleFiTips` adi ile dogrula.

Verifier adresi, `.env.local` icindeki `VERIFIER_PRIVATE_KEY` degerinden tureyen wallet adresiyle ayni olmalidir.

## 4. X OAuth 2.0

Yeni X app icin gerekli izinler:

- OAuth 2.0 enabled
- App type: Web App
- Scopes: `tweet.read`, `users.read`

Yerel callback:

```text
http://localhost:3000/api/x/callback
```

Canli site hazir olduktan sonra X app ve Vercel'de ayni callback kullanilmalidir:

```text
https://YENI-HANDLEFI-DOMAIN/api/x/callback
```

## 5. Vercel

Yeni GitHub deposunu Vercel'e yeni proje olarak import et. Onceki Vercel projesini yeniden adlandirarak kullanma.

Vercel Environment Variables bolumune sunlari ekle:

- `NEXT_PUBLIC_TIPS_CONTRACT`
- `NEXT_PUBLIC_HANDLEFI_X_HANDLE`
- `VERIFIER_PRIVATE_KEY`
- `SESSION_SECRET`
- `X_CLIENT_ID`
- `X_CLIENT_SECRET`
- `X_CALLBACK_URL`

## 6. Son test

1. Wallet bagla ve Arc Testnet kontrolunu dogrula.
2. USDC reward olustur.
3. X hesabini bagla.
4. Verify yap.
5. Claim ve Claim & Tweet akisini test et.
6. ArcScan'de `TipCreated` ve `TipClaimed` eventlerini kontrol et.
7. Eski deployment'i ancak yeni akisin tamamı calistiktan sonra kapat.
