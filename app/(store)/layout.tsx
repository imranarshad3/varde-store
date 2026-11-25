import { StoreProvider } from "@/lib/store";
import { getProducts, getSettings } from "@/lib/queries";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BagDrawer from "@/components/BagDrawer";
import Toast from "@/components/Toast";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [catalog, settings] = await Promise.all([getProducts(), getSettings()]);
  return (
    <StoreProvider catalog={catalog} settings={settings}>
      <Header />
      {children}
      <Footer />
      <BagDrawer />
      <Toast />
    </StoreProvider>
  );
}
