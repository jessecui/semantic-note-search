"use client";

import {
  ActionIcon,
  Alert,
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
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  Modal,
  NavLink,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { Session } from "@supabase/supabase-js";
import {
  IconArrowBadgeRightFilled,
  IconArticle,
  IconCalendar,
  IconClipboardText,
  IconDots,
  IconEdit,
  IconInfoCircle,
  IconLogout,
  IconMoon,
  IconPlus,
  IconReportSearch,
  IconSearch,
  IconStack2,
  IconSun,
  IconTextPlus,
  IconTrash,
  IconUser,
  IconViewfinder,
} from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import supabaseClient from "../../../supabase/supabaseClient";
import "./dashboard.css";

export default function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

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
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  const [noteMode, setNoteMode] = useState<"view" | "edit">("edit");

  // Side note navigation states
  const [sideNavigator, setSideNavigator] = useState<string | null>(null);

  const [recommendedNotes, setRecommendedNotes] = useState<
    { id: any; text: any }[]
  >([]);

  const [activeSideNoteSpace, setActiveSideNoteSpace] = useState<{
    id: any;
    name: string;
  } | null>(null);
  const [sideNoteSpaceNotes, setSideNoteSpaceNotes] = useState<
    { id: any; text: any }[]
  >([]);

  const [sideSearchTextInputValue, setSideSearchTextInputValue] = useState("");
  const [sideSearchText, setSideSearchText] = useState("");
  const [sideSearchedNotes, setSideSearchedNotes] = useState<
    { id: any; text: string }[]
  >([]);

  // Dashboard refs
  const editableNoteRef = useRef<HTMLDivElement>(null);  
  const eventListenersRef = useRef<{
    [key: string]: (e: KeyboardEvent) => void;
  }>({});

  // Alert disclosure for notifying user of duplicate note creation
  const [alertOpened, { open: openAlert, close: closeAlert }] =
    useDisclosure(false);

  // Set session after fetching the router data
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

  // Fetch initial note spaces
  useEffect(() => {
    const fetchNoteSpaces = async () => {
      if (session?.user.id) {
        const { data, error } = await supabaseClient
          .from("Notespaces")
          .select("id, name")
          .eq("user_id", session?.user.id)
          .order("created_at", { ascending: true });

        if (error) console.log(error);
        else {
          const decryptionResponse = await fetch("/decrypt-note-spaces", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ noteSpaces: data }),
          });
          const decryptedNotes = await decryptionResponse.json();
          setNoteSpaces(decryptedNotes);
        }
      }
    };
    fetchNoteSpaces();
  }, [session]);

  // Fetch notes within note spaces
  useEffect(() => {
    const fetchAllNotesWithDates = async () => {
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
          const formattedEndDate = new Date(
            new Date(endDate).setDate(endDate.getDate() + 1),
          ).toISOString();
          query = query.lte("created_at", formattedEndDate);
        }

        query = query.order("created_at", { ascending: false });

        const { data, error } = await query;

        if (error) console.log(error);
        else {
          const decryptionResponse = await fetch("/decrypt-notes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ notes: data }),
          });
          const decryptedNotes = await decryptionResponse.json();
          setNotes(decryptedNotes);
        }
      }
    };

    const fetchNotesWithinNoteSpaceWithDates = async () => {
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
          const formattedEndDate = new Date(
            new Date(endDate).setDate(endDate.getDate() + 1),
          ).toISOString();
          query = query.lte("created_at", formattedEndDate);
        }

        query = query.order("created_at", { ascending: false });

        const { data, error } = await query;

        if (error) console.log(error);
        else {
          const notes: { id: any; text: any }[] = data.flatMap((note) => {
            return note.Notes;
          });
          const decryptionResponse = await fetch("/decrypt-notes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ notes }),
          });
          const decryptedNotes = await decryptionResponse.json();
          setNotes(decryptedNotes);
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
  }, [startDate, endDate, session, activeNoteSpace, searchedText]);

  // Fetch notes when using main semantic search
  useEffect(() => {
    const semanticSearch = async () => {
      if (!searchedText) {
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
        match_notespace_id: activeNoteSpace?.id,
        match_start: startDate?.toISOString(),
        match_end: endDate?.toISOString(),
      });

      if (error) {
        console.log(error);
        return;
      }
      const decryptionResponse = await fetch("/decrypt-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes: data }),
      });
      const decryptedNotes = await decryptionResponse.json();
      setNotes(decryptedNotes);
    };

    semanticSearch();
  }, [searchedText, activeNoteSpace, startDate, endDate]);

  // Fetch side navigator semantically searched notes
  useEffect(() => {
    const fetchSideSearchedNotes = async () => {
      if (sideSearchText === "") {
        setSideSearchedNotes([]);
        return;
      }

      const embeddingResponse = await fetch(
        `/embed?text=${encodeURIComponent(sideSearchText)}`,
      );
      const embedding = await embeddingResponse.json();

      const { data, error } = await supabaseClient.rpc("match_notes", {
        query_embedding: embedding,
        match_threshold: 1.8,
        match_count: 100,
        match_start: startDate?.toISOString(),
        match_end: endDate?.toISOString(),
      });

      if (error) {
        console.log(error);
        return;
      }

      const decryptionResponse = await fetch("/decrypt-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes: data }),
      });
      const decryptedNotes = await decryptionResponse.json();
      setSideSearchedNotes(decryptedNotes);
    };
    fetchSideSearchedNotes();
  }, [sideSearchText, startDate, endDate, notes]);

  // Fetch side navigator notes when viewing note spaces
  useEffect(() => {
    const fetchNoteSpaceNotes = async () => {
      if (sideNavigator != "Note Spaces") {
        return;
      }
      if (!session?.user.id) {
        return;
      }

      let query;

      if (!activeSideNoteSpace?.id) {
        query = supabaseClient
          .from("Notes")
          .select("id, text")
          .eq("user_id", session?.user.id);
      } else {
        query = supabaseClient
          .from("Note to Notespace")
          .select("id, Notes (id, text)")
          .eq("user_id", session?.user.id)
          .eq("notespace_id", activeSideNoteSpace.id);
      }

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

      if (error) {
        console.log(error);
        return;
      }

      let notes: { id: any; text: any }[];
      if (!activeSideNoteSpace?.id) {
        notes = data as any;
      } else {
        notes = data.flatMap((note: any) => {
          return note.Notes;
        });
      }

      const decryptionResponse = await fetch("/decrypt-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });
      const decryptedNotes = await decryptionResponse.json();
      setSideNoteSpaceNotes(decryptedNotes);
    };
    fetchNoteSpaceNotes();
  }, [sideNavigator, activeSideNoteSpace, session, startDate, endDate, notes]);

  // Fetch side navigator recommended notes
  useEffect(() => {
    const fetchRecommendedNotes = async () => {
      if (session?.user.id) {
        if (!activeNoteSpace?.id) {
          setRecommendedNotes([]);
          return;
        }
        let query = supabaseClient
          .from("Notespaces")
          .select("embedding")
          .eq("id", activeNoteSpace?.id);

        // Fetch notespace embedding
        const { data: notespaceData, error: notespaceError } = await query;

        if (notespaceError) {
          console.log(notespaceError);
          return;
        }

        const embedding = notespaceData[0].embedding;

        if (!embedding) {
          setRecommendedNotes([]);
          return;
        }

        const { data, error } = await supabaseClient.rpc("match_notes", {
          query_embedding: embedding,
          match_threshold: 1.8,
          match_count: 100,
          match_start: startDate?.toISOString(),
          match_end: endDate?.toISOString(),
        });

        if (error) {
          console.log(error);
          return;
        }

        const existingNoteIds = new Set(notes.map((note) => note.id));
        const deduplicatedData = data.filter(
          (note: { id: Number }) => !existingNoteIds.has(note.id),
        );

        const decryptionResponse = await fetch("/decrypt-notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notes: deduplicatedData }),
        });
        const decryptedNotes = await decryptionResponse.json();
        setRecommendedNotes(decryptedNotes);
      }
    };
    fetchRecommendedNotes();
  }, [session, activeNoteSpace, notes, startDate, endDate, sideNavigator]);

  // Reset side navigator state when switching between navigators
  useEffect(() => {
    if (sideNavigator != "Recommended Notes") {
      setRecommendedNotes([]);
    }
    if (sideNavigator != "Semantic Search") {
      setSideSearchTextInputValue("");
      setSideSearchText("");
      setSideSearchedNotes([]);
    }
    if (sideNavigator != "Note Spaces") {
      setActiveSideNoteSpace(null);
      setSideNoteSpaceNotes([]);
    }
  }, [sideNavigator]);

  // Handle caret positioning on keydown events
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
            }

            const noteIdToDelete = notes[index].id;

            // Delete from supabase
            if (activeNoteSpace?.id) {
              const { error } = await supabaseClient
                .from("Note to Notespace")
                .delete()
                .eq("note_id", noteIdToDelete)
                .eq("notespace_id", activeNoteSpace.id);
              if (error) {
                console.log(error);
              }
            } else {
              const { error } = await supabaseClient
                .from("Notes")
                .delete()
                .eq("id", noteIdToDelete);
              if (error) {
                console.log(error);
              }
            }

            // Delete note from notes state
            const newNotes = [...notes];
            newNotes.splice(index, 1);
            setNotes(newNotes);
          }
        }
      }
    }

    notes.forEach((_, index) => {
      const contentEditableDiv = document.getElementById(`note-${index}`);

      if (contentEditableDiv) {
        const storedFunction = eventListenersRef.current[`note-${index}`];
        if (storedFunction) {
          contentEditableDiv.removeEventListener("keydown", storedFunction);

          delete eventListenersRef.current[`note-${index}`];
        }
        const eventListenerFunction = (e: KeyboardEvent) =>
          handleKeyDown(e, index);
        contentEditableDiv.addEventListener("keydown", eventListenerFunction);

        eventListenersRef.current[`note-${index}`] = eventListenerFunction;
      }
    });

    const noteCreator = document.getElementById("note-creator");
    if (noteCreator) {
      const storedFunction = eventListenersRef.current[`note-creator`];
      if (storedFunction) {
        noteCreator.removeEventListener("keydown", storedFunction);

        delete eventListenersRef.current[`note-creator`];
      }
      const eventListenerFunction = (e: KeyboardEvent) => handleKeyDown(e, -1);
      noteCreator.addEventListener("keydown", eventListenerFunction);

      eventListenersRef.current[`note-creator`] = eventListenerFunction;
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
  }, [
    activeNoteSpace,
    activeSideNoteSpace?.id,
    notes,
    recommendedNotes,
    searchedText,
    sideNavigator,
    sideNoteSpaceNotes,
    sideSearchedNotes,
  ]);

  return (
    <main>
      <AppShell navbar={{ width: 240, breakpoint: "xs" }} padding="md">
        <AppShellNavbar p="md" className="navbar">
          <NavLink
            p={0}
            mt={4}
            styles={{ children: { paddingLeft: 4, paddingTop: 8 } }}
            label={
              <Flex align="center">
                <Image
                  className="light-only"
                  src="/crux-logo.png"
                  alt="Crux Logo"
                  width={75}
                  height={25}
                  priority
                />
                <Image
                  className="dark-only"
                  src="/crux-logo-dark.png"
                  alt="Crux Logo"
                  width={75}
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
              label={<Text size="sm">{session?.user.email}</Text>}
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
            <NavLink
              p={0}
              leftSection={<IconLogout size={16} />}
              className="navlink"
              onClick={async () => {
                await supabaseClient.auth.signOut();
              }}
              label={<Text size="sm">Log Out</Text>}
            />
          </NavLink>
          <Box
            mt={32}
            style={{ overflow: "auto" }}
            className="custom-scrollbar"
          >
            <Stack gap={4} mt={8}>
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
                      setRecommendedNotes([]);
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
                                  (notespace2) =>
                                    notespace2.id !== notespace.id,
                                ),
                              );
                              if (activeSideNoteSpace?.id == notespace.id) {
                                setActiveSideNoteSpace(null);
                              }
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
              <Text
                mt={4}
                className="navlink"
                fw={500}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
                onClick={async () => {
                  let newNoteSpaceName = "Note Space ";

                  // Find a unique note space name with an appended number
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

                  const encryptResponse = await fetch(
                    `/encrypt?text=${encodeURIComponent(newNoteSpaceName)}`,
                  );

                  const encryptedText = (await encryptResponse.json())
                    .encryption;

                  const { data, error } = await supabaseClient
                    .from("Notespaces")
                    .insert([{ name: encryptedText }])
                    .select();

                  if (!error) {
                    setActiveNoteSpace({
                      id: data[0].id,
                      name: newNoteSpaceName,
                    });
                    setNoteSpaces([
                      ...noteSpaces,
                      { id: data[0].id, name: newNoteSpaceName },
                    ]);
                  } else {
                    console.log(error);
                  }
                }}
              >
                <IconPlus size={16} />
                Add a Note Space
              </Text>
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
                  radius={4}
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
                      const textToSearch = (e.target as HTMLInputElement).value;
                      (e.target as HTMLInputElement).value = "";
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
                  className="custom-scrollbar"
                >
                  <Text
                    id="notespace-title"
                    size="lg"
                    fw={500}
                    mb={16}
                    contentEditable={
                      noteMode === "edit" && activeNoteSpace != null
                    }
                    className="text-box-edit"
                    style={{
                      cursor:
                        activeNoteSpace && noteMode == "edit"
                          ? "text"
                          : "default",
                    }}
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
                        noteSpaces.find(
                          (notespace) => notespace.name === noteSpaceName,
                        )
                      ) {
                        (e.target as HTMLElement).innerText =
                          activeNoteSpace?.name as string;
                        return;
                      }

                      const encryptResponse = await fetch(
                        `/encrypt?text=${encodeURIComponent(noteSpaceName)}`,
                      );

                      const encryptedText = (await encryptResponse.json())
                        .encryption;

                      const embeddingResponse = await fetch(
                        `/embed?text=${encodeURIComponent(noteSpaceName)}`,
                      );
                      const embedding = await embeddingResponse.json();

                      const { error } = await supabaseClient
                        .from("Notespaces")
                        .update({ name: encryptedText, embedding: embedding })
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
                      if (activeSideNoteSpace?.id === activeNoteSpace?.id) {
                        setActiveSideNoteSpace({
                          id: activeNoteSpace?.id,
                          name: noteSpaceName,
                        });
                      }
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
                  {!searchedText && (
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

                            const encryptResponse = await fetch(
                              `/encrypt?text=${encodeURIComponent(noteText)}`,
                            );

                            const encryptedText = (await encryptResponse.json())
                              .encryption;

                            // TODO: Make notes state update instantaneous upon enter key press
                            const embeddingResponse = await fetch(
                              `/embed?text=${encodeURIComponent(noteText)}`,
                            );
                            const embedding = await embeddingResponse.json();

                            const { data, error } = await supabaseClient
                              .from("Notes")
                              .insert([{ text: encryptedText, embedding }])
                              .select();

                            if (error) {
                              console.log(error);
                              return;
                            }

                            setNotes((notes) => [
                              { id: data[0].id, text: noteText },
                              ...notes,
                            ]);

                            if (activeNoteSpace?.id) {
                              const { error: error2 } = await supabaseClient
                                .from("Note to Notespace")
                                .insert([
                                  {
                                    notespace_id: activeNoteSpace?.id,
                                    note_id: data[0].id,
                                  },
                                ]);
                              if (error2) {
                                console.log(error2);
                                return;
                              }
                            }
                          }
                        }
                      }}
                    />
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
                          contentEditable={noteMode === "edit"}
                          className={
                            noteMode === "edit"
                              ? "text-box-edit"
                              : "text-box-view"
                          }
                          style={{
                            cursor: noteMode === "view" ? "pointer" : "text",
                          }}
                          onBlur={async (e) => {
                            const newNoteText = (e.target as HTMLElement)
                              .innerText;

                            // Update note in database
                            if (newNoteText === "") {
                              return;
                            }

                            const { data } = await supabaseClient
                              .from("Notes")
                              .select("id")
                              .eq("id", note.id);

                            if (data && data.length) {
                              const encryptResponse = await fetch(
                                `/encrypt?text=${encodeURIComponent(
                                  newNoteText,
                                )}`,
                              );

                              const encryptedText = (
                                await encryptResponse.json()
                              ).encryption;

                              let embedding = null;
                              const embeddingResponse = await fetch(
                                `/embed?text=${encodeURIComponent(
                                  newNoteText,
                                )}`,
                              );
                              embedding = await embeddingResponse.json();

                              const { error } = await supabaseClient
                                .from("Notes")
                                .update({ text: encryptedText, embedding })
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
                          suppressContentEditableWarning
                        >
                          {note.text}
                        </Text>
                      );
                      return noteMode === "view" ? (
                        <Menu offset={0} position="right" key={index}>
                          <MenuTarget>{textComponent}</MenuTarget>
                          <MenuDropdown>
                            {activeSideNoteSpace?.name && (
                              <MenuItem
                                leftSection={
                                  <IconTextPlus
                                    style={{ width: 16, height: 16 }}
                                  />
                                }
                                onClick={async () => {
                                  // Check if note is already in notespace
                                  const {
                                    data: existingData,
                                    error: existingError,
                                  } = await supabaseClient
                                    .from("Note to Notespace")
                                    .select("id")
                                    .eq("notespace_id", activeSideNoteSpace?.id)
                                    .eq("note_id", note.id);

                                  if (existingError) {
                                    console.log(existingError);
                                    return;
                                  }

                                  if (existingData?.length) {
                                    openAlert();
                                    return;
                                  }

                                  // Insert Note into Notespace
                                  const { error } = await supabaseClient
                                    .from("Note to Notespace")
                                    .insert([
                                      {
                                        notespace_id: activeSideNoteSpace?.id,
                                        note_id: note.id,
                                      },
                                    ]);

                                  if (error) {
                                    console.log(error);
                                    return;
                                  }

                                  setSideNoteSpaceNotes([
                                    { id: note.id, text: note.text },
                                    ...sideNoteSpaceNotes,
                                  ]);
                                }}
                              >
                                Add to {activeSideNoteSpace?.name}
                              </MenuItem>
                            )}
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
                            <MenuItem
                              leftSection={
                                <IconReportSearch
                                  style={{ width: 16, height: 16 }}
                                />
                              }
                              onClick={async (e) => {
                                const textToSearch = note.text;

                                const embeddingResponse = await fetch(
                                  `/embed?text=${encodeURIComponent(
                                    textToSearch,
                                  )}`,
                                );
                                const embedding =
                                  await embeddingResponse.json();

                                const { data, error } =
                                  await supabaseClient.rpc("match_notes", {
                                    query_embedding: embedding,
                                    match_threshold: 1.8,
                                    match_count: 100,
                                  });

                                if (error) {
                                  console.log(error);
                                  return;
                                }

                                setSideNavigator("Semantic Search");
                                setSideSearchTextInputValue(textToSearch);
                                setSideSearchText(textToSearch);
                              }}
                            >
                              Side Search for Similar Notes
                            </MenuItem>
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
                  <Flex
                    display="flex"
                    justify="space-between"
                    wrap="wrap"
                    gap={12}
                  >
                    <Group gap={4} style={{ flex: "1 1 auto" }}>
                      <DatePickerInput
                        leftSection={<IconCalendar size={16} />}
                        placeholder="Start Date"
                        value={startDate}
                        onChange={setStartDate}
                        w={140}
                        valueFormat="M/D/YYYY"
                        clearable
                      />
                      <IconArrowBadgeRightFilled size={16} className="icon" />
                      <DatePickerInput
                        leftSection={<IconCalendar size={16} />}
                        placeholder="End Date"
                        value={endDate}
                        onChange={setEndDate}
                        w={140}
                        valueFormat="M/D/YYYY"
                        clearable
                      />
                    </Group>
                    <Button
                      leftSection={
                        noteMode === "view" ? (
                          <IconViewfinder size={16} />
                        ) : (
                          <IconEdit size={16} />
                        )
                      }
                      fw="400"
                      variant="outline"
                      w={110}
                      className="outline-button"
                      onClick={() => {
                        if (noteMode === "view") {
                          setNoteMode("edit");
                        } else {
                          setNoteMode("view");
                        }
                      }}
                    >
                      {noteMode === "view" ? "Viewing" : "Editing"}
                    </Button>
                  </Flex>
                  <Stack>
                    <Select
                      leftSection={<IconReportSearch size={16} />}
                      data={[
                        "Recommended Notes",
                        "Semantic Search",
                        "Note Spaces",
                      ]}
                      placeholder="Side Navigator"
                      clearable
                      value={sideNavigator}
                      onChange={setSideNavigator}
                    />
                    {sideNavigator == "Note Spaces" && (
                      <Paper
                        radius={4}
                        withBorder
                        mah="78.5vh"
                        style={{ overflow: "auto" }}
                        className="custom-scrollbar"
                      >
                        <Select
                          data={[
                            "All Notes",
                            ...noteSpaces.map((notespace) => notespace.name),
                          ]}
                          value={activeSideNoteSpace?.name || "All Notes"}
                          leftSection={<IconClipboardText size={16} />}
                          variant="unstyled"
                          onChange={(value) => {
                            setActiveSideNoteSpace({
                              name: value as string,
                              id: noteSpaces.find(
                                (notespace) => notespace.name === value,
                              )?.id,
                            });
                          }}
                        />
                        <Stack my={8} mx={8}>
                          {sideNoteSpaceNotes.length === 0 && (
                            <Text fz="sm" style={{ cursor: "default" }}>
                              There are no notes in this note space.
                            </Text>
                          )}
                          {sideNoteSpaceNotes.map((note, index) => (
                            <Menu key={index} position="left">
                              <MenuTarget>
                                <Text
                                  fz="sm"
                                  className={"text-box-view"}
                                  style={{
                                    cursor: "pointer",
                                  }}
                                >
                                  {note.text}
                                </Text>
                              </MenuTarget>

                              <MenuDropdown>
                                {activeNoteSpace && (
                                  <MenuItem
                                    leftSection={
                                      <IconTextPlus
                                        style={{ width: 16, height: 16 }}
                                      />
                                    }
                                    onClick={async () => {
                                      // Check if note is already in notespace
                                      const {
                                        data: existingData,
                                        error: existingError,
                                      } = await supabaseClient
                                        .from("Note to Notespace")
                                        .select("id")
                                        .eq("notespace_id", activeNoteSpace?.id)
                                        .eq("note_id", note.id);

                                      if (existingError) {
                                        console.log(existingError);
                                        return;
                                      }

                                      if (existingData?.length) {
                                        openAlert();
                                        return;
                                      }

                                      // Insert Note into Notespace
                                      const { error } = await supabaseClient
                                        .from("Note to Notespace")
                                        .insert([
                                          {
                                            notespace_id: activeNoteSpace?.id,
                                            note_id: note.id,
                                          },
                                        ]);

                                      if (error) {
                                        console.log(error);
                                        return;
                                      }

                                      setNotes([
                                        { id: note.id, text: note.text },
                                        ...notes,
                                      ]);
                                    }}
                                  >
                                    Add to {activeNoteSpace?.name}
                                  </MenuItem>
                                )}
                                <MenuItem
                                  leftSection={
                                    <IconSearch
                                      style={{ width: 16, height: 16 }}
                                    />
                                  }
                                  onClick={async (e) => {
                                    setActiveNoteSpace(null);
                                    setSearchedText(note.text);
                                  }}
                                >
                                  Search for Similar Notes
                                </MenuItem>
                                <MenuItem
                                  leftSection={
                                    <IconReportSearch
                                      style={{ width: 16, height: 16 }}
                                    />
                                  }
                                  onClick={async (e) => {
                                    const textToSearch = note.text;

                                    const embeddingResponse = await fetch(
                                      `/embed?text=${encodeURIComponent(
                                        textToSearch,
                                      )}`,
                                    );
                                    const embedding =
                                      await embeddingResponse.json();

                                    const { data, error } =
                                      await supabaseClient.rpc("match_notes", {
                                        query_embedding: embedding,
                                        match_threshold: 1.8,
                                        match_count: 100,
                                      });

                                    if (error) {
                                      console.log(error);
                                      return;
                                    }

                                    setSideNavigator("Semantic Search");
                                    setSideSearchTextInputValue(textToSearch);
                                    setSideSearchText(textToSearch);
                                  }}
                                >
                                  Side Search for Similar Notes
                                </MenuItem>
                              </MenuDropdown>
                            </Menu>
                          ))}
                        </Stack>
                      </Paper>
                    )}{" "}
                    {sideNavigator == "Recommended Notes" && (
                      <Paper
                        radius={4}
                        withBorder
                        px={8}
                        py={8}
                        mah="78.5vh"
                        style={{ overflow: "auto" }}
                        className="custom-scrollbar"
                      >
                        <Stack>
                          {recommendedNotes.length === 0 && (
                            <Text fz="sm" style={{ cursor: "default" }}>
                              There are no recommended notes.
                            </Text>
                          )}
                          {recommendedNotes.length > 0 &&
                            recommendedNotes.map((note, index) => (
                              <Menu key={index} position="left">
                                <MenuTarget>
                                  <Text
                                    fz="sm"
                                    className={"text-box-view"}
                                    style={{
                                      cursor: "pointer",
                                    }}
                                  >
                                    {note.text}
                                  </Text>
                                </MenuTarget>

                                <MenuDropdown>
                                  {activeNoteSpace && (
                                    <MenuItem
                                      leftSection={
                                        <IconTextPlus
                                          style={{ width: 16, height: 16 }}
                                        />
                                      }
                                      onClick={async () => {
                                        // Check if note is already in notespace
                                        const {
                                          data: existingData,
                                          error: existingError,
                                        } = await supabaseClient
                                          .from("Note to Notespace")
                                          .select("id")
                                          .eq(
                                            "notespace_id",
                                            activeNoteSpace?.id,
                                          )
                                          .eq("note_id", note.id);

                                        if (existingError) {
                                          console.log(existingError);
                                          return;
                                        }

                                        if (existingData?.length) {
                                          openAlert();
                                          return;
                                        }

                                        // Insert Note into Notespace
                                        const { error } = await supabaseClient
                                          .from("Note to Notespace")
                                          .insert([
                                            {
                                              notespace_id: activeNoteSpace?.id,
                                              note_id: note.id,
                                            },
                                          ]);

                                        if (error) {
                                          console.log(error);
                                          return;
                                        }

                                        setNotes([
                                          { id: note.id, text: note.text },
                                          ...notes,
                                        ]);
                                      }}
                                    >
                                      Add to {activeNoteSpace?.name}
                                    </MenuItem>
                                  )}
                                  <MenuItem
                                    leftSection={
                                      <IconSearch
                                        style={{ width: 16, height: 16 }}
                                      />
                                    }
                                    onClick={async (e) => {
                                      setActiveNoteSpace(null);
                                      setSearchedText(note.text);
                                    }}
                                  >
                                    Search for Similar Notes
                                  </MenuItem>
                                  <MenuItem
                                    leftSection={
                                      <IconReportSearch
                                        style={{ width: 16, height: 16 }}
                                      />
                                    }
                                    onClick={async (e) => {
                                      const textToSearch = note.text;

                                      const embeddingResponse = await fetch(
                                        `/embed?text=${encodeURIComponent(
                                          textToSearch,
                                        )}`,
                                      );
                                      const embedding =
                                        await embeddingResponse.json();

                                      const { data, error } =
                                        await supabaseClient.rpc(
                                          "match_notes",
                                          {
                                            query_embedding: embedding,
                                            match_threshold: 1.8,
                                            match_count: 100,
                                          },
                                        );

                                      if (error) {
                                        console.log(error);
                                        return;
                                      }

                                      setSideNavigator("Semantic Search");
                                      setSideSearchTextInputValue(textToSearch);
                                      setSideSearchText(textToSearch);
                                    }}
                                  >
                                    Side Search for Similar Notes
                                  </MenuItem>
                                </MenuDropdown>
                              </Menu>
                            ))}
                        </Stack>
                      </Paper>
                    )}
                    {sideNavigator == "Semantic Search" && (
                      <Stack>
                        <Paper
                          radius={4}
                          withBorder
                          mah="78.5vh"
                          style={{ overflow: "auto" }}
                          className="custom-scrollbar"
                          pb={sideSearchedNotes.length ? 8 : 0}
                          pr={8}
                        >
                          <Textarea
                            variant="unstyled"
                            pr={8}
                            rows={1}
                            autosize
                            radius={4}
                            placeholder="Search"
                            value={sideSearchTextInputValue}
                            onChange={(event) =>
                              setSideSearchTextInputValue(
                                event.currentTarget.value,
                              )
                            }
                            leftSection={
                              <IconSearch
                                style={{ alignSelf: "start", marginTop: 8.5 }}
                                size={16}
                              />
                            }
                            onKeyDown={async (e) => {
                              if (e.key == "Enter") {
                                e.preventDefault();
                                setSideSearchText(sideSearchTextInputValue);
                              }
                            }}
                          />
                          {sideSearchText && (
                            <>
                              <Divider mt={0} mb={16} mx={2} />
                              <Flex>
                                <Box mx={8}>
                                  <IconArticle size={16} className="icon" />
                                </Box>
                                <Stack>
                                  {sideSearchedNotes.map((note, index) => (
                                    <Menu key={index} position="left">
                                      <MenuTarget>
                                        <Text
                                          fz="sm"
                                          className={"text-box-view"}
                                          style={{
                                            cursor: "pointer",
                                          }}
                                        >
                                          {note.text}
                                        </Text>
                                      </MenuTarget>

                                      <MenuDropdown>
                                        {activeNoteSpace && (
                                          <MenuItem
                                            leftSection={
                                              <IconTextPlus
                                                style={{
                                                  width: 16,
                                                  height: 16,
                                                }}
                                              />
                                            }
                                            onClick={async () => {
                                              // Check if note is already in notespace
                                              const {
                                                data: existingData,
                                                error: existingError,
                                              } = await supabaseClient
                                                .from("Note to Notespace")
                                                .select("id")
                                                .eq(
                                                  "notespace_id",
                                                  activeNoteSpace?.id,
                                                )
                                                .eq("note_id", note.id);

                                              if (existingError) {
                                                console.log(existingError);
                                                return;
                                              }

                                              if (existingData?.length) {
                                                openAlert();
                                                return;
                                              }

                                              // Insert Note into Notespace
                                              const { error } =
                                                await supabaseClient
                                                  .from("Note to Notespace")
                                                  .insert([
                                                    {
                                                      notespace_id:
                                                        activeNoteSpace?.id,
                                                      note_id: note.id,
                                                    },
                                                  ]);

                                              if (error) {
                                                console.log(error);
                                                return;
                                              }

                                              setNotes([
                                                {
                                                  id: note.id,
                                                  text: note.text,
                                                },
                                                ...notes,
                                              ]);
                                            }}
                                          >
                                            Add to {activeNoteSpace?.name}
                                          </MenuItem>
                                        )}
                                        <MenuItem
                                          leftSection={
                                            <IconSearch
                                              style={{ width: 16, height: 16 }}
                                            />
                                          }
                                          onClick={async (e) => {
                                            setActiveNoteSpace(null);
                                            setSearchedText(note.text);
                                          }}
                                        >
                                          Search for Similar Notes
                                        </MenuItem>
                                        <MenuItem
                                          leftSection={
                                            <IconReportSearch
                                              style={{ width: 16, height: 16 }}
                                            />
                                          }
                                          onClick={async (e) => {
                                            const textToSearch = note.text;

                                            const embeddingResponse =
                                              await fetch(
                                                `/embed?text=${encodeURIComponent(
                                                  textToSearch,
                                                )}`,
                                              );
                                            const embedding =
                                              await embeddingResponse.json();

                                            const { data, error } =
                                              await supabaseClient.rpc(
                                                "match_notes",
                                                {
                                                  query_embedding: embedding,
                                                  match_threshold: 1.8,
                                                  match_count: 100,
                                                },
                                              );

                                            if (error) {
                                              console.log(error);
                                              return;
                                            }

                                            setSideNavigator("Semantic Search");
                                            setSideSearchTextInputValue(
                                              textToSearch,
                                            );
                                            setSideSearchText(textToSearch);
                                          }}
                                        >
                                          Side Search for Similar Notes
                                        </MenuItem>
                                      </MenuDropdown>
                                    </Menu>
                                  ))}
                                </Stack>
                              </Flex>
                            </>
                          )}
                        </Paper>
                      </Stack>
                    )}
                  </Stack>
                </Stack>
              </Container>
            </GridCol>
          </Grid>
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
