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
    font: { family: "Inter" },
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
      enabled: true,
      provider: "whatsapp",
      accountId: "5511974389297",
    },
  };
  return next;
}

function styleDevice(device: Record<string, unknown> | undefined) {
  if (!device) return undefined;
  return {
    ...device,
    extra: styleExtra(device.extra as Record<string, unknown> | undefined),
    settings: {
      ...((device.settings as object) || {}),
      ...jornadaCheckoutSettings(),
    },
  };
}

/** Mescla o tema da academia no config atual (mobile + desktop). */
export function applyJornadaCheckoutTheme(config: Record<string, unknown> | null | undefined) {
  const base = { ...(config || {}) };
  const mobile = styleDevice((base.mobile as Record<string, unknown>) || undefined);
  const desktop = styleDevice((base.desktop as Record<string, unknown>) || undefined);
  if (mobile) base.mobile = mobile;
  if (desktop) base.desktop = desktop;
  if (!base.mobile && !base.desktop) {
    base.mobile = styleDevice({
      rows: [
        {
          id: "checkout-main",
          type: "row",
          layout: [12],
          columns: [
            {
              id: "checkout-col",
              type: "column",
              components: [{ id: "checkout-form", type: "checkout", attributes: {} }],
            },
          ],
        },
      ],
    });
  }
  return base;
}
