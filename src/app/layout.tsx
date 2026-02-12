import type { Metadata } from "next";
// Importando as fontes do Google Fonts via Next.js
import { Montserrat, Poppins } from "next/font/google"; 
import "./globals.css";
// Importando o Provider que criamos
import { ProjectProvider } from "@/context/ProjectContext"; 

// Configuração da fonte Montserrat (Principal do Manual)
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"], // Pesos: Regular, Medium, Bold, Black
  style: ["normal", "italic"],
});

// Configuração da fonte Poppins (Secundária/Fallback)
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "UFU Racing | Formula SAE Team",
  description: "Site oficial da equipe UFU Racing - Velocidade e Engenharia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`${montserrat.variable} ${poppins.variable} antialiased`}
      >
        {/* O ProjectProvider precisa ficar AQUI, envolvendo todo o site */}
        <ProjectProvider>
          {children}
        </ProjectProvider>
      </body>
    </html>
  );
}