// lib/prisma.ts

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const isConnectionError = (err: any) =>
  err?.message?.includes("Server has closed the connection") ||
  err?.message?.includes("Connection terminated") ||
  err?.code === "P1017";

const prismaClientSingleton = () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    max: 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 5000,
  });

  pool.on("error", (err) => {
    console.error("Unexpected Postgres pool error:", err.message);
  });

  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({ adapter });

  // Retry تلقائي على مستوى كل استعلام، بيغطي أي مكان بتستخدم فيه prisma
  return client.$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        try {
          return await query(args);
        } catch (err: any) {
          if (isConnectionError(err)) {
            console.warn(
              `[Prisma retry] ${model}.${operation} failed with stale connection, retrying once...`
            );
            return await query(args);
          }
          throw err;
        }
      },
    },
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;