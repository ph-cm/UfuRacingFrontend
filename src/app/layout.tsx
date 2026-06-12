import type { Metadata, Viewport } from "next";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";
import { ProjectProvider } from "@/context/ProjectContext";
import { MemberAuthProvider } from "@/context/MemberAuthContext";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#041E3F",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ufuracing.com.br"),
  title: {
    default: "UFU Racing | Equipe Formula SAE",
    template: "%s | UFU Racing",
  },
  description:
    "Equipe Formula SAE da Universidade Federal de Uberlândia. Projetando e construindo protótipos de competição desde 2015.",
  keywords: [
    "UFU Racing",
    "Formula SAE",
    "Universidade Federal de Uberlândia",
    "equipe de engenharia",
    "carro de fórmula universitário",
    "FSAE Brasil",
  ],
  authors: [{ name: "UFU Racing Team" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "UFU Racing",
    title: "UFU Racing | Equipe Formula SAE",
    description:
      "Equipe de engenharia competitiva da UFU. Projetando e construindo protótipos Formula SAE desde 2015.",
  },
  twitter: {
    card: "summary_large_image",
    title: "UFU Racing | Equipe Formula SAE",
    description:
      "Equipe de engenharia competitiva da UFU. Projetando e construindo protótipos Formula SAE desde 2015.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${poppins.variable}`}>
      <body className="antialiased">
        <MemberAuthProvider>
          <ProjectProvider>{children}</ProjectProvider>
        </MemberAuthProvider>
      </body>
    </html>
  );
}
