"use client";

import {
  Box,
  Container,
  Flex,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <main>
      <Container>
        <Flex justify="space-between" align="center" mih={60}>
          <Link href="/" style={{ display: "flex" }}>
            <Image
              src="/crux-logo.png"
              alt="Crux Logo"
              width={90}
              height={30}
              priority
            />
          </Link>
        </Flex>
        <Box maw={500} mx="auto">
          <Title size="1.5rem" mb={16} ta="center">
            Verification Email Sent
          </Title>
          <Stack>
            <Text ta="center">
              A verification email has been sent to{" "}
              <Text span fw="bold">
                {email}
              </Text>{" "}
              if it is valid. Please click the link in the email to verify your
              account.
            </Text>
            <Text ta="center">
              If an email has not been received within 5 minutes, please try
              signing up again or logging in with the email you used to sign up.
            </Text>
          </Stack>
        </Box>
      </Container>
    </main>
  );
}
