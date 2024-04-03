"use client";

import {
  ActionIcon,
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  Box,
  Burger,
  Button,
  Center,
  Container,
  Flex,
  Group,
  Loader,
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  Modal,
  Paper,
  PasswordInput,
  Skeleton,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { useMantineTheme } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useMediaQuery } from "@mantine/hooks";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import {
  IconCalendar,
  IconClipboardText,
  IconCopy,
  IconDots,
  IconDotsVertical,
  IconPin,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Dashboard() {
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient>();
  const theme = useMantineTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [notes, setNotes] = useState<
    { id: number; text: string; date: string; score?: number }[] | null
  >([]);
  const [savedSearches, setSavedSearches] = useState<
    { id: any; text: string }[]
  >([]);

  const [hoveredNoteTitle, setHoveredNoteTitle] = useState<boolean>(false);
  const [hoveredNoteSearchId, setHoveredNoteSearchId] = useState<Number | null>(
    null,
  );
  const [hoveredNoteId, setHoveredNoteId] = useState<Number | null>(null);

  const [search, setSearch] = useState<{
    id: number | null;
    text: string;
  } | null>(null);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [authFormOpened, { close: closeAuthForm }] = useDisclosure(true);
  const loginForm = useForm({
    initialValues: {
      password: "",
    },
  });

  const [navbarOpened, { toggle: toggleNavbar }] = useDisclosure();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`);

  const pageSize = 100;
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastNoteElementRef = useCallback(
    (node: Element | null) => {
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [hasMore],
  );

  // Fetch notes
  useEffect(() => {
    const searchNotes = async () => {
      if (!supabaseClient || !search) {
        return;
      }

      setLoading(true);

      const embeddingResponse = await fetch(
        `/embed?text=${encodeURIComponent(search.text)}`,
      );
      const { embedding } = await embeddingResponse.json();

      const { data, error } = await supabaseClient.rpc("match_notes", {
        search_embedding: embedding,
        score_minimum: 0.7,
        page: page,
        page_size: pageSize,
        match_start: startDate?.toISOString(),
        match_end: endDate?.toISOString(),
      });      
      
      if (data) {
        setNotes((prevNotes) => (prevNotes ? [...prevNotes, ...data] : data));
        setHasMore(data.length === pageSize);
      }

      if (error) {
        console.log(error);
      }

      setLoading(false);
    };

    const getAllNotes = async () => {
      if (!supabaseClient) {
        return;
      }

      setLoading(true);

      let query = supabaseClient
        .from("Notes")
        .select("id, text, date")
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (startDate) {
        const formattedStartDate = startDate.toISOString();
        query = query.gte("date", formattedStartDate);
      }

      if (endDate) {
        const formattedEndDate = new Date(
          new Date(endDate).setDate(endDate.getDate() + 1),
        ).toISOString();
        query = query.lte("date", formattedEndDate);
      }

      query = query.order("date", { ascending: false });

      const { data, error } = await query;

      if (data) {
        setNotes((prevNotes) => (prevNotes ? [...prevNotes, ...data] : data));
        setHasMore(data.length === pageSize);
      }

      if (error) {
        console.log(error);
      }

      setLoading(false);
    };

    if (search) {
      searchNotes();
    } else {
      getAllNotes();
    }
  }, [startDate, endDate, search, supabaseClient, page]);

  // Clear existing notes on search change
  useEffect(() => {
    setNotes(null);
    setPage(0);
    setHasMore(true);    
  }, [searchParams]);

  // Update search state query param change
  useEffect(() => {
    const searchTextFromQueryParam = searchParams.get("search");
    if (searchTextFromQueryParam) {
      const searchId = savedSearches.find(
        (search) => search.text === searchTextFromQueryParam,
      )?.id;
      setSearch({ id: searchId, text: searchTextFromQueryParam });
    } else {
      setSearch(null);
    }
  }, [searchParams, savedSearches]);

  // Fetch saved searches
  useEffect(() => {
    const fetchSavedSearches = async () => {
      if (supabaseClient) {
        const { data, error } = await supabaseClient
          .from("Searches")
          .select("id, text")
          .order("date", { ascending: false });

        if (error) console.log(error);
        if (data) {
          setSavedSearches(data);
        }
      }
    };
    fetchSavedSearches();
  }, [supabaseClient]);

  function formatTimestamp(timestampString: string) {
    const date = new Date(timestampString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <main>
      <Modal
        opened={authFormOpened}
        onClose={closeAuthForm}
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
          onSubmit={loginForm.onSubmit(async ({ password }) => {
            const response = await fetch(
              `/verify-login?password=${encodeURIComponent(password)}`,
            );
            const { verified, supabaseCredentials } = await response.json();

            if (verified) {
              setSupabaseClient(
                createClient(
                  supabaseCredentials.supabaseUrl,
                  supabaseCredentials.supabaseKey,
                ),
              );
              closeAuthForm();
            } else {
              loginForm.setErrors({
                password: "Invalid password",
              });
            }
          })}
        >
          <PasswordInput
            label="Password"
            placeholder="********"
            {...loginForm.getInputProps("password")}
            mt={8}
          />
          <Center mt={24}>
            <Button type="submit">Log In</Button>
          </Center>
        </form>
      </Modal>
      <AppShell
        header={{
          height: 48,
          collapsed: !isMobile,
        }}
        navbar={{
          width: 285,
          breakpoint: "xs",
          collapsed: { mobile: !navbarOpened },
        }}
        padding="md"
      >
        <AppShellHeader px="md" display="flex" style={{ alignItems: "center" }}>
          <Burger
            opened={navbarOpened}
            onClick={toggleNavbar}
            hiddenFrom="sm"
            size="sm"
            mr={8}
          />
          <Image
            src="/notesearch-logo.png"
            alt="NoteSearch Logo"
            width={125}
            height={25}
            priority
          />
        </AppShellHeader>
        <AppShellNavbar p="md">
          <Flex
            align="center"
            mt={4}
            mb={32}
            onClick={async () => {
              router.push("/");
            }}
            style={{ cursor: "pointer" }}
            visibleFrom="xs"
          >
            <Image
              src="/notesearch-logo.png"
              alt="NoteSearch Logo"
              width={125}
              height={25}
              priority
            />
          </Flex>
          <Box style={{ overflow: "auto" }}>
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
            <Stack gap={8} mt={8}>
              <Text fz="sm" fw="500" c="dark.2">
                Saved Searches
              </Text>
              {savedSearches.map((savedSearch) => (
                <Flex
                  key={savedSearch.id}
                  justify="space-between"
                  align="center"
                  h="25px"
                  onMouseEnter={() => setHoveredNoteSearchId(savedSearch.id)}
                  onMouseLeave={() => setHoveredNoteSearchId(null)}
                  bg={
                    savedSearch.id == hoveredNoteSearchId ||
                    savedSearch.text === search?.text
                      ? "dark.6"
                      : "transparent"
                  }
                  style={{ borderRadius: 4, cursor: "pointer" }}
                >
                  <Flex
                    style={{ alignItems: "center", gap: 8 }}
                    onClick={() => {
                      router.push(
                        `/?search=${encodeURIComponent(savedSearch.text)}`,
                      );
                      if (isMobile) toggleNavbar();
                    }}
                  >
                    <IconClipboardText size={16} />
                    <Text
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: isMobile ? "75vw" : "200px",
                      }}
                    >
                      {savedSearch.text}
                    </Text>
                  </Flex>
                  {hoveredNoteSearchId === savedSearch.id && (
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
                            <IconCopy style={{ width: 16, height: 16 }} />
                          }
                          onClick={async () => {
                            await navigator.clipboard.writeText(
                              `${
                                process.env.NEXT_PUBLIC_SITE_DOMAIN
                              }/?search=${encodeURIComponent(
                                savedSearch.text,
                              )}`,
                            );
                            setHoveredNoteSearchId(null);
                          }}
                        >
                          Copy link
                        </MenuItem>
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
          <Container
            h={`calc(100vh - ${isMobile ? 8 : 7.5}em)`}
            w={isMobile ? "100%" : 768}
            px={0}
          >
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
              mb={isMobile ? 16 : 32}
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
              h={"100%"}
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
                {hoveredNoteTitle && search ? (
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
                      {savedSearches.every(
                        (savedSearch) => savedSearch.text !== search.text,
                      ) && (
                        <MenuItem
                          leftSection={
                            <IconPin style={{ width: 16, height: 16 }} />
                          }
                          onClick={async (e) => {
                            const { data, error } = await supabaseClient!
                              .from("Searches")
                              .insert({
                                text: search.text,
                              })
                              .select("id")
                              .single();

                            if (error) {
                              console.log(error);
                              return;
                            }

                            setSavedSearches([
                              { id: data.id, text: search.text },
                              ...savedSearches,
                            ]);
                            setHoveredNoteTitle(false);
                          }}
                        >
                          Save Search
                        </MenuItem>
                      )}
                      <MenuItem
                        leftSection={
                          <IconCopy style={{ width: 16, height: 16 }} />
                        }
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            `${
                              process.env.NEXT_PUBLIC_SITE_DOMAIN
                            }/?search=${encodeURIComponent(search.text)}`,
                          );
                          setHoveredNoteTitle(false);
                        }}
                      >
                        Copy link
                      </MenuItem>
                    </MenuDropdown>
                  </Menu>
                ) : (
                  <ActionIcon
                    variant="transparent"
                    style={{ cursor: search ? "pointer" : "default" }}
                  />
                )}
                <Text size="lg" fw={500} mb={24}>
                  {search ? search.text : "All Notes"}
                </Text>
              </Group>
              <Stack>
                {notes ? (
                  <>
                    {notes.map((note, index) => {
                      return (
                        <Group
                          key={note.id}
                          ref={
                            notes.length === index + 1
                              ? lastNoteElementRef
                              : null
                          }
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
                                    <IconSearch
                                      style={{ width: 16, height: 16 }}
                                    />
                                  }
                                  onClick={async (e) => {
                                    router.push(
                                      `/?search=${encodeURIComponent(
                                        note.text,
                                      )}`,
                                    );
                                  }}
                                >
                                  Search for similar notes
                                </MenuItem>
                                <Menu.Divider />
                                <Stack px={12} pt={4} pb={2} gap={2}>
                                  {note.score && (
                                    <Text size="xs" fw="500" c="dark.2">
                                      Similarity score: {note.score.toFixed(3)}
                                    </Text>
                                  )}
                                  <Text size="xs" fw="500" c="dark.2">
                                    Created: {formatTimestamp(note.date)}
                                  </Text>
                                </Stack>
                              </MenuDropdown>
                            </Menu>
                          ) : (
                            <ActionIcon variant="subtle" />
                          )}
                          <Text>{note.text}</Text>
                        </Group>
                      );
                    })}
                    {loading && (
                      <Center>
                        <Loader color="dark.2" />
                      </Center>
                    )}
                  </>
                ) : (
                  <Stack gap={32}>
                    <Stack gap={8}>
                      <Skeleton
                        ml={48}
                        w={isMobile ? "calc(100vw - 128px)" : 660}
                        h="16"
                      />
                      <Skeleton
                        ml={48}
                        w={isMobile ? "calc(100vw - 128px)" : 660}
                        h="16"
                      />
                      <Skeleton
                        ml={48}
                        w={isMobile ? "calc(0.5 * (100vw - 128px))" : 330}
                        h="16"
                      />
                    </Stack>
                    <Stack gap={8}>
                      <Skeleton
                        ml={48}
                        w={isMobile ? "calc(100vw - 128px)" : 660}
                        h="16"
                      />
                      <Skeleton
                        ml={48}
                        w={isMobile ? "calc(100vw - 128px)" : 660}
                        h="16"
                      />
                      <Skeleton
                        ml={48}
                        w={isMobile ? "calc(0.5 * (100vw - 128px))" : 330}
                        h="16"
                      />
                    </Stack>
                    <Stack gap={8}>
                      <Skeleton
                        ml={48}
                        w={isMobile ? "calc(100vw - 128px)" : 660}
                        h="16"
                      />
                      <Skeleton
                        ml={48}
                        w={isMobile ? "calc(100vw - 128px)" : 660}
                        h="16"
                      />
                      <Skeleton
                        ml={48}
                        w={isMobile ? "calc(0.5 * (100vw - 128px))" : 330}
                        h="16"
                      />
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Container>
        </AppShellMain>
      </AppShell>
    </main>
  );
}
