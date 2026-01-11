import { getPeriod } from "@level-up-life/core";
import type { Database } from "./database.types";
import {
	supabase as defaultClient,
	createSupabaseClient,
	requireClient,
	type SupabaseDBClient,
} from "./client";
import {
	FamilySchema,
	CreateFamilySchema,
	ChildProfileSchema,
	CreateChildProfileSchema,
	QuestSchema,
	CreateQuestSchema,
	QuestInstanceSchema,
	CompleteQuestSchema,
	XPLogSchema,
	type Family,
	type CreateFamily,
	type ChildProfile,
	type CreateChildProfile,
	type Quest,
	type CreateQuest,
	type QuestInstance,
	type CompleteQuest,
	type XPLog,
} from "./schemas";

export const API_VERSION = "0.0.1";

type Client = SupabaseDBClient;

function periodISO() {
	const { start, end } = getPeriod("daily", new Date());
	return { start: start.toISOString(), end: end.toISOString() };
}

async function ensureFamilyMembership(client: Client, familyId: string, userId: string, role: "parent" | "caregiver" | "child" = "parent") {
	const { error } = await client
		.from("family_member")
		.upsert({ family_id: familyId, user_id: userId, role }, { onConflict: "family_id,user_id" });
	if (error) throw error;
}

export async function getOrCreateFamily(clientInput: Client | undefined, userId: string, name = "My Family"): Promise<Family> {
	const client = requireClient(clientInput);

	const existing = await client.from("family").select("*").eq("owner_user_id", userId).limit(1).maybeSingle();
	if (existing.error && existing.error.code !== "PGRST116") throw existing.error;
	if (existing.data) {
		await ensureFamilyMembership(client, existing.data.id, userId, "parent");
		return FamilySchema.parse(existing.data);
	}

	const { data, error } = await client
		.from("family")
		.insert({ owner_user_id: userId, name })
		.select()
		.single();
	if (error) throw error;
	await ensureFamilyMembership(client, data.id, userId, "parent");
	return FamilySchema.parse(data);
}

export async function createChildProfile(clientInput: Client | undefined, payload: CreateChildProfile): Promise<ChildProfile> {
	const parsed = CreateChildProfileSchema.parse(payload);
	const client = requireClient(clientInput);
	const { data, error } = await client.from("child_profile").insert(parsed).select().single();
	if (error) throw error;
	return ChildProfileSchema.parse(data);
}

export async function fetchChildren(clientInput: Client | undefined, familyId: string): Promise<ChildProfile[]> {
	const client = requireClient(clientInput);
	const { data, error } = await client
		.from("child_profile")
		.select("*")
		.eq("family_id", familyId)
		.order("created_at", { ascending: true });
	if (error) throw error;
	return ChildProfileSchema.array().parse(data ?? []);
}

export async function createQuestTemplate(clientInput: Client | undefined, payload: CreateQuest): Promise<Quest> {
	const parsed = CreateQuestSchema.parse(payload);
	const client = requireClient(clientInput);
	const { data, error } = await client.from("quest").insert(parsed).select().single();
	if (error) throw error;
	return QuestSchema.parse(data);
}

export async function ensureDefaultQuests(clientInput: Client | undefined, familyId: string, userId: string) {
	const client = requireClient(clientInput);
	const { count, error } = await client
		.from("quest")
		.select("id", { count: "exact", head: true })
		.eq("family_id", familyId);
	if (error) throw error;

	if (!count || count === 0) {
		await createQuestTemplate(client, {
			family_id: familyId,
			title: "Daily Check-in",
			description: "A quick daily reflection",
			domain: "general",
			cadence: "daily",
			difficulty: 1,
			xp_reward: 25,
			is_system: true,
			created_by_user_id: userId,
		});
	}
}

export async function fetchQuestTemplates(clientInput: Client | undefined, familyId: string): Promise<Quest[]> {
	const client = requireClient(clientInput);
	const { data, error } = await client.from("quest").select("*").eq("family_id", familyId).order("created_at", { ascending: true });
	if (error) throw error;
	return QuestSchema.array().parse(data ?? []);
}

