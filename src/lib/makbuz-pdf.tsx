import path from "node:path";
import { Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import { CURRENCY_SYMBOLS, PAYMENT_METHODS } from "@/lib/constants";

Font.register({
  family: "Roboto",
  fonts: [
    { src: path.join(process.cwd(), "public/fonts/Roboto-Regular.ttf"), fontWeight: "normal" },
    { src: path.join(process.cwd(), "public/fonts/Roboto-Bold.ttf"), fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    padding: 40,
    color: "#1f2937",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    paddingBottom: 16,
    borderBottom: "2 solid #0f172a",
  },
  brand: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  brandSub: {
    fontSize: 9,
    color: "#0369a1",
    marginTop: 2,
    letterSpacing: 1,
  },
  docTitle: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "right",
  },
  docMeta: {
    fontSize: 9,
    color: "#6b7280",
    textAlign: "right",
    marginTop: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    borderBottom: "1 solid #e5e7eb",
  },
  label: {
    color: "#6b7280",
  },
  value: {
    fontWeight: "bold",
  },
  amountBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#f0f9ff",
    borderRadius: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 11,
    color: "#0369a1",
  },
  amountValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0c4a6e",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "center",
    borderTop: "1 solid #e5e7eb",
    paddingTop: 10,
  },
});

export type MakbuzData = {
  receiptNo: string;
  recordedAt: Date;
  customerName: string;
  description: string;
  method: string;
  amount: number;
  currency: string;
};

export function MakbuzDocument({ data }: { data: MakbuzData }) {
  const symbol = CURRENCY_SYMBOLS[data.currency as keyof typeof CURRENCY_SYMBOLS] ?? data.currency;
  const methodLabel = PAYMENT_METHODS[data.method as keyof typeof PAYMENT_METHODS] ?? data.method;

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Kite Gang Corner</Text>
            <Text style={styles.brandSub}>KİTESURF OKULU</Text>
          </View>
          <View>
            <Text style={styles.docTitle}>Ödeme Makbuzu</Text>
            <Text style={styles.docMeta}>Makbuz No: {data.receiptNo}</Text>
            <Text style={styles.docMeta}>
              {data.recordedAt.toLocaleDateString("tr-TR")} {data.recordedAt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Müşteri</Text>
          <Text style={styles.value}>{data.customerName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Açıklama</Text>
          <Text style={styles.value}>{data.description}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Ödeme Yöntemi</Text>
          <Text style={styles.value}>{methodLabel}</Text>
        </View>

        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Ödenen Tutar</Text>
          <Text style={styles.amountValue}>
            {symbol}{data.amount.toFixed(2)}
          </Text>
        </View>

        <Text style={styles.footer}>
          Bu belge Kite Gang Corner tarafından elektronik olarak düzenlenmiştir.
        </Text>
      </Page>
    </Document>
  );
}
