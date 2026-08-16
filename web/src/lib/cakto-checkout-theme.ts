/** Identidade visual da Jornada SAP EWM (Best One IT) para o checkout Cakto. */
export const BRAND = {
  gold: "#f6b40a",
  ink: "#0a0a0c",
  panel: "#161618",
  panelAlt: "#111113",
  muted: "#a8a8a8",
  white: "#ffffff",
  grayBox: "#1c1c20",
} as const;

export function jornadaCheckoutSettings() {
  const { gold, ink, panel, muted, white, grayBox } = BRAND;
  const text = { color: { primary: white, secondary: muted } };
  return {
    box: {
      default: {
        text,
        header: { text, background: { color: grayBox } },
        background: { color: panel },
      },
      selected: {
        text: { color: { primary: ink, secondary: ink } },
        header: {
          text: { color: { primary: ink, secondary: ink } },
          background: { color: gold },
        },
        background: { color: panel },
      },
      unselected: {
        text,
        header: { text, background: { color: grayBox } },
        background: { color: grayBox },
      },
    },
    font: { family: "Roboto" },
    form: { background: { color: panel } },
    icon: { color: gold },
    text: { color: { active: gold, primary: white, secondary: muted } },
    payButton: {
      text: { text: "CONFIRMAR PAGAMENTO", color: ink },
      color: gold,
    },
    background: {
      color: ink,
      cover: false,
      fixed: false,
      image: null,
      repeat: false,
    },
    paymentOptions: {
      button: {
        selected: {
          icon: { color: ink },
          text: { color: ink },
          background: { color: gold },
        },
        unselected: {
          icon: { color: muted },
          text: { color: muted },
          background: { color: grayBox },
        },
      },
    },
  };
}

function styleExtra(extra: Record<string, unknown> | undefined) {
  const next = { ...(extra || {}) } as Record<string, unknown>;
  const exitPopup = (next.exitPopup || {}) as Record<string, unknown>;
  const exitAttrs = {
    ...((exitPopup.attributes as Record<string, unknown>) || {}),
    enabled: false,
    textButtonColor: BRAND.ink,
    backgroundButtonColor: BRAND.gold,
  };
  next.exitPopup = { ...exitPopup, type: "exitPopup", attributes: exitAttrs };

  const chat = (next.chat || {}) as Record<string, unknown>;
  next.chat = {
    ...chat,
    type: "chat",
    attributes: {
      ...((chat.attributes as Record<string, unknown>) || {}),
      enabled: false,
      provider: "whatsapp",
      accountId: "5511974389297",
    },
  };
  return next;
}

function fallbackLayout() {
  return {
    rows: [
      {
        id: "369db380-d652-4b4f-bf0e-31710f1cfc03",
        type: "row",
        layout: [12],
        columns: [
          {
            id: "e0253c14-37ea-47f7-b77a-e260cb814a6f",
            type: "column",
            components: [
              {
                id: "cff7c565-5957-4330-be70-b804878827dd",
                type: "checkout",
                attributes: {},
              },
            ],
          },
        ],
      },
    ],
  };
}

function hasCheckoutBlock(device: Record<string, unknown> | undefined) {
  return JSON.stringify(device || {}).includes('"checkout"');
}

function styleDevice(device: Record<string, unknown> | undefined) {
  const src = (device && hasCheckoutBlock(device) ? device : fallbackLayout()) as Record<string, unknown>;
  return {
    ...src,
    extra: styleExtra(src.extra as Record<string, unknown> | undefined),
    settings: {
      ...((src.settings as object) || {}),
      ...jornadaCheckoutSettings(),
    },
  };
}

/** Mescla o tema da academia no config atual (mobile + desktop). */
export function applyJornadaCheckoutTheme(config: Record<string, unknown> | null | undefined) {
  const base = { ...(config || {}) };
  const mobile = styleDevice(base.mobile as Record<string, unknown> | undefined);
  const desktop = styleDevice(base.desktop as Record<string, unknown> | undefined);
  base.mobile = mobile;
  base.desktop = desktop;
  return base;
}
