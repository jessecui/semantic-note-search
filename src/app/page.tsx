import {
  Box,
  Button,
  Center,
  Container,
  Divider,
  Flex,
  Grid,
  GridCol,
  Text,
  Title,
} from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <Container size="md">
        <nav>
          <Flex justify="space-between" align="center" mih={60}>
            <Image
              src="/crux-logo.png"
              alt="Crux Logo"
              width={90}
              height={30}
              priority
            />
            <Button>Sign Up</Button>
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
            <Link href="/dashboard" passHref>
              <Button>Get started</Button>
            </Link>
          </GridCol>
          <GridCol span={5}>
            <Image
              src="/notes-playground-art.png"
              alt="Notes Playground Art"
              width={420}
              height={420}
              priority
            />
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
            <Title order={2} ta="center" size="1.5rem" py={16}>
              Capture thoughts fast
            </Title>
            <Text ta="center">
              Crux offers instant access for typing as soon as the app launches,
              ideal for those who require a swift space to capture fleeting
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
            <Title order={2} ta="center" size="1.5rem" py={16}>
              See related ideas
            </Title>
            <Text ta="center">
              Uncover relations between your notes with advanced AI embedding
              models, enabling you to make connections with Crux you might have
              missed otherwise.
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
                  src="/notes-organization-art.png"
                  alt="Crux Logo"
                  width={90}
                  height={90}
                  priority
                />
              </Box>
            </Center>
            <Title order={2} ta="center" size="1.5rem" py={16}>
              Organize and create
            </Title>
            <Text ta="center">
              Refine notes from your unique experiences into consolidated
              outlines in Crux, giving you a defined foundation to craft
              original, compelling works.
            </Text>
          </GridCol>
        </Grid>
        <Divider />
        <Box py={16}>
          <Text ta="center">©2023 Crux Notes</Text>
        </Box>
      </Container>
    </main>
  );
}
