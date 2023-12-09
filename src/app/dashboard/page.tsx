"use client";

import {
  ActionIcon,
  AppShell,
  AppShellMain,
  AppShellNavbar,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  GridCol,
  Group,
  InputLabel,
  Menu,
  MenuDropdown,
  MenuTarget,
  NavLink,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Session } from "@supabase/supabase-js";
import {
  IconArrowBadgeRightFilled,
  IconCalendar,
  IconClipboardText,
  IconDots,
  IconEdit,
  IconLogout,
  IconPlaylistX,
  IconSearch,
  IconStack2,
  IconTextPlus,
  IconTrash,
  IconViewfinder,
} from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import supabaseClient from "../../supabase/supabaseClient";
import "./dashboard.css";

export default function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const editableNoteRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState<{ id: any; text: any }[]>([]);

  const [noteSpaceNotes, setNoteSpaceNotes] = useState<
    { id: any; text: any }[]
  >([]);

  const [searchedText, setSearchedText] = useState<string | null>(null);

  const [noteSpaces, setNoteSpaces] = useState<{ id: any; name: string }[]>([]);

  const [activeNoteSpace, setActiveNoteSpace] = useState<{
    id: any;
    name: string;
  } | null>(null);

  const [activeSideNoteSpace, setActiveSideNoteSpace] = useState<{
    id: any;
    name: string;
  } | null>(null);

  const caretPositionRef = useRef<number | null>(null);
  const notesRef = useRef(notes);
  const eventListenersSetRef = useRef<(boolean | null)[]>([]);
  const noteCreatorEventListenerSetRef = useRef(false);

  const [noteMode, setNoteMode] = useState<"view" | "edit">("edit");
  const [hoveredNoteSpaceId, setHoveredNoteSpaceId] = useState<Number | null>(
    null,
  );

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) console.log(error);
      else setSession(data.session);
      if (!data.session) {
        router.push("/");
      }
    };
    fetchSession();

    editableNoteRef.current?.focus();
  }, [router]);

  useEffect(() => {
    const fetchNotes = async () => {
      if (session?.user.id) {
        const { data, error } = await supabaseClient
          .from("Notes")
          .select("id, text")
          .eq("user_id", session?.user.id)
          .order("created_at", { ascending: false });

        if (error) console.log(error);
        else {
          setNotes(data);
        }
      }
    };
    fetchNotes();

    const fetchNoteSpaces = async () => {
      if (session?.user.id) {
        const { data, error } = await supabaseClient
          .from("Notespaces")
          .select("id, name")
          .eq("user_id", session?.user.id)
          .order("created_at", { ascending: false });

        if (error) console.log(error);
        else {
          setNoteSpaces(data);
        }
      }
    };
    fetchNoteSpaces();
  }, [session]);

  useEffect(() => {
    const fetchNoteSpaceNotes = async () => {
      if (activeSideNoteSpace?.id && session?.user.id) {
        const { data, error } = await supabaseClient
          .from("Note to Notespace")
          .select("id, Notes (id, text)")
          .eq("user_id", session?.user.id)
          .eq("notespace_id", activeSideNoteSpace.id)
          .order("created_at", { ascending: false });

        if (error) console.log(error);
        else {
          const notes: { id: any; text: any }[] = data.flatMap((note) => {
            return note.Notes;
          });
          setNoteSpaceNotes(notes);
        }
      } else {
        setNoteSpaceNotes([]);
      }
    };
    fetchNoteSpaceNotes();
  }, [activeSideNoteSpace, session]);

  useEffect(() => {
    const fetchNoteSpaceNotes = async () => {
      if (activeNoteSpace?.id && session?.user.id) {
        const { data, error } = await supabaseClient
          .from("Note to Notespace")
          .select("id, Notes (id, text)")
          .eq("user_id", session?.user.id)
          .eq("notespace_id", activeNoteSpace.id)
          .order("created_at", { ascending: false });

        if (error) console.log(error);
        else {
          const notes: { id: any; text: any }[] = data.flatMap((note) => {
            return note.Notes;
          });
          setNotes(notes);
        }
      } else {
        if (session?.user.id) {
          const { data, error } = await supabaseClient
            .from("Notes")
            .select("id, text")
            .eq("user_id", session?.user.id)
            .order("created_at", { ascending: false });

          if (error) console.log(error);
          else {
            setNotes(data);
          }
        }
      }
    };
    fetchNoteSpaceNotes();
  }, [activeNoteSpace, session]);

  useEffect(() => {
    if (startDate || endDate) {
      const fetchNotes = async () => {
        if (session?.user.id) {
          let query = supabaseClient
            .from("Notes")
            .select("id, text")
            .eq("user_id", session?.user.id);

          if (startDate) {
            const formattedStartDate = startDate.toISOString();
            query = query.gte("created_at", formattedStartDate);
          }

          if (endDate) {
            const formattedEndDate = endDate.toISOString();
            query = query.lte("created_at", formattedEndDate);
          }

          query = query.order("created_at", { ascending: false });

          const { data, error } = await query;

          if (error) console.log(error);
          else {
            setNotes(data);
          }
        }
      };

      const fetchNotesWithinNoteSpace = async () => {
        if (activeNoteSpace?.id && session?.user.id) {
          let query = supabaseClient
            .from("Note to Notespace")
            .select("id, Notes (id, text)")
            .eq("user_id", session?.user.id)
            .eq("notespace_id", activeNoteSpace.id);

          if (startDate) {
            const formattedStartDate = startDate.toISOString();
            query = query.gte("created_at", formattedStartDate);
          }

          if (endDate) {
            const formattedEndDate = endDate.toISOString();
            query = query.lte("created_at", formattedEndDate);
          }

          query = query.order("created_at", { ascending: false });

          const { data, error } = await query;

          if (error) console.log(error);
          else {
            const notes: { id: any; text: any }[] = data.flatMap((note) => {
              return note.Notes;
            });
            setNotes(notes);
          }
        }
      };

      if (activeNoteSpace) {
        fetchNotesWithinNoteSpace();
      } else {
        fetchNotes();
      }
    }
  }, [startDate, endDate, session, activeNoteSpace]);

  useEffect(() => {
    function isCursorInFirstLine(element: HTMLElement) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return false;

      let range = selection.getRangeAt(0);

      const rangeRect = range.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      const threshold = 10; // pixels from the top of the element
      return rangeRect.top - elementRect.top <= threshold;
    }

    function isCursorInLastLine(element: HTMLElement) {
      if (element.textContent!.length === 0) {
        return true;
      }

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return false;

      const range = selection.getRangeAt(0);
      const rangeRect = range.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      const threshold = 10; // pixels from the bottom of the element
      return elementRect.bottom - rangeRect.bottom <= threshold;
    }

    function getCaretHorizontalPosition() {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return null;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      return rect.left;
    }

    function setCaretToFirstLineAtPosition(
      element: HTMLElement,
      horizontalPosition: number,
    ) {
      // Ensure the element is a paragraph and contentEditable
      if (element.tagName !== "P" || !element.isContentEditable) {
        console.error("Element is not a contentEditable <p> tag.");
        return;
      }

      if (element.textContent!.length === 0) {
        element.focus();
        return;
      }

      // Create a range and selection object
      const range = document.createRange();
      const sel = window.getSelection();
      sel!.removeAllRanges();

      // Determine the top of the element's bounding box
      const elementRect = element.getBoundingClientRect();
      const elementTop = elementRect.top;

      // Variables to store the position closest to the horizontal position on the first line
      let closestPosition = 0;
      let closestDistance = Number.MAX_VALUE;
      let isFirstLineProcessed = false;

      for (let i = 0; i < element.textContent!.length; i++) {
        range.setStart(element.firstChild!, i);
        range.setEnd(element.firstChild!, i + 1);

        // Get the rectangle for the current character
        const rect = range.getBoundingClientRect();

        // Check if the current character is on the first line
        if (rect.top <= elementTop + rect.height) {
          const distanceToLeft = Math.abs(rect.left - horizontalPosition);
          const distanceToRight = Math.abs(rect.right - horizontalPosition);

          // Determine if the left or right edge is closer
          if (
            distanceToLeft < closestDistance ||
            distanceToRight < closestDistance
          ) {
            closestDistance = Math.min(distanceToLeft, distanceToRight);
            closestPosition = i;
            // If the right side is closer, place the cursor after the character
            if (distanceToRight < distanceToLeft) {
              closestPosition += 1;
            }
          }
        } else if (isFirstLineProcessed) {
          break;
        }
      }

      // Set the caret to the closest position on the first line
      range.setStart(element.firstChild!, closestPosition);
      range.collapse(true);
      sel!.addRange(range);
    }

    function setCaretToLastLineAtPosition(
      element: HTMLElement,
      horizontalPosition: number,
    ) {
      // Ensure the element is a paragraph and contentEditable
      if (element.tagName !== "P" || !element.isContentEditable) {
        console.error("Element is not a contentEditable <p> tag.");
        return;
      }

      // Create a range and selection object
      const range = document.createRange();
      const sel = window.getSelection();
      sel!.removeAllRanges();

      // If the element has no text, set the cursor at the start
      if (element.textContent!.length === 0) {
        range.setStart(element, 0);
        range.collapse(true);
        sel!.addRange(range);
        return;
      }

      // Determine the bottom of the element's bounding box
      const elementRect = element.getBoundingClientRect();
      const elementBottom = elementRect.bottom;

      // Variables to store the position closest to the horizontal position on the last line
      let closestPosition = 0;
      let closestDistance = Number.MAX_VALUE;
      let isLastLineReached = false;

      for (let i = 0; i < element.textContent!.length; i++) {
        range.setStart(element.firstChild!, i);
        range.setEnd(element.firstChild!, i + 1);

        // Get the rectangle for the current character
        const rect = range.getBoundingClientRect();

        // Check if we have reached the last line
        if (rect.bottom >= elementBottom - rect.height) {
          const distanceToLeft = Math.abs(rect.left - horizontalPosition);
          const distanceToRight = Math.abs(rect.right - horizontalPosition);

          // Determine if the left or right edge is closer
          if (
            distanceToLeft < closestDistance ||
            distanceToRight < closestDistance
          ) {
            closestDistance = Math.min(distanceToLeft, distanceToRight);
            closestPosition = i;
            // If the right side is closer, place the cursor after the character
            if (distanceToRight < distanceToLeft) {
              closestPosition += 1;
            }
          }
        } else if (isLastLineReached) {
          break;
        }
      }

      // Set the caret to the closest position on the last line
      range.setStart(element.firstChild!, closestPosition);
      range.collapse(true);
      sel!.addRange(range);
    }

    function isCursorAtEnd(element: HTMLElement) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return false;

      const range = selection.getRangeAt(0);
      if (!range.collapsed) return false; // Ensure the range is a single point (caret)

      // Check if the caret is at the end of the element's content
      return range.endOffset === element.textContent!.length;
    }

    function isCursorAtStart(element: HTMLElement) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return false;

      const range = selection.getRangeAt(0);
      if (!range.collapsed) return false; // Ensure the range is a single point (caret)

      // Check if the caret is at the start of the element's content
      return range.startOffset === 0;
    }

    function setCaretToStartPosition(element: HTMLElement) {
      // Create a range and selection object
      const range = document.createRange();
      const sel = window.getSelection();
      sel!.removeAllRanges();

      // Set the caret to the start of the element
      range.setStart(element.firstChild!, 0);
      range.collapse(true);
      sel!.addRange(range);
    }

    function setCaretToEndPosition(element: HTMLElement) {
      // Create a range and selection object
      const range = document.createRange();
      const sel = window.getSelection();
      sel!.removeAllRanges();

      // If the element has no text, set the cursor at the start
      if (element.textContent!.length === 0) {
        range.setStart(element, 0);
        range.collapse(true);
        sel!.addRange(range);
        return;
      }

      // Set the caret to the end of the element
      range.setStart(element.firstChild!, element.textContent!.length);
      range.collapse(true);
      sel!.addRange(range);
    }

    async function handleKeyDown(event: KeyboardEvent, index: number) {
      const currentElement = event.target as HTMLElement;
      if (event.key === "ArrowDown" && index < notes.length - 1) {
        const cursorInLastLine = isCursorInLastLine(currentElement);
        if (cursorInLastLine) {
          event.preventDefault(); // Prevent moving to next line in the same element

          const horizontalPos = getCaretHorizontalPosition() as number;
          const nextElement = document.getElementById(
            `note-${index + 1}`,
          ) as HTMLElement;
          nextElement.focus();
          setCaretToFirstLineAtPosition(nextElement, horizontalPos);
        }
      } else if (event.key === "ArrowUp" && index >= 0) {
        const cursorInFirstLine = isCursorInFirstLine(currentElement);
        if (cursorInFirstLine) {
          event.preventDefault(); // Prevent moving to previous line in the same element

          const horizontalPos = getCaretHorizontalPosition() as number;
          let previousElement: HTMLElement;
          if (index === 0) {
            previousElement = document.getElementById(
              `note-creator`,
            ) as HTMLElement;
          } else {
            previousElement = document.getElementById(
              `note-${index - 1}`,
            ) as HTMLElement;
          }

          if (previousElement) {
            previousElement.focus();
            setCaretToLastLineAtPosition(previousElement, horizontalPos);
          } else {
            setCaretToStartPosition(currentElement);
          }
        }
      }
      // Handle Right Arrow Key
      else if (event.key === "ArrowRight") {
        const cursorAtEnd = isCursorAtEnd(currentElement);
        if (cursorAtEnd && index < notes.length - 1) {
          event.preventDefault(); // Prevent moving to next character in the same element

          const nextElement = document.getElementById(
            `note-${index + 1}`,
          ) as HTMLElement;
          nextElement.focus();
          setCaretToStartPosition(nextElement);
        }
      }
      // Handle Left Arrow Key
      else if (event.key === "ArrowLeft") {
        const cursorAtStart = isCursorAtStart(currentElement);
        if (cursorAtStart && index >= 0) {
          event.preventDefault(); // Prevent moving to previous character in the same element

          let previousElement: HTMLElement;
          if (index === 0) {
            previousElement = document.getElementById(
              `note-creator`,
            ) as HTMLElement;
          } else {
            previousElement = document.getElementById(
              `note-${index - 1}`,
            ) as HTMLElement;
          }
          if (previousElement) {
            previousElement.focus();
            setCaretToEndPosition(previousElement);
          }
        }
      }

      if (event.metaKey && event.key === "ArrowRight") {
        setTimeout(() => {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (range.collapsed) {
              // When the range is collapsed, it represents the caret position
              const caretPosition = range.startOffset;

              // Check if the caret is not at the end
              if (caretPosition < currentElement.textContent!.length) {
                range.setStart(currentElement.firstChild!, caretPosition - 1);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
              }
            }
          }
        }, 0);
      }

      if (event.key === "Enter") {
        event.preventDefault();
      }

      if (event.key === "Backspace") {
        if (currentElement.textContent!.length === 0) {
          event.preventDefault();

          if (index >= 0) {
            let previousElement: HTMLElement;
            if (index === 0) {
              previousElement = document.getElementById(
                `note-creator`,
              ) as HTMLElement;
            } else {
              previousElement = document.getElementById(
                `note-${index - 1}`,
              ) as HTMLElement;
            }
            if (previousElement) {
              previousElement.focus();
              caretPositionRef.current = previousElement.textContent!.length;
            }

            // Delete note from notes state
            const newNotes = [...notes];
            newNotes.splice(index, 1);
            setNotes(newNotes);

            // Delete from supabase
            await supabaseClient
              .from("Notes")
              .delete()
              .eq("id", notes[index].id);
          }
        }
      }
    }

    notes.forEach((_, index) => {
      const contentEditableDiv = document.getElementById(`note-${index}`);

      if (contentEditableDiv) {
        contentEditableDiv.removeEventListener("keydown", (e) =>
          handleKeyDown(e, index),
        );
        contentEditableDiv.addEventListener("keydown", (e) =>
          handleKeyDown(e, index),
        );
        eventListenersSetRef.current[index] = true;
      }
    });

    const noteCreator = document.getElementById("note-creator");
    if (noteCreator) {
      noteCreator.removeEventListener("keydown", (e) => handleKeyDown(e, -1));
      noteCreator.addEventListener("keydown", (e) => {
        handleKeyDown(e, -1);
      });
      noteCreatorEventListenerSetRef.current = true;
    }

    // Cleanup function
    return () => {
      // Remove event listeners from all notes
      notes.forEach((_, index) => {
        const contentEditableDiv = document.getElementById(`note-${index}`);
        if (contentEditableDiv) {
          contentEditableDiv.removeEventListener("keydown", (e) =>
            handleKeyDown(e, index),
          );
        }
      });
      const noteCreator = document.getElementById("note-creator");
      if (noteCreator) {
        noteCreator.removeEventListener("keydown", (e) => {
          handleKeyDown(e, -1);
        });
      }
    };
  }, [notes, searchedText]);

  const debounce = useCallback(
    <T extends (...args: any[]) => void>(func: T, wait: number) => {
      let timeout: NodeJS.Timeout | undefined;

      return function executedFunction(...args: any[]) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
    [],
  );

  const debouncedUpdateNote = useRef(
    debounce(async (index, noteId, newNoteText) => {
      const newNotes = [...notesRef.current];
      newNotes[index] = { id: noteId, text: newNoteText };

      const { data } = await supabaseClient
        .from("Notes")
        .select("id")
        .eq("id", noteId);

      if (data && data.length) {
        const embeddingResponse = await fetch(
          `/embed?text=${encodeURIComponent(newNoteText)}`,
        );
        const embedding = await embeddingResponse.json();

        const { error } = await supabaseClient
          .from("Notes")
          .update({ text: newNoteText, embedding })
          .eq("id", noteId);

        if (!error) {
          setNotes(newNotes);
        }
      }
    }, 1000),
  ).current;

  // Update caret position after note state gets changed on debounce
  useEffect(() => {
    if (caretPositionRef.current !== null) {
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement as HTMLElement).contentEditable === "true"
      ) {
        const range = document.createRange();
        const selection = window.getSelection();
        if (!activeElement.firstChild) {
          range.setStart(activeElement, 0);
        } else {
          range.setStart(activeElement.firstChild, caretPositionRef.current);
        }

        range.collapse(true);
        selection!.removeAllRanges();
        selection!.addRange(range);
      }
    }
  }, [notes]); // Dependency on notes state to trigger after update

  return (
    <AppShell navbar={{ width: 240, breakpoint: "xs" }} padding="md">
      <AppShellNavbar p="md" bg="#F9FBFD">
        <NavLink
          p={0}
          styles={{ children: { paddingLeft: 4, paddingTop: 8 } }}
          label={
            <Flex align="center">
              <Image
                src="/crux-logo.png"
                alt="Crux Logo"
                width={75}
                height={25}
                priority
              />
            </Flex>
          }
        >
          <Text
            mt={6}
            size="sm"
            c="#5F6D7E"
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            {session?.user.email}
          </Text>
          <Divider my={8} />
          <NavLink
            p={0}
            leftSection={<IconLogout color="#5F6D7E" size={16} />}
            label={
              <Text
                c="#5F6D7E"
                size="sm"
                onClick={async () => {
                  await supabaseClient.auth.signOut();
                  router.push("/");
                }}
              >
                Log Out
              </Text>
            }
          />
        </NavLink>
        <Box mt={32}>
          <Text size="lg" fw="500" mb={8}>
            Note Spaces
          </Text>
          <Stack gap={4}>
            <Text
              c={activeNoteSpace == null ? "#282E36" : "#5F6D7E"}
              fw={600}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
              }}
              onClick={async () => {
                setActiveNoteSpace(null);
                setSearchedText(null);
                setStartDate(null);
                setEndDate(null);
                if (session?.user.id) {
                  const { data, error } = await supabaseClient
                    .from("Notes")
                    .select("id, text")
                    .eq("user_id", session?.user.id)
                    .order("created_at", { ascending: false });

                  if (error) console.log(error);
                  else {
                    setNotes(data);
                  }
                }
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
                  c={
                    notespace.id == activeNoteSpace?.id ? "#282E36" : "#5F6D7E"
                  }
                  fw={600}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setActiveNoteSpace(notespace);
                    setSearchedText(null);
                    setStartDate(null);
                    setEndDate(null);
                  }}
                >
                  <IconClipboardText size={16} />
                  {notespace.name}
                </Text>
                {hoveredNoteSpaceId === notespace.id && (
                  <Menu offset={0} position="bottom-start">
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
                    <MenuDropdown bg="#F9FBFD">
                      <Menu.Item
                        leftSection={
                          <IconTrash style={{ width: 16, height: 16 }} />
                        }
                        onClick={async () => {
                          const { error } = await supabaseClient
                            .from("Notespaces")
                            .delete()
                            .eq("id", notespace.id);

                          if (!error) {
                            if (activeNoteSpace?.id == notespace.id) {
                              setActiveNoteSpace(null);
                            }
                            setNoteSpaces(
                              noteSpaces.filter(
                                (notespace2) => notespace2.id !== notespace.id,
                              ),
                            );
                          }
                        }}
                      >
                        Delete
                      </Menu.Item>
                    </MenuDropdown>
                  </Menu>
                )}
              </Flex>
            ))}
          </Stack>
        </Box>
      </AppShellNavbar>
      <AppShellMain>
        <Grid>
          <GridCol span={7}>
            <Container h={"95vh"}>
              <Textarea
                rows={1}
                autosize
                radius={8}
                placeholder="Semantic Search"
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
                    setActiveNoteSpace(null);
                    const textToSearch = (e.target as HTMLInputElement).value;

                    const embeddingResponse = await fetch(
                      `/embed?text=${encodeURIComponent(textToSearch)}`,
                    );
                    const embedding = await embeddingResponse.json();

                    const { data, error } = await supabaseClient.rpc(
                      "match_notes",
                      {
                        query_embedding: embedding,
                        match_threshold: 1.81,
                        match_count: 20,
                      },
                    );

                    setNotes(data);

                    (e.target as HTMLInputElement).value = "";
                    setSearchedText(textToSearch);
                  }
                }}
              />
              <Paper
                radius={8}
                withBorder
                px={48}
                py={36}
                h={"90%"}
                style={{ overflow: "auto" }}
                className="custom-scrollbar"
              >
                {searchedText ? (
                  <Box>
                    <Text mb={4} fw={500}>
                      Searched Text:
                    </Text>
                    <Text>{searchedText}</Text>
                    <Divider my={24} />
                  </Box>
                ) : (
                  <Text
                    id="notespace-title"
                    size="lg"
                    fw={500}
                    mb={16}
                    contentEditable={
                      noteMode === "edit" && activeNoteSpace != null
                    }
                    dangerouslySetInnerHTML={{
                      __html: activeNoteSpace
                        ? activeNoteSpace.name
                        : "All Notes",
                    }}
                    className="text-box-edit"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        editableNoteRef.current?.focus();
                      }
                    }}
                    onBlur={async (e) => {
                      const noteSpaceName = (e.target as HTMLElement).innerText;

                      const { data } = await supabaseClient
                        .from("Notespaces")
                        .select("id")
                        .eq("user_id", session?.user.id)
                        .eq("name", noteSpaceName);

                      if (data && data.length) {
                        (e.target as HTMLElement).innerText =
                          activeNoteSpace?.name as string;
                        return;
                      }

                      const { error } = await supabaseClient
                        .from("Notespaces")
                        .update({ name: noteSpaceName })
                        .eq("id", activeNoteSpace?.id);

                      if (!error) {
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
                      }
                    }}
                  />
                )}
                {!searchedText && !(noteMode === "view") && (
                  <Text
                    id="note-creator"
                    ref={editableNoteRef}
                    mb={16}
                    className="text-box-edit"
                    contentEditable
                    onKeyDown={async (e) => {
                      if (e.key == "Enter") {
                        e.preventDefault();

                        const noteText = editableNoteRef.current?.textContent;

                        if (noteText) {
                          editableNoteRef.current.textContent = "";

                          // TODO: Make notes state update instantaneous upon enter key press
                          const embeddingResponse = await fetch(
                            `/embed?text=${encodeURIComponent(noteText)}`,
                          );
                          const embedding = await embeddingResponse.json();

                          const { data, error } = await supabaseClient
                            .from("Notes")
                            .insert([{ text: noteText, embedding }])
                            .select();

                          if (!error) {
                            const { data: data2, error: error2 } =
                              await supabaseClient
                                .from("Note to Notespace")
                                .insert([
                                  {
                                    notespace_id: activeNoteSpace?.id,
                                    note_id: data[0].id,
                                  },
                                ]);
                            if (!error2) {
                              setNotes((notes) => [
                                { id: data[0].id, text: noteText },
                                ...notes,
                              ]);
                            }
                          }
                        }
                      }
                    }}
                  />
                )}
                {searchedText && (
                  <Text mb={4} fw={500}>
                    Related Notes:
                  </Text>
                )}
                <Stack>
                  {notes.map((note, index) => {
                    const textComponent = (
                      <Text
                        id={`note-${index}`}
                        contentEditable={noteMode === "edit"}
                        dangerouslySetInnerHTML={{ __html: note.text }}
                        className={
                          noteMode === "edit"
                            ? "text-box-edit"
                            : "text-box-view"
                        }
                        style={{
                          cursor: noteMode === "view" ? "pointer" : "text",
                        }}
                        onInput={(e) => {
                          const selection = window.getSelection();
                          if (selection!.rangeCount > 0) {
                            const range = selection!.getRangeAt(0);
                            const start = range.startOffset;

                            // Store the caret position in a ref
                            caretPositionRef.current = start;
                          }

                          const noteContent = (e.target as HTMLElement)
                            .innerText;
                          debouncedUpdateNote(index, note.id, noteContent);
                        }}
                      />
                    );
                    return noteMode === "view" ? (
                      <Menu offset={0} position="right" key={index}>
                        <MenuTarget>{textComponent}</MenuTarget>
                        <MenuDropdown bg="#F9FBFD">
                          {activeNoteSpace && (
                            <Menu.Item
                              leftSection={
                                <IconPlaylistX
                                  style={{ width: 16, height: 16 }}
                                />
                              }
                              onClick={async () => {
                                const { error } = await supabaseClient
                                  .from("Note to Notespace")
                                  .delete()
                                  .eq("notespace_id", activeNoteSpace?.id)
                                  .eq("note_id", note.id);

                                if (!error) {
                                  setNotes(
                                    notes.filter(
                                      (note2) => note2.id !== note.id,
                                    ),
                                  );
                                }
                              }}
                            >
                              Delete from {activeNoteSpace?.name}
                            </Menu.Item>
                          )}
                          {activeSideNoteSpace?.name && (
                            <Menu.Item
                              leftSection={
                                <IconTextPlus
                                  style={{ width: 16, height: 16 }}
                                />
                              }
                              onClick={async () => {
                                const {
                                  data: existingData,
                                  error: existingError,
                                } = await supabaseClient
                                  .from("Note to Notespace")
                                  .select("id")
                                  .eq("notespace_id", activeSideNoteSpace?.id)
                                  .eq("note_id", note.id);

                                if (!existingData?.length) {
                                  const { data, error } = await supabaseClient
                                    .from("Note to Notespace")
                                    .insert([
                                      {
                                        notespace_id: activeSideNoteSpace?.id,
                                        note_id: note.id,
                                      },
                                    ]);

                                  if (!error) {
                                    setNoteSpaceNotes([
                                      { id: note.id, text: note.text },
                                      ...noteSpaceNotes,
                                    ]);
                                  } else {
                                    console.log(error);
                                  }
                                }
                              }}
                            >
                              Add to {activeSideNoteSpace?.name}
                            </Menu.Item>
                          )}
                          <Menu.Item
                            leftSection={
                              <IconTrash style={{ width: 16, height: 16 }} />
                            }
                            onClick={async () => {
                              const { error } = await supabaseClient
                                .from("Notes")
                                .delete()
                                .eq("id", note.id);

                              if (!error) {
                                setNotes(
                                  notes.filter((note2) => note2.id !== note.id),
                                );
                              }
                            }}
                          >
                            Delete Note
                          </Menu.Item>
                        </MenuDropdown>
                      </Menu>
                    ) : (
                      <Box key={index}>{textComponent}</Box>
                    );
                  })}
                </Stack>
              </Paper>
            </Container>
          </GridCol>
          <GridCol span={5}>
            <Container>
              <Stack gap={32}>
                <Group>
                  <Button
                    variant="filled"
                    aria-label="Settings"
                    leftSection={
                      noteMode === "view" ? (
                        <IconViewfinder
                          style={{ width: "70%", height: "70%" }}
                          stroke={1.5}
                        />
                      ) : (
                        <IconEdit
                          style={{ width: "70%", height: "70%" }}
                          stroke={1.5}
                        />
                      )
                    }
                    onClick={() => {
                      if (noteMode === "view") {
                        setNoteMode("edit");
                      } else {
                        setNoteMode("view");
                      }
                    }}
                  >
                    Toggle Note Mode
                  </Button>
                  <Button
                    color="#506EDC"
                    onClick={async () => {
                      let newNoteSpaceName = "Note Space ";
                      for (
                        let i = noteSpaces.length;
                        i < noteSpaces.length * 2;
                        i++
                      ) {
                        if (
                          noteSpaces.find(
                            (noteSpace) =>
                              noteSpace.name === `${newNoteSpaceName}${i}`,
                          ) === undefined
                        ) {
                          newNoteSpaceName = `${newNoteSpaceName}${i}`;
                          break;
                        }
                      }

                      const { data, error } = await supabaseClient
                        .from("Notespaces")
                        .insert([{ name: newNoteSpaceName }])
                        .select();

                      if (!error) {
                        setActiveSideNoteSpace({
                          id: data[0].id,
                          name: data[0].name,
                        });
                        setNoteSpaces([
                          { id: 1, name: newNoteSpaceName },
                          ...noteSpaces,
                        ]);
                      } else {
                        console.log(error);
                      }
                    }}
                  >
                    Create a Note Space
                  </Button>
                </Group>
                <Paper radius={8} withBorder px={48} py={32}>
                  <InputLabel c="#5F6D7E" fw="700" mb={12}>
                    Time Range
                  </InputLabel>
                  <Flex justify="space-between" align="center" c="#C1CBD8">
                    <DatePickerInput
                      leftSection={<IconCalendar />}
                      placeholder="Pick Start Date"
                      value={startDate}
                      onChange={setStartDate}
                      w={150}
                      valueFormat="MMM D, YYYY"
                    />
                    <IconArrowBadgeRightFilled />
                    <DatePickerInput
                      leftSection={<IconCalendar />}
                      placeholder="Pick End Date"
                      value={endDate}
                      onChange={setEndDate}
                      w={150}
                      valueFormat="MMM D, YYYY"
                    />
                  </Flex>
                </Paper>
                <Paper
                  radius={8}
                  withBorder
                  px={48}
                  py={32}
                  mah="63vh"
                  style={{ overflow: "auto" }}
                  className="custom-scrollbar"
                >
                  {activeNoteSpace == null ? (
                    <Box>
                      <Select
                        placeholder="View a Note Space"
                        data={noteSpaces.map((notespace) => notespace.name)}
                        value={activeSideNoteSpace?.name}
                        variant="unstyled"
                        className="input-with-styled-placeholder"
                        onChange={(value) => {
                          setActiveSideNoteSpace({
                            name: value as string,
                            id: noteSpaces.find(
                              (notespace) => notespace.name === value,
                            )?.id,
                          });
                        }}
                        styles={{
                          wrapper: {
                            fontWeight: 700,
                          },
                          input: {
                            color: "#5F6D7E",
                          },
                        }}
                        clearable
                      />
                      {activeSideNoteSpace?.id && (
                        <Stack mt={8}>
                          {noteSpaceNotes.map((note, index) => (
                            <Text key={index}>{note.text}</Text>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  ) : (
                    <Box>
                      <Text fw={700} mb={16} c="#5F6D7E" size="sm">
                        Recommended Notes to Add
                      </Text>
                    </Box>
                  )}
                </Paper>
              </Stack>
            </Container>
          </GridCol>
        </Grid>
      </AppShellMain>
    </AppShell>
  );
}
