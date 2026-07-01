import React, { useState, useEffect, useRef } from "react";
import { IRoles, IUser } from "@/src/types";
import ProfilePicture from "@/src/components/layout/app/profilePicture";
import { LoadingCursor } from "@/lib/utiils/cursor/loading";
import { getCached, setCache } from "@/lib/utils/cache";

const ROLES_CACHE_KEY = "roles";
const MEMBERS_CACHE_KEY = "members";

export default function RolesPage({
  serverId,
  sessionId,
  close,
  menuBtnsDisabled,
}: {
  serverId: string;
  sessionId: string;
  close: () => void;
  menuBtnsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [pageIndex, setPageIndex] = useState(0);
  const [roles, setRoles] = useState<IRoles[]>([]);
  const [roleName, setRoleName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updateRankLoading, setUpdateRankLoading] = useState(false);
  const [createRoleError, setCreateRoleError] = useState("");
  LoadingCursor(loading);

  const [serverMembers, setServerMembers] = useState<IUser[]>([]);
  const [addMembersData, setAddMembersData] = useState<IRoles | null>(null);
  const [btnFocus, setBtnFocus] = useState<string>("");

  // drag and drop states
  const tableRef = useRef<HTMLTableElement>(null);
  const [rowWidth, setRowWidth] = useState(0);
  const [dragged, setDragged] = useState<number | null>(null);
  const [mouse, setMouse] = useState<[number, number]>([0, 0]);
  const [dropZone, setDropZone] = useState(0);
  const [detectChange, setDetectChange] = useState(false);
  const [initialRoles, setInitialRoles] = useState<IRoles[]>([]);

  const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    close();
  };

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const cacheKey = `${ROLES_CACHE_KEY}::${serverId}`;
        const cachedRoles = getCached<IRoles[]>(cacheKey);

        if (cachedRoles && cachedRoles.length > 0) {
          setRoles(cachedRoles);
          setInitialRoles(cachedRoles);
          return;
        }

        const res = await fetch(
          `/api/server/roles/get/serverId?serverId=${serverId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!res.ok) {
          console.error("Failed to fetch roles:", res.status);
          return;
        }

        const data = await res.json();
        const userRolesData = data.roles;
        setCache(cacheKey, userRolesData);
        const filteredRoles = userRolesData;
        setRoles(filteredRoles);
        setInitialRoles(filteredRoles);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    const fetchServerMembers = async () => {
      try {
        const cacheKey = `${MEMBERS_CACHE_KEY}::${serverId}`;
        const cachedMembers = getCached<IUser[]>(cacheKey);

        if (cachedMembers && cachedMembers.length > 0) {
          setServerMembers(cachedMembers);
          return;
        }

        const res = await fetch(
          `/api/server/get/members?serverId=${serverId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!res.ok) {
          console.error("Failed to fetch server members:", res.status);
          return;
        }

        const data = await res.json();
        const serverMembersData = data.members;
        setCache(cacheKey, serverMembersData);
        setServerMembers(serverMembersData);
      } catch (error) {
        console.error("Error fetching server members:", error);
      }
    };
    fetchUserRoles();
    fetchServerMembers();
  }, [serverId, sessionId]);

  // get mouse coordenates
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMouse([e.x, e.y]);
    };

    document.addEventListener("mousemove", handler);

    return () => document.removeEventListener("mousemove", handler);
  }, []);

  // get closest drop zone
  useEffect(() => {
    if (dragged !== null) {
      const elements = Array.from(
        document.querySelectorAll("[data-drop-zone-index]"),
      ) as HTMLElement[];
      if (elements.length === 0) {
        setDropZone(dragged);
        return;
      }

      const closestZone = elements.reduce(
        (closest, element) => {
          const elementTop = element.getBoundingClientRect().top;
          const elementDistance = Math.abs(elementTop - mouse[1]);

          if (!closest) {
            return { element, distance: elementDistance };
          }

          return elementDistance < closest.distance
            ? { element, distance: elementDistance }
            : closest;
        },
        null as { element: HTMLElement; distance: number } | null,
      );

      const nextDropZone = Number(
        closestZone?.element.dataset.dropZoneIndex ?? dragged,
      );

      setDropZone(Math.max(0, Math.min(nextDropZone, roles.length)));
    }
  }, [dragged, mouse, roles.length]);

  // drop item
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dragged !== null) {
        e.preventDefault();
        const nextRoles = reorderList([...roles], dragged, dropZone);

        const orderRoles = nextRoles.map((role, index) => ({
          ...role,
          rank: index + 1,
        }));

        setRoles(orderRoles);
        setDetectChange(!arraysAreIdentical(orderRoles, initialRoles));
        menuBtnsDisabled(!arraysAreIdentical(orderRoles, initialRoles));
        setDragged(null);
      }
    };

    document.addEventListener("mouseup", handler);
    return () => document.removeEventListener("mouseup", handler);
  });

  const reorderList = <T,>(l: T[], start: number, end: number) => {
    if (start < 0 || start >= l.length) {
      return l;
    }

    const safeEnd = Math.max(0, Math.min(end, l.length));
    const nextList = [...l];
    const [movedItem] = nextList.splice(start, 1);

    if (movedItem === undefined) {
      return l;
    }

    const targetIndex = start < safeEnd ? safeEnd - 1 : safeEnd;

    nextList.splice(targetIndex, 0, movedItem);

    return nextList;
  };

  function arraysAreIdentical<T>(arr1: T[], arr2: T[]): boolean {
    // Quick length check
    if (arr1.length !== arr2.length) return false;

    // Compare each element
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
    return true;
  }

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const roleRank = Number(roles.length ?? 0) + 1; // Set rank based on current number of roles
    try {
      setLoading(true);
      setCreateRoleError("");
      const res = await fetch("/api/server/roles/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serverId,
          role: roleName,
          admin: isAdmin,
          rank: roleRank,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.message ?? "Failed to create role";
        setCreateRoleError(errorMessage);
        console.error("Failed to create role:", res.status, errorMessage);
        return;
      }
      const data = await res.json();
      const newRole = data.serverRole;
      setRoles((prevRoles) => [...prevRoles, newRole]);
      setRoleName("");
      setIsAdmin(false);
      setPageIndex(0);
    } catch (error) {
      setCreateRoleError("Failed to create role");
      console.error("Error creating role:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = () => {
    try {
      setUpdateRankLoading(true);
      setLoading(true);
      roles.forEach(async (role) => {
        await fetch(
          `/api/server/roles/update?serverId=${serverId}&roleId=${role.id}&rank=${role.rank}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      });
    } catch (error) {
      console.error("Error saving role order:", error);
    } finally {
      setDetectChange(false);
      setUpdateRankLoading(false);
      setLoading(false);
    }
  };

  const handleAddUser = async (userId: string, roleId: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/server/roles/update/member/add?serverId=${serverId}&roleId=${roleId}&userId=${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        console.error("Failed to add user to role:", res.status);
        return;
      }
      const userToAdd = serverMembers.find((member) => member.id === userId);
      if (!userToAdd) return;
      setAddMembersData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          users: [...prev.users, userToAdd],
        };
      });
      setRoles((prevRoles) =>
        prevRoles.map((role) =>
          role.id === roleId
            ? { ...role, users: [...role.users, userToAdd] }
            : role,
        ),
      );
    } catch (error) {
      console.error("Error adding user to role:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string, roleId: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/server/roles/update/member/remove?serverId=${serverId}&roleId=${roleId}&userId=${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        console.error("Failed to remove user from role:", res.status);
        return;
      }
      setAddMembersData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          users: prev.users.filter((user) => user.id !== userId),
        };
      });
      setRoles((prevRoles) =>
        prevRoles.map((role) =>
          role.id === roleId
            ? {
                ...role,
                users: role.users.filter((user) => user.id !== userId),
              }
            : role,
        ),
      );
    } catch (error) {
      console.error("Error removing user from role:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex ">
      <div className="w-full h-full flex flex-col gap-[1rem]">
        {pageIndex === 0 && (
          <div className="flex flex-col gap-[1rem]">
            <div className="flex flex-col">
              <h1 className="font-bold text-[1.2rem]">Roles</h1>
              <p className="">
                Use roles to group your server members and assign permissions.
              </p>
            </div>

            <div className="pb-[1rem]">
              <button
                disabled={detectChange}
                onClick={() => {
                  setCreateRoleError("");
                  setPageIndex(1);
                }}
                className={`bg-[var(--button)] rounded cursor-pointer px-[0.5rem] py-[0.25rem] hover:bg-[var(--button-hover)] disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Create Role
              </button>
            </div>

            <div className="w-inherit">
              {dragged !== null && roles[dragged] && (
                <div
                  className="fixed pointer-events-none z-50 bg-[var(--secondary)] rounded px-[0.5rem] py-[0.25rem] flex gap-[2rem] shadow-[5px_5px_10px_rgba(0,0,0,0.5)] cursor-grabbing"
                  style={{
                    left: `${mouse[0]}px`,
                    top: `${mouse[1]}px`,
                    width: rowWidth,
                  }}
                >
                  <span className="w-[2rem]">::</span>
                  <span className="w-full">{roles[dragged].role}</span>
                  <span className="">{roles[dragged]?.users?.length ?? 0}</span>
                </div>
              )}
            </div>

            <table ref={tableRef} className="w-full text-left">
              <thead className="w-full [border-bottom:1px_solid_DimGray]">
                <tr>
                  <th className="w-[3rem]"></th>
                  <th className="w-full text-left text-[var(--subtitle)] text-[0.8rem] font-bold">
                    {`ROLES - ${roles.length}`}
                  </th>
                  <th className="w-[10rem] text-left text-[var(--subtitle)] text-[0.8rem] font-bold">
                    MEMBERS
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr
                  data-drop-zone-index={0}
                  className={`drop-zone bg-[#ccc] [transition-property:height_padding] duration-[250ms] ease-[cubic-bezier(0.075,0.82,0.165,1)] overflow-hidden ${dragged === null || dropZone !== 0 ? "h-[0px] p-[0px]" : ""}`}
                ></tr>
                {roles.map((role, index) => (
                  <React.Fragment key={role.id}>
                    {dragged !== index && (
                      <>
                        <tr
                          className="w-full hover:bg-[var(--hover)] rounded cursor-pointer [border-bottom:1px_solid_DimGray] nowrapping"
                          key={role.id}
                          onClick={() => {
                            setAddMembersData(role);
                            setPageIndex(2);
                            setBtnFocus(role.id);
                          }}
                        >
                          <td
                            className="cursor-grab"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setRowWidth(
                                tableRef.current?.getBoundingClientRect()
                                  .width ?? 0,
                              );
                              setDragged(index);
                            }}
                            key={`${role.id}-handle`}
                          >
                            <div className="w-[2rem] flex justify-center">
                              ::
                            </div>
                          </td>
                          <td className="" key={`${role.id}-${role.role}`}>
                            {role.role}
                          </td>
                          <td className="" key={`${role.id}-${role.createdAt}`}>
                            {role?.users?.length ?? 0}
                          </td>
                        </tr>
                        <tr
                          data-drop-zone-index={index + 1}
                          className={`drop-zone bg-[#ccc] [transition-property:height_padding] duration-[250ms] ease-[cubic-bezier(0.075,0.82,0.165,1)] overflow-hidden ${dragged === null || dropZone !== index + 1 ? "h-[0px] p-[0px]" : ""}`}
                        ></tr>
                      </>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            {detectChange && roles.length === initialRoles.length && (
              <div className="flex w-full justify-end gap-[1rem]">
                <button
                  onClick={() => {
                    setRoles(initialRoles);
                    setDetectChange(false);
                  }}
                  disabled={updateRankLoading}
                  className="text-[var(--button)] rounded cursor-pointer px-[0.5rem] py-[0.25rem] hover:bg-[var(--button-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
                <button
                  onClick={saveChanges}
                  disabled={updateRankLoading}
                  className="bg-green-500 rounded cursor-pointer px-[0.5rem] py-[0.25rem] hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        )}

        {pageIndex === 1 && (
          <div className="flex w-full h-full">
            <div className="w-[7rem] h-full">
              <button
                className="text-[var(--subtitle)] hover:bg-[var(--hover)] px-[0.5rem] py-[0.25rem] rounded cursor-pointer"
                onClick={() => {
                  setCreateRoleError("");
                  setPageIndex(0);
                }}
              >
                &lt; Back
              </button>
            </div>
            <div className="w-full h-full">
              <form
                action=""
                className="flex flex-col gap-[1rem]"
                onSubmit={handleCreateRole}
              >
                <input
                  type="text"
                  className="bg-[var(--inputs)] border border-[dimgray] focus:outline-none focus:ring-2 rounded px-[0.5rem] py-[0.25rem] disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Role Name"
                  disabled={loading}
                  value={roleName}
                  onChange={(e) => {
                    if (createRoleError) {
                      setCreateRoleError("");
                    }
                    setRoleName(e.target.value);
                  }}
                />
                {createRoleError && (
                  <p className="text-[tomato] text-[0.85rem]">
                    {createRoleError}
                  </p>
                )}
                <div className="pb-[1rem]">
                  <label htmlFor="admin-label" className="">
                    Admin:{" "}
                  </label>
                  <input
                    type="checkbox"
                    className="disabled:cursor-not-allowed disabled:opacity-50"
                    id="admin-label"
                    disabled={loading}
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                  />
                </div>
                <div className="">
                  <button
                    type="submit"
                    className="bg-[var(--button)] rounded cursor-pointer px-[0.5rem] py-[0.25rem] hover:bg-[var(--button-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {pageIndex === 2 && (
          <div className="flex w-full h-full">
            <div className="w-[15rem] h-full">
              <button
                className="text-[var(--subtitle)] hover:bg-[var(--hover)] px-[0.5rem] py-[0.25rem] rounded cursor-pointer"
                onClick={() => {
                  setPageIndex(0);
                }}
              >
                &lt; Back
              </button>
              <div className="flex flex-col w-full gap-[0.25rem]">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className={`w-full px-[0.5rem] py-[0.25rem] rounded cursor-pointer hover:bg-[var(--hover)] ${btnFocus === role.id ? "bg-[var(--hover)]" : ""}`}
                    onClick={() => {
                      setAddMembersData(role);
                      setBtnFocus(role.id);
                    }}
                  >
                    {role.role}
                  </div>
                ))}
              </div>
            </div>

            {addMembersData && (
              <div className="w-full h-full pl-[1rem] ">
                <h3 className="italic text-[var(--subtitle)] text-[0.9rem] pb-[1rem]">
                  {addMembersData.admin ? "has admin permissions" : ""}
                </h3>
                <div className="font-bold">Role Members</div>
                {addMembersData?.users.length > 0 ? (
                  <div className="flex flex-col gap-[0.5rem] pb-[1rem]">
                    {addMembersData.users.map((user) => (
                      <div
                        key={user.id}
                        className="flex gap-[0.5rem] w-full justify-between items-center hover:bg-[var(--hover)] rounded cursor-pointer px-[0.5rem] py-[0.25rem]"
                      >
                        <div className="flex gap-[0.25rem] items-center">
                          <ProfilePicture username={user.displayName} />
                          <span>{user.displayName}</span>
                          <span className="text-[var(--subtitle)] text-[0.8rem]">
                            {user.username}
                          </span>
                        </div>

                        <div
                          onClick={() =>
                            handleRemoveUser(user.id, addMembersData.id)
                          }
                          className="text-[var(--subtitle)] rounded-full bg-[dimgray] hover:bg-[silver] w-[1rem] h-[1rem] flex items-center justify-center cursor-pointer"
                        >
                          <div className="text-[var(--background)]">x</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[var(--subtitle)] text-[0.9rem] pb-[1rem]">
                    no assigned users
                  </div>
                )}

                {serverMembers.filter(
                  (member) =>
                    !addMembersData?.users.some(
                      (user) => user.id === member.id,
                    ),
                ).length > 0 && (
                  <div className="flex flex-col ">
                    <div className="font-bold">Server Members</div>
                    {serverMembers
                      .filter(
                        (member) =>
                          !addMembersData?.users.some(
                            (user) => user.id === member.id,
                          ),
                      )
                      .map((member) => (
                        <div
                          key={member.id}
                          className="flex gap-[0.5rem] w-full justify-between items-center hover:bg-[var(--hover)] rounded cursor-pointer px-[0.5rem] py-[0.25rem]"
                        >
                          <div className="flex items-center gap-[0.5rem]">
                            <ProfilePicture username={member.displayName} />
                            <span>{member.displayName}</span>
                            <span className="text-[var(--subtitle)] text-[0.8rem]">
                              {member.username}
                            </span>
                          </div>

                          <button
                            onClick={() =>
                              handleAddUser(member.id, addMembersData.id)
                            }
                            className="rounded cursor-pointer px-[0.5rem] py-[0.25rem] bg-[var(--button)] hover:bg-[var(--button-hover)]"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="w-[10rem] flex justify-center">
        <button
          disabled={detectChange}
          className="w-[3rem] h-[3rem] cursor-pointer rounded-full [border:2px_solid_dimgray] p-[0.5rem] flex items-center justify-center hover:bg-[var(--hover)] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleCloseClick}
        >
          X
        </button>
      </div>
    </div>
  );
}
