import { NextResponse, NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * Prismic Webhook Endpoint
 * Triggers instant on-demand cache invalidation when content is published or updated in Prismic.
 *
 * Webhook URL: https://<your-domain>/api/revalidate
 * Optional Secret: PRISMIC_WEBHOOK_SECRET
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Optional secret verification
    const secret = process.env.PRISMIC_WEBHOOK_SECRET;
    if (secret && body?.secret !== secret) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    // Revalidate affected routes
    revalidatePath("/", "page");
    revalidatePath("/services", "page");
    revalidatePath("/services/[slug]", "page");
    revalidatePath("/api/services");

    return NextResponse.json({
      revalidated: true,
      timestamp: Date.now(),
      type: body?.type || "manual",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        revalidated: false,
        error: error.message || "Failed to revalidate",
      },
      { status: 500 }
    );
  }
}
