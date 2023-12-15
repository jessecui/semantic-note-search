"use client";

import {
  Box,
  Button,
  Center,
  Container,
  Divider,
  Flex,
  Grid,
  GridCol,
  Group,
  Stack,
  Switch,
  Text,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

import Logo from "../logo/logo";

export default function Landing() {
  const {toggleColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  return (
    <main>
      <Container size="md">
        <nav>
          <Flex justify="space-between" align="center" mih={60}>
            <Logo />
            <Group>
              <Link href="/login" passHref>
                <Button variant="outline">Log In</Button>
              </Link>
              <Link href="/signup" passHref>
                <Button>Sign Up</Button>
              </Link>
            </Group>
          </Flex>
        </nav>
        <Grid align="center">
          <GridCol span={7}>
            <Title order={1}>
              Effortlessly transform your notes into{" "}
              <Text span c="blue" inherit>
                insightful, publishable
              </Text>{" "}
              content.
            </Title>
            <Text size="lg" my={16}>
              Crux is an app designed to organize your ideas in a simple and
              smart way, helping you create{" "}
              <Text span c="blue" fw={500}>
                better content faster
              </Text>
              .
            </Text>
            <Link href="/signup" passHref>
              <Button>Get started</Button>
            </Link>
          </GridCol>
          <GridCol span={5} my={8}>
            <Box
              w={372}
              h={372}
              style={{ borderRadius: 16, overflow: "hidden" }}
            >
              <Image
                src="/notes-playground-art.png"
                alt="Notes Playground Art"
                width={372}
                height={372}
                style={{ objectFit: "contain" }}
                priority
              />
            </Box>
          </GridCol>
        </Grid>
        <Divider my="sm" />
        <Grid>
          <GridCol span={4} py={32}>
            <Center>
              <Box
                w={90}
                h={90}
                style={{ borderRadius: 16, overflow: "hidden" }}
              >
                <Image
                  src="/notes-fast-art.png"
                  alt="Crux Logo"
                  width={90}
                  height={90}
                  priority
                />
              </Box>
            </Center>
            <Title order={2} ta="center" size="1.4rem" py={16}>
              Capture thoughts fast
            </Title>
            <Text ta="center">
              Crux offers instant no-click typing as soon as the app launches,
              ideal for those who require a swift space to jot down fleeting
              insights before they slip away.
            </Text>
          </GridCol>
          <GridCol span={4} py={32}>
            <Center>
              <Box
                w={90}
                h={90}
                style={{ borderRadius: 16, overflow: "hidden" }}
              >
                <Image
                  src="/notes-connected-art.png"
                  alt="Crux Logo"
                  width={90}
                  height={90}
                  priority
                />
              </Box>
            </Center>
            <Title order={2} ta="center" size="1.4rem" py={16}>
              See related ideas
            </Title>
            <Text ta="center">
              Uncover relations between your notes with AI language models,
              enabling you to make connections with Crux you might have missed
              otherwise.
            </Text>
          </GridCol>
          <GridCol span={4} pt={32} pb={48}>
            <Center>
              <Box
                w={90}
                h={90}
                style={{ borderRadius: 16, overflow: "hidden" }}
              >
                <Image
                  src="/notes-organization-art.png"
                  alt="Crux Logo"
                  width={90}
                  height={90}
                  priority
                />
              </Box>
            </Center>
            <Title order={2} ta="center" size="1.4rem" py={16}>
              Organize and create
            </Title>
            <Text ta="center">
              Refine notes from your unique experiences into consolidated
              outlines in Crux, providing you a clear starting point to craft
              original, compelling works.
            </Text>
          </GridCol>
        </Grid>
        <Divider />
        <Stack align="center" py={16} gap={8}>
          <Text>©2023 Crux Notes</Text>
          <Switch
            size="md"
            color="black"
            onLabel={<IconSun size={16} />}
            offLabel={<IconMoon size={16} />}
            checked={computedColorScheme === "light"}
            onChange={() => toggleColorScheme()}
          />
        </Stack>
      </Container>
    </main>
  );
}
