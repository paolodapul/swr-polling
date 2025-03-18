import { z } from "zod";

const envSchema = z.object({
  DELAY: z.string().transform((val) => parseInt(val, 10)),
  FORCE_ERROR: z.string().transform((val) => {
    return val.toLowerCase() === "true" || val === "1";
  }),
});

function validateEnv() {
  const env = {
    DELAY: process.env.DELAY,
    FORCE_ERROR: process.env.FORCE_ERROR || "false",
  };

  try {
    return envSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVariables = error.errors.map((e) => e.path.join("."));
      throw new Error(
        `❌ Invalid environment variables: ${missingVariables.join(", ")}`
      );
    }
    throw error;
  }
}

export const config = validateEnv();
export type Config = z.infer<typeof envSchema>;
