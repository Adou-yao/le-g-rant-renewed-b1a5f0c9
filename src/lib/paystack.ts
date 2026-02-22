declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        ref?: string;
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
  [key: string]: unknown;
}

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";

export function initierPaystackPayment({
  amount,
  email,
  metadata = {},
  callback,
  onClose,
}: {
  amount: number;
  email: string;
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
