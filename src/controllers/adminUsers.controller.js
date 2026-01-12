import User from "../models/User.js";

export async function listUsers(_req, res) {
  const users = await User.find().select("_id name email role createdAt").sort({ createdAt: -1 });
  res.json(users);
}

export async function updateUserRole(req, res) {
  const { role } = req.body;
  if (!["user", "admin"].includes(role)) return res.status(400).json({ error: "Rol inválido" });

  const u = await User.findByIdAndUpdate(req.params.id, { role }, { new: true })
    .select("_id name email role createdAt");
  if (!u) return res.status(404).json({ error: "No encontrado" });

  res.json(u);
}

export async function deleteUser(req, res) {
  const u = await User.findByIdAndDelete(req.params.id);
  if (!u) return res.status(404).json({ error: "No encontrado" });
  res.status(204).send();
}
