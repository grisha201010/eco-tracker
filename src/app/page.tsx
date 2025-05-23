import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart2, Wind, Thermometer, Droplets, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero секция */}
        <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted py-20">
          <div className="container flex flex-col items-center gap-8 text-center ml-8">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Мониторинг качества воздуха<br />
              <span className="text-primary">в реальном времени</span>
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Отслеживайте качество воздуха в вашем регионе, получайте уведомления о превышении норм и формируйте отчеты для анализа.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Начать мониторинг
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/about">Узнать больше</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Секция с параметрами */}
        <section className="py-16">
          <div className="container ml-8">
            <h2 className="mb-8 text-center text-3xl font-bold">Отслеживаемые параметры</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center rounded-lg border bg-card p-6 text-card-foreground shadow">
                <BarChart2 className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">Уровень CO2</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Мониторинг концентрации углекислого газа в воздухе
                </p>
              </div>
              <div className="flex flex-col items-center rounded-lg border bg-card p-6 text-card-foreground shadow">
                <Wind className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">Частицы PM2.5 и PM10</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Отслеживание мелких частиц в воздухе
                </p>
              </div>
              <div className="flex flex-col items-center rounded-lg border bg-card p-6 text-card-foreground shadow">
                <Thermometer className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">Температура</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Измерение температуры окружающей среды
                </p>
              </div>
              <div className="flex flex-col items-center rounded-lg border bg-card p-6 text-card-foreground shadow">
                <Droplets className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">Влажность</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Контроль уровня влажности воздуха
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Секция с преимуществами */}
        <section className="bg-muted py-16">
          <div className="container ml-8">
            <h2 className="mb-8 text-center text-3xl font-bold">Преимущества нашего сервиса</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-card p-6 shadow">
                <h3 className="mb-4 text-xl font-semibold">Мониторинг в реальном времени</h3>
                <p className="text-muted-foreground">
                  Получайте актуальные данные о качестве воздуха в вашем регионе с минимальной задержкой.
                </p>
              </div>
              <div className="rounded-lg bg-card p-6 shadow">
                <h3 className="mb-4 text-xl font-semibold">Уведомления о превышении норм</h3>
                <p className="text-muted-foreground">
                  Настройте пороговые значения и получайте уведомления при их превышении.
                </p>
              </div>
              <div className="rounded-lg bg-card p-6 shadow">
                <h3 className="mb-4 text-xl font-semibold">Аналитические отчеты</h3>
                <p className="text-muted-foreground">
                  Формируйте детальные отчеты для анализа качества воздуха за выбранный период.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA секция */}
        <section className="py-16">
          <div className="container ml-8">
            <div className="rounded-lg bg-primary p-8 text-primary-foreground">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold">Начните мониторинг сегодня</h2>
                <p className="mb-6">
                  Присоединяйтесь к тысячам пользователей, которые уже отслеживают качество воздуха с помощью нашего сервиса.
                </p>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/dashboard">Перейти к дашборду</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
