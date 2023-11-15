"use client";

import {
  AppShell,
  AppShellMain,
  AppShellNavbar,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridCol,
  Group,
  Input,
  InputLabel,
  Paper,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconArrowBadgeRightFilled,
  IconCalendar,
  IconSearch,
  IconStarFilled,
} from "@tabler/icons-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Dashboard() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const editableNoteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    editableNoteRef.current?.focus();
  }, []);

  return (
    <AppShell navbar={{ width: 240, breakpoint: "xs" }} padding="md">
      <AppShellNavbar p="md" bg="#F9FBFD">
        <Image
          src="/crux-logo.png"
          alt="Crux Logo"
          width={75}
          height={25}
          priority
        />
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
              <Paper radius={8} withBorder px={48} py={36}>
                <Text size="lg" fw={500} mb={8}>
                  All Notes
                </Text>
                <Text ref={editableNoteRef} mb={16} contentEditable></Text>
                <Text size="sm" fw={500} c="#5F6D7E" mb={8}>
                  Today
                </Text>
                <Text contentEditable>
                  Success, often perceived as the pinnacle of one&apos;s efforts
                  and ambitions, is a multifaceted concept that transcends mere
                  material accomplishments. While society frequently measures
                  success in terms of wealth, titles, or accolades, its true
                  essence lies in the fulfillment of personal goals, the
                  enrichment of one&apos;s life, and the positive impact one
                  leaves on others. Success is as much about the journey -
                  marked by learning, resilience, and growth - as it is about
                  the destination.
                </Text>
              </Paper>
            </Container>
          </GridCol>
          <GridCol span={5}>
            <Container>
              <Stack gap={32}>
                <Group>
                  <Button>+ Create a Note</Button>
                  <Button color="#506EDC">+ Create a Note Space</Button>
                </Group>
                <Paper radius={8} withBorder px={48} py={32}>
                  <InputLabel c="#5F6D7E" fw="700" mb={12}>
                    Time Range
                  </InputLabel>
                  <Flex
                    justify="space-between"
                    align="center"
                    c="#C1CBD8"
                    mb={24}
                  >
                    <DatePickerInput
                      leftSection={<IconCalendar />}
                      placeholder="Pick start date"
                      value={startDate}
                      onChange={setStartDate}
                      w={150}
                      valueFormat="MMM D, YYYY"
                    />
                    <IconArrowBadgeRightFilled />
                    <DatePickerInput
                      leftSection={<IconCalendar />}
                      placeholder="Pick end date"
                      value={endDate}
                      onChange={setEndDate}
                      w={150}
                      valueFormat="MMM D, YYYY"
                    />
                  </Flex>
                  <InputLabel c="#5F6D7E" fw="700" mb={12}>
                    Note Space
                  </InputLabel>
                  <Select placeholder="Pick note space" data={["All Notes"]} />
                </Paper>
              </Stack>
            </Container>
          </GridCol>
        </Grid>
      </AppShellMain>
    </AppShell>
  );
}
