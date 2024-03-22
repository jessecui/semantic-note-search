"use client";

import {
  ActionIcon,
  Alert,
  AppShell,
  AppShellMain,
  AppShellNavbar,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Flex,
  Group,
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  Modal,
  Paper,
  PasswordInput,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { useMantineTheme } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import {
  IconArticle,
  IconCalendar,
  IconClipboardText,
  IconDots,
  IconDotsVertical,
  IconInfoCircle,
  IconPin,
  IconSearch,
  IconStack2,
  IconTrash,
} from "@tabler/icons-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Dashboard() {
  // Notes state
  const [notes, setNotes] = useState<{ id: any; text: any }[]>([]);

  // Note space states
  const [savedSearches, setSavedSearches] = useState<
    { id: any; text: string }[]
  >([]);
  const [searchText, setSearchText] = useState<{
    id: any;
    text: string;
  } | null>(null);
  const [hoveredNoteSpaceId, setHoveredNoteSpaceId] = useState<Number | null>(
    null,
  );
  const [hoveredNoteId, setHoveredNoteId] = useState<Number | null>(null);
  const [hoveredNoteTitle, setHoveredNoteTitle] = useState<boolean>(false);

  // Note navigation and filtering states
  const [searchedText, setSearchedText] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [opened, { close }] = useDisclosure(true);
  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },
  });

  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient>();

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const searchText = searchParams.get("search");
    if (searchText) {
      setNotes([]);
      setSearchedText(searchText);
      setSearchText({ id: -1, text: searchText });
    }
  }, [searchParams]);

  // Dashboard refs
  const editableNoteRef = useRef<HTMLDivElement>(null);

  // Alert disclosure for notifying user of duplicate note creation
  const [alertOpened, { open: openAlert, close: closeAlert }] =
    useDisclosure(false);

  const theme = useMantineTheme();

  // Fetch initial note spaces
  useEffect(() => {
    const fetchNoteSpaces = async () => {
      if (supabaseClient) {
        const { data, error } = await supabaseClient
          .from("Searches")
          .select("id, text")
          .order("created_at", { ascending: false });

        if (error) console.log(error);
        if (data) {
          setSavedSearches(data);
        }
      }
    };
    fetchNoteSpaces();
  }, [supabaseClient]);

  // Fetch notes within note spaces
  useEffect(() => {
    const fetchAllNotesWithDates = async () => {
      if (supabaseClient) {
        let query = supabaseClient.from("Notes").select("id, text");

        if (startDate) {
          const formattedStartDate = startDate.toISOString();
          query = query.gte("created_at", formattedStartDate);
        }

        if (endDate) {
          const formattedEndDate = new Date(
            new Date(endDate).setDate(endDate.getDate() + 1),
          ).toISOString();
          query = query.lte("created_at", formattedEndDate);
        }

        query = query.order("created_at", { ascending: false });

        const { data, error } = await query;

        if (error) console.log(error);
        if (data) {
          setNotes(data);
        }
      }
    };

    const fetchNotesWithinNoteSpaceWithDates = async () => {
      if (searchText?.id && supabaseClient) {
        let query = supabaseClient
          .from("Note to Note Space")
          .select("id, Notes (id, text)")
          .eq("note_space_id", searchText.id);

        if (startDate) {
          const formattedStartDate = startDate.toISOString();
          query = query.gte("created_at", formattedStartDate);
        }

        if (endDate) {
          const formattedEndDate = new Date(
            new Date(endDate).setDate(endDate.getDate() + 1),
          ).toISOString();
          query = query.lte("created_at", formattedEndDate);
        }

        query = query.order("created_at", { ascending: false });

        const { data, error } = await query;

        if (error) console.log(error);
        if (data) {
          const notes: { id: any; text: any }[] = data.flatMap((note) => {
            return note.Notes;
          });
          setNotes(notes);
        }
      }
    };

    if (searchedText) {
      return;
    }

    if (searchText) {
      fetchNotesWithinNoteSpaceWithDates();
    } else {
      fetchAllNotesWithDates();
    }
  }, [startDate, endDate, searchText, searchedText, supabaseClient]);

  // Fetch notes when using main semantic search
  useEffect(() => {
    const semanticSearch = async () => {
      if (!supabaseClient || !searchedText) {
        return;
      }
      const embeddingResponse = await fetch(
        `/embed?text=${encodeURIComponent(searchedText)}`,
      );
      const embedding = await embeddingResponse.json();

      const { data, error } = await supabaseClient.rpc("match_notes", {
        query_embedding: embedding,
        match_threshold: 1.8,
        match_count: 1000,
        match_start: startDate?.toISOString(),
        match_end: endDate?.toISOString(),
      });

      if (error) {
        console.log(error);
        return;
      }
      if (data) {
        setNotes(data);
      }
    };

    semanticSearch();
  }, [searchedText, startDate, endDate, supabaseClient]);

  return (
    <main>
      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        yOffset="15vh"
        overlayProps={{
          backgroundOpacity: 0.6,
          blur: 2,
        }}
        closeOnEscape={false}
        closeOnClickOutside={false}
      >
        <form
          onSubmit={form.onSubmit(async ({ username, password }) => {
            const response = await fetch(
              `/verify-login?username=${encodeURIComponent(
                username,
              )}&password=${encodeURIComponent(password)}`,
            );
            const { verified, supabaseCredentials } = await response.json();

            if (verified) {
              setSupabaseClient(
                createClient(
                  supabaseCredentials.supabaseUrl,
                  supabaseCredentials.supabaseKey,
                ),
              );
              close();
            } else {
              form.setErrors({
                password: "Invalid password",
              });
            }
          })}
        >
          <PasswordInput
            label="Password"
            placeholder="********"
            {...form.getInputProps("password")}
            mt={8}
          />
          <Center mt={24}>
            <Button type="submit">Log In</Button>
          </Center>
        </form>
      </Modal>
      <AppShell navbar={{ width: 285, breakpoint: "xs" }} padding="md">
        <AppShellNavbar p="md" className="navbar">
          <Flex
            align="center"
            mt={4}
            onClick={async () => {
              if (searchText != null) {
                setNotes([]);
              }
              setSearchedText(null);
              setSearchText(null);
            }}
            style={{ cursor: "pointer" }}
          >
            <Image
              src="/notesearch-logo.png"
              alt="NoteSearch Logo"
              width={125}
              height={25}
              priority
            />
          </Flex>
          <Box
            mt={32}
            style={{ overflow: "auto" }}
            className="custom-scrollbar"
          >
            <Stack gap={4} mb={32}>
              <DatePickerInput
                leftSection={<IconCalendar size={16} />}
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                valueFormat="MMMM D, YYYY"
                clearable
                styles={{
                  label: {
                    color: theme.colors.dark[2],
                  },
                }}
              />
              <DatePickerInput
                leftSection={<IconCalendar size={16} />}
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                valueFormat="MMMM D, YYYY"
                clearable
                styles={{
                  label: {
                    color: theme.colors.dark[2],
                  },
                }}
              />
            </Stack>
            <Stack gap={4} mt={8}>
              <Text fz="sm" fw="500" c="dark.2">
                Saved Searches
              </Text>
              {savedSearches.map((savedSearch) => (
                <Flex
                  key={savedSearch.id}
                  justify="space-between"
                  align="center"
                  h="25px"
                  onMouseEnter={() => setHoveredNoteSpaceId(savedSearch.id)}
                  onMouseLeave={() => setHoveredNoteSpaceId(null)}
                >
                  <Text
                    className={
                      savedSearch.id == searchText?.id
                        ? "navlink-selected"
                        : "navlink"
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      router.push(
                        `/?search=${encodeURIComponent(savedSearch.text)}`,
                      );
                    }}
                  >
                    <IconClipboardText size={16} />
                    {savedSearch.text.length > 25 ? `${savedSearch.text.substring(0, 25)}...` : savedSearch.text}
                  </Text>
                  {hoveredNoteSpaceId === savedSearch.id && (
                    <Menu offset={-8} position="bottom-start">
                      <MenuTarget>
                        <ActionIcon
                          variant="subtle"
                          aria-label="Settings"
                          color="gray"
                          size="md"
                        >
                          <IconDots
                            style={{ width: "70%", height: "70%" }}
                            stroke={1.5}
                          />
                        </ActionIcon>
                      </MenuTarget>
                      <MenuDropdown>
                        <MenuItem
                          leftSection={
                            <IconTrash style={{ width: 16, height: 16 }} />
                          }
                          onClick={async () => {
                            const { error } = await supabaseClient!
                              .from("Searches")
                              .delete()
                              .eq("id", savedSearch.id);

                            if (!error) {
                              if (searchText?.id == savedSearch.id) {
                                setSearchText(null);
                              }
                              setSavedSearches(
                                savedSearches.filter(
                                  (searchToKeep) =>
                                    searchToKeep.id !== savedSearch.id,
                                ),
                              );
                            }
                          }}
                        >
                          Delete
                        </MenuItem>
                      </MenuDropdown>
                    </Menu>
                  )}
                </Flex>
              ))}
            </Stack>
          </Box>
        </AppShellNavbar>
        <AppShellMain bg="dark.8">
          <Container h={"95vh"} w={768}>
            <Textarea
              rows={1}
              autosize
              radius={4}
              leftSection={
                <IconSearch
                  style={{ alignSelf: "start", marginTop: 8.5 }}
                  size={16}
                />
              }
              mb={32}
              onKeyDown={async (e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  const textToSearch = (e.target as HTMLInputElement).value;
                  (e.target as HTMLInputElement).value = "";
                  router.push(`/?search=${encodeURIComponent(textToSearch)}`);
                }
              }}
            />
            <Paper
              radius={4}
              withBorder
              px={4}
              py={36}
              h={"90%"}
              style={{ overflow: "auto" }}
              bg="dark.8"
            >
              <Group
                wrap="nowrap"
                align="flex-start"
                onMouseEnter={() => setHoveredNoteTitle(true)}
                onMouseLeave={() => setHoveredNoteTitle(false)}
                gap={4}
                pl={16}
                pr={42}
              >
                {hoveredNoteTitle && searchText ? (
                  <Menu offset={4} position="left">
                    <MenuTarget>
                      <ActionIcon
                        variant="subtle"
                        aria-label="Settings"
                        color="gray"
                        size="md"
                      >
                        <IconDotsVertical
                          style={{ width: "70%", height: "70%" }}
                          stroke={1.5}
                        />
                      </ActionIcon>
                    </MenuTarget>
                    <MenuDropdown>
                      <MenuItem
                        leftSection={
                          <IconPin style={{ width: 16, height: 16 }} />
                        }
                        onClick={async (e) => {
                          // Add searchText to searches
                          const embeddingResponse = await fetch(
                            `/embed?text=${encodeURIComponent(
                              searchText.text,
                            )}`,
                          );
                          const embedding = await embeddingResponse.json();

                          await supabaseClient!.from("Searches").insert({
                            text: searchText.text,
                            embedding: embedding,
                          });

                          setSavedSearches([
                            { id: -1, text: searchText.text },
                            ...savedSearches,
                          ]);
                        }}
                      >
                        Save Search
                      </MenuItem>
                    </MenuDropdown>
                  </Menu>
                ) : (
                  <ActionIcon
                    variant="transparent"
                    style={{ cursor: searchText ? "pointer" : "default" }}
                  />
                )}
                <Text
                  id="notespace-title"
                  size="lg"
                  fw={500}
                  mb={24}
                  className="text-box-edit"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      editableNoteRef.current?.focus();
                    }
                  }}
                  onBlur={async (e) => {
                    const noteSpaceName = (e.target as HTMLElement).innerText;

                    // If notespace name already exists, reset the text
                    if (
                      noteSpaceName == "" ||
                      savedSearches.find(
                        (savedSearch) => savedSearch.text === noteSpaceName,
                      )
                    ) {
                      (e.target as HTMLElement).innerText =
                        searchText?.text as string;
                      return;
                    }

                    const embeddingResponse = await fetch(
                      `/embed?text=${encodeURIComponent(noteSpaceName)}`,
                    );
                    const embedding = await embeddingResponse.json();

                    const { error } = await supabaseClient!
                      .from("Queries")
                      .update({ name: noteSpaceName, embedding: embedding })
                      .eq("id", searchText?.id);

                    if (error) {
                      console.log(error);
                      return;
                    }
                    setSearchText({
                      id: searchText?.id,
                      text: noteSpaceName,
                    });
                    setSavedSearches(
                      savedSearches.map((notespace) => {
                        if (notespace.id === searchText?.id) {
                          return {
                            id: searchText?.id,
                            text: noteSpaceName,
                          };
                        } else {
                          return notespace;
                        }
                      }),
                    );
                  }}
                  suppressContentEditableWarning
                >
                  {searchText ? searchText.text : "All Notes"}
                </Text>
              </Group>
              <Stack>
                {notes.map((note, index) => {
                  return (
                    <Group
                      key={index}
                      wrap="nowrap"
                      align="flex-start"
                      onMouseEnter={() => setHoveredNoteId(note.id)}
                      onMouseLeave={() => setHoveredNoteId(null)}
                      gap={4}
                      pl={16}
                      pr={42}
                    >
                      {hoveredNoteId === note.id ? (
                        <Menu offset={4} position="left">
                          <MenuTarget>
                            <ActionIcon
                              variant="subtle"
                              aria-label="Settings"
                              color="gray"
                              size="md"
                            >
                              <IconDotsVertical
                                style={{ width: "70%", height: "70%" }}
                                stroke={1.5}
                              />
                            </ActionIcon>
                          </MenuTarget>
                          <MenuDropdown>
                            <MenuItem
                              leftSection={
                                <IconSearch style={{ width: 16, height: 16 }} />
                              }
                              onClick={async (e) => {
                                setSearchText(null);
                                setSearchedText(note.text);
                              }}
                            >
                              Search for Similar Notes
                            </MenuItem>
                          </MenuDropdown>
                        </Menu>
                      ) : (
                        <ActionIcon variant="subtle" />
                      )}
                      <Text
                        id={`note-${index}`}
                        onBlur={async (e) => {
                          const newNoteText = (e.target as HTMLElement)
                            .innerText;

                          if (newNoteText === "") {
                            // Delete the note
                            const newNotes = [...notes];
                            newNotes.splice(index, 1);
                            setNotes(newNotes);

                            const { error } = await supabaseClient!
                              .from("Notes")
                              .delete()
                              .eq("id", note.id);

                            if (error) {
                              console.log(error);
                            }
                          }

                          // Update note in database
                          const { data } = await supabaseClient!
                            .from("Notes")
                            .select("id")
                            .eq("id", note.id);

                          if (data && data.length) {
                            let embedding = null;
                            const embeddingResponse = await fetch(
                              `/embed?text=${encodeURIComponent(newNoteText)}`,
                            );
                            embedding = await embeddingResponse.json();

                            const { error } = await supabaseClient!
                              .from("Notes")
                              .update({ text: newNoteText, embedding })
                              .eq("id", note.id);

                            if (!error) {
                              const newNotes = [...notes];
                              newNotes[index] = {
                                id: note.id,
                                text: newNoteText,
                              };
                              setNotes(newNotes);
                            }
                          }
                        }}
                      >
                        {note.text}
                      </Text>
                    </Group>
                  );
                })}
              </Stack>
            </Paper>
          </Container>
        </AppShellMain>
      </AppShell>
      <Modal opened={alertOpened} onClose={closeAlert} withCloseButton={false}>
        <Alert
          variant="light"
          color="indigo"
          title="Duplicate Note"
          icon={<IconInfoCircle size={16} />}
        >
          The note you are trying to add is already in the current notespace.
        </Alert>
      </Modal>
    </main>
  );
}
