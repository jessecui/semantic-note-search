"use client";

import {
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
  Input,
  InputLabel,
  NavLink,
  Paper,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Session, createClient } from "@supabase/supabase-js";
import {
  IconArrowBadgeRightFilled,
  IconCalendar,
  IconLogout,
  IconSearch,
  IconStarFilled,
} from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import "./dashboard.css";

export default function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const editableNoteRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState<string[]>([]);

  const url = "https://faozpgzgwapvpomsfuig.supabase.co";
  const publicKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhb3pwZ3pnd2FwdnBvbXNmdWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwOTE1NTQsImV4cCI6MjAxNTY2NzU1NH0.3JTgWckpK194wc3hht_KnWev_Rqe4C8Mdpg9ALM0JKo";

  useEffect(() => {
    const supabaseClient = createClient(url, publicKey);

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
        const supabaseClient = createClient(url, publicKey);
        const { data, error } = await supabaseClient
          .from("Notes")
          .select("text")
          .eq("user_id", session?.user.id)
          .order("created_at", { ascending: false });

        if (error) console.log(error);
        else {
          const notes = data.map((note) => note.text);
          setNotes(notes);
        }
      }
    };
    fetchNotes();
  }, [session]);

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

    function handleKeyDown(event: KeyboardEvent, index: number) {
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
          previousElement.focus();
          setCaretToLastLineAtPosition(previousElement, horizontalPos);
        }
      }
    }

    notes.forEach((_, index) => {
      const contentEditableDiv = document.getElementById(`note-${index}`);

      if (contentEditableDiv) {
        contentEditableDiv.addEventListener("keydown", (e) =>
          handleKeyDown(e, index),
        );
      }
    });

    const noteCreator = document.getElementById("note-creator");
    if (noteCreator) {
      noteCreator.addEventListener("keydown", (e) => {
        handleKeyDown(e, -1);
      });
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
  }, [notes]);

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
                  const supabaseClient = createClient(url, publicKey);
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
          <Text
            c="#5F6D7E"
            fw={600}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <IconStarFilled size={12} />
            All Notes
          </Text>
        </Box>
      </AppShellNavbar>
      <AppShellMain>
        <Grid>
          <GridCol span={7}>
            <Container>
              <Input
                radius={8}
                placeholder="Search"
                leftSection={<IconSearch size={16} />}
                mb={32}
              />
              <Paper
                radius={8}
                withBorder
                px={48}
                py={36}
                mah={600}
                style={{ overflow: "auto" }}
                className="custom-scrollbar"
              >
                <Text size="lg" fw={500} mb={8}>
                  All Notes
                </Text>
                <Text
                  id="note-creator"
                  ref={editableNoteRef}
                  mb={16}
                  className="text-box"
                  contentEditable
                  onKeyDown={async (e) => {
                    if (e.key == "Enter") {
                      e.preventDefault();

                      const noteText = editableNoteRef.current?.textContent;

                      if (noteText) {
                        editableNoteRef.current.textContent = "";

                        setNotes((notes) => [noteText || "", ...notes]);

                        const supabase = createClient(url, publicKey);
                        const { data, error } = await supabase
                          .from("Notes")
                          .insert([{ text: noteText }])
                          .select();
                      }
                    }
                  }}
                ></Text>
                <Text size="sm" fw={500} c="#5F6D7E" mb={8}>
                  Today
                </Text>
                <Stack>
                  {notes.map((note, index) => (
                    <Text
                      id={`note-${index}`}
                      key={index}
                      contentEditable
                      dangerouslySetInnerHTML={{ __html: note }}
                      className="text-box"
                      onChange={async (e) => {
                        e.preventDefault();
                        const target = e.target as HTMLElement;
                        setNotes((notes) => {
                          notes[index] = target.innerText;
                          return notes;
                        });
                      }}
                    />
                  ))}
                </Stack>
              </Paper>
            </Container>
          </GridCol>
          <GridCol span={5}>
            <Container>
              <Stack gap={32}>
                <Group>
                  <Button>Create a Note</Button>
                  <Button color="#506EDC">Create a Note Space</Button>
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
                <Select
                  placeholder="View a Note Space"
                  data={["All Notes"]}
                  clearable
                />
              </Stack>
            </Container>
          </GridCol>
        </Grid>
      </AppShellMain>
    </AppShell>
  );
}