export async function fetchQuestInstancesForToday(clientInput: Client | undefined, childId: string): Promise<QuestInstance[]> {
	const client = requireClient(clientInput);
	const { start, end } = periodISO();
	const { data, error } = await client
		.from("quest_instance")
		.select("*")
		.eq("child_id", childId)
		.gte("period_start", start)
		.lte("period_end", end)
		.order("created_at", { ascending: true });
	if (error) throw error;
	return QuestInstanceSchema.array().parse(data ?? []);
}

export async function ensureQuestInstancesForToday(clientInput: Client | undefined, childId: string): Promise<QuestInstance[]> {
	const client = requireClient(clientInput);
	const todayExisting = await fetchQuestInstancesForToday(client, childId);
	if (todayExisting.length > 0) return todayExisting;

	// Need child's family to pull quest templates
	const childRes = await client.from("child_profile").select("*").eq("id", childId).single();
	if (childRes.error) throw childRes.error;
	const child = ChildProfileSchema.parse(childRes.data);

	await ensureDefaultQuests(client, child.family_id, (await client.auth.getUser()).data.user?.id || "");
	const quests = await fetchQuestTemplates(client, child.family_id);
	if (quests.length === 0) return [];

	const { start, end } = periodISO();
	const rows = quests.map((quest) => ({
		child_id: childId,
		quest_id: quest.id,
		period_start: start,
		period_end: end,
		status: "pending" as const,
	}));

	const { error } = await client.from("quest_instance").insert(rows);
	if (error) throw error;
	return fetchQuestInstancesForToday(client, childId);
}

export async function completeQuestInstance(
	clientInput: Client | undefined,
	questInstanceId: string,
	notes?: string
): Promise<{ quest_instance: QuestInstance; xp_log: XPLog }>
{
	const client = requireClient(clientInput);

	const qiRes = await client
		.from("quest_instance")
		.select("*, quest:quest_id(*)")
		.eq("id", questInstanceId)
		.single();
	if (qiRes.error) throw qiRes.error;
	const questInstance = QuestInstanceSchema.parse(qiRes.data);
	const quest = QuestSchema.parse((qiRes.data as any).quest);

	const completedAt = new Date().toISOString();

	const updateRes = await client
		.from("quest_instance")
		.update({ status: "completed", completed_at: completedAt, notes })
		.eq("id", questInstanceId)
		.select()
		.single();
	if (updateRes.error) throw updateRes.error;
	const updatedInstance = QuestInstanceSchema.parse(updateRes.data);

	const xpRes = await client
		.from("xp_log")
		.insert({
			child_id: questInstance.child_id,
			domain: quest.domain,
			amount: quest.xp_reward,
			reason: `Completed: ${quest.title}`,
			quest_instance_id: questInstanceId,
		})
		.select()
		.single();
	if (xpRes.error) throw xpRes.error;

	return { quest_instance: updatedInstance, xp_log: XPLogSchema.parse(xpRes.data) };
}

export async function fetchXpTotal(clientInput: Client | undefined, childId: string): Promise<number> {
	const client = requireClient(clientInput);
	const { data, error } = await client.rpc("get_child_total_xp", { p_child_id: childId });
	if (error) throw error;
	return data ?? 0;
}

export {
	defaultClient,
	createSupabaseClient,
	requireClient,
	FamilySchema,
	CreateFamilySchema,
	ChildProfileSchema,
	CreateChildProfileSchema,
	QuestSchema,
	CreateQuestSchema,
	QuestInstanceSchema,
	CompleteQuestSchema,
	XPLogSchema,
};

export type {
	Database,
	SupabaseDBClient as SupabaseClient,
	Family,
	CreateFamily,
	ChildProfile,
	CreateChildProfile,
	Quest,
	CreateQuest,
	QuestInstance,
	CompleteQuest,
	XPLog,
};
