declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        ref?: string;
        plan?: string;
        metadata?: Record<string, unknown>;
        callback?: (response: PaystackResponse) => void;
        onClose?: () => void;
      }) => { openIframe: () => void };
    };
  }
}

export interface PaystackResponse {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  message: string;
}

export interface PaystackMetadata {
  boutique?: string;
  produit?: string;
  vendeur_id?: string;
  vente_id?: string;
  plan?: string;
  [key: string]: unknown;
}

const PAYSTACK_PUBLIC_KEY = "pk_live_b852b02dfe1f593f4907436fbd6c3896dcd663b8";

export function initierPaystackPayment({
  amount,
  email,
  planCode,
  metadata = {},
  callback,
  onClose,
}: {
  amount: number;
  email: string;
  planCode?: string;
  metadata?: PaystackMetadata;
  callback: (response: PaystackResponse) => void;
  onClose?: () => void;
}) {
  if (!window.PaystackPop) {
    console.error("SDK Paystack non chargé. Vérifiez le script dans index.html.");
    return;
  }

  const reference = `lgr_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

  const handler = window.PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount: amount * 100,
    currency: "XOF",
    ref: reference,
    ...(planCode ? { plan: planCode } : {}),
    metadata: {
      ...metadata,
      custom_fields: [
        { display_name: "Application", variable_name: "app", value: "Le Gérant" },
      ],
    },
    callback: (response: PaystackResponse) => {
      console.log(`✅ Paiement réussi ! Référence : ${response.reference}`);
      callback(response);
    },
    onClose: onClose || (() => {
      console.log("❌ Paiement annulé par le client.");
    }),
  });

  handler.openIframe();
}
