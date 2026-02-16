import client from "@/api/client";

export async function createProfileIfNotExists(user) {
  const { data } = await client
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!data) {
    await client.from("profiles").insert({
      id: user.id,
      email: user.email,
      role: "traveler",
    });
  }
}
