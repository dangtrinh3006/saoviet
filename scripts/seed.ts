/**
 * Demo data: one admin + two users, plus reviews, comments, threads and orders.
 * Idempotent per email. Passwords are generated per run and printed once.
 */
import { randomBytes, randomUUID } from "node:crypto";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { posts } from "../src/content/posts";
import { tours } from "../src/content/tours";
import * as schema from "../src/db/schema";

config({ path: ".env.local" });

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const client = postgres(url, { max: 1, prepare: false });
const db = drizzle(client, { schema });

// Same config as src/lib/auth.ts minus the Next-only cookie plugin.
const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  plugins: [admin()],
});

const password = () => randomBytes(9).toString("base64url");

async function ensureUser(email: string, name: string) {
  const [existing] = await db.select().from(schema.user).where(eq(schema.user.email, email));
  if (existing) return { user: existing, password: null as string | null };
  const pw = password();
  await auth.api.signUpEmail({ body: { email, password: pw, name } });
  const [created] = await db.select().from(schema.user).where(eq(schema.user.email, email));
  return { user: created, password: pw };
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@saoviet.local";
  const people = [
    await ensureUser(adminEmail, "Quản trị Sao Việt"),
    await ensureUser("lan@saoviet.local", "Ngọc Lan"),
    await ensureUser("minh@saoviet.local", "Đức Minh"),
  ];
  await db.update(schema.user).set({ role: "admin" }).where(eq(schema.user.email, adminEmail));
  const [, lan, minh] = people.map((p) => p.user);

  const already = await db.select({ id: schema.thread.id }).from(schema.thread).limit(1);
  if (already.length === 0) {
    const [t1, t2, t3] = tours;
    await db.insert(schema.review).values([
      { id: randomUUID(), tourSlug: t1.slug, userId: lan.id, rating: 5, body: "Biển mây lúc 5 giờ sáng và Ngân Hà lúc 2 giờ sáng — một chuyến đáng giá từng bước leo." },
      { id: randomUUID(), tourSlug: t1.slug, userId: minh.id, rating: 4, body: "Hướng dẫn viên rất hiểu bầu trời. Đêm thứ hai có mây nhưng đội đã đổi kế hoạch hợp lý." },
      { id: randomUUID(), tourSlug: t2.slug, userId: lan.id, rating: 5, body: "Clear skies, warm tea and a guide who knew every constellation by its Vietnamese name." },
      { id: randomUUID(), tourSlug: t3.slug, userId: minh.id, rating: 4, body: "Trời rất tối, nhưng gió mạnh. Nên mang thêm áo khoác dày." },
    ]);

    const threads = [
      { slug: "ong-kinh-nao-cho-nguoi-moi-chup-ngan-ha-demo1", title: "Ống kính nào cho người mới chụp Ngân Hà?", body: "Mình có Sony A7 III, đang phân vân giữa 14mm f/1.8 và 20mm f/1.8. Mọi người dùng gì ở Tà Xùa?", category: "gear", userId: lan.id, pinned: false },
      { slug: "lich-trang-thang-12-di-dau-demo2", title: "Lịch trăng tháng 12 — đi đâu cuối tuần trăng non?", body: "Trăng non rơi vào giữa tháng. Có ai đi Ninh Thuận hay Hà Giang dịp đó không, ghép nhóm nhé.", category: "trips", userId: minh.id, pinned: true },
      { slug: "first-milky-way-shot-from-moc-chau-demo3", title: "First Milky Way shot from Mộc Châu", body: "15 × 20 s at ISO 3200, stacked in Sequator. Light dome from the town is visible to the north-east.", category: "photos", userId: lan.id, pinned: false },
    ];
    await db.insert(schema.thread).values(threads.map((th) => ({ id: randomUUID(), ...th })));
    await db.insert(schema.comment).values([
      { id: randomUUID(), targetType: "thread", targetId: threads[0].slug, userId: minh.id, body: "14mm cho khung rộng có biển mây, 20mm nếu muốn lõi Ngân Hà to hơn. Mình nghiêng về 20mm." },
      { id: randomUUID(), targetType: "thread", targetId: threads[1].slug, userId: lan.id, body: "Mình đi Ninh Thuận, mùa khô nên cơ hội trời quang cao hơn." },
      { id: randomUUID(), targetType: "post", targetId: posts[0].slug, userId: minh.id, body: "Bài viết rõ ràng. Thích phần giải thích vì sao Bortle chỉ là ước tính." },
      { id: randomUUID(), targetType: "post", targetId: posts[0].slug, userId: lan.id, body: "Có thể thêm bảng so sánh SQM đo thực tế ở vài điểm được không?" },
    ]);

    const future = (days: number) => {
      const d = new Date(Date.now() + days * 86400000);
      return d.toISOString().slice(0, 10);
    };
    const mk = (userId: string, tourIdx: number, guests: number, status: "pending" | "confirmed" | "completed", days: number) => {
      const tour = tours[tourIdx % tours.length];
      const code = `SV-${randomBytes(3).toString("hex").toUpperCase()}`;
      return {
        id: randomUUID(),
        code,
        userId,
        tourSlug: tour.slug,
        departureDate: future(days),
        guests,
        unitPriceVnd: tour.priceVnd,
        totalVnd: tour.priceVnd * guests,
        contactName: userId === lan.id ? "Ngọc Lan" : "Đức Minh",
        contactEmail: userId === lan.id ? "lan@saoviet.local" : "minh@saoviet.local",
        contactPhone: "0900 000 000",
        status,
      };
    };
    await db.insert(schema.order).values([mk(lan.id, 0, 2, "confirmed", 18), mk(lan.id, 3, 1, "pending", 40), mk(minh.id, 1, 3, "pending", 25), mk(minh.id, 2, 2, "completed", 3)]);
  }

  console.log("Seed done. Accounts (passwords shown only when created this run):");
  for (const p of people) console.log(`  ${p.user.email}  role=${p.user.email === adminEmail ? "admin" : p.user.role}  password=${p.password ?? "(unchanged)"}`);
  await client.end();
}

main().catch(async (err) => {
  console.error(err);
  await client.end();
  process.exit(1);
});
