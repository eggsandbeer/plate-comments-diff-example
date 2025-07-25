const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/miniavs/svg?seed=${seed}`;

export const usersData: Record<
  string,
  { id: string; avatarUrl: string; name: string; hue?: number }
> = {
  cam: {
    id: "cam",
    avatarUrl: avatarUrl("cam"),
    name: "Cam",
  },
  bob: {
    id: "bob",
    avatarUrl: avatarUrl("bob4"),
    name: "Bob",
  },
  charlie: {
    id: "charlie",
    avatarUrl: avatarUrl("charlie2"),
    name: "Charlie",
  },
};
