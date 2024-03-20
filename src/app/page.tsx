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
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  Modal,
  NavLink,
  Paper,
  PasswordInput,
  Stack,
  Text,
  Textarea,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import {
  IconArticle,
  IconCalendar,
  IconClipboardText,
  IconDots,
  IconInfoCircle,
  IconMoon,
  IconPlus,
  IconSearch,
  IconStack2,
  IconSun,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import "./style.css";

export default function Dashboard() {
  // Notes state
  const [notes, setNotes] = useState<{ id: any; text: any }[]>([]);

  // Note space states
  const [noteSpaces, setNoteSpaces] = useState<{ id: any; name: string }[]>([]);
  const [activeNoteSpace, setActiveNoteSpace] = useState<{
    id: any;
    name: string;
  } | null>(null);
  const [hoveredNoteSpaceId, setHoveredNoteSpaceId] = useState<Number | null>(
    null,
  );

  // Note navigation and filtering states
  const [searchedText, setSearchedText] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("dark", {
    getInitialValueInEffect: true,
  });

  const [opened, { close }] = useDisclosure(true);
  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },
  });

  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient>();

  // Dashboard refs
  const editableNoteRef = useRef<HTMLDivElement>(null);

  // Alert disclosure for notifying user of duplicate note creation
  const [alertOpened, { open: openAlert, close: closeAlert }] =
    useDisclosure(false);

  // Fetch initial note spaces
  useEffect(() => {
    const fetchNoteSpaces = async () => {
      if (supabaseClient) {
        const { data, error } = await supabaseClient
          .from("Searches")
          .select("id, name")
          .order("created_at", { ascending: true });

        if (error) console.log(error);
        if (data) {
          setNoteSpaces(data);
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
      if (activeNoteSpace?.id && supabaseClient) {
        let query = supabaseClient
          .from("Note to Note Space")
          .select("id, Notes (id, text)")
          .eq("note_space_id", activeNoteSpace.id);

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

    if (activeNoteSpace) {
      fetchNotesWithinNoteSpaceWithDates();
    } else {
      fetchAllNotesWithDates();
    }
  }, [startDate, endDate, activeNoteSpace, searchedText, supabaseClient]);

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
        match_count: 100,
        match_note_space_id: activeNoteSpace?.id,
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
  }, [searchedText, activeNoteSpace, startDate, endDate, supabaseClient]);

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
      <AppShell navbar={{ width: 270, breakpoint: "xs" }} padding="md">
        <AppShellNavbar p="md" className="navbar">
          <NavLink
            p={0}
            mt={4}
            styles={{ children: { paddingLeft: 4, paddingTop: 8 } }}
            className="bg-accent"
            label={
              <Flex align="center">
                <Image
                  className="light-only"
                  src="/notesearch-logo.png"
                  alt="NoteSearch Logo"
                  width={125}
                  height={25}
                  priority
                />
                <Image
                  className="dark-only"
                  src="/notesearch-logo-dark.png"
                  alt="NoteSearch Logo"
                  width={125}
                  height={25}
                  priority
                />
              </Flex>
            }
          >
            <NavLink
              mt={6}
              p={0}
              leftSection={<IconUser size={16} />}
              style={{ cursor: "default" }}
              className="navlink-disabled"
              label={<Text size="sm">Jesse Cui</Text>}
            />
            <Divider my={8} />
            <NavLink
              p={0}
              leftSection={
                <>
                  <IconSun size={16} className="light-only" />
                  <IconMoon size={16} className="dark-only" />
                </>
              }
              className="navlink"
              onClick={() => {
                if (computedColorScheme == "light") {
                  setColorScheme("dark");
                } else {
                  setColorScheme("light");
                }
              }}
              label={<Text size="sm">Change Appearance</Text>}
              mb={8}
            />
          </NavLink>
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
              />
              <DatePickerInput
                leftSection={<IconCalendar size={16} />}
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                valueFormat="M/D/YYYY"
                clearable
              />
            </Stack>
            <Stack gap={4} mt={8}>
              <Text>Saved Searches</Text>
              <Text
                className={
                  activeNoteSpace == null ? "navlink-selected" : "navlink"
                }
                fw={600}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
                onClick={async () => {
                  if (activeNoteSpace != null) {
                    setNotes([]);
                  }
                  setSearchedText(null);
                  setActiveNoteSpace(null);
                }}
              >
                <IconStack2 size={16} />
                All Notes
              </Text>
              {noteSpaces.map((notespace) => (
                <Flex
                  key={notespace.id}
                  justify="space-between"
                  align="center"
                  h="25px"
                  onMouseEnter={() => setHoveredNoteSpaceId(notespace.id)}
                  onMouseLeave={() => setHoveredNoteSpaceId(null)}
                >
                  <Text
                    className={
                      notespace.id == activeNoteSpace?.id
                        ? "navlink-selected"
                        : "navlink"
                    }
                    fw={600}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (activeNoteSpace?.id != notespace.id) {
                        setNotes([]);
                      }
                      setSearchedText(null);
                      setActiveNoteSpace(notespace);
                    }}
                  >
                    <IconClipboardText size={16} />
                    {notespace.name}
                  </Text>
                  {hoveredNoteSpaceId === notespace.id && (
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
                              .eq("id", notespace.id);

                            if (!error) {
                              if (activeNoteSpace?.id == notespace.id) {
                                setActiveNoteSpace(null);
                              }
                              setNoteSpaces(
                                noteSpaces.filter(
                                  (notespace2) =>
                                    notespace2.id !== notespace.id,
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
        <AppShellMain className="bg-main">
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
                  setNotes([]);
                  setSearchedText(textToSearch);
                }
              }}
            />
            <Paper
              radius={4}
              withBorder
              px={48}
              py={36}
              h={"90%"}
              style={{ overflow: "auto" }}
              className="bg-main custom-scrollbar"
            >
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
                    noteSpaces.find(
                      (notespace) => notespace.name === noteSpaceName,
                    )
                  ) {
                    (e.target as HTMLElement).innerText =
                      activeNoteSpace?.name as string;
                    return;
                  }

                  const embeddingResponse = await fetch(
                    `/embed?text=${encodeURIComponent(noteSpaceName)}`,
                  );
                  const embedding = await embeddingResponse.json();

                  const { error } = await supabaseClient!
                    .from("Queries")
                    .update({ name: noteSpaceName, embedding: embedding })
                    .eq("id", activeNoteSpace?.id);

                  if (error) {
                    console.log(error);
                    return;
                  }
                  setActiveNoteSpace({
                    id: activeNoteSpace?.id,
                    name: noteSpaceName,
                  });
                  setNoteSpaces(
                    noteSpaces.map((notespace) => {
                      if (notespace.id === activeNoteSpace?.id) {
                        return {
                          id: activeNoteSpace?.id,
                          name: noteSpaceName,
                        };
                      } else {
                        return notespace;
                      }
                    }),
                  );
                }}
                suppressContentEditableWarning
              >
                {activeNoteSpace ? activeNoteSpace.name : "All Notes"}
              </Text>
              {searchedText && (
                <Box>
                  <Text
                    mb={4}
                    fw={500}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {" "}
                    <IconSearch size={16} />
                    Searched Text:
                  </Text>
                  <Text>{searchedText}</Text>
                  <Divider my={24} />
                </Box>
              )}

              {searchedText && (
                <Text
                  mb={4}
                  fw={500}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <IconArticle size={16} />
                  Related Notes:
                </Text>
              )}
              <Stack>
                {notes.map((note, index) => {
                  const textComponent = (
                    <Text
                      id={`note-${index}`}
                      className={"text-box-view"}
                      onBlur={async (e) => {
                        const newNoteText = (e.target as HTMLElement).innerText;

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
                  );
                  return (
                    <Menu offset={0} position="right" key={index}>
                      <MenuTarget>{textComponent}</MenuTarget>
                      <MenuDropdown>
                        <MenuItem
                          leftSection={
                            <IconSearch style={{ width: 16, height: 16 }} />
                          }
                          onClick={async (e) => {
                            setActiveNoteSpace(null);
                            setSearchedText(note.text);
                          }}
                        >
                          Search for Similar Notes
                        </MenuItem>
                      </MenuDropdown>
                    </Menu>
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
